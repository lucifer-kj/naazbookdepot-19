import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { ApiResponseHandler, isSuccessResult } from '@/lib/services/ApiResponseHandler';

export type Product = Database['public']['Tables']['products']['Row'];
export type ProductWithCategory = Product & {
  categories?: Database['public']['Tables']['categories']['Row'];
  average_rating?: number;
  review_count?: number;
};

/**
 * Enhanced useProducts hook with standardized API response handling
 */
export const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async (): Promise<ProductWithCategory[]> => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category', categoryId);
      }

      const result = await ApiResponseHandler.handleArrayResponse(
        query,
        {
          component: 'useProducts',
          action: 'fetch_products',
          additionalData: { categoryId }
        }
      );

      if (!isSuccessResult(result)) {
        throw new Error(result.error);
      }

      const products = result.data;

      // Get average ratings and review counts for each product with proper error handling
      const productsWithReviews = await Promise.all(
        products.map(async (product): Promise<ProductWithCategory> => {
          try {
            // Safely fetch ratings with fallback values
            const [ratingResult, countResult] = await Promise.all([
              supabase.rpc('get_product_average_rating', { product_uuid: product.id }).then(
                res => res.data ?? 0
              ).catch(() => 0),
              supabase.rpc('get_product_review_count', { product_uuid: product.id }).then(
                res => res.data ?? 0
              ).catch(() => 0)
            ]);

            return {
              ...product,
              average_rating: ratingResult,
              review_count: countResult,
            };
          } catch (error) {
            // If rating/count fetch fails, return product with default values
            console.warn(`Failed to fetch ratings for product ${product.id}:`, error);
            return {
              ...product,
              average_rating: 0,
              review_count: 0,
            };
          }
        })
      );

      return productsWithReviews;
    },
  });
};

/**
 * Enhanced useProduct hook for single product with standardized error handling
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<ProductWithCategory> => {
      if (!id || id.trim() === '') {
        throw new Error('Product ID is required');
      }

      const result = await ApiResponseHandler.handleSingleResponse(
        supabase
          .from('products')
          .select(`
            *,
            categories(*)
          `)
          .eq('id', id)
          .single(),
        {
          component: 'useProduct',
          action: 'fetch_single_product',
          additionalData: { productId: id }
        }
      );

      if (!isSuccessResult(result)) {
        throw new Error(result.error);
      }

      const product = result.data;

      if (!product) {
        throw new Error('Product not found');
      }

      // Get average rating and review count with proper error handling
      try {
        const [ratingResult, countResult] = await Promise.all([
          supabase.rpc('get_product_average_rating', { product_uuid: id }).then(
            res => res.data ?? 0
          ).catch(() => 0),
          supabase.rpc('get_product_review_count', { product_uuid: id }).then(
            res => res.data ?? 0
          ).catch(() => 0)
        ]);

        return {
          ...product,
          average_rating: ratingResult,
          review_count: countResult,
        };
      } catch (error) {
        console.warn(`Failed to fetch ratings for product ${id}:`, error);
        return {
          ...product,
          average_rating: 0,
          review_count: 0,
        };
      }
    },
    enabled: !!id,
  });
};

/**
 * Enhanced useSearchProducts hook with standardized error handling
 */
export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['search-products', query],
    queryFn: async (): Promise<ProductWithCategory[]> => {
      if (!query || query.trim() === '') {
        return [];
      }

      const searchQuery = query.trim();
      const result = await ApiResponseHandler.handleArrayResponse(
        supabase
          .from('products')
          .select(`
            *,
            categories(*)
          `)
          .eq('status', 'published')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false }),
        {
          component: 'useSearchProducts',
          action: 'search_products',
          additionalData: { searchQuery }
        }
      );

      if (!isSuccessResult(result)) {
        throw new Error(result.error);
      }

      const products = result.data;

      // Get average ratings and review counts for each product with proper error handling
      const productsWithReviews = await Promise.all(
        products.map(async (product): Promise<ProductWithCategory> => {
          try {
            const [ratingResult, countResult] = await Promise.all([
              supabase.rpc('get_product_average_rating', { product_uuid: product.id }).then(
                res => res.data ?? 0
              ).catch(() => 0),
              supabase.rpc('get_product_review_count', { product_uuid: product.id }).then(
                res => res.data ?? 0
              ).catch(() => 0)
            ]);

            return {
              ...product,
              average_rating: ratingResult,
              review_count: countResult,
            };
          } catch (error) {
            console.warn(`Failed to fetch ratings for product ${product.id}:`, error);
            return {
              ...product,
              average_rating: 0,
              review_count: 0,
            };
          }
        })
      );

      return productsWithReviews;
    },
    enabled: !!query,
  });
};
