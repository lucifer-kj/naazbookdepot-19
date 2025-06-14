
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Smartphone, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const UpiPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCartContext();
  const createOrder = useCreateOrder();
  
  const [countdown, setCountdown] = useState(15);
  const [showButtons, setShowButtons] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get data from URL params
  const total = searchParams.get('total') || '0';
  const shippingData = JSON.parse(searchParams.get('shipping') || '{}');
  const paymentData = JSON.parse(searchParams.get('payment') || '{}');
  
  // Generate UPI reference code (will be replaced by actual order ID later)
  const [upiReference] = useState(() => 
    `NBD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  );
  
  const upiId = 'athar.nabeel94-3@oksbi';
  const merchantName = 'Nabeel Athar';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${total}&tn=${encodeURIComponent(`Order payment - Ref: ${upiReference}`)}&mc=0000&mode=02&purpose=00`;

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowButtons(true);
    }
  }, [countdown]);

  // Generate QR code URL using QR Server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleRetryPayment = () => {
    setCountdown(15);
    setShowButtons(false);
  };

  const handlePaymentComplete = async () => {
    if (!user || cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderData = {
        cartItems: cart.items,
        shippingAddress: shippingData,
        billingAddress: shippingData,
        total: parseFloat(total),
        notes: `UPI Payment - Reference: ${upiReference}`,
      };

      const order = await createOrder.mutateAsync(orderData);
      
      // Update order with UPI payment details
      await fetch(`https://ihxtvfuqodvodrutvvcp.supabase.co/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          payment_method: 'upi',
          payment_status: 'paid_claimed',
          upi_reference_code: upiReference,
          payment_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        }),
      });

      clearCart();
      navigate(`/order-confirmation?orderNumber=${order.order_number}&payment=upi`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 bg-naaz-cream">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-4">
                Complete Your Payment
              </h1>
              <div className="bg-naaz-gold/10 p-4 rounded-lg mb-6">
                <p className="text-naaz-green font-semibold text-lg">
                  Amount to Pay: ₹{total}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Reference: {upiReference}
                </p>
              </div>
            </div>

            {!showButtons && (
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="text-naaz-gold mr-2" size={24} />
                  <span className="text-lg font-semibold text-naaz-green">
                    {countdown} seconds
                  </span>
                </div>
                <p className="text-gray-600">
                  Please complete your payment within the time limit
                </p>
              </div>
            )}

            <div className="space-y-6">
              {isMobile ? (
                <div className="text-center">
                  <div className="bg-naaz-green/5 p-6 rounded-lg mb-4">
                    <Smartphone className="mx-auto text-naaz-green mb-4" size={48} />
                    <h3 className="font-semibold text-naaz-green mb-2">
                      Pay with UPI App
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Click the button below to open your UPI app
                    </p>
                    <a
                      href={upiUrl}
                      className="inline-block bg-naaz-green text-white px-6 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
                    >
                      Pay Now with UPI
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-naaz-green/5 p-6 rounded-lg mb-4">
                    <QrCode className="mx-auto text-naaz-green mb-4" size={48} />
                    <h3 className="font-semibold text-naaz-green mb-2">
                      Scan QR Code
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Use any UPI app to scan this QR code
                    </p>
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="UPI QR Code" 
                        className="border-2 border-naaz-green rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-naaz-gold/10 p-4 rounded-lg">
                <h4 className="font-medium text-naaz-green mb-2">Payment Instructions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Pay the exact amount: ₹{total}</li>
                  <li>• The reference code will be auto-filled</li>
                  <li>• Complete payment within 15 minutes</li>
                  <li>• Click "I've Paid" after successful payment</li>
                </ul>
              </div>

              {showButtons && (
                <div className="flex gap-4">
                  <button
                    onClick={handleRetryPayment}
                    className="flex-1 flex items-center justify-center border border-naaz-green text-naaz-green py-3 rounded-lg hover:bg-naaz-green/5 transition-colors"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    Retry Payment
                  </button>
                  <button
                    onClick={handlePaymentComplete}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center bg-naaz-green text-white py-3 rounded-lg hover:bg-naaz-green/90 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    {isProcessing ? 'Processing...' : "I've Paid"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                "And Allah is the best of providers" - Quran 62:11
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
