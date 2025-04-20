
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CartSummary } from "../types/cart";

export interface RazorpayCheckoutAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
}

export interface RazorpayCheckoutInput {
  cartItems: CartSummary;
  shippingAddress: RazorpayCheckoutAddress;
  billingAddress: RazorpayCheckoutAddress;
  shippingCost: number;
  taxAmount: number;
  email: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export async function createRazorpayOrder(input: RazorpayCheckoutInput): Promise<RazorpayOrderResponse> {
  try {
    // Calculate total amount
    const totalAmount = input.cartItems.subtotal + input.shippingCost + input.taxAmount;
    
    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body: {
        cartItems: input.cartItems,
        orderData: {
          totalAmount,
          email: input.email,
          shippingAddress: input.shippingAddress
        }
      },
    });

    if (error) {
      toast.error("Failed to create Razorpay order");
      throw error;
    }

    if (!data.id) {
      toast.error("No order ID returned from Razorpay");
      throw new Error("No order ID returned");
    }

    return data as RazorpayOrderResponse;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    toast.error("Failed to initialize payment");
    throw error;
  }
}

// Save the order details after successful payment
export async function saveOrderAfterPayment(params: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke("order-helpers", {
      body: {
        action: 'saveRazorpayPayment',
        params
      }
    });

    if (error) {
      toast.error("Failed to save payment details");
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Payment saving error:", error);
    toast.error("Failed to finalize payment details");
    throw error;
  }
}

// Verify payment status
export async function verifyRazorpayPayment(paymentId: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "order-helpers",
      {
        body: { action: 'verifyRazorpayPayment', paymentId }
      }
    );

    if (error) {
      toast.error("Failed to verify payment");
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Payment verification error:", error);
    toast.error("Failed to verify payment status");
    throw error;
  }
}
