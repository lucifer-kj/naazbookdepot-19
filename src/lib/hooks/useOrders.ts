
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { useEffect } from 'react';
import type { Tables } from '@/integrations/supabase/types';

export type Order = Tables<'orders'> & {
  order_items: (Tables<'order_items'> & {
    products: Tables<'products'>;
  })[];
};

export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  // Real-time order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return query;
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      cartItems,
      shippingAddress,
      billingAddress,
      total,
      notes,
      paymentMethod = 'cod'
    }: {
      cartItems: unknown[];
      shippingAddress: unknown;
      billingAddress?: unknown;
      total: number;
      notes?: string;
      paymentMethod?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) throw orderNumberError;

      // Start transaction by creating order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: 'pending',
          order_number: orderNumberData,
          shipping_address: shippingAddress,
          billing_address: billingAddress || shippingAddress,
          notes: notes,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'upi' ? 'pending' : 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.productId || item.product_id || item.products?.id,
        quantity: item.quantity,
        price: parseFloat(item.price || item.products?.price || '0'),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock levels
      for (const item of cartItems) {
        const productId = item.productId || item.product_id || item.products?.id;
        const quantity = item.quantity;

        // Get current stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        // Update stock
        const newStock = Math.max(0, product.stock - quantity);
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', productId);

        if (stockError) throw stockError;
      }

      // Clear cart after successful order (only for non-UPI orders)
      if (paymentMethod !== 'upi') {
        const { error: clearCartError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (clearCartError) throw clearCartError;
      }

      // Send order confirmation notification
      try {
        await supabase.functions.invoke('order-notifications', {
          body: {
            orderId: order.id,
            eventType: 'order_created'
          }
        });
      } catch (notificationError) {
        console.error('Error sending order confirmation:', notificationError);
        // Don't fail the order creation if notification fails
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: {
      orderId: string;
      status: string;
      trackingNumber?: string;
    }) => {
      const updateData: unknown = { status };
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
