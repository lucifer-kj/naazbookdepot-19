
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
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

export const useOrder = (orderId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId],
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

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderInfo,
          user_id: user?.id || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: order.id,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
