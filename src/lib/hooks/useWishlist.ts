
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

// Since there's no wishlists table, we'll use cart_items as a wishlist for now
// This is a temporary solution - you can create a proper wishlists table later
export type WishlistItem = Tables<'cart_items'> & {
  products: Tables<'products'> & {
    categories?: Tables<'categories'>;
  };
};

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Using cart_items with quantity 0 as wishlist items for now
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(
            *,
            categories(*)
          )
        `)
        .eq('user_id', user.id)
        .eq('quantity', 0); // Use quantity 0 to differentiate wishlist from cart

      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 0, // Use quantity 0 for wishlist items
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (wishlistId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', wishlistId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
};
