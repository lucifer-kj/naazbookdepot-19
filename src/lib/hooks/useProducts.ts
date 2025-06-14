
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type ProductWithCategory = Product & {
  categories?: Tables<'categories'>;
  average_rating?: number;
  review_count?: number;
};

export const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Get average ratings and review counts for each product
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const [ratingResult, countResult] = await Promise.all([
            supabase.rpc('get_product_average_rating', { product_uuid: product.id }),
            supabase.rpc('get_product_review_count', { product_uuid: product.id })
          ]);

          return {
            ...product,
            average_rating: ratingResult.data || 0,
            review_count: countResult.data || 0,
          };
        })
      );

      return productsWithReviews as ProductWithCategory[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get average rating and review count
      const [ratingResult, countResult] = await Promise.all([
        supabase.rpc('get_product_average_rating', { product_uuid: id }),
        supabase.rpc('get_product_review_count', { product_uuid: id })
      ]);

      return {
        ...data,
        average_rating: ratingResult.data || 0,
        review_count: countResult.data || 0,
      } as ProductWithCategory;
    },
    enabled: !!id,
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['search-products', query],
    queryFn: async () => {
      if (!query) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get average ratings and review counts for each product
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const [ratingResult, countResult] = await Promise.all([
            supabase.rpc('get_product_average_rating', { product_uuid: product.id }),
            supabase.rpc('get_product_review_count', { product_uuid: product.id })
          ]);

          return {
            ...product,
            average_rating: ratingResult.data || 0,
            review_count: countResult.data || 0,
          };
        })
      );

      return productsWithReviews as ProductWithCategory[];
    },
    enabled: !!query,
  });
};
