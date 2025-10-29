import { supabase } from '@/integrations/supabase/client';
import { OrderWithItems, OrderStatus } from '@/types/order';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailNotificationData {
  to: string;
  customerName: string;
  orderNumber: string;
  orderTotal: number;
  orderItems: any[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  orderUrl: string;
}

export class EmailService {
  private static instance: EmailService;
  private baseUrl = window.location.origin;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: OrderWithItems): Promise<boolean> {
    try {
      const template = this.generateOrderConfirmationTemplate({
        to: order.email || '',
        customerName: (order.shipping_address as any)?.name || 'Customer',
        orderNumber: order.order_number,
        orderTotal: order.total_amount,
        orderItems: order.order_items,
        orderUrl: `${this.baseUrl}/track-order/${order.order_number}`
      });

      return await this.sendEmail(order.email || '', template);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return false;
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    order: OrderWithItems, 
    newStatus: OrderStatus, 
    message?: string
  ): Promise<boolean> {
    try {
      const template = this.generateOrderStatusUpdateTemplate({
        to: order.email || '',
        customerName: (order.shipping_address as any)?.name || 'Customer',
        orderNumber: order.order_number,
        orderTotal: order.total_amount,
        orderItems: order.order_items,
        trackingNumber: order.tracking_number || undefined,
        orderUrl: `${this.baseUrl}/track-order/${order.order_number}`
      }, newStatus, message);

      return await this.sendEmail(order.email || '', template);
    } catch (error) {
      console.error('Error sending order status update:', error);
      return false;
    }
  }

  /**
   * Send shipping notification email
   */
  async sendShippingNotification(
    order: OrderWithItems, 
    trackingNumber: string,
    estimatedDelivery?: string
  ): Promise<boolean> {
    try {
      const template = this.generateShippingNotificationTemplate({
        to: order.email || '',
        customerName: (order.shipping_address as any)?.name || 'Customer',
        orderNumber: order.order_number,
        orderTotal: order.total_amount,
        orderItems: order.order_items,
        trackingNumber,
        estimatedDelivery,
        orderUrl: `${this.baseUrl}/track-order/${order.order_number}`
      });

      return await this.sendEmail(order.email || '', template);
    } catch (error) {
      console.error('Error sending shipping notification:', error);
      return false;
    }
  }

  /**
   * Send delivery confirmation email
   */
  async sendDeliveryConfirmation(order: OrderWithItems): Promise<boolean> {
    try {
      const template = this.generateDeliveryConfirmationTemplate({
        to: order.email || '',
        customerName: (order.shipping_address as any)?.name || 'Customer',
        orderNumber: order.order_number,
        orderTotal: order.total_amount,
        orderItems: order.order_items,
        orderUrl: `${this.baseUrl}/track-order/${order.order_number}`
      });

      return await this.sendEmail(order.email || '', template);
    } catch (error) {
      console.error('Error sending delivery confirmation:', error);
      return false;
    }
  }

  /**
   * Send newsletter subscription confirmation
   */
  async sendNewsletterConfirmation(email: string, name: string): Promise<boolean> {
    try {
      const template = this.generateNewsletterConfirmationTemplate(email, name);
      return await this.sendEmail(email, template);
    } catch (error) {
      console.error('Error sending newsletter confirmation:', error);
      return false;
    }
  }

  /**
   * Send marketing email
   */
  async sendMarketingEmail(
    email: string, 
    name: string, 
    subject: string, 
    content: string
  ): Promise<boolean> {
    try {
      const template = this.generateMarketingEmailTemplate(name, subject, content);
      return await this.sendEmail(email, template);
    } catch (error) {
      console.error('Error sending marketing email:', error);
      return false;
    }
  }

  /**
   * Send email using Supabase Edge Function
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject: template.subject,
          html: template.html,
          text: template.text
        }
      });

      if (error) {
        console.error('Email sending error:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error invoking email function:', error);
      // Fallback: Log email for manual processing
      this.logEmailForManualProcessing(to, template);
      return false;
    }
  }

  /**
   * Log email for manual processing when automatic sending fails
   */
  private async logEmailForManualProcessing(to: string, template: EmailTemplate): Promise<void> {
    try {
      await supabase.from('email_queue').insert({
        to_email: to,
        subject: template.subject,
        html_content: template.html,
        text_content: template.text,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging email for manual processing:', error);
    }
  }

  /**
   * Generate order confirmation email template
   */
  private generateOrderConfirmationTemplate(data: EmailNotificationData): EmailTemplate {
    const subject = `Order Confirmation - ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { border-bottom: 1px solid #eee; padding: 10px 0; }
          .total { font-weight: bold; font-size: 18px; color: #2D5A27; }
          .button { display: inline-block; background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Naaz Book Depot</h1>
            <p>Order Confirmation</p>
          </div>
          
          <div class="content">
            <h2>Thank you for your order, ${data.customerName}!</h2>
            <p>We've received your order and are preparing it for shipment. You'll receive another email when your order has been shipped.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Order Total:</strong> ₹${data.orderTotal.toFixed(2)}</p>
              
              <h4>Items Ordered:</h4>
              ${data.orderItems.map(item => `
                <div class="item">
                  <strong>${item.product_name || 'Product'}</strong><br>
                  Quantity: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}
                </div>
              `).join('')}
              
              <div class="total">
                Total: ₹${data.orderTotal.toFixed(2)}
              </div>
            </div>
            
            <a href="${data.orderUrl}" class="button">Track Your Order</a>
            
            <p>If you have any questions about your order, please contact our customer service team.</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Naaz Book Depot. All rights reserved.</p>
            <p>This email was sent to ${data.to}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Confirmation - ${data.orderNumber}
      
      Thank you for your order, ${data.customerName}!
      
      Order Details:
      Order Number: ${data.orderNumber}
      Order Total: ₹${data.orderTotal.toFixed(2)}
      
      Items Ordered:
      ${data.orderItems.map(item => 
        `${item.product_name || 'Product'} - Qty: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${(item.quantity * item.price).toFixed(2)}`
      ).join('\n')}
      
      Track your order: ${data.orderUrl}
      
      © 2024 Naaz Book Depot
    `;

    return { subject, html, text };
  }

  /**
   * Generate order status update email template
   */
  private generateOrderStatusUpdateTemplate(
    data: EmailNotificationData, 
    status: OrderStatus, 
    message?: string
  ): EmailTemplate {
    const statusMessages = {
      pending: 'Your order is being processed',
      confirmed: 'Your order has been confirmed',
      processing: 'Your order is being prepared',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
      refunded: 'Your order has been refunded',
      pending_payment_verification: 'Payment verification is pending'
    };

    const subject = `Order Update - ${data.orderNumber}`;
    const statusMessage = message || statusMessages[status] || 'Your order status has been updated';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .status-update { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2D5A27; }
          .button { display: inline-block; background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Naaz Book Depot</h1>
            <p>Order Update</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            
            <div class="status-update">
              <h3>Order Status Update</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Status:</strong> ${statusMessage}</p>
              ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
            </div>
            
            <a href="${data.orderUrl}" class="button">View Order Details</a>
            
            <p>Thank you for shopping with us!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Naaz Book Depot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Update - ${data.orderNumber}
      
      Hello ${data.customerName},
      
      Order Status Update:
      Order Number: ${data.orderNumber}
      Status: ${statusMessage}
      ${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}
      
      View order details: ${data.orderUrl}
      
      © 2024 Naaz Book Depot
    `;

    return { subject, html, text };
  }

  /**
   * Generate shipping notification email template
   */
  private generateShippingNotificationTemplate(data: EmailNotificationData): EmailTemplate {
    const subject = `Your order is on its way! - ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .shipping-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .tracking { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Naaz Book Depot</h1>
            <p>📦 Your Order is Shipped!</p>
          </div>
          
          <div class="content">
            <h2>Great news, ${data.customerName}!</h2>
            <p>Your order has been shipped and is on its way to you.</p>
            
            <div class="shipping-info">
              <h3>Shipping Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
              ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
            </div>
            
            ${data.trackingNumber ? `
            <div class="tracking">
              <h4>📍 Track Your Package</h4>
              <p>Use tracking number <strong>${data.trackingNumber}</strong> to track your package with the carrier.</p>
            </div>
            ` : ''}
            
            <a href="${data.orderUrl}" class="button">Track Your Order</a>
            
            <p>We'll send you another email when your order is delivered. Thank you for shopping with us!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Naaz Book Depot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Your order is on its way! - ${data.orderNumber}
      
      Great news, ${data.customerName}!
      Your order has been shipped and is on its way to you.
      
      Shipping Details:
      Order Number: ${data.orderNumber}
      ${data.trackingNumber ? `Tracking Number: ${data.trackingNumber}` : ''}
      ${data.estimatedDelivery ? `Estimated Delivery: ${data.estimatedDelivery}` : ''}
      
      Track your order: ${data.orderUrl}
      
      © 2024 Naaz Book Depot
    `;

    return { subject, html, text };
  }

  /**
   * Generate delivery confirmation email template
   */
  private generateDeliveryConfirmationTemplate(data: EmailNotificationData): EmailTemplate {
    const subject = `Order Delivered - ${data.orderNumber}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .delivery-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .feedback { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Naaz Book Depot</h1>
            <p>✅ Order Delivered!</p>
          </div>
          
          <div class="content">
            <h2>Congratulations, ${data.customerName}!</h2>
            <p>Your order has been successfully delivered. We hope you enjoy your purchase!</p>
            
            <div class="delivery-info">
              <h3>Delivery Confirmation</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Delivered:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div class="feedback">
              <h4>📝 How was your experience?</h4>
              <p>We'd love to hear about your experience with us. Your feedback helps us improve our service.</p>
              <a href="${data.orderUrl}" class="button">Leave a Review</a>
            </div>
            
            <p>Thank you for choosing Naaz Book Depot. We look forward to serving you again!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Naaz Book Depot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Delivered - ${data.orderNumber}
      
      Congratulations, ${data.customerName}!
      Your order has been successfully delivered.
      
      Order Number: ${data.orderNumber}
      Delivered: ${new Date().toLocaleDateString('en-IN')}
      
      We'd love your feedback: ${data.orderUrl}
      
      © 2024 Naaz Book Depot
    `;

    return { subject, html, text };
  }

  /**
   * Generate newsletter confirmation email template
   */
  private generateNewsletterConfirmationTemplate(email: string, name: string): EmailTemplate {
    const subject = 'Welcome to Naaz Book Depot Newsletter!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .welcome { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .button { display: inline-block; background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Naaz Book Depot</h1>
            <p>📚 Welcome to Our Newsletter!</p>
          </div>
          
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for subscribing to the Naaz Book Depot newsletter. You'll now receive updates about:</p>
            
            <div class="welcome">
              <ul>
                <li>📖 New Islamic books and publications</li>
                <li>🎯 Special offers and discounts</li>
                <li>📚 Author spotlights and book reviews</li>
                <li>🕌 Islamic knowledge and insights</li>
                <li>📦 Early access to new arrivals</li>
              </ul>
            </div>
            
            <a href="${this.baseUrl}/products" class="button">Browse Our Collection</a>
            
            <p>We're committed to bringing you the finest Islamic literature and knowledge. Stay tuned for exciting updates!</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Naaz Book Depot. All rights reserved.</p>
            <p>You can unsubscribe at any time by clicking <a href="${this.baseUrl}/unsubscribe?email=${email}">here</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Naaz Book Depot Newsletter!
      
      Welcome, ${name}!
      
      Thank you for subscribing. You'll receive updates about:
      - New Islamic books and publications
      - Special offers and discounts
      - Author spotlights and book reviews
      - Islamic knowledge and insights
      - Early access to new arrivals
      
      Browse our collection: ${this.baseUrl}/products
      
      © 2024 Naaz Book Depot
      Unsubscribe: ${this.baseUrl}/unsubscribe?email=${email}
    `;

    return { subject, html, text };
  }

  /**
   * Generate marketing email template
   */
  private generateMarketingEmailTemplate(name: string, subject: string, content: string): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D5A27; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .message { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .button { display: inline-block; background: #2D5A27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Naaz Book Depot</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="message">
              ${content}
            </div>
            
            <a href="${this.baseUrl}/products" class="button">Shop Now</a>
          </div>
          
          <div class="footer">
            <p>© 2024 Naaz Book Depot. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${subject}
      
      Hello ${name},
      
      ${content.replace(/<[^>]*>/g, '')}
      
      Shop now: ${this.baseUrl}/products
      
      © 2024 Naaz Book Depot
    `;

    return { subject, html, text };
  }
}

export const emailService = EmailService.getInstance();