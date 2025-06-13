
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type AdminProduct = Tables<'products'> & {
  categories?: Tables<'categories'>;
  variants?: Tables<'product_variants'>[];
};

export type AdminOrder = Tables<'orders'> & {
  order_items: (Tables<'order_items'> & {
    products: Tables<'products'>;
  })[];
};

export type StockHistory = Tables<'stock_history'>;
export type PromoCode = Tables<'promo_codes'>;

// Product Management Hooks
export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*),
          product_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminProduct[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Tables<'products'>, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tables<'products'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Stock Management Hooks
export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      newStock, 
      changeType, 
      reason 
    }: {
      productId: string;
      newStock: number;
      changeType: 'restock' | 'sale' | 'adjustment' | 'return';
      reason?: string;
    }) => {
      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const previousStock = product.stock;
      const quantityChange = newStock - previousStock;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Record stock history
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          product_id: productId,
          change_type: changeType,
          quantity_change: quantityChange,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: reason || `Stock ${changeType}`,
        });

      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });
};

export const useStockHistory = (productId?: string) => {
  return useQuery({
    queryKey: ['stock-history', productId],
    queryFn: async () => {
      let query = supabase
        .from('stock_history')
        .select(`
          *,
          products(name)
        `)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

// Order Management Hooks
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
      const updates: any = { status };
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

// Promo Code Management Hooks
export const usePromoCodes = () => {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCode[];
    },
  });
};

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promoCode: Omit<PromoCode, 'id' | 'created_at' | 'current_uses' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCode)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
};

export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async ({ code, orderValue }: { code: string; orderValue: number }) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) throw new Error('Invalid promo code');

      const promoCode = data as PromoCode;

      // Check validity period
      const now = new Date();
      if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
        throw new Error('Promo code has expired');
      }

      // Check usage limits
      if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
        throw new Error('Promo code usage limit reached');
      }

      // Check minimum order value
      if (promoCode.minimum_order_value && orderValue < promoCode.minimum_order_value) {
        throw new Error(`Minimum order value of ₹${promoCode.minimum_order_value} required`);
      }

      return promoCode;
    },
  });
};
