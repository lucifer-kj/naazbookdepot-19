
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type ProductWithImages = Product & {
  product_images?: Tables<'product_images'>[];
  categories?: Tables<'categories'>;
};

export const useProducts = (shopType?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['products', shopType, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (shopType) {
        query = query.eq('shop_type', shopType);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ProductWithImages[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*),
          product_variants(*),
          product_reviews(*, users(full_name))
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ProductWithImages[];
    },
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
          product_images(*),
          categories(*)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithImages[];
    },
    enabled: !!query,
  });
};
