
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield, Loader2 } from 'lucide-react';
import { useCartContext, CartItem } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { useCreateOrder } from '@/lib/hooks/useOrders';
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
  const { cart, clearCart } = useCartContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<any>(null); // Consider defining a specific type
  const [paymentData, setPaymentData] = useState<any>(null); // Consider defining a specific type
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const createOrderMutation = useCreateOrder();

  // Shipping options - should ideally come from a config or API
  const shippingOptions = [
    { id: 'standard', name: 'Standard Shipping (5-7 days)', price: 100 },
    { id: 'express', name: 'Express Shipping (2-3 days)', price: 250 },
  ];

  const steps = [
    { id: 1, title: 'Shipping', icon: MapPin },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Review', icon: Shield }
  ];

  const handleStepComplete = async (stepData: any) => {
    if (currentStep === 1) {
      setShippingData(stepData);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setPaymentData(stepData);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!shippingData || !paymentData) {
        alert("Shipping or Payment data is missing.");
        return;
      }
      setIsPlacingOrder(true);

      const mappedCartItems = cart.items.map(item => ({
        product_id: item.productId.toString(), // Ensure string
        variant_id: item.variationId || undefined, // Ensure undefined if null/empty
        quantity: item.quantity,
        unit_price: parseFloat(item.price), // Ensure number
        product_name: item.name,
        product_sku: item.sku || undefined, // Ensure undefined if null/empty
        // variant_name: item.variantName || undefined, // Add if CartItem has variantName
      }));

      const selectedShippingOption = shippingOptions.find(opt => opt.id === shippingData.shippingOption) || shippingOptions[0];
      const shippingAmount = selectedShippingOption.price;
      const taxAmount = Math.round(cart.subtotal * 0.02); // 2% tax, as in OrderSummary

      // Discount: For now, assume 0 as it's complex to get from OrderSummary without major refactor.
      // If discountCode state was lifted to Checkout.tsx, it could be calculated here.
      const discountAmount = 0;

      const totalAmount = cart.subtotal + shippingAmount + taxAmount - discountAmount;

      const orderInfo = {
        subtotal: cart.subtotal,
        shipping_address: { ...shippingData }, // Clone to avoid potential issues
        billing_address: paymentData?.billingAddress
          ? { ...paymentData.billingAddress }
          : { ...shippingData }, // Use shipping if billing not separate
        customer_email: shippingData.email,
        customer_phone: shippingData.phone,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        // payment_method: paymentData?.method, // Optional: if you store this on the order
        // payment_transaction_id: paymentData?.transactionId, // Optional
      };

      try {
        const order = await createOrderMutation.mutateAsync({
          items: mappedCartItems,
          ...orderInfo,
        });

        if (order && order.order_number) {
          clearCart();
          navigate(`/order-confirmation?orderNumber=${order.order_number}`);
        } else {
          // This case might happen if the mutation doesn't return the order_number as expected
           console.error("Order created but order_number is missing in response:", order);
           alert("Order placed, but there was an issue retrieving your order number. Please check your email or order history.");
           clearCart(); // Still clear cart and navigate to a generic success or home
           navigate('/');
        }
      } catch (error: any) {
        console.error("Error placing order:", error);
        alert(`Failed to place order: ${error.message || 'An unexpected error occurred.'}`);
      } finally {
        setIsPlacingOrder(false);
      }
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
                  onPlaceOrder={() => handleStepComplete({})} // Data for step 3 is already collected
                  isPlacingOrder={isPlacingOrder}
                />
              )}
            </div>
            
            {/* OrderSummary can take shippingData to display selected shipping option cost */}
            <OrderSummary cart={cart} shippingCost={shippingData?.shippingOption ? (shippingOptions.find(opt => opt.id === shippingData.shippingOption)?.price || 0) : 0} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
