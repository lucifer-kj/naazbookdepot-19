import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type AdminProduct = Tables<'products'> & {
  categories?: Tables<'categories'>;
  variants?: Tables<'product_variants'>[];
  average_rating?: number;
  review_count?: number;
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*),
          product_variants(*)
        `)
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

      return productsWithReviews as AdminProduct[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Tables<'products'>, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast.error('Failed to create product');
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tables<'products'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated');
    },
    onError: (error) => {
      console.error('Update product error:', error);
      toast.error('Failed to update product');
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all possible product queries for real-time update
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['search-products'] });
      // Remove all cached product lists with any categoryId
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = Array.isArray(query.queryKey) ? query.queryKey : [];
        return key[0] === 'products';
      }});
      toast.success('Product deleted');
    },
    onError: (error) => {
      console.error('Delete product error:', error);
      toast.error('Failed to delete product');
    }
  });
};
