
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
    
    const { action, params } = await req.json();
    let result = null;
    
    // Add order note
    if (action === "addOrderNote") {
      const { orderId, userId, note, isCustomerVisible = true } = params;
      
      const { error } = await supabaseAdmin
        .from("order_notes")
        .insert({
          order_id: orderId,
          user_id: userId,
          note,
          is_customer_visible: isCustomerVisible,
        });
      
      if (error) throw error;
      result = { success: true };
    }
    
    // Save Razorpay payment details
    else if (action === "saveRazorpayPayment") {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
      
      // Find the order using Razorpay order ID
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();
      
      if (orderError) {
        throw new Error(`Order not found: ${orderError.message}`);
      }
      
      // Update order with payment details
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          payment_status: "paid",
          status: "processing"
        })
        .eq("id", order.id);
      
      if (updateError) throw updateError;
      
      result = { success: true, orderId: order.id };
    }
    
    // Verify Razorpay payment status
    else if (action === "verifyRazorpayPayment") {
      const { paymentId } = params;
      
      // Find order by payment ID
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
        .eq("razorpay_payment_id", paymentId)
        .single();
      
      if (orderError) {
        throw new Error(`Order not found: ${orderError.message}`);
      }
      
      result = { order };
    }
    
    else {
      throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
