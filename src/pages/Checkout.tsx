
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, Gift, ArrowLeft, Shield } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';

const Checkout = () => {
  const { cart, clearCart } = useCartContext();
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

  const handleStepComplete = (stepData: any) => {
    if (currentStep === 1) {
      setShippingData(stepData);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setPaymentData(stepData);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Process order
      const orderNumber = `NBD-${Date.now()}`;
      clearCart();
      navigate(`/order-confirmation?orderNumber=${orderNumber}`);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-600 mb-8">
              Add some books to your cart before checkout.
            </p>
            <button
              onClick={() => navigate('/books')}
              className="bg-naaz-green text-white px-6 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
            >
              Browse Books
            </button>
          </div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/cart')}
              className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-2">
              Checkout
            </h1>
            <p className="text-gray-600">
              Bismillah - Complete your order with Allah's blessing
            </p>
          </motion.div>

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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6">
                    Review Your Order
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Shipping Address</h3>
                      <div className="text-gray-700">
                        <p>{shippingData?.name}</p>
                        <p>{shippingData?.address}</p>
                        <p>{shippingData?.city}, {shippingData?.state} {shippingData?.pincode}</p>
                        <p>{shippingData?.phone}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Payment Method</h3>
                      <p className="text-gray-700">{paymentData?.method}</p>
                    </div>
                    
                    <div className="bg-naaz-gold/10 p-4 rounded-lg">
                      <p className="text-naaz-green font-medium text-center">
                        "And it is He who sends down rain from the sky, and We produce thereby the vegetation of every kind" - Quran 6:99
                      </p>
                      <p className="text-sm text-gray-600 text-center mt-2">
                        May Allah bless your purchase and increase your knowledge
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 border border-naaz-green text-naaz-green py-3 rounded-lg hover:bg-naaz-green/5 transition-colors"
                    >
                      Back to Payment
                    </button>
                    <button
                      onClick={() => handleStepComplete({})}
                      className="flex-1 bg-naaz-green text-white py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
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
