import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CartSummary } from "../types/cart";

export interface CheckoutAddress {
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

export interface CheckoutInput {
  cartItems: CartSummary;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  shippingCost: number;
  taxAmount: number;
}

export async function createCheckoutSession(input: CheckoutInput) {
  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        cartItems: input.cartItems.items,
        shippingAddress: input.shippingAddress,
        billingAddress: input.billingAddress,
        shippingCost: input.shippingCost,
        taxAmount: input.taxAmount,
      },
    });

    if (error) {
      toast.error("Failed to create checkout session");
      throw error;
    }

    if (!data.url) {
      toast.error("No checkout URL returned");
      throw new Error("No checkout URL returned");
    }

    return data.url;
  } catch (error) {
    console.error("Checkout error:", error);
    toast.error("Failed to initialize checkout");
    throw error;
  }
}

export async function verifyPayment(sessionId: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "verify-payment",
      {
        body: { session_id: sessionId }
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
