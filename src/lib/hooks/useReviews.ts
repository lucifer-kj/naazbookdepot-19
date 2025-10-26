
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Review = Tables<'reviews'> & {
  profiles: {
    name: string | null;
    avatar_url: string | null;
  };
  is_verified?: boolean;
  reported_count?: number;
};

export const useProductReviews = (productId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!productId,
  });

  // Set up real-time subscription for reviews
  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`product-reviews:${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `product_id=eq.${productId}`,
        },
        async (payload: any) => {
          console.log('Review update received:', payload);

          if (payload.eventType === 'DELETE') {
            // Handle deletion without fetching
            queryClient.setQueryData(['reviews', productId], (old: Review[] | undefined) => {
              return old?.filter(review => review.id !== payload.old.id) || [];
            });
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            return;
          }

          // Fetch the complete review data including profile
          const { data, error } = await supabase
            .from('reviews')
            .select(`
              *,
              profiles(name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching review details:', error);
            return;
          }

          // Update the cache based on the event type
          switch (payload.eventType) {
            case 'INSERT':
              queryClient.setQueryData(['reviews', productId], (old: Review[] | undefined) => {
                return old ? [data, ...old] : [data];
              });
              toast.success('New review added');
              break;
            
            case 'UPDATE':
              queryClient.setQueryData(['reviews', productId], (old: Review[] | undefined) => {
                return old?.map(review => 
                  review.id === data.id ? data : review
                ) || [];
              });
              break;
            
            case 'DELETE':
              queryClient.setQueryData(['reviews', productId], (old: Review[] | undefined) => {
                return old?.filter(review => review.id !== payload.old.id) || [];
              });
              break;
          }

          // Invalidate the product rating cache
          queryClient.invalidateQueries({ queryKey: ['product', productId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);

  return query;
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
    }: {
      productId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
