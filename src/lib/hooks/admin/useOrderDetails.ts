
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type OrderStatusHistory = Tables<'order_status_history'>;
export type OrderNote = Tables<'order_notes'>;

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ['order-details', orderId],
    queryFn: async () => {
      const [orderResponse, statusHistoryResponse, notesResponse] = await Promise.all([
        supabase
          .from('orders')
          .select(`
            *,
            order_items(
              *,
              products(*)
            )
          `)
          .eq('id', orderId)
          .single(),
        supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false }),
        supabase
          .from('order_notes')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false })
      ]);

      if (orderResponse.error) throw orderResponse.error;
      if (statusHistoryResponse.error) throw statusHistoryResponse.error;
      if (notesResponse.error) throw notesResponse.error;

      return {
        order: orderResponse.data,
        statusHistory: statusHistoryResponse.data,
        notes: notesResponse.data
      };
    },
    enabled: !!orderId,
  });
};

export const useAddOrderNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, note, isInternal = true }: {
      orderId: string;
      note: string;
      isInternal?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('order_notes')
        .insert({
          order_id: orderId,
          note,
          is_internal: isInternal,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-details', variables.orderId] });
    },
  });
};

export const useUpdateOrderItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, items }: {
      orderId: string;
      items: Array<{ id: string; quantity: number; price: number }>;
    }) => {
      const updates = items.map(item => 
        supabase
          .from('order_items')
          .update({ quantity: item.quantity, price: item.price })
          .eq('id', item.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error('Failed to update some order items');
      }

      // Recalculate order total
      const totalResult = await supabase
        .from('order_items')
        .select('quantity, price')
        .eq('order_id', orderId);

      if (totalResult.error) throw totalResult.error;

      const newTotal = totalResult.data.reduce((sum, item) => 
        sum + (item.quantity * item.price), 0
      );

      const { error: orderError } = await supabase
        .from('orders')
        .update({ total: newTotal })
        .eq('id', orderId);

      if (orderError) throw orderError;

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order-details', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
};
