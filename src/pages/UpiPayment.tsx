
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Smartphone, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import brandLogo from '/lovable-uploads/logo.png';

const UpiPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCartContext();
  const createOrder = useCreateOrder();

  const [countdown, setCountdown] = useState(15);
  const [showButtons, setShowButtons] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const cartFromUrl = JSON.parse(searchParams.get('cart') || '{}');
  const total = searchParams.get('total') || '0';
  const shippingData = JSON.parse(searchParams.get('shipping') || '{}');
  const gst = searchParams.get('gst') || '0';

  const [upiReference] = useState(() =>
    `NBD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  );

  const upiId = 'athar.nabeel94-3@oksbi';
  const merchantName = 'Nabeel Athar';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${total}&tn=${encodeURIComponent(`Naaz Books order reference: ${upiReference}`)}&mc=0000&mode=02&purpose=00`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

  const customerName = shippingData?.name || '';
  const waMsg = encodeURIComponent(
    `Salam Team Naaz, I need help with my order.\nName: ${customerName}\nOrder Ref: ${upiReference}\nIssue: [describe your payment issue here]`
  );
  const waLink = `https://wa.me/919876543210?text=${waMsg}`;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    // When countdown reaches 0, show buttons
    setShowButtons(true);
  }, [countdown]);

  const handleRetryPayment = () => {
    setCountdown(15);
    setShowButtons(false);
  };

  const handlePaymentComplete = async () => {
    if (!user || !cartFromUrl.items || cartFromUrl.items.length === 0) {
      navigate('/cart');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        cartItems: cartFromUrl.items,
        shippingAddress: shippingData,
        billingAddress: shippingData,
        total: parseFloat(total),
        notes: `UPI Payment - Reference: ${upiReference}`,
        paymentMethod: 'upi'
      };

      const order = await createOrder.mutateAsync(orderData);

      // Update order with UPI details for admin verification
      await supabase
        .from('orders')
        .update({
          payment_method: 'upi',
          payment_status: 'pending_verification',
          upi_reference_code: upiReference,
          status: 'pending_payment_verification'
        })
        .eq('id', order.id);

      // Save user address for future orders if signed in
      if (user && shippingData) {
        try {
          await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              name: shippingData.name,
              default_address: {
                address: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                pincode: shippingData.pincode,
                phone: shippingData.phone,
                landmark: shippingData.landmark
              }
            });
        } catch (error) {
          import('../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
            handleDatabaseError(error, 'save_user_address');
          });
        }
      }

      clearCart();
      navigate(`/order-confirmation?orderNumber=${order.order_number}&payment=upi&status=pending`);
    } catch (error) {
      import('../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'create_order', { paymentMethod: 'upi' });
      });
      alert('Failed to process order. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-4 md:py-8 px-4 bg-naaz-cream">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-lg md:text-2xl font-playfair font-bold text-naaz-green mb-4">
                Complete Your UPI Payment
              </h1>
              <div className="bg-naaz-gold/10 p-3 md:p-4 rounded-lg mb-4">
                <p className="text-naaz-green font-semibold text-sm md:text-lg">
                  Amount to Pay: <span className="text-naaz-gold">₹{total}</span>
                </p>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  Reference: {upiReference}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">GST (included): </span>₹{gst}
                </p>
              </div>
              <p className="text-naaz-green font-medium mb-2 text-xs md:text-base px-2">
                Scan QR below, or click the UPI link on your phone. Do not change the "note" – it's how we match your payment!
              </p>
            </div>

            <div className="flex flex-col items-center relative mb-4 md:mb-6">
              <img
                src={qrCodeUrl}
                alt="Scan to pay with UPI"
                className="rounded-xl w-40 h-40 md:w-52 md:h-52 border-0 shadow-sm"
                style={{ background: 'white', objectFit: 'contain' }}
              />
              <img
                src={brandLogo}
                alt="Brand Logo"
                className="absolute top-1/2 left-1/2 w-8 h-8 md:w-12 md:h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border border-gray-200 shadow-sm"
              />
            </div>

            <div className="flex justify-center mb-4">
              <a
                href={upiUrl}
                className="inline-block bg-naaz-green text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-naaz-green/90 transition-colors text-xs md:text-base"
                rel="noopener noreferrer"
                target="_blank"
              >
                Pay Now with UPI
              </a>
            </div>

            {!showButtons && (
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <Clock className="text-naaz-gold mr-2" size={18} />
                <span className="text-sm md:text-lg font-semibold text-naaz-green">
                  {countdown} seconds
                </span>
              </div>
            )}

            {showButtons && (
              <div className="flex flex-col gap-3 mb-4 md:mb-6">
                <button
                  onClick={handleRetryPayment}
                  className="flex items-center justify-center border border-naaz-green text-naaz-green py-2 md:py-3 rounded-lg hover:bg-naaz-green/5 transition-colors text-xs md:text-base"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Retry Payment
                </button>
                <button
                  onClick={handlePaymentComplete}
                  disabled={isProcessing}
                  className="flex items-center justify-center bg-naaz-green text-white py-2 md:py-3 rounded-lg hover:bg-naaz-green/90 transition-colors disabled:opacity-50 text-xs md:text-base"
                >
                  <CheckCircle size={16} className="mr-2" />
                  {isProcessing ? 'Processing...' : "I've paid"}
                </button>
              </div>
            )}

            <div className="flex flex-col items-center mt-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs md:text-base"
              >
                <Smartphone size={16} />
                WhatsApp for Payment Help
              </a>
              <span className="text-xs text-gray-500 mt-1 text-center px-2">Include reference: {upiReference}</span>
            </div>

            <div className="mt-6 md:mt-8 text-center px-2">
              <p className="text-xs text-gray-500">
                "And Allah is the best of providers." — We will confirm your payment as soon as it appears in our dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UpiPayment;
