
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type StockHistoryItem = Tables<'stock_history'> & {
  products: {
    name: string;
  };
  profiles?: {
    name: string;
  } | null;
};

export const useStockHistory = (productId?: string) => {
  return useQuery({
    queryKey: ['stock-history', productId],
    queryFn: async () => {
      let query = supabase
        .from('stock_history')
        .select(`
          *,
          products!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match our type
      const transformedData = data?.map(item => ({
        ...item,
        profiles: null // We'll handle user info separately if needed
      })) || [];

      return transformedData as StockHistoryItem[];
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      newStock,
      changeType,
      reason,
    }: {
      productId: string;
      newStock: number;
      changeType: string;
      reason: string;
    }) => {
      // Get current stock first
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const quantityChange = newStock - product.stock;

      const { error } = await supabase.rpc('update_product_stock', {
        product_uuid: productId,
        quantity_change: quantityChange,
        change_reason: reason,
        change_type_param: changeType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
};
