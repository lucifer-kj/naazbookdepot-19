import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Smartphone, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import brandLogo from '/lovable-uploads/logo.png'; // or wherever the brand logo is

const UpiPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCartContext();
  const createOrder = useCreateOrder();
  
  const [countdown, setCountdown] = useState(15);
  const [showButtons, setShowButtons] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Read cart from URL param and use for items & totals
  const cart = JSON.parse(searchParams.get('cart') || '{}');
  const total = searchParams.get('total') || '0';
  const shippingData = JSON.parse(searchParams.get('shipping') || '{}');
  const gst = searchParams.get('gst') || '0';
  
  // Generate unique order reference for UPI note
  const [upiReference] = useState(() =>
    `NBD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  );
  
  const upiId = 'athar.nabeel94-3@oksbi';
  const merchantName = 'Nabeel Athar';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${total}&tn=${encodeURIComponent(`Naaz Books order reference: ${upiReference}`)}&mc=0000&mode=02&purpose=00`;

  // NEW: Custom QR code rendering with logo overlay (mobile/desktop optimized)
  // Instead of directly embedding img src, use a canvas-based renderer if possible, but for now, just use QR Server plus overlayed logo div for demo:
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUrl)}`;

  // WhatsApp fallback data
  const customerName = shippingData?.name || '';
  const waMsg = encodeURIComponent(
    `Salam Team Naaz, I need help with my order.\nName: ${customerName}\nOrder Ref: ${upiReference}\nIssue: [describe your payment issue here]`
  );
  const waLink = `https://wa.me/919876543210?text=${waMsg}`; // change phone as needed

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowButtons(true);
    }
  }, [countdown]);

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
                Complete Your UPI Payment
              </h1>
              <div className="bg-naaz-gold/10 p-4 rounded-lg mb-4">
                <p className="text-naaz-green font-semibold text-lg">
                  Amount to Pay: <span className="text-naaz-gold">₹{total}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Reference: {upiReference}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">GST (included): </span>₹{gst}
                </p>
              </div>
              {/* Short instruction */}
              <p className="text-naaz-green font-medium mb-2">
                Scan QR below, or click the UPI link on your phone. Do not change the "note" – it's how we match your payment!
              </p>
            </div>
            {/* QR Code and embedded logo (desktop) */}
            <div className="flex flex-col items-center relative mb-6">
              <img 
                src={qrCodeUrl}
                alt="Scan to pay with UPI"
                className="rounded-xl w-52 h-52 border-0 shadow-sm"
                style={{ background: 'white', objectFit: 'contain' }}
              />
              <img 
                src={brandLogo}
                alt="Brand Logo"
                className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border border-gray-200 shadow-sm"
              />
            </div>
            {/* UPI link for mobile */}
            <div className="flex justify-center mb-4">
              <a
                href={upiUrl}
                className="inline-block bg-naaz-green text-white px-6 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
                rel="noopener noreferrer"
                target="_blank"
              >
                Pay Now with UPI
              </a>
            </div>
            {/* Timer & post-timer buttons */}
            {!showButtons && (
              <div className="flex items-center justify-center mb-6">
                <Clock className="text-naaz-gold mr-2" size={24} />
                <span className="text-lg font-semibold text-naaz-green">
                  {countdown} seconds
                </span>
              </div>
            )}
            {showButtons && (
              <div className="flex gap-4 mb-6">
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
                  {isProcessing ? 'Processing...' : "I've paid"}
                </button>
              </div>
            )}
            {/* WhatsApp help */}
            <div className="flex flex-col items-center mt-3">
              <a 
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Smartphone size={18}/>
                WhatsApp for Payment Help
              </a>
              <span className="text-xs text-gray-500 mt-1">Include reference: {upiReference}</span>
            </div>
            {/* Post-payment remark */}
            <div className="mt-8 text-center">
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
