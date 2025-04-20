
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature provided" }), {
      status: 400,
    });
  }

  try {
    // Get raw request body
    const body = await req.text();
    
    // Verify the event using the webhook secret
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret || ""
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
      });
    }

    // Connect to Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Update order status
        const { error } = await supabaseAdmin
          .from("orders")
          .update({ 
            payment_status: "paid",
            status: "processing" 
          })
          .eq("stripe_session_id", session.id);

        if (error) {
          console.error("Error updating order status:", error);
        } else {
          // Get order items to update inventory
          const { data: orderData } = await supabaseAdmin
            .from("orders")
            .select("id")
            .eq("stripe_session_id", session.id)
            .single();

          if (orderData) {
            const { data: orderItems } = await supabaseAdmin
              .from("order_items")
              .select("*")
              .eq("order_id", orderData.id);

            // Update inventory for each item
            if (orderItems) {
              for (const item of orderItems) {
                // Decrement product quantity
                const { error: inventoryError } = await supabaseAdmin
                  .from("products")
                  .update({ 
                    quantity_in_stock: supabaseAdmin.rpc("decrement", { 
                      inc_amount: item.quantity 
                    }) 
                  })
                  .eq("id", item.product_id);
                
                if (inventoryError) {
                  console.error("Error updating inventory:", inventoryError);
                }
              }
            }
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        
        // Find the session ID associated with this payment intent
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        
        if (sessions.data.length > 0) {
          const sessionId = sessions.data[0].id;
          
          // Update order status
          const { error } = await supabaseAdmin
            .from("orders")
            .update({ 
              payment_status: "failed",
              status: "cancelled" 
            })
            .eq("stripe_session_id", sessionId);

          if (error) {
            console.error("Error updating order status:", error);
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
