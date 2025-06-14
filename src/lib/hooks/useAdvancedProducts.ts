
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { FilterOptions } from '@/components/product/AdvancedProductFilters';

export type ProductWithReviews = Tables<'products'> & {
  categories?: Tables<'categories'>;
  average_rating?: number;
  review_count?: number;
};

export const useAdvancedProducts = (filters: FilterOptions) => {
  return useQuery({
    queryKey: ['advanced-products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `);

      // Apply category filter
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      // Apply price filters
      if (filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice > 0) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply stock filter
      if (filters.inStock) {
        query = query.gt('stock', 0);
      }

      // Apply search filter
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data: products, error } = await query;
      
      if (error) throw error;

      // Get average ratings and review counts for each product
      const productsWithReviews = await Promise.all(
        products.map(async (product) => {
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

      // Apply rating filter (done client-side after getting ratings)
      let filteredProducts = productsWithReviews;
      if (filters.minRating > 0) {
        filteredProducts = productsWithReviews.filter(
          product => (product.average_rating || 0) >= filters.minRating
        );
      }

      // Apply rating sort if needed
      if (filters.sortBy === 'rating') {
        filteredProducts.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      }

      return filteredProducts as ProductWithReviews[];
    },
  });
};
