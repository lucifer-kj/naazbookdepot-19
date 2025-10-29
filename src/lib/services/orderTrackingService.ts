import { supabase } from '@/integrations/supabase/client';
import { 
  Order, 
  OrderWithItems, 
  OrderTimeline, 
  OrderTrackingInfo, 
  ShippingCarrier, 
  DeliveryEstimate,
  OrderStatus 
} from '@/types/order';

export class OrderTrackingService {
  private static instance: OrderTrackingService;
  private carriers: ShippingCarrier[] = [
    {
      id: 'india_post',
      name: 'India Post',
      tracking_url_template: 'https://www.indiapost.gov.in/VAS/Pages/IndiaPostHome.aspx?TrackID={tracking_number}',
      supported_countries: ['IN']
    },
    {
      id: 'delhivery',
      name: 'Delhivery',
      tracking_url_template: 'https://www.delhivery.com/track/package/{tracking_number}',
      supported_countries: ['IN']
    },
    {
      id: 'bluedart',
      name: 'Blue Dart',
      tracking_url_template: 'https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo={tracking_number}',
      supported_countries: ['IN']
    },
    {
      id: 'dtdc',
      name: 'DTDC',
      tracking_url_template: 'https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno={tracking_number}',
      supported_countries: ['IN']
    }
  ];

  public static getInstance(): OrderTrackingService {
    if (!OrderTrackingService.instance) {
      OrderTrackingService.instance = new OrderTrackingService();
    }
    return OrderTrackingService.instance;
  }

  /**
   * Get order with tracking information
   */
  async getOrderTrackingInfo(orderNumber: string): Promise<OrderTrackingInfo | null> {
    try {
      // Fetch order with items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('order_number', orderNumber)
        .single();

      if (orderError || !order) {
        console.error('Error fetching order:', orderError);
        return null;
      }

      // Fetch order timeline
      const timeline = await this.getOrderTimeline(order.id);

      // Get carrier information
      const carrier = order.tracking_number ? 
        this.getCarrierByTrackingNumber(order.tracking_number) : undefined;

      // Calculate delivery estimate
      const deliveryEstimate = await this.calculateDeliveryEstimate(order);

      return {
        order: order as OrderWithItems,
        timeline,
        current_status: order.status,
        tracking_number: order.tracking_number || undefined,
        carrier,
        delivery_estimate: deliveryEstimate,
        last_update: order.updated_at
      };
    } catch (error) {
      console.error('Error getting order tracking info:', error);
      return null;
    }
  }

  /**
   * Get order timeline with status history
   */
  async getOrderTimeline(orderId: number): Promise<OrderTimeline[]> {
    try {
      const { data, error } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching order timeline:', error);
        return this.generateDefaultTimeline(orderId);
      }

      return data || this.generateDefaultTimeline(orderId);
    } catch (error) {
      console.error('Error getting order timeline:', error);
      return this.generateDefaultTimeline(orderId);
    }
  }

  /**
   * Generate default timeline if no timeline exists
   */
  private async generateDefaultTimeline(orderId: number): Promise<OrderTimeline[]> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) return [];

      const timeline: OrderTimeline[] = [
        {
          order_id: orderId,
          status: 'pending',
          message: 'Order placed successfully',
          timestamp: order.created_at
        }
      ];

      if (order.status !== 'pending') {
        timeline.push({
          order_id: orderId,
          status: 'confirmed',
          message: 'Order confirmed and being processed',
          timestamp: order.updated_at
        });
      }

      if (order.status === 'shipped' || order.status === 'delivered') {
        timeline.push({
          order_id: orderId,
          status: 'shipped',
          message: 'Order shipped',
          timestamp: order.shipped_at || order.updated_at,
          carrier_info: order.tracking_number ? {
            name: this.getCarrierByTrackingNumber(order.tracking_number)?.name || 'Unknown Carrier'
          } : undefined
        });
      }

      if (order.status === 'delivered') {
        timeline.push({
          order_id: orderId,
          status: 'delivered',
          message: 'Order delivered successfully',
          timestamp: order.delivered_at || order.updated_at
        });
      }

      return timeline;
    } catch (error) {
      console.error('Error generating default timeline:', error);
      return [];
    }
  }

  /**
   * Update order status and add timeline entry
   */
  async updateOrderStatus(
    orderId: number, 
    status: OrderStatus, 
    message: string,
    trackingNumber?: string,
    location?: string
  ): Promise<boolean> {
    try {
      // Update order status
      const updateData: unknown = {
        status,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      }

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error: orderError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order status:', orderError);
        return false;
      }

      // Add timeline entry
      await this.addTimelineEntry(orderId, status, message, location, trackingNumber);

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  /**
   * Add entry to order timeline
   */
  async addTimelineEntry(
    orderId: number,
    status: OrderStatus,
    message: string,
    location?: string,
    trackingNumber?: string
  ): Promise<void> {
    try {
      const timelineEntry: Partial<OrderTimeline> = {
        order_id: orderId,
        status,
        message,
        timestamp: new Date().toISOString(),
        location
      };

      if (trackingNumber) {
        const carrier = this.getCarrierByTrackingNumber(trackingNumber);
        if (carrier) {
          timelineEntry.carrier_info = {
            name: carrier.name,
            tracking_url: carrier.tracking_url_template.replace('{tracking_number}', trackingNumber)
          };
        }
      }

      const { error } = await supabase
        .from('order_timeline')
        .insert([timelineEntry]);

      if (error) {
        console.error('Error adding timeline entry:', error);
      }
    } catch (error) {
      console.error('Error adding timeline entry:', error);
    }
  }

  /**
   * Get carrier information by tracking number pattern
   */
  private getCarrierByTrackingNumber(trackingNumber: string): ShippingCarrier | undefined {
    // Simple pattern matching - in production, this would be more sophisticated
    if (trackingNumber.startsWith('IN')) {
      return this.carriers.find(c => c.id === 'india_post');
    }
    if (trackingNumber.length === 10 && /^\d+$/.test(trackingNumber)) {
      return this.carriers.find(c => c.id === 'delhivery');
    }
    if (trackingNumber.startsWith('BD')) {
      return this.carriers.find(c => c.id === 'bluedart');
    }
    if (trackingNumber.startsWith('D')) {
      return this.carriers.find(c => c.id === 'dtdc');
    }
    
    return this.carriers[0]; // Default to India Post
  }

  /**
   * Calculate estimated delivery date
   */
  private async calculateDeliveryEstimate(order: Order): Promise<DeliveryEstimate | undefined> {
    try {
      const shippingAddress = order.shipping_address as unknown;
      if (!shippingAddress) return undefined;

      const city = shippingAddress.city?.toLowerCase();
      const state = shippingAddress.state?.toLowerCase();
      
      let minDays = 3;
      let maxDays = 7;
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      const factors: string[] = [];

      // Adjust based on location (simplified logic)
      const majorCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad'];
      
      if (city && majorCities.includes(city)) {
        minDays = 2;
        maxDays = 4;
        confidence = 'high';
        factors.push('Major city delivery');
      } else {
        minDays = 4;
        maxDays = 8;
        factors.push('Standard delivery area');
      }

      // Adjust based on order status
      if (order.status === 'shipped') {
        minDays = Math.max(1, minDays - 2);
        maxDays = Math.max(2, maxDays - 2);
        factors.push('Order already shipped');
      }

      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + Math.ceil((minDays + maxDays) / 2));

      return {
        estimated_date: estimatedDate.toISOString(),
        min_days: minDays,
        max_days: maxDays,
        confidence,
        factors
      };
    } catch (error) {
      console.error('Error calculating delivery estimate:', error);
      return undefined;
    }
  }

  /**
   * Get all carriers
   */
  getCarriers(): ShippingCarrier[] {
    return this.carriers;
  }

  /**
   * Get tracking URL for a tracking number
   */
  getTrackingUrl(trackingNumber: string): string | undefined {
    const carrier = this.getCarrierByTrackingNumber(trackingNumber);
    return carrier?.tracking_url_template.replace('{tracking_number}', trackingNumber);
  }

  /**
   * Search orders by various criteria
   */
  async searchOrders(criteria: {
    userId?: string;
    email?: string;
    phone?: string;
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<OrderWithItems[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `);

      if (criteria.userId) {
        query = query.eq('user_id', criteria.userId);
      }

      if (criteria.email) {
        query = query.eq('email', criteria.email);
      }

      if (criteria.phone) {
        query = query.eq('phone', criteria.phone);
      }

      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      if (criteria.dateFrom) {
        query = query.gte('created_at', criteria.dateFrom);
      }

      if (criteria.dateTo) {
        query = query.lte('created_at', criteria.dateTo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching orders:', error);
        return [];
      }

      return data as OrderWithItems[] || [];
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  }
}

export const orderTrackingService = OrderTrackingService.getInstance();
