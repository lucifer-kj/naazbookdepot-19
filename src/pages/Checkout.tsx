
import React from 'react'; // Removed useState, useMemo as they are moved to the hook
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield } from 'lucide-react'; // Loader2 might be handled within OrderReview if needed
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
// useCreateOrder is now used within useCheckoutProcess
import { useCheckoutProcess } from '@/lib/hooks/useCheckoutProcess';
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
  const { cart } = useCartContext(); // clearCart is now handled by the hook
  const { user } = useAuth();
  const navigate = useNavigate(); // Still needed for EmptyCartMessage navigation

  const {
    currentStep,
    shippingData,
    paymentData,
    isPlacingOrder,
    submitCheckoutStep,
    setCurrentStep,
    shippingOptions
  } = useCheckoutProcess();

  // Steps definition can remain here or be moved to the hook if it influences logic there
  const steps = [
    { id: 1, title: 'Shipping', icon: MapPin },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Review', icon: Shield }
  ];

  if (cart.items.length === 0 && !isPlacingOrder) { // Check !isPlacingOrder to prevent flicker after order placement
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
                  user={user} // ShippingForm might need user details for pre-filling
                  onComplete={submitCheckoutStep}
                />
              )}
              {currentStep === 2 && (
                <PaymentForm
                  shippingData={shippingData} // Pass shippingData to PaymentForm if needed
                  onComplete={submitCheckoutStep}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <OrderReview
                  shippingData={shippingData}
                  paymentData={paymentData}
                  onBack={() => setCurrentStep(2)}
                  onPlaceOrder={() => submitCheckoutStep({})} // stepData for review might be empty or specific review confirmation
                  isPlacingOrder={isPlacingOrder}
                />
              )}
            </div>
            
            <OrderSummary
              cart={cart}
              shippingCost={shippingData?.shippingOption
                ? (shippingOptions.find(opt => opt.id === shippingData.shippingOption)?.price || 0)
                : 0
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
