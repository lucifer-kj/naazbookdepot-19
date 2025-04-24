
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useCart, useClearCart } from "@/lib/services/cart";
import { useCheckout } from "@/lib/services/checkout-service";
import { useNavigate } from "react-router-dom";

interface CheckoutButtonProps {
  shippingAddress: any;
  billingAddress: any;
  shippingCost: number;
  taxAmount: number;
  paymentMethod: string;
  notes?: string;
  disabled?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  shippingAddress,
  billingAddress,
  shippingCost,
  taxAmount,
  paymentMethod,
  notes,
  disabled = false
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const { data: cart } = useCart();
  const clearCartMutation = useClearCart();
  const checkout = useCheckout();
  
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Validate addresses
      if (!shippingAddress || !billingAddress) {
        toast({
          title: "Missing Address Information",
          description: "Please provide complete shipping and billing addresses.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Process checkout based on payment method
      if (paymentMethod === 'cod') {
        // Direct checkout for Cash on Delivery
        const result = await checkout.mutateAsync({
          shippingAddress,
          billingAddress,
          sameAsBilling: false,
          paymentMethod: 'cod',
          notes
        });
        
        // Redirect to success page on completion
        navigate(`/checkout/success?order_id=${result.order_id}`);
        clearCartMutation.mutate();
      } else {
        // Online payment processing for other methods
        const checkoutInput = {
          cartItems: cart,
          shippingAddress,
          billingAddress,
          shippingCost,
          taxAmount,
          email: shippingAddress.email
        };
        
        if (paymentMethod === 'razorpay') {
          // Implement Razorpay functionality here
          toast({
            title: "Feature Not Available",
            description: "UPI/Razorpay payment is currently disabled.",
            variant: "default"
          });
          setLoading(false);
          return;
        } else {
          // Default to Stripe or other online payment
          // Default implementation for online payments would go here
          toast({
            title: "Online Payment Processing",
            description: "Online payment processing is under maintenance. Please choose Cash on Delivery.",
            variant: "default"
          });
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "Unable to process your order. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={disabled || loading || !cart || cart.items.length === 0}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        paymentMethod === 'cod' ? "Complete Order (Cash on Delivery)" : "Proceed to Payment"
      )}
    </Button>
  );
};

export default CheckoutButton;
