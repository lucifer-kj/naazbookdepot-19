import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartContext, CartItem } from '@/lib/context/CartContext'; // Ensure CartItem is exported or define locally
import { useCreateOrder } from '@/lib/hooks/useOrders';
import { toast } from 'sonner'; // For notifications

// Define types for shipping and payment data if not already globally available
// These are simplified examples; adjust them based on your actual data structure.
export interface ShippingData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  shippingOption: string; // e.g., 'standard', 'express'
  [key: string]: any; // For other fields
}

export interface PaymentData {
  method: string; // e.g., 'cod', 'stripe', 'paypal'
  billingAddress?: ShippingData; // Optional, if different from shipping
  [key: string]: any; // For other fields like transactionId from payment processor
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
}

export const useCheckoutProcess = () => {
  const { cart, clearCart } = useCartContext();
  const createOrderMutation = useCreateOrder();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const shippingOptions: ShippingOption[] = useMemo(() => [
    { id: 'standard', name: 'Standard Shipping (5-7 days)', price: 100 },
    { id: 'express', name: 'Express Shipping (2-3 days)', price: 250 },
  ], []);

  const submitCheckoutStep = async (stepData: any) => {
    if (currentStep === 1) { // Shipping step completed
      setShippingData(stepData as ShippingData);
      setCurrentStep(2);
    } else if (currentStep === 2) { // Payment step completed
      setPaymentData(stepData as PaymentData);
      setCurrentStep(3);
    } else if (currentStep === 3) { // Review step completed (Place Order)
      if (!shippingData || !paymentData) {
        toast.error("Shipping or Payment data is missing. Please go back and complete the steps.");
        // Optionally, force user back to the problematic step:
        // if (!shippingData) setCurrentStep(1);
        // else if (!paymentData) setCurrentStep(2);
        return;
      }
      setIsPlacingOrder(true);

      const mappedCartItems = cart.items.map(item => ({
        product_id: item.productId.toString(),
        variant_id: item.variationId || undefined,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        product_name: item.name,
        product_sku: (item as any).sku || undefined, // Assuming 'sku' might be on CartItem
      }));

      const selectedShippingOption = shippingOptions.find(opt => opt.id === shippingData.shippingOption) || shippingOptions[0];
      const shippingAmount = selectedShippingOption.price;

      // Assuming tax is 2% of subtotal, and discount is 0 for now.
      // These could be made more dynamic if needed.
      const taxAmount = Math.round(cart.subtotal * 0.02);
      const discountAmount = 0;
      const totalAmount = cart.subtotal + shippingAmount + taxAmount - discountAmount;

      const orderInfo = {
        subtotal: cart.subtotal,
        shipping_address: { ...shippingData },
        billing_address: paymentData?.billingAddress ? { ...paymentData.billingAddress } : { ...shippingData },
        customer_email: shippingData.email,
        customer_phone: shippingData.phone,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        payment_method: paymentData.method, // Store payment method
        // You might also want to store shipping_option_id or name:
        // shipping_method_name: selectedShippingOption.name,
      };

      try {
        const order = await createOrderMutation.mutateAsync({
          items: mappedCartItems,
          ...orderInfo,
        });

        if (order && order.order_number) {
          clearCart();
          toast.success(`Order #${order.order_number} placed successfully!`);
          navigate(`/order-confirmation?orderNumber=${order.order_number}`);
        } else {
           console.error("Order created but order_number is missing in response:", order);
           toast.error("Order placed, but there was an issue retrieving your order number. Please check your email or order history.");
           clearCart();
           navigate('/');
        }
      } catch (error: any) {
        console.error("Error placing order:", error);
        toast.error(`Failed to place order: ${error.message || 'An unexpected error occurred.'}`);
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };

  return {
    currentStep,
    shippingData,
    paymentData,
    isPlacingOrder,
    submitCheckoutStep,
    setCurrentStep, // For "Back" buttons or direct navigation
    shippingOptions,
  };
};
