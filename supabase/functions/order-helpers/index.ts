
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendOrderConfirmation } from "./send-confirmation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { action, params } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    switch (action) {
      case "addOrderNote": {
        const { orderId, userId, note, isCustomerVisible } = params;
        
        // Validate inputs
        if (!orderId || !userId || !note) {
          throw new Error("Missing required parameters");
        }
        
        // Add order note
        const { data, error } = await supabase
          .from("order_notes")
          .insert({
            order_id: orderId,
            user_id: userId,
            note,
            is_customer_visible: isCustomerVisible || false
          })
          .select("*")
          .single();
          
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "sendOrderConfirmation": {
        const { orderId } = params;
        
        if (!orderId) {
          throw new Error("Order ID is required");
        }
        
        const success = await sendOrderConfirmation(orderId);
        
        return new Response(JSON.stringify({ success }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "updateOrderStatus": {
        const { orderId, status, note } = params;
        
        if (!orderId || !status) {
          throw new Error("Order ID and status are required");
        }
        
        // Update order status
        const { error: orderError } = await supabase
          .from("orders")
          .update({ status })
          .eq("id", orderId);
          
        if (orderError) throw orderError;
        
        // Add note if provided
        if (note) {
          const { error: noteError } = await supabase
            .from("order_notes")
            .insert({
              order_id: orderId,
              user_id: params.userId,
              note,
              is_customer_visible: true
            });
            
          if (noteError) throw noteError;
        }
        
        // Send email for specific status changes
        if (status === "shipped" && params.trackingInfo) {
          // Code to send shipping update email would go here
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in order-helpers function:`, error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
