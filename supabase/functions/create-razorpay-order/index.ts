
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartItems, orderData } = await req.json();
    
    if (!cartItems || !cartItems.items || !cartItems.items.length) {
      throw new Error("Cart is empty");
    }

    // Calculate total amount in paise (₹100 = 10000 paise)
    const amount = Math.round(orderData.totalAmount * 100);
    
    // Create a Razorpay order
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          order_type: "Naaz Book Depot",
          customer_email: orderData.email || "",
          shipping_address: JSON.stringify(orderData.shippingAddress),
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("Razorpay error:", errorData);
      throw new Error(`Failed to create Razorpay order: ${errorData.error?.description || "Unknown error"}`);
    }

    const razorpayOrder = await orderResponse.json();
    
    // Return the order details needed for frontend
    return new Response(
      JSON.stringify({
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: RAZORPAY_KEY_ID
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create order" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
