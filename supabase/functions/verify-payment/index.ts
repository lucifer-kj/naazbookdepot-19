
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    
    if (!sessionId) {
      throw new Error("No session ID provided");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Connect to Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(`
        id, 
        status, 
        payment_status,
        total_amount,
        created_at,
        order_items (*)
      `)
      .eq("stripe_session_id", sessionId)
      .single();

    if (orderError) {
      throw new Error(`Error retrieving order: ${orderError.message}`);
    }

    // If the payment was successful but our database doesn't show it,
    // update the order status
    if (session.payment_status === "paid" && order.payment_status !== "paid") {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({ 
          payment_status: "paid",
          status: "processing" 
        })
        .eq("id", order.id);

      if (error) {
        console.error("Error updating order status:", error);
      } else {
        // Update the order object we're returning
        order.payment_status = "paid";
        order.status = "processing";
      }
    }

    return new Response(JSON.stringify({ 
      order,
      session_status: session.status,
      payment_status: session.payment_status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
