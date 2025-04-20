
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Email templates
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
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
  })
};

interface SendEmailParams {
  to: string;
  template: string;
  data: Record<string, any>;
}

export async function sendEmail({ to, template, data }: SendEmailParams): Promise<boolean> {
  try {
    if (!templates[template]) {
      throw new Error(`Template '${template}' not found`);
    }
    
    // Generate email content from template
    const emailTemplate = templates[template](data);
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Naaz Book Depot <no-reply@naazbookdepot.com>",
      to: [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    
    console.log("Email sent successfully:", emailResponse);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
