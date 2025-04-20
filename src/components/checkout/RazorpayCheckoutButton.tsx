
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { createRazorpayOrder, saveOrderAfterPayment } from "@/lib/services/razorpay-service";
import { useCart, useClearCart } from "@/lib/services/cart";
import { useNavigate } from 'react-router-dom';
import Script from 'react-load-script';

interface RazorpayCheckoutButtonProps {
  shippingAddress: any;
  billingAddress: any;
  shippingCost: number;
  taxAmount: number;
  email: string;
  disabled?: boolean;
}

// Declare Razorpay as a global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  shippingAddress,
  billingAddress,
  shippingCost,
  taxAmount,
  email,
  disabled = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { data: cart } = useCart();
  const clearCartMutation = useClearCart();
  const navigate = useNavigate();
  
  const handleScriptLoad = () => {
    setScriptLoaded(true);
  };

  const handleScriptError = () => {
    toast({
      title: "Payment Failed",
      description: "Could not load the payment gateway. Please try again.",
      variant: "destructive"
    });
    setScriptLoaded(false);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive"
      });
      return;
    }

    if (!scriptLoaded) {
      toast({
        title: "Payment Gateway Loading",
        description: "Please wait while the payment gateway loads.",
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

      if (!email) {
        toast({
          title: "Missing Email",
          description: "Please provide your email address.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Create Razorpay order
      const orderData = await createRazorpayOrder({
        cartItems: cart,
        shippingAddress,
        billingAddress,
        shippingCost,
        taxAmount,
        email
      });
      
      // Create Razorpay options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Naaz Book Depot",
        description: "Purchase from Naaz Book Depot",
        order_id: orderData.id,
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: email,
          contact: shippingAddress.phone
        },
        notes: {
          shipping_address: JSON.stringify(shippingAddress),
          billing_address: JSON.stringify(billingAddress)
        },
        theme: {
          color: "#3B8249" // Naaz green color
        },
        handler: async function(response: any) {
          try {
            // Save the payment details
            await saveOrderAfterPayment({
              orderId: orderData.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            // Clear cart and redirect to success page
            clearCartMutation.mutate();
            navigate(`/order-success?payment_id=${response.razorpay_payment_id}`);
          } catch (error) {
            console.error("Error handling payment:", error);
            toast({
              title: "Payment Processing Error",
              description: "Your payment was received but we couldn't process it. Please contact support.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process. Your cart is still saved.",
              variant: "default"
            });
          }
        }
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();
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
    <>
      <Script
        url="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <Button 
        onClick={handleCheckout} 
        disabled={disabled || loading || !cart || cart.items.length === 0 || !scriptLoaded}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay with Razorpay"
        )}
      </Button>
    </>
  );
};

export default RazorpayCheckoutButton;
