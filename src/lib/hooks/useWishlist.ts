
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type WishlistItem = Tables<'wishlist_items'> & {
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

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products(
            *,
            categories(*)
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
    mutationFn: async ({ productId }: { productId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId,
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
        .from('wishlist_items')
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

export const useCheckWishlistStatus = (productId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist-status', user?.id, productId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!user && !!productId,
  });
};
