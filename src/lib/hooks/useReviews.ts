
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { ReviewService } from '@/lib/services/reviewService';
import type { EnhancedReview, ReviewStats, ReviewReportData, OrderFeedbackData } from '@/types/review';
import { toast } from 'sonner';

export type Review = EnhancedReview;

export const useProductReviews = (productId: string, userId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reviews', productId, userId],
    queryFn: () => ReviewService.getProductReviews(productId, { userId }),
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
      title,
      comment,
      wouldRecommend,
    }: {
      productId: string;
      rating: number;
      title?: string;
      comment?: string;
      wouldRecommend?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      return ReviewService.createReview({
        productId,
        userId: user.id,
        rating,
        title,
        comment,
        wouldRecommend,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.productId] });
      toast.success('Review submitted for moderation');
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

// New hooks for enhanced functionality

export const useProductReviewStats = (productId: string) => {
  return useQuery({
    queryKey: ['review-stats', productId],
    queryFn: () => ReviewService.getProductReviewStats(productId),
    enabled: !!productId,
  });
};

export const useVoteHelpful = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: number; isHelpful: boolean }) => {
      if (!user) throw new Error('User not authenticated');
      return ReviewService.voteHelpful(reviewId, user.id, isHelpful);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useReportReview = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reportData: ReviewReportData) => {
      if (!user) throw new Error('User not authenticated');
      return ReviewService.reportReview({ ...reportData, reporterId: user.id });
    },
    onSuccess: () => {
      toast.success('Review reported successfully');
    },
  });
};

export const useModerateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (moderationData: { reviewId: number; action: 'approve' | 'reject'; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');
      return ReviewService.moderateReview({ ...moderationData, moderatorId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review moderated successfully');
    },
  });
};

export const usePendingReviews = () => {
  return useQuery({
    queryKey: ['pending-reviews'],
    queryFn: () => ReviewService.getPendingReviews(),
  });
};

export const useCreateOrderFeedback = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (feedbackData: OrderFeedbackData) => {
      if (!user) throw new Error('User not authenticated');
      return ReviewService.createOrderFeedback({ ...feedbackData, userId: user.id });
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
    },
  });
};

export const useOrderFeedback = (orderId: number) => {
  return useQuery({
    queryKey: ['order-feedback', orderId],
    queryFn: () => ReviewService.getOrderFeedback(orderId),
    enabled: !!orderId,
  });
};

export const useReviewAnalytics = (dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: ['review-analytics', dateRange],
    queryFn: () => ReviewService.getReviewAnalytics(dateRange),
  });
};
