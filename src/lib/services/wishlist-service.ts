
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    name: string;
    price: number;
    sale_price: number | null;
    image_url?: string;
    slug: string;
    is_in_stock: boolean;
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
          product_id,
          created_at,
          product:products(
            name,
            price,
            sale_price,
            slug,
            quantity_in_stock,
            image:product_images(image_url)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Format wishlist items
      return data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          name: item.product.name,
          price: item.product.price,
          sale_price: item.product.sale_price,
          slug: item.product.slug,
          image_url: item.product.image?.[0]?.image_url || null,
          is_in_stock: item.product.quantity_in_stock > 0
        }
      }));
    }
  });
};

// Add item to wishlist
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if product already in wishlist
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (!checkError && existingItem) {
        throw new Error('Product already in wishlist');
      }

      // Get product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Add to wishlist
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) throw error;

      return { productName: product.name };
    },
    onSuccess: (data) => {
      toast.success(`Added to wishlist: ${data.productName}`);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      if (error.message === 'Product already in wishlist') {
        toast.info(error.message);
      } else {
        toast.error(`Error adding to wishlist: ${error.message}`);
      }
    }
  });
};

// Remove item from wishlist
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      itemId,
      productName
    }: { 
      itemId: string;
      productName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get product name if not provided
      if (!productName) {
        const { data, error } = await supabase
          .from('wishlist_items')
          .select(`
            product:products(name)
          `)
          .eq('id', itemId)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          productName = data.product?.name;
        }
      }

      // Remove from wishlist
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { productName: productName || 'Item' };
    },
    onSuccess: (data) => {
      toast.success(`Removed from wishlist: ${data.productName}`);
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
    mutationFn: async ({ 
      itemId,
      productId,
      quantity = 1
    }: { 
      itemId: string;
      productId: string;
      quantity?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, quantity_in_stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Check inventory
      if (product.quantity_in_stock < quantity) {
        throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
      }

      // Check if product already in cart
      const { data: existingCartItem, error: checkCartError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      // Start transaction
      const { data: { transaction_id } } = await supabase.rpc('begin_transaction');
      
      try {
        if (!checkCartError && existingCartItem) {
          // Update quantity if already in cart
          const newQuantity = existingCartItem.quantity + quantity;
          
          // Check again for inventory with new total
          if (product.quantity_in_stock < newQuantity) {
            throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
          }
          
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingCartItem.id);

          if (updateError) throw updateError;
        } else {
          // Add new item to cart
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity
            });

          if (insertError) throw insertError;
        }

        // Remove from wishlist
        const { error: removeError } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (removeError) throw removeError;

        // Commit transaction
        await supabase.rpc('commit_transaction', { transaction_id });

        return { productName: product.name };
      } catch (error) {
        // Rollback transaction
        await supabase.rpc('rollback_transaction', { transaction_id });
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Moved to cart: ${data.productName}`);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(`Error moving to cart: ${error.message}`);
    }
  });
};

// Clear entire wishlist
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
