import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProductRealtime } from "./realtime-service";

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  quantity_in_stock: number;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive';
  stock?: 'in' | 'low' | 'out';
  sort?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  display_order: number;
}

export const useProducts = (filters: ProductFilters = {}, page = 1) => {
  const limit = 10;
  
  useProductRealtime();
  
  return useQuery({
    queryKey: ['products', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(*)', { count: 'exact' });

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.status) {
        query = query.eq('is_active', filters.status === 'active');
      }

      if (filters.stock) {
        switch (filters.stock) {
          case 'out':
            query = query.eq('quantity_in_stock', 0);
            break;
          case 'low':
            query = query.lte('quantity_in_stock', 10).gt('quantity_in_stock', 0);
            break;
          case 'in':
            query = query.gt('quantity_in_stock', 10);
            break;
        }
      }

      if (filters.sort) {
        const [column, order] = filters.sort.split('.');
        query = query.order(column, { ascending: order === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;

      return {
        products: data,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      };
    }
  });
};

export const useProductById = (id?: string) => {
  useProductRealtime(id);
  
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error("Product ID is required");
      
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data as Product & { categories: Category };
    },
    enabled: !!id
  });
};

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Products deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Error deleting products: ' + error.message);
    }
  });
};

export const useUpdateProductsStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: status })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Products updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Error updating products: ' + error.message);
    }
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      return buildCategoryTree(data as Category[]);
    }
  });
};

function buildCategoryTree(categories: Category[]) {
  const categoryMap = new Map<string, Category & { children: (Category & { children: any[] })[] }>();
  
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });
  
  const rootCategories: (Category & { children: any[] })[] = [];
  
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)!;
    
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      const parent = categoryMap.get(category.parent_id)!;
      parent.children.push(categoryWithChildren);
    } else {
      rootCategories.push(categoryWithChildren);
    }
  });
  
  return {
    flat: categories,
    tree: rootCategories,
    map: categoryMap
  };
}
