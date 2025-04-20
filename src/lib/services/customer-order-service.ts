
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderStatus } from "./admin-order-service";

export interface CustomerOrder {
  id: string;
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  total_amount: number;
  items: {
    id: string;
    quantity: number;
    price_per_unit: number;
    total_price: number;
    product: {
      name: string;
      slug: string;
    };
  }[];
}

// Get customer orders
export const useCustomerOrders = () => {
  return useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          updated_at,
          status,
          total_amount,
          items:order_items(
            id,
            quantity,
            price_per_unit,
            total_price,
            product:product_id(
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as CustomerOrder[];
    }
  });
};

// Get customer order details
export const useCustomerOrderDetails = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['customer', 'order', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            id,
            quantity,
            price_per_unit,
            total_price,
            product:product_id(
              id,
              name,
              slug,
              sku
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (orderError) throw orderError;

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

      // Fetch order timeline (only customer-visible entries)
      const { data: timeline, error: timelineError } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (timelineError) throw timelineError;

      // Fetch order notes (only customer-visible notes)
      const { data: notes, error: notesError } = await supabase
        .from('order_notes')
        .select('*')
        .eq('order_id', orderId)
        .eq('is_customer_visible', true)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      return {
        ...order,
        shippingAddress,
        billingAddress,
        timeline: timeline || [],
        notes: notes || []
      };
    },
    enabled: !!orderId
  });
};

// Cancel customer order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if order belongs to user and is in a cancellable state
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('status, user_id')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (order.user_id !== user.id) {
        throw new Error('Not authorized to cancel this order');
      }

      if (!['pending', 'processing'].includes(order.status)) {
        throw new Error('This order cannot be cancelled');
      }

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;

      // Add to order timeline
      const { error: timelineError } = await supabase
        .from('order_timeline')
        .insert({
          order_id: orderId,
          status: 'cancelled',
          note: reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
          user_id: user.id
        });

      if (timelineError) throw timelineError;

      return { orderId };
    },
    onSuccess: (data) => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['customer', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'order', data.orderId] });
    },
    onError: (error) => {
      toast.error(`Error cancelling order: ${error.message}`);
    }
  });
};

// Reorder - add all items from an order to cart
export const useReorder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId }: { orderId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product_id
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Check product availability
      const productIds = items.map(item => item.product_id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, quantity_in_stock')
        .in('id', productIds);

      if (productsError) throw productsError;

      const productsMap = new Map(products.map(p => [p.id, p]));
      const validItems = [];
      const unavailableItems = [];

      for (const item of items) {
        const product = productsMap.get(item.product_id);
        if (product && product.quantity_in_stock > 0) {
          // Limit quantity to available stock
          const quantity = Math.min(item.quantity, product.quantity_in_stock);
          validItems.push({
            product_id: item.product_id,
            user_id: user.id,
            quantity
          });
        } else {
          unavailableItems.push(item.product_id);
        }
      }

      if (validItems.length === 0) {
        throw new Error('None of the products from this order are currently available');
      }

      // Clear existing cart items
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Add items to cart
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(validItems);

      if (insertError) throw insertError;

      return { 
        added: validItems.length, 
        unavailable: unavailableItems.length 
      };
    },
    onSuccess: (data) => {
      if (data.unavailable > 0) {
        toast.warning(`Added ${data.added} items to cart. ${data.unavailable} items are no longer available.`);
      } else {
        toast.success(`All items added to your cart`);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error adding items to cart: ${error.message}`);
    }
  });
};
