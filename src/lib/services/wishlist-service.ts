
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    main_image_url: string | null;
    quantity_in_stock: number;
  };
}

// Get user's wishlist
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          product:products(
            id,
            name,
            slug,
            price,
            sale_price,
            quantity_in_stock
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as WishlistItem[];
    }
  });
};

// Check if a product is in the wishlist
export const useIsInWishlist = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['wishlist', 'check', productId],
    queryFn: async () => {
      if (!productId) return false;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    },
    enabled: !!productId
  });
};

// Add product to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (existing) {
        return { id: existing.id };
      }

      // Add to wishlist
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          action_type: 'add_to_wishlist',
          user_id: user.id,
          details: { product_id: productId }
        });

      return data;
    },
    onSuccess: () => {
      toast.success('Added to wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      toast.error(`Error adding to wishlist: ${error.message}`);
    }
  });
};

// Remove product from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { id: itemId };
    },
    onSuccess: () => {
      toast.success('Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      toast.error(`Error removing from wishlist: ${error.message}`);
    }
  });
};

// Move item from wishlist to cart
export const useMoveToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, productId }: { itemId: string; productId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check product availability
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('quantity_in_stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (!product || product.quantity_in_stock < 1) {
        throw new Error('Product is out of stock');
      }

      // Check if already in cart
      const { data: existingCartItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      // Start a transaction
      const { data: transactionResult } = await supabase.rpc('begin_transaction');
      let transactionId = null;
      
      if (transactionResult && typeof transactionResult === 'object') {
        // Safely extract transaction_id
        transactionId = transactionResult && (transactionResult as any).transaction_id;
      }

      try {
        // Add to cart or update quantity
        if (existingCartItem) {
          // Update quantity
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ 
              quantity: existingCartItem.quantity + 1 
            })
            .eq('id', existingCartItem.id);

          if (updateError) throw updateError;
        } else {
          // Add new cart item
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity: 1
            });

          if (insertError) throw insertError;
        }

        // Remove from wishlist
        const { error: deleteError } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Commit transaction
        if (transactionId) {
          await supabase.rpc('commit_transaction', { transaction_id: transactionId });
        }

        return { success: true };
      } catch (error) {
        // Rollback transaction
        if (transactionId) {
          await supabase.rpc('rollback_transaction', { transaction_id: transactionId });
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Item moved to cart');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error moving to cart: ${error.message}`);
    }
  });
};

// Move all wishlist items to cart
export const useMoveAllToCart = () => {
  const queryClient = useQueryClient();
  const { data: wishlistItems } = useWishlist();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!wishlistItems || wishlistItems.length === 0) {
        throw new Error('Your wishlist is empty');
      }

      // Start a transaction
      const { data: transactionResult } = await supabase.rpc('begin_transaction');
      let transactionId = null;
      
      if (transactionResult && typeof transactionResult === 'object') {
        transactionId = transactionResult && (transactionResult as any).transaction_id;
      }
      
      try {
        // Get current cart items
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select('id, product_id, quantity')
          .eq('user_id', user.id);

        if (cartError) throw cartError;

        // Create a map of product_id -> cart_item for easy lookup
        const cartMap = new Map();
        cartItems?.forEach(item => {
          cartMap.set(item.product_id, item);
        });

        // Process each wishlist item
        const itemsToAdd = [];
        const itemsToUpdate = [];
        const successfulItems = [];
        const failedItems = [];

        for (const item of wishlistItems) {
          // Skip out of stock items
          if (item.product.quantity_in_stock < 1) {
            failedItems.push({
              id: item.id,
              reason: 'Out of stock'
            });
            continue;
          }

          // Check if already in cart
          const existingCartItem = cartMap.get(item.product_id);
          
          if (existingCartItem) {
            // Update quantity
            itemsToUpdate.push({
              id: existingCartItem.id,
              quantity: existingCartItem.quantity + 1
            });
          } else {
            // Add new cart item
            itemsToAdd.push({
              user_id: user.id,
              product_id: item.product_id,
              quantity: 1
            });
          }
          
          successfulItems.push(item.id);
        }

        // Add new cart items
        if (itemsToAdd.length > 0) {
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert(itemsToAdd);

          if (insertError) throw insertError;
        }

        // Update existing cart items
        for (const item of itemsToUpdate) {
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: item.quantity })
            .eq('id', item.id);

          if (updateError) throw updateError;
        }

        // Remove successful items from wishlist
        if (successfulItems.length > 0) {
          const { error: deleteError } = await supabase
            .from('wishlist_items')
            .delete()
            .in('id', successfulItems)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        }

        // Commit transaction
        if (transactionId) {
          await supabase.rpc('commit_transaction', { transaction_id: transactionId });
        }

        return { 
          success: true,
          added: successfulItems.length,
          failed: failedItems.length
        };
      } catch (error) {
        // Rollback transaction
        if (transactionId) {
          await supabase.rpc('rollback_transaction', { transaction_id: transactionId });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data.failed > 0) {
        toast.warning(`Added ${data.added} items to cart. ${data.failed} items couldn't be added.`);
      } else {
        toast.success('All items moved to cart');
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error moving items to cart: ${error.message}`);
    }
  });
};

// Clear wishlist
export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: () => {
      toast.success('Wishlist cleared');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error) => {
      toast.error(`Error clearing wishlist: ${error.message}`);
    }
  });
};
