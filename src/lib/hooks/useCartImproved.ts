import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';
import { Database } from '@/types/supabase';
import { ApiResponseHandler, isSuccessResult } from '@/lib/services/ApiResponseHandler';

export type CartItem = Database['public']['Tables']['cart_items']['Row'] & {
  products: Database['public']['Tables']['products']['Row'] & {
    categories?: Database['public']['Tables']['categories']['Row'];
  };
};

/**
 * Enhanced useCart hook with standardized API response handling and null checks
 */
export const useCart = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async (): Promise<CartItem[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const result = await ApiResponseHandler.handleArrayResponse(
        supabase
          .from('cart_items')
          .select(`
            *,
            products(
              *,
              categories(*)
            )
          `)
          .eq('user_id', user.id),
        {
          component: 'useCart',
          action: 'fetch_cart_items',
          additionalData: { userId: user.id }
        }
      );

      if (!isSuccessResult(result)) {
        throw new Error(result.error);
      }

      // Filter out items with missing products (in case product was deleted)
      const validCartItems = result.data.filter(item => 
        item.products && 
        typeof item.products === 'object' && 
        'id' in item.products
      ) as CartItem[];

      return validCartItems;
    },
    enabled: !!user?.id,
  });
};

/**
 * Enhanced useAddToCart hook with proper validation and error handling
 */
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      productId, 
      quantity = 1 
    }: { 
      productId: string; 
      quantity?: number; 
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Validate inputs
      if (!productId || productId.trim() === '') {
        throw new Error('Product ID is required');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Check if product exists and is available
      const productResult = await ApiResponseHandler.handleSingleResponse(
        supabase
          .from('products')
          .select('id, title, stock_quantity, status')
          .eq('id', productId)
          .single(),
        {
          component: 'useAddToCart',
          action: 'validate_product',
          additionalData: { productId }
        },
        true // Allow null for product not found
      );

      if (!isSuccessResult(productResult) || !productResult.data) {
        throw new Error('Product not found or unavailable');
      }

      const product = productResult.data;

      if (product.status !== 'published') {
        throw new Error('Product is not available for purchase');
      }

      if (product.stock_quantity < quantity) {
        throw new Error(`Insufficient stock. Only ${product.stock_quantity} items available`);
      }

      // Check if item already exists in cart
      const existingItemResult = await ApiResponseHandler.handleSingleResponse(
        supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single(),
        {
          component: 'useAddToCart',
          action: 'check_existing_item',
          additionalData: { userId: user.id, productId }
        },
        true // Allow null for item not found
      );

      if (isSuccessResult(existingItemResult) && existingItemResult.data) {
        // Update existing item
        const existingItem = existingItemResult.data;
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock_quantity) {
          throw new Error(`Cannot add ${quantity} more items. Maximum available: ${product.stock_quantity - existingItem.quantity}`);
        }

        const updateResult = await ApiResponseHandler.handleSingleResponse(
          supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id)
            .select()
            .single(),
          {
            component: 'useAddToCart',
            action: 'update_existing_item',
            additionalData: { cartItemId: existingItem.id, newQuantity }
          }
        );

        if (!isSuccessResult(updateResult)) {
          throw new Error(updateResult.error);
        }

        return updateResult.data;
      } else {
        // Add new item
        const insertResult = await ApiResponseHandler.handleSingleResponse(
          supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: quantity,
            })
            .select()
            .single(),
          {
            component: 'useAddToCart',
            action: 'add_new_item',
            additionalData: { userId: user.id, productId, quantity }
          }
        );

        if (!isSuccessResult(insertResult)) {
          throw new Error(insertResult.error);
        }

        return insertResult.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Enhanced useUpdateCartItem hook with proper validation
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      cartItemId, 
      quantity 
    }: { 
      cartItemId: string; 
      quantity: number; 
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Validate inputs
      if (!cartItemId || cartItemId.trim() === '') {
        throw new Error('Cart item ID is required');
      }

      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      if (quantity === 0) {
        // Remove item if quantity is 0
        const deleteResult = await ApiResponseHandler.handleSupabaseResponse(
          supabase
            .from('cart_items')
            .delete()
            .eq('id', cartItemId)
            .eq('user_id', user.id),
          {
            component: 'useUpdateCartItem',
            action: 'remove_item',
            additionalData: { cartItemId, userId: user.id }
          }
        );

        if (!isSuccessResult(deleteResult)) {
          throw new Error(deleteResult.error);
        }

        return null;
      } else {
        // Update quantity
        const updateResult = await ApiResponseHandler.handleSingleResponse(
          supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', cartItemId)
            .eq('user_id', user.id)
            .select()
            .single(),
          {
            component: 'useUpdateCartItem',
            action: 'update_quantity',
            additionalData: { cartItemId, quantity, userId: user.id }
          }
        );

        if (!isSuccessResult(updateResult)) {
          throw new Error(updateResult.error);
        }

        return updateResult.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Enhanced useRemoveFromCart hook with proper validation
 */
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!cartItemId || cartItemId.trim() === '') {
        throw new Error('Cart item ID is required');
      }

      const result = await ApiResponseHandler.handleSupabaseResponse(
        supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('user_id', user.id),
        {
          component: 'useRemoveFromCart',
          action: 'remove_cart_item',
          additionalData: { cartItemId, userId: user.id }
        }
      );

      if (!isSuccessResult(result)) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

/**
 * Enhanced useClearCart hook with proper validation
 */
export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const result = await ApiResponseHandler.handleSupabaseResponse(
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id),
        {
          component: 'useClearCart',
          action: 'clear_all_items',
          additionalData: { userId: user.id }
        }
      );

      if (!isSuccessResult(result)) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};