import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    quantity_in_stock: number;
    main_image_url: string | null;
  };
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  items: CartItem[];
}

// Get cart items
export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products(
            id,
            name,
            slug,
            price,
            sale_price,
            quantity_in_stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate subtotal
      let subtotal = 0;
      let itemCount = 0;
      
      // Add type assertion to handle possible SelectQueryError
      const items = (data || []).map((item: any) => {
        // Safely access price with null checks
        const price = item.product?.sale_price || item.product?.price || 0;
        subtotal += price * item.quantity;
        itemCount += item.quantity;
        return item as CartItem;
      });

      return {
        items,
        subtotal,
        itemCount
      } as CartSummary;
    }
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      quantity = 1 
    }: { 
      productId: string; 
      quantity?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if product exists and has stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('quantity_in_stock, name')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (product.quantity_in_stock < quantity) {
        throw new Error(`Not enough stock for ${product.name}. Only ${product.quantity_in_stock} available.`);
      }

      // Check if item already in cart
      const { data: existingItem, error: existingItemError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingItemError) throw existingItemError;

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > product.quantity_in_stock) {
          throw new Error(`Cannot add ${quantity} more. Only ${product.quantity_in_stock - existingItem.quantity} more available.`);
        }
        
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
        
        return { 
          added: true, 
          updated: true, 
          productId, 
          quantity: newQuantity 
        };
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          });

        if (insertError) throw insertError;
        
        return { 
          added: true, 
          updated: false, 
          productId, 
          quantity 
        };
      }
    },
    onSuccess: (data) => {
      if (data.updated) {
        toast.success(`Updated quantity in cart (${data.quantity})`);
      } else {
        toast.success('Item added to cart');
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error adding to cart: ${error.message}`);
    }
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      cartItemId, 
      quantity 
    }: { 
      cartItemId: string; 
      quantity: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        return { removed: true, cartItemId };
      } else {
        // Get product info to check stock
        const { data: cartItem, error: cartItemError } = await supabase
          .from('cart_items')
          .select('product_id')
          .eq('id', cartItemId)
          .eq('user_id', user.id)
          .single();

        if (cartItemError) throw cartItemError;

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('quantity_in_stock, name')
          .eq('id', cartItem.product_id)
          .single();

        if (productError) throw productError;

        if (product.quantity_in_stock < quantity) {
          throw new Error(`Not enough stock for ${product.name}. Only ${product.quantity_in_stock} available.`);
        }

        // Update quantity
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', cartItemId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        
        return { 
          updated: true, 
          cartItemId, 
          quantity 
        };
      }
    },
    onSuccess: (data) => {
      if (data.removed) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error updating cart: ${error.message}`);
    }
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId }: { cartItemId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return { removed: true, cartItemId };
    },
    onSuccess: () => {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error removing item: ${error.message}`);
    }
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      return { cleared: true };
    },
    onSuccess: () => {
      toast.success('Cart cleared');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error clearing cart: ${error.message}`);
    }
  });
};

// Get cart summary (for use outside of React components)
export const getCartSummary = async (): Promise<CartSummary> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      product:products(
        id,
        name,
        slug,
        price,
        sale_price,
        quantity_in_stock
      )
    `)
    .eq('user_id', user.id);

  if (error) throw error;

  // Calculate subtotal
  let subtotal = 0;
  let itemCount = 0;
  
  // Add type assertion to handle possible SelectQueryError
  const items = (data || []).map((item: any) => {
    // Safely access price with null checks
    const price = item.product?.sale_price || item.product?.price || 0;
    subtotal += price * item.quantity;
    itemCount += item.quantity;
    return item as CartItem;
  });

  return {
    items,
    subtotal,
    itemCount
  };
};

// Apply coupon/discount code
export const applyDiscount = async (couponCode: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Get cart subtotal
    const cartSummary = await getCartSummary();
    
    // Safely access subtotal
    const subtotal = cartSummary?.subtotal || 0;
    
    // Validate coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single();
      
    if (couponError) {
      throw new Error('Invalid coupon code');
    }
    
    // Check coupon validity
    const now = new Date();
    if (new Date(coupon.start_date) > now || new Date(coupon.end_date) < now) {
      throw new Error('Coupon is expired or not yet active');
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit reached');
    }
    
    if (coupon.min_purchase > subtotal) {
      throw new Error(`Minimum purchase amount of ${coupon.min_purchase} required`);
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = subtotal * (coupon.discount_value / 100);
    } else {
      // Fixed amount
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }
    
    return {
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
      },
      discountAmount,
      subtotal
    };
  } catch (error: any) {
    console.error('Error applying discount:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
