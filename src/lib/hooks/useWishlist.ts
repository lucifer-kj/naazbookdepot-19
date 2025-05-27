
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type WishlistItem = Tables<'wishlists'> & {
  products: Tables<'products'> & {
    product_images?: Tables<'product_images'>[];
  };
};

export const useWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products(
            *,
            product_images(*)
          )
        `)
        .eq('user_id', user.id);

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
    mutationFn: async ({ productId, variantId }: { productId: string; variantId?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
          variant_id: variantId,
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
        .from('wishlists')
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
