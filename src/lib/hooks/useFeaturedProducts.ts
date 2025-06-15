
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProductWithCategory } from './useProducts';

export const useFeaturedProducts = (limit: number = 6) => {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      // For now, we'll get the latest products as featured
      // In the future, you can add a 'featured' boolean column to the products table
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

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
