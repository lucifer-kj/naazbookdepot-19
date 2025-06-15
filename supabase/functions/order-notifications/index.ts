
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateOrderConfirmationEmail, generateOrderStatusUpdateEmail } from '../../../src/lib/utils/emailTemplates.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, eventType, webhookUrl } = await req.json();

    if (!orderId || !eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order details with customer info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .single();

    if (!profile) {
      console.error('Customer profile not found');
      return new Response(
        JSON.stringify({ error: 'Customer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check email notification preferences
    const emailPrefs = profile.email_notifications || { order_updates: true };
    
    let emailSent = false;
    let webhookSent = false;
    let emailHtml = '';
    let subject = '';

    // Send email notification if enabled
    if (emailPrefs.order_updates) {
      try {
        if (eventType === 'order_created') {
          subject = `Order Confirmation - ${order.order_number}`;
          emailHtml = generateOrderConfirmationEmail(order, profile);
        } else if (eventType === 'status_updated') {
          subject = `Order Update - ${order.order_number}`;
          emailHtml = generateOrderStatusUpdateEmail(order, profile, order.status);
        }

        if (emailHtml && subject) {
          // Call the existing send-email function
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: profile.email || '',
              subject,
              html: emailHtml,
            },
          });

          if (emailError) {
            console.error('Error sending email:', emailError);
          } else {
            emailSent = true;
            console.log('Email sent successfully');
          }
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    // Send webhook if URL provided
    if (webhookUrl) {
      try {
        const webhookPayload = {
          event: eventType,
          order_id: orderId,
          order_number: order.order_number,
          status: order.status,
          total: order.total,
          customer: {
            id: order.user_id,
            name: profile.name,
            email: profile.email
          },
          timestamp: new Date().toISOString()
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Naaz-Books-Webhook/1.0'
          },
          body: JSON.stringify(webhookPayload)
        });

        // Log webhook attempt
        const { error: logError } = await supabase
          .from('webhook_logs')
          .insert({
            order_id: orderId,
            event_type: eventType,
            webhook_url: webhookUrl,
            payload: webhookPayload,
            response_status: webhookResponse.status,
            response_body: await webhookResponse.text(),
            success: webhookResponse.ok,
            retry_count: 0
          });

        if (logError) {
          console.error('Error logging webhook:', logError);
        }

        webhookSent = webhookResponse.ok;
      } catch (webhookError) {
        console.error('Webhook sending failed:', webhookError);
        
        // Log failed webhook
        await supabase
          .from('webhook_logs')
          .insert({
            order_id: orderId,
            event_type: eventType,
            webhook_url: webhookUrl,
            payload: { error: String(webhookError) },
            response_status: 0,
            response_body: String(webhookError),
            success: false,
            retry_count: 0
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_sent: emailSent,
        webhook_sent: webhookSent,
        message: 'Notifications processed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
