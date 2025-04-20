import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderFilter {
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface OrderDetails {
  id: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  user_id: string | null;
  total_amount: number;
  shipping_address_id: string | null;
  billing_address_id: string | null;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  payment_method: string | null;
  payment_status: string | null;
  coupon_code: string | null;
  customer: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  timeline: OrderTimeline[];
  notes: OrderNote[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  order_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  product: {
    name: string;
    slug: string;
    sku: string;
  };
}

export interface Address {
  id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  status: OrderStatus;
  created_at: string;
  user_id: string | null;
  note: string | null;
  user?: {
    first_name: string;
    last_name: string;
  };
}

export interface OrderNote {
  id: string;
  order_id: string;
  user_id: string;
  note: string;
  created_at: string;
  is_customer_visible: boolean;
  user: {
    first_name: string;
    last_name: string;
  };
}

// Get orders with filtering and pagination
export const useAdminOrders = (filters: OrderFilter = {}) => {
  const {
    status,
    search,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sortField = 'created_at',
    sortDirection = 'desc'
  } = filters;

  return useQuery({
    queryKey: ['admin', 'orders', { status, search, dateFrom, dateTo, page, limit, sortField, sortDirection }],
    queryFn: async () => {
      // Calculate pagination offset
      const offset = (page - 1) * limit;

      // Start building the query
      let query = supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          user_id,
          total_amount,
          users:user_id (
            first_name,
            last_name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`id.ilike.%${search}%,users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%`);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        // Add a day to include the end date fully
        const nextDay = new Date(dateTo);
        nextDay.setDate(nextDay.getDate() + 1);
        query = query.lt('created_at', nextDay.toISOString());
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      // Format the response with customer information
      const orders = data.map(order => ({
        ...order,
        customer: {
          name: order.users ? `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() : 'Guest Customer',
          email: order.users?.email || 'N/A'
        }
      }));

      return {
        orders,
        totalCount: count || 0,
        pageCount: Math.ceil((count || 0) / limit)
      };
    }
  });
};

// Get order details by ID
export const useOrderDetails = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Fetch order basic information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id (
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (
            name,
            slug,
            sku
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Fetch shipping address
      let shippingAddress = null;
      if (order.shipping_address_id) {
        const { data: address, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', order.shipping_address_id)
          .single();

        if (!addressError) {
          shippingAddress = address;
        }
      }

      // Fetch billing address
      let billingAddress = null;
      if (order.billing_address_id) {
        const { data: address, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', order.billing_address_id)
          .single();

        if (!addressError) {
          billingAddress = address;
        }
      }

      // Fetch order timeline using edge function
      const { data: timeline, error: timelineError } = await supabase.functions
        .invoke('order-helpers', {
          body: {
            action: 'getOrderTimeline',
            params: { orderId }
          }
        });

      if (timelineError) throw timelineError;

      // Fetch order notes using edge function
      const { data: notes, error: notesError } = await supabase.functions
        .invoke('order-helpers', {
          body: {
            action: 'getOrderNotes',
            params: { orderId }
          }
        });

      if (notesError) throw notesError;

      // Format customer information
      const customer = {
        name: order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() : 'Guest Customer',
        email: order.user?.email || 'N/A',
        phone: order.user?.phone || 'N/A'
      };

      return {
        ...order,
        customer,
        items,
        shippingAddress,
        billingAddress,
        timeline: timeline || [],
        notes: notes || []
      };
    },
    enabled: !!orderId
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      note 
    }: { 
      orderId: string; 
      status: OrderStatus; 
      note?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to order timeline using edge function
      const { error: timelineError } = await supabase.functions
        .invoke('order-helpers', {
          body: {
            action: 'addOrderTimelineEntry',
            params: {
              orderId,
              status,
              userId: user.id,
              note: note || null
            }
          }
        });

      if (timelineError) throw timelineError;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          action_type: 'update_order_status',
          details: { orderId, status, note },
          user_id: user.id
        });

      return { orderId, status };
    },
    onSuccess: (data) => {
      toast.success(`Order #${data.orderId.substring(0, 8)} updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', data.orderId] });
    },
    onError: (error) => {
      toast.error(`Error updating order: ${error.message}`);
    }
  });
};

// Add order note
export const useAddOrderNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      note, 
      isCustomerVisible = false 
    }: { 
      orderId: string; 
      note: string; 
      isCustomerVisible?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase.functions
        .invoke('order-helpers', {
          body: {
            action: 'addOrderNote',
            params: {
              orderId,
              userId: user.id,
              note,
              isCustomerVisible
            }
          }
        });

      if (error) throw error;

      return data && data[0] ? data[0] : { order_id: orderId };
    },
    onSuccess: (data) => {
      toast.success('Note added successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', data.order_id] });
    },
    onError: (error) => {
      toast.error(`Error adding note: ${error.message}`);
    }
  });
};

// Delete order note
export const useDeleteOrderNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, orderId }: { noteId: string; orderId: string }) => {
      const { error } = await supabase.functions
        .invoke('order-helpers', {
          body: {
            action: 'deleteOrderNote',
            params: { noteId }
          }
        });

      if (error) throw error;

      return { noteId, orderId };
    },
    onSuccess: (data) => {
      toast.success('Note deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', data.orderId] });
    },
    onError: (error) => {
      toast.error(`Error deleting note: ${error.message}`);
    }
  });
};

// Bulk update order status
export const useBulkUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderIds, 
      status 
    }: { 
      orderIds: string[]; 
      status: OrderStatus;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update orders
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .in('id', orderIds);

      if (error) throw error;

      // Add timeline entries using edge function
      const { error: timelineError } = await supabase.functions
        .invoke('order-helpers', {
          body: {
            action: 'bulkAddTimelineEntries',
            params: {
              orderIds,
              status,
              userId: user.id,
              note: `Bulk updated to ${status}`
            }
          }
        });

      if (timelineError) throw timelineError;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          action_type: 'bulk_update_order_status',
          details: { orderIds, status },
          user_id: user.id
        });

      return { orderIds, status };
    },
    onSuccess: (data) => {
      toast.success(`${data.orderIds.length} orders updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onError: (error) => {
      toast.error(`Error updating orders: ${error.message}`);
    }
  });
};

// Generate invoice data for an order
export const useGenerateInvoice = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['admin', 'invoice', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      // Reuse the order details query
      const orderDetailsQuery = useOrderDetails(orderId);
      const orderDetails = await orderDetailsQuery.refetch();
      
      if (orderDetails.error) throw orderDetails.error;
      
      // Format data specifically for invoice
      return {
        ...orderDetails.data,
        invoiceNumber: `INV-${orderId.substring(0, 8).toUpperCase()}`,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString()
      };
    },
    enabled: !!orderId
  });
};
