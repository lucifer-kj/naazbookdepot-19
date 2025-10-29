import { Database } from './supabase';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface TrackingUpdate {
  id: string;
  status: OrderStatus;
  message: string;
  location?: string;
  timestamp: string;
  carrier?: string;
  tracking_number?: string;
}

export interface OrderTimeline {
  order_id: number;
  status: OrderStatus;
  message: string;
  timestamp: string;
  location?: string;
  carrier_info?: {
    name: string;
    tracking_url?: string;
    estimated_delivery?: string;
  };
}

export interface ShippingCarrier {
  id: string;
  name: string;
  tracking_url_template: string;
  api_endpoint?: string;
  supported_countries: string[];
}

export interface DeliveryEstimate {
  estimated_date: string;
  min_days: number;
  max_days: number;
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
}

export interface OrderTrackingInfo {
  order: OrderWithItems;
  timeline: OrderTimeline[];
  current_status: OrderStatus;
  tracking_number?: string;
  carrier?: ShippingCarrier;
  delivery_estimate?: DeliveryEstimate;
  last_update: string;
}
