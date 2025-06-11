
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Category = Tables<'categories'>;

export const useCategories = (shopType?: string) => {
  return useQuery({
    queryKey: ['categories', shopType],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (shopType) {
        query = query.eq('shop_type', shopType);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    },
  });
};

// Add Category Mutation
export const useAddCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData: Pick<TablesInsert<'categories'>, 'name' | 'slug' | 'description' | 'is_active' | 'parent_id' | 'shop_type' | 'sort_order'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Delete Category Mutation
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Update Category Mutation
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, categoryData }: { categoryId: string, categoryData: TablesUpdate<'categories'> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['category', data.slug] }); // Assuming slug might be used as a key
        queryClient.invalidateQueries({ queryKey: ['category', data.id] });
      }
    },
  });
};

export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as Category;
    },
  });
};
