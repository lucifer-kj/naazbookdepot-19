import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type ProductStock = Pick<Tables<'products'>, 'id' | 'stock' | 'name'>;

export const useProductStock = (productId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['product-stock', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID provided');

      const { data, error } = await supabase
        .from('products')
        .select('id, stock, name')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data as ProductStock;
    },
    enabled: !!productId,
  });

  // Set up real-time subscription for stock updates
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`product-stock:${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload: {
          new: { id: string; stock: number; name: string };
        }) => {
          const newData: ProductStock = payload.new;
          // Update the cache with new stock value
          queryClient.setQueryData(['product-stock', productId], newData);
          
          // If stock is low (less than 5), show a warning
          if (newData.stock < 5) {
            toast.warning(`Low stock alert: ${newData.name} (${newData.stock} remaining)`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);

  return query;
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      quantity, 
      action = 'set',
      reason = 'manual-update' 
    }: {
      productId: string;
      quantity: number;
      action?: 'add' | 'subtract' | 'set';
      reason?: string;
    }) => {
      // First get the current stock
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      let newQuantity: number;
      switch (action) {
        case 'add':
          newQuantity = (currentProduct.stock || 0) + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max((currentProduct.stock || 0) - quantity, 0);
          break;
        default: // 'set'
          newQuantity = quantity;
      }

      // Update the stock quantity
      const { data, error: updateError } = await supabase
        .from('products')
        .update({ stock: newQuantity })
        .eq('id', productId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record the stock history
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          product_id: productId,
          quantity_change: action === 'set' ? newQuantity - (currentProduct.stock || 0) : quantity,
          change_type: action,
          reason: reason,
          previous_stock: currentProduct.stock || 0,
          new_stock: newQuantity
        });

      if (historyError) throw historyError;

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-stock', data.id] });
      queryClient.invalidateQueries({ queryKey: ['stock-history', data.id] });
      toast.success('Stock updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update stock');
      console.error('Stock update error:', error);
    },
  });
};