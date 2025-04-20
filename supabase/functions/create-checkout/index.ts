
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
    // Create Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    
    // Parse request body
    const { cartItems, shippingAddress, billingAddress, shippingCost, taxAmount } = await req.json();
    
    if (!cartItems || !cartItems.length) {
      throw new Error("No items in cart");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Prepare line items for Stripe
    const lineItems = cartItems.map((item: any) => {
      const price = item.product.sale_price || item.product.price;
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.product.name,
            images: item.product.main_image_url ? [item.product.main_image_url] : [],
            metadata: {
              product_id: item.product_id
            }
          },
          unit_amount: Math.round(parseFloat(price) * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping cost if applicable
    if (shippingCost && shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax if applicable
    if (taxAmount && taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Tax",
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    // Customer data
    let customerEmail = user?.email;
    if (!customerEmail && billingAddress?.email) {
      customerEmail = billingAddress.email;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["IN"], // India
      },
      billing_address_collection: "required",
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        user_id: user?.id || "guest",
      },
    });

    // For authenticated users, save order info to database
    if (user?.id) {
      // Use service role to bypass RLS
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Calculate total amount
      const totalAmount = lineItems.reduce((sum: number, item: any) => {
        return sum + (item.price_data.unit_amount * (item.quantity || 1));
      }, 0) / 100; // Convert back from cents

      // Create order record
      const { data: shippingAddressData, error: shippingAddressError } = await supabaseAdmin
        .from('addresses')
        .upsert({
          user_id: user.id,
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          street: shippingAddress.address1,
          street2: shippingAddress.address2 || null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postcode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
          is_default: false,
          type: 'shipping'
        })
        .select()
        .single();

      if (shippingAddressError) {
        console.error("Error saving shipping address:", shippingAddressError);
      }

      const { data: billingAddressData, error: billingAddressError } = await supabaseAdmin
        .from('addresses')
        .upsert({
          user_id: user.id,
          name: `${billingAddress.firstName} ${billingAddress.lastName}`,
          street: billingAddress.address1,
          street2: billingAddress.address2 || null,
          city: billingAddress.city,
          state: billingAddress.state,
          postal_code: billingAddress.postcode,
          country: billingAddress.country,
          phone: billingAddress.phone,
          email: billingAddress.email,
          is_default: false,
          type: 'billing'
        })
        .select()
        .single();

      if (billingAddressError) {
        console.error("Error saving billing address:", billingAddressError);
      }

      // Create order record
      const orderData = {
        user_id: user.id,
        status: 'pending' as const,
        total_amount: totalAmount,
        shipping_address_id: shippingAddressData?.id,
        billing_address_id: billingAddressData?.id,
        shipping_cost: shippingCost || 0,
        tax_amount: taxAmount || 0,
        discount_amount: 0,
        payment_method: 'stripe',
        payment_status: 'pending',
        stripe_session_id: session.id
      };

      const { data: orderResult, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
      } else if (orderResult) {
        // Save order items
        const orderItems = cartItems.map((item: any) => ({
          order_id: orderResult.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.sale_price || item.product.price,
          product_name: item.product.name,
          product_image: item.product.main_image_url || null
        }));

        const { error: orderItemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems);

        if (orderItemsError) {
          console.error("Error saving order items:", orderItemsError);
        }
      }
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
