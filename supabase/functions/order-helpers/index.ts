
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
          .select("*");
          
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "getOrderNotes": {
        const { orderId } = params;
        
        if (!orderId) {
          throw new Error("Order ID is required");
        }
        
        // Fetch order notes with user info
        const { data, error } = await supabase
          .from("order_notes")
          .select(`
            *,
            user:user_id (
              first_name,
              last_name
            )
          `)
          .eq("order_id", orderId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "deleteOrderNote": {
        const { noteId } = params;
        
        if (!noteId) {
          throw new Error("Note ID is required");
        }
        
        const { error } = await supabase
          .from("order_notes")
          .delete()
          .eq("id", noteId);
          
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "getOrderTimeline": {
        const { orderId } = params;
        
        if (!orderId) {
          throw new Error("Order ID is required");
        }
        
        // Fetch order timeline with user info
        const { data, error } = await supabase
          .from("order_timeline")
          .select(`
            *,
            user:user_id (
              first_name,
              last_name
            )
          `)
          .eq("order_id", orderId)
          .order("created_at", { ascending: true });
          
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "addOrderTimelineEntry": {
        const { orderId, status, userId, note } = params;
        
        // Validate inputs
        if (!orderId || !status) {
          throw new Error("Missing required parameters");
        }
        
        // Add timeline entry
        const { data, error } = await supabase
          .from("order_timeline")
          .insert({
            order_id: orderId,
            status,
            user_id: userId || null,
            note: note || null
          })
          .select();
          
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "bulkAddTimelineEntries": {
        const { orderIds, status, userId, note } = params;
        
        // Validate inputs
        if (!orderIds || !Array.isArray(orderIds) || !status) {
          throw new Error("Missing required parameters");
        }
        
        const entries = orderIds.map(orderId => ({
          order_id: orderId,
          status,
          user_id: userId || null,
          note: note || null
        }));
        
        // Bulk add timeline entries
        const { data, error } = await supabase
          .from("order_timeline")
          .insert(entries);
          
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "saveRazorpayPayment": {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
        
        if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          throw new Error("Missing payment parameters");
        }
        
        // Update order with payment details
        const { error } = await supabase
          .from("orders")
          .update({
            payment_status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);
          
        if (error) throw error;
        
        // Add timeline entry
        await supabase
          .from("order_timeline")
          .insert({
            order_id: orderId,
            status: "processing",
            note: `Payment completed. Reference: ${razorpayPaymentId}`
          });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "webhookPublishBlog": {
        const { blogData, webhookSecret } = params;
        
        // Verify webhook secret
        const configSecret = Deno.env.get("MAKE_WEBHOOK_SECRET");
        if (!configSecret || webhookSecret !== configSecret) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 403,
          });
        }
        
        if (!blogData || !blogData.title || !blogData.content) {
          throw new Error("Invalid blog data");
        }
        
        // Generate slug from title
        const slug = blogData.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
        
        // Insert blog post
        const { data, error } = await supabase
          .from("blog_posts")
          .insert({
            title: blogData.title,
            content: blogData.content,
            slug: slug,
            excerpt: blogData.excerpt || blogData.content.substring(0, 150) + '...',
            is_automated: true,
            status: blogData.status || 'draft',
            featured_image_url: blogData.featured_image_url,
            meta_title: blogData.meta_title || blogData.title,
            meta_description: blogData.meta_description || blogData.excerpt,
            tags: blogData.tags || [],
            category_id: blogData.category_id,
            author_name: blogData.author_name || "Naaz Book Depot",
            published_at: blogData.status === 'published' ? new Date().toISOString() : null
          })
          .select();
          
        if (error) throw error;
        
        return new Response(JSON.stringify({ success: true, post: data[0] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "verifyRazorpayPayment": {
        const { paymentId } = params;
        
        if (!paymentId) {
          throw new Error("Payment ID is required");
        }
        
        // In a real implementation, you would verify with Razorpay API
        // For now, we'll simulate a successful verification
        
        return new Response(JSON.stringify({ 
          verified: true,
          status: "captured" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Order helper error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
