
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import OrderReview from '@/components/checkout/OrderReview';
import EmptyCartMessage from '@/components/checkout/EmptyCartMessage';

const Checkout = () => {
  const { cart } = useCartContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  const steps = [
    { id: 1, title: 'Shipping', icon: MapPin },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Review', icon: Shield }
  ];

  // Calculate total with shipping and tax
  const shipping = cart.items.length > 0 ? 100 : 0;
  const tax = Math.round(cart.subtotal * 0.02);
  const total = cart.subtotal + shipping + tax;

  const handleStepComplete = (stepData: any) => {
    if (currentStep === 1) {
      setShippingData(stepData);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setPaymentData(stepData);
      
      // If UPI payment is selected, redirect to UPI payment page
      if (stepData.type === 'upi') {
        const params = new URLSearchParams({
          total: total.toString(),
          shipping: JSON.stringify(shippingData),
          payment: JSON.stringify(stepData),
        });
        navigate(`/upi-payment?${params.toString()}`);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      // For non-UPI payments, process order normally
      const orderNumber = `NBD-${Date.now()}`;
      navigate(`/order-confirmation?orderNumber=${orderNumber}`);
    }
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
          <CheckoutSteps steps={steps} currentStep={currentStep} />

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <ShippingForm
                  user={user}
                  onComplete={handleStepComplete}
                />
              )}
              {currentStep === 2 && (
                <PaymentForm
                  shippingData={shippingData}
                  onComplete={handleStepComplete}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <OrderReview
                  shippingData={shippingData}
                  paymentData={paymentData}
                  onBack={() => setCurrentStep(2)}
                  onPlaceOrder={() => handleStepComplete({})}
                />
              )}
            </div>
            
            <OrderSummary cart={cart} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
