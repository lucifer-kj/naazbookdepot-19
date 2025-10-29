import { supabase } from '@/integrations/supabase/client';
import { emailService } from './emailService';
import { OrderWithItems, OrderStatus } from '@/types/order';

export class EmailNotificationService {
  private static instance: EmailNotificationService;

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Initialize email notifications for order status changes
   */
  async initializeOrderNotifications(): Promise<void> {
    try {
      // Set up real-time subscription for order changes
      const subscription = supabase
        .channel('order-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            this.handleOrderStatusChange(payload.new as unknown, payload.old as unknown);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            this.handleNewOrder(payload.new as unknown);
          }
        )
        .subscribe();

      console.log('Email notification system initialized');
    } catch (error) {
      console.error('Error initializing email notifications:', error);
    }
  }

  /**
   * Handle new order creation
   */
  private async handleNewOrder(order: unknown): Promise<void> {
    try {
      // Get full order with items
      const fullOrder = await this.getOrderWithItems(order.id);
      if (!fullOrder) return;

      // Check if user wants order notifications
      const shouldSendEmail = await this.shouldSendOrderEmail(fullOrder.email, 'order_updates');
      if (!shouldSendEmail) return;

      // Send order confirmation email
      await emailService.sendOrderConfirmation(fullOrder);

      // Log notification
      await this.logNotification(fullOrder.id, 'order_confirmation', 'sent');
    } catch (error) {
      console.error('Error handling new order notification:', error);
    }
  }

  /**
   * Handle order status changes
   */
  private async handleOrderStatusChange(newOrder: unknown, oldOrder: unknown): Promise<void> {
    try {
      // Only process if status actually changed
      if (newOrder.status === oldOrder.status) return;

      // Get full order with items
      const fullOrder = await this.getOrderWithItems(newOrder.id);
      if (!fullOrder) return;

      // Check if user wants order notifications
      const shouldSendEmail = await this.shouldSendOrderEmail(fullOrder.email, 'order_updates');
      if (!shouldSendEmail) return;

      // Send appropriate notification based on new status
      await this.sendStatusNotification(fullOrder, newOrder.status, oldOrder.status);

      // Log notification
      await this.logNotification(fullOrder.id, `status_${newOrder.status}`, 'sent');
    } catch (error) {
      console.error('Error handling order status change notification:', error);
    }
  }

  /**
   * Send status-specific notification
   */
  private async sendStatusNotification(
    order: OrderWithItems,
    newStatus: OrderStatus,
    oldStatus: OrderStatus
  ): Promise<void> {
    switch (newStatus) {
      case 'confirmed':
        await emailService.sendOrderStatusUpdate(order, newStatus, 'Your order has been confirmed and is being processed');
        break;

      case 'processing':
        await emailService.sendOrderStatusUpdate(order, newStatus, 'Your order is being prepared for shipment');
        break;

      case 'shipped': {
        // Check if user wants shipping notifications
        const wantsShipping = await this.shouldSendOrderEmail(order.email, 'shipping_notifications');
        if (wantsShipping) {
          await emailService.sendShippingNotification(
            order,
            order.tracking_number || '',
            order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('en-IN') : undefined
          );
        }
        break;
      }

      case 'delivered':
        await emailService.sendDeliveryConfirmation(order);
        break;

      case 'cancelled':
        await emailService.sendOrderStatusUpdate(order, newStatus, 'Your order has been cancelled');
        break;

      case 'refunded':
        await emailService.sendOrderStatusUpdate(order, newStatus, 'Your order has been refunded');
        break;

      default:
        await emailService.sendOrderStatusUpdate(order, newStatus);
        break;
    }
  }

  /**
   * Get full order with items
   */
  private async getOrderWithItems(orderId: number): Promise<OrderWithItems | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        console.error('Error fetching order:', error);
        return null;
      }

      return data as OrderWithItems;
    } catch (error) {
      console.error('Error getting order with items:', error);
      return null;
    }
  }

  /**
   * Check if user wants to receive specific type of email
   */
  private async shouldSendOrderEmail(email: string | null, type: string): Promise<boolean> {
    if (!email) return false;

    try {
      // Check user preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_preferences')
        .eq('email', email.toLowerCase())
        .single();

      if (profile?.email_preferences) {
        return profile.email_preferences[type] !== false;
      }

      // Default to true if no preferences set
      return true;
    } catch (error) {
      console.error('Error checking email preferences:', error);
      // Default to true if we can't check preferences
      return true;
    }
  }

  /**
   * Log email notification for tracking
   */
  private async logNotification(
    orderId: number,
    type: string,
    status: 'sent' | 'failed'
  ): Promise<void> {
    try {
      await supabase.from('email_notifications').insert({
        order_id: orderId,
        notification_type: type,
        status,
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Send marketing email to newsletter subscribers
   */
  async sendMarketingEmail(
    subject: string,
    content: string,
    targetSegment?: 'all' | 'new_arrivals' | 'special_offers' | 'islamic_insights'
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    try {
      // Get newsletter subscribers based on segment
      let query = supabase
        .from('newsletter_subscribers')
        .select('email, name, preferences')
        .eq('is_active', true);

      if (targetSegment && targetSegment !== 'all') {
        query = query.eq(`preferences->${targetSegment}`, true);
      }

      const { data: subscribers, error } = await query;

      if (error || !subscribers) {
        console.error('Error fetching subscribers:', error);
        return { sent: 0, failed: 1 };
      }

      // Send emails in batches to avoid rate limiting
      const batchSize = 50;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);

        const promises = batch.map(async (subscriber) => {
          try {
            await emailService.sendMarketingEmail(
              subscriber.email,
              subscriber.name || 'Subscriber',
              subject,
              content
            );
            sent++;
          } catch (error) {
            console.error(`Failed to send email to ${subscriber.email}:`, error);
            failed++;
          }
        });

        await Promise.allSettled(promises);

        // Add delay between batches
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Log marketing campaign
      await supabase.from('marketing_campaigns').insert({
        subject,
        content,
        target_segment: targetSegment || 'all',
        sent_count: sent,
        failed_count: failed,
        sent_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error sending marketing email:', error);
      failed++;
    }

    return { sent, failed };
  }

  /**
   * Send abandoned cart recovery email
   */
  async sendAbandonedCartEmail(userId: string, cartItems: unknown[]): Promise<boolean> {
    try {
      // Get user details
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (!profile?.email) return false;

      // Check if user wants marketing emails
      const shouldSend = await this.shouldSendOrderEmail(profile.email, 'special_offers');
      if (!shouldSend) return false;

      // Calculate cart total
      const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      // Generate abandoned cart email content
      const content = `
        <h2>Don't forget your Islamic books!</h2>
        <p>You left some wonderful books in your cart. Complete your purchase to continue your journey of Islamic knowledge.</p>
        
        <div style="background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3>Items in your cart:</h3>
          ${cartItems.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <strong>${item.title}</strong><br>
              ₹${item.price.toFixed(2)} × ${item.quantity}
            </div>
          `).join('')}
          <div style="font-weight: bold; font-size: 18px; color: #2D5A27; margin-top: 10px;">
            Total: ₹${cartTotal.toFixed(2)}
          </div>
        </div>
        
        <p>Complete your purchase now and get free shipping on orders over ₹500!</p>
      `;

      await emailService.sendMarketingEmail(
        profile.email,
        profile.name || 'Valued Customer',
        'Complete your purchase - Islamic books waiting for you',
        content
      );

      return true;
    } catch (error) {
      console.error('Error sending abandoned cart email:', error);
      return false;
    }
  }

  /**
   * Schedule abandoned cart emails
   */
  async scheduleAbandonedCartEmails(): Promise<void> {
    try {
      // This would typically be run as a scheduled job
      // For now, we'll check for carts abandoned in the last 24 hours

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Get users with items in cart but no recent orders
      const { data: abandonedCarts } = await supabase
        .from('cart_items')
        .select(`
          user_id,
          product_id,
          quantity,
          products (title, price)
        `)
        .gte('updated_at', oneDayAgo.toISOString());

      if (!abandonedCarts) return;

      // Group by user
      const userCarts = abandonedCarts.reduce((acc, item) => {
        if (!acc[item.user_id]) {
          acc[item.user_id] = [];
        }
        acc[item.user_id].push({
          title: (item.products as unknown)?.title || 'Product',
          price: (item.products as unknown)?.price || 0,
          quantity: item.quantity
        });
        return acc;
      }, {} as Record<string, unknown[]>);

      // Send abandoned cart emails
      for (const [userId, items] of Object.entries(userCarts)) {
        await this.sendAbandonedCartEmail(userId, items);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error('Error scheduling abandoned cart emails:', error);
    }
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();
