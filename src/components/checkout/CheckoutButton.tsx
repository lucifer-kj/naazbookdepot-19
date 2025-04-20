
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/services/payment-service";
import { useCart } from "@/lib/services/cart";

interface CheckoutButtonProps {
  shippingAddress: any;
  billingAddress: any;
  shippingCost: number;
  taxAmount: number;
  disabled?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  shippingAddress,
  billingAddress,
  shippingCost,
  taxAmount,
  disabled = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const { cart } = useCart();
  
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
      
      const checkoutUrl = await createCheckoutSession({
        cartItems: cart,
        shippingAddress,
        billingAddress,
        shippingCost,
        taxAmount
      });
      
      // Redirect to Stripe
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Failed",
        description: "Unable to process your payment. Please try again.",
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
        "Proceed to Payment"
      )}
    </Button>
  );
};

export default CheckoutButton;
