
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  is_verified: boolean;
  user: {
    first_name: string | null;
    last_name: string | null;
  };
}

// Get reviews for a product
export const useProductReviews = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) {
        return { reviews: [], average: 0, total: 0 };
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:user_id(
            first_name,
            last_name
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate average rating
      const reviews = data as ProductReview[];
      const total = reviews.length;
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average = total > 0 ? sum / total : 0;

      return {
        reviews,
        average,
        total
      };
    },
    enabled: !!productId
  });
};

// Get reviews by user
export const useUserReviews = () => {
  return useQuery({
    queryKey: ['user-reviews'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          product:product_id(
            name,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    }
  });
};

// Check if user can review a product (has purchased it)
export const useCanReviewProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['can-review', productId],
    queryFn: async () => {
      if (!productId) {
        return { canReview: false, hasReviewed: false };
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { canReview: false, hasReviewed: false };
      }

      // Check if user has already reviewed this product
      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (!reviewError && existingReview) {
        return { canReview: true, hasReviewed: true, reviewId: existingReview.id };
      }

      // Check if user has purchased this product
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order:order_id(
            status
          )
        `)
        .eq('product_id', productId)
        .in('order.status', ['delivered', 'completed'])
        .eq('order.user_id', user.id);

      if (error) throw error;

      return { 
        canReview: data.length > 0,
        hasReviewed: false,
        orderIds: data.map(item => item.order_id)
      };
    },
    enabled: !!productId
  });
};

// Add a review
export const useAddReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      rating, 
      title, 
      content 
    }: { 
      productId: string; 
      rating: number;
      title?: string;
      content?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has already reviewed this product
      const { data: existingReview, error: reviewError } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (!reviewError && existingReview) {
        throw new Error('You have already reviewed this product');
      }

      // Check if user has purchased this product
      const { data: orders, error: orderError } = await supabase
        .from('order_items')
        .select(`
          order:order_id(
            status
          )
        `)
        .eq('product_id', productId)
        .in('order.status', ['delivered', 'completed'])
        .eq('order.user_id', user.id);

      if (orderError) throw orderError;

      const isVerified = orders.length > 0;

      // Add the review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          title: title || null,
          content: content || null,
          is_verified: isVerified
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (data) => {
      toast.success('Review submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['can-review', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
    },
    onError: (error: any) => {
      toast.error(`Error submitting review: ${error.message}`);
    }
  });
};

// Update a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      reviewId,
      rating, 
      title, 
      content 
    }: { 
      reviewId: string;
      rating: number;
      title?: string;
      content?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current review data to know which product it belongs to
      const { data: currentReview, error: getError } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (getError) throw getError;

      // Update the review
      const { error } = await supabase
        .from('reviews')
        .update({
          rating,
          title: title || null,
          content: content || null
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { reviewId, productId: currentReview.product_id };
    },
    onSuccess: (data) => {
      toast.success('Review updated successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
    },
    onError: (error) => {
      toast.error(`Error updating review: ${error.message}`);
    }
  });
};

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId }: { reviewId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current review data to know which product it belongs to
      const { data: currentReview, error: getError } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (getError) throw getError;

      // Delete the review
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { reviewId, productId: currentReview.product_id };
    },
    onSuccess: (data) => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['reviews', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['can-review', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
    },
    onError: (error) => {
      toast.error(`Error deleting review: ${error.message}`);
    }
  });
};

// For admin - Get all reviews
export const useAdminReviews = (
  page = 1, 
  limit = 10, 
  filters: { 
    productId?: string; 
    verified?: boolean; 
    rating?: number;
    search?: string;
  } = {}
) => {
  return useQuery({
    queryKey: ['admin', 'reviews', { page, limit, ...filters }],
    queryFn: async () => {
      // Calculate pagination offset
      const offset = (page - 1) * limit;

      // Start building the query
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user:user_id(
            first_name,
            last_name,
            email
          ),
          product:product_id(
            name,
            slug
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.productId) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }

      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      if (filters.search) {
        query = query.or(`content.ilike.%${filters.search}%,title.ilike.%${filters.search}%,product.name.ilike.%${filters.search}%,user.email.ilike.%${filters.search}%`);
      }

      // Apply sorting and pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        reviews: data,
        totalCount: count || 0,
        pageCount: Math.ceil((count || 0) / limit)
      };
    }
  });
};

// For admin - Update review status
export const useAdminUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      isVerified 
    }: { 
      reviewId: string; 
      isVerified: boolean;
    }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_verified: isVerified })
        .eq('id', reviewId);

      if (error) throw error;

      return { reviewId, isVerified };
    },
    onSuccess: () => {
      toast.success('Review updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: (error) => {
      toast.error(`Error updating review: ${error.message}`);
    }
  });
};

// For admin - Delete review
export const useAdminDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reviewId }: { reviewId: string }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      return { reviewId };
    },
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: (error) => {
      toast.error(`Error deleting review: ${error.message}`);
    }
  });
};
