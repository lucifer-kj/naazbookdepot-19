
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Category = Tables<'categories'> & {
  subcategories?: Category[];
  parent?: Category;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          parent:parent_id(*)
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Group categories by parent-child relationship
      const categoriesMap = new Map();
      const rootCategories: Category[] = [];
      
      // First pass: create all categories
      data.forEach(cat => {
        const category: Category = {
          ...cat,
          subcategories: []
        };
        categoriesMap.set(cat.id, category);
      });
      
      // Second pass: build hierarchy
      data.forEach(cat => {
        const category = categoriesMap.get(cat.id);
        if (cat.parent_id) {
          const parent = categoriesMap.get(cat.parent_id);
          if (parent) {
            parent.subcategories = parent.subcategories || [];
            parent.subcategories.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });
      
      return rootCategories;
    },
  });
};

export const useAllCategories = () => {
  return useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
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
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
  });
};
