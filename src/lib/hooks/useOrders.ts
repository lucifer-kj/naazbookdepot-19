
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

// Renamed from useOrders
export const useUserOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userOrders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
    enabled: !!user,
  });
};

// New hook for Admin to fetch all orders
export const useAdminOrders = () => {
  // No user context needed here directly, RLS should handle auth
  return useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
    // enabled: true, // Always enabled for admin context, or add specific admin role check if needed
  });
};

// Renamed from useOrder
export const useUserOrderDetails = (orderId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userOrder', orderId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as OrderWithItems;
    },
    enabled: !!user && !!orderId,
  });
};

// New hook for Admin to fetch specific order details
export const useAdminOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['adminOrder', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          users(id, full_name, email)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data as OrderWithItems; // Consider a more specific type if users relation is consistently present
    },
    enabled: !!orderId,
  });
};


export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderData: {
      items: Array<{
        product_id: string;
        variant_id?: string;
        quantity: number;
        unit_price: number;
        product_name: string;
        product_sku?: string;
        variant_name?: string;
      }>;
      subtotal: number;
      total_amount: number;
      shipping_address: any;
      billing_address: any;
      customer_email?: string;
      customer_phone?: string;
      shipping_amount?: number;
      tax_amount?: number;
      discount_amount?: number;
    }) => {
      const { items, ...orderInfo } = orderData;

      // Create the order with a temporary order_number that will be replaced by trigger
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: `TEMP-${Date.now()}`, // Temporary value, will be replaced by trigger
          user_id: user?.id || null,
          subtotal: orderInfo.subtotal,
          total_amount: orderInfo.total_amount,
          shipping_address: orderInfo.shipping_address,
          billing_address: orderInfo.billing_address,
          customer_email: orderInfo.customer_email,
          customer_phone: orderInfo.customer_phone,
          shipping_amount: orderInfo.shipping_amount || 0,
          tax_amount: orderInfo.tax_amount || 0,
          discount_amount: orderInfo.discount_amount || 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        variant_name: item.variant_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      // Invalidate user-specific orders query if a user created an order
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      // Also invalidate admin orders list as a new order is added
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });
};

// New Mutation for updating order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['adminOrder', data.id] });
        // If users can also see their order status changes, invalidate their specific order query too
        queryClient.invalidateQueries({ queryKey: ['userOrder', data.id] });
      }
    },
  });
};
