
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type AdminOrder = Tables<'orders'> & {
  order_items: (Tables<'order_items'> & {
    products: Tables<'products'>;
  })[];
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminOrder[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status, 
      trackingNumber 
    }: {
      orderId: string;
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
      trackingNumber?: string;
    }) => {
      const updates: { status: string; tracking_number?: string } = { status };
      if (trackingNumber) {
        updates.tracking_number = trackingNumber;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
};
