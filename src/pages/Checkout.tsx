import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import OrderReview from '@/components/checkout/OrderReview';
import EmptyCartMessage from '@/components/checkout/EmptyCartMessage';

const Checkout = () => {
  const { cart } = useCartContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shippingData, setShippingData] = useState(null);

  const shipping = cart.items.length > 0 ? 100 : 0;
  const gstRate = 0.12;
  const subtotal = cart.subtotal;
  const gstAmount = +(subtotal * gstRate).toFixed(2);
  const total = subtotal + shipping;

  // When form is submitted, go straight to UPI payment page:
  const handleShippingComplete = (stepData: any) => {
    setShippingData(stepData);
    // Pass shipping, cart, and total as params
    const params = new URLSearchParams({
      total: total.toString(),
      shipping: JSON.stringify(stepData),
      cart: JSON.stringify(cart), // full cart details
      gst: gstAmount.toString()
    });
    navigate(`/upi-payment?${params.toString()}`);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <EmptyCartMessage onBrowseBooks={() => navigate('/books')} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 bg-naaz-cream">
        <div className="container mx-auto max-w-6xl">
          <CheckoutHeader onBackToCart={() => navigate('/cart')} />

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              {/* Show only shipping form, pre-filled from user if possible */}
              <ShippingForm
                user={user}
                onComplete={handleShippingComplete}
              />
            </div>
            {/* Live summary on the right */}
            <OrderSummary cart={cart} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
