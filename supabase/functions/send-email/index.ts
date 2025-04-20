
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, any>;
}

// Email templates
const templates = {
  orderConfirmation: (data: any) => ({
    subject: `Order Confirmation #${data.orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Thank You for Your Order!</h1>
        <p>Hello ${data.customerName},</p>
        <p>Your order #${data.orderId} has been confirmed and is being processed.</p>
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
          <p><strong>Order Total:</strong> ₹${data.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${data.paymentStatus}</p>
        </div>
        <h3>Items Ordered</h3>
        ${data.items.map((item: any) => `
          <div style="display: flex; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <div style="flex: 3;">
              <p style="margin: 0; font-weight: bold;">${item.productName}</p>
              <p style="margin: 0; color: #666;">Quantity: ${item.quantity}</p>
            </div>
            <div style="flex: 1; text-align: right;">
              <p style="margin: 0;">₹${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        `).join('')}
        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Subtotal:</strong> ₹${data.subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> ₹${data.shippingCost.toFixed(2)}</p>
          <p><strong>Tax:</strong> ₹${data.taxAmount.toFixed(2)}</p>
          ${data.discountAmount > 0 ? `<p><strong>Discount:</strong> -₹${data.discountAmount.toFixed(2)}</p>` : ''}
          <p style="font-size: 18px; font-weight: bold;">Total: ₹${data.totalAmount.toFixed(2)}</p>
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <h3>Shipping Address</h3>
          <p>${data.shippingAddress.line1}<br>
          ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>
          ${data.shippingAddress.country}</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>If you have any questions about your order, please contact our customer support at support@naazbookdepot.com</p>
          <p>&copy; ${new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  shippingUpdate: (data: any) => ({
    subject: `Shipping Update for Order #${data.orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Your Order Has Been Shipped!</h1>
        <p>Hello ${data.customerName},</p>
        <p>Your order #${data.orderId} has been shipped and is on its way to you.</p>
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Shipping Details</h3>
          <p><strong>Shipping Carrier:</strong> ${data.carrier}</p>
          <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">Track Your Package</a></p>` : ''}
        </div>
        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <h3>Shipping Address</h3>
          <p>${data.shippingAddress.line1}<br>
          ${data.shippingAddress.line2 ? data.shippingAddress.line2 + '<br>' : ''}
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>
          ${data.shippingAddress.country}</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>If you have any questions about your order, please contact our customer support at support@naazbookdepot.com</p>
          <p>&copy; ${new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  passwordReset: (data: any) => ({
    subject: "Reset Your Password - Naaz Book Depot",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password for your Naaz Book Depot account. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
        <p style="word-break: break-all; background-color: #f7f7f7; padding: 10px; border-radius: 5px;">${data.resetUrl}</p>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>&copy; ${new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    `
  }),
  
  welcomeEmail: (data: any) => ({
    subject: "Welcome to Naaz Book Depot!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to Naaz Book Depot!</h1>
        <p>Hello ${data.customerName},</p>
        <p>Thank you for creating an account with Naaz Book Depot. We're excited to have you join our community of book lovers!</p>
        <div style="background-color: #f7f7f7; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">What's Next?</h3>
          <ul>
            <li>Browse our extensive collection of books, perfumes, and essentials</li>
            <li>Update your profile and address information</li>
            <li>Add items to your wishlist</li>
            <li>Check out our latest deals and promotions</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.storeUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Shopping</a>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>If you have any questions, please contact our customer support at support@naazbookdepot.com</p>
          <p>&copy; ${new Date().getFullYear()} Naaz Book Depot. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Handle requests
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { to, template, data }: EmailRequest = await req.json();
    
    // Validate inputs
    if (!to || !template || !data) {
      throw new Error("Missing required fields: to, template, data");
    }
    
    // Check if template exists
    if (!templates[template as keyof typeof templates]) {
      throw new Error(`Template '${template}' not found`);
    }
    
    // Generate email content from template
    const emailTemplate = templates[template as keyof typeof templates](data);
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Naaz Book Depot <no-reply@naazbookdepot.com>",
      to: [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    
    console.log("Email sent successfully:", emailResponse);

    // Log email delivery
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from("email_logs").insert({
        recipient: to,
        template_name: template,
        related_data: data,
        status: "delivered",
        resend_id: emailResponse.id,
      });
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    // Log email failure if possible
    try {
      const { to, template, data } = await req.json();
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey && to && template) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.from("email_logs").insert({
          recipient: to,
          template_name: template,
          related_data: data,
          status: "failed",
          error_message: error.message,
        });
      }
    } catch (logError) {
      console.error("Failed to log email error:", logError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
