
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProductRealtime } from "./realtime-service";
import { logError } from "./error-service";

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

// Local storage cache helpers
const CACHE_PREFIX = 'naaz_cache_';
const CACHE_EXPIRY = 1000 * 60 * 30; // 30 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const saveToCache = <T>(key: string, data: T) => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

const getFromCache = <T>(key: string): T | null => {
  try {
    const cacheJson = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cacheJson) return null;
    
    const cache = JSON.parse(cacheJson) as CacheItem<T>;
    
    // Check if cache is expired
    if (Date.now() - cache.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return cache.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

// Network status helpers
const isOnline = () => navigator.onLine;

export const useProducts = (filters: ProductFilters = {}, page = 1) => {
  const limit = 10;
  const cacheKey = `products_${JSON.stringify(filters)}_${page}`;
  
  useProductRealtime();
  
  return useQuery({
    queryKey: ['products', filters, page],
    queryFn: async () => {
      try {
        if (!isOnline()) {
          const cachedData = getFromCache<any>(cacheKey);
          if (cachedData) {
            toast.info('Using cached product data. Connect to the internet for latest data.');
            return cachedData;
          }
          throw new Error('You are offline and no cached data is available');
        }
        
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

        const result = {
          products: data,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        };
        
        // Cache the successful result
        saveToCache(cacheKey, result);
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load products';
        console.error('Error fetching products:', error);
        
        // If offline, try to use cached data
        if (!isOnline()) {
          const cachedData = getFromCache<any>(cacheKey);
          if (cachedData) {
            toast.info('Using cached product data. Connect to the internet for latest data.');
            return cachedData;
          }
        }
        
        // Log the error
        logError({
          type: 'api_error',
          error: {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            code: error instanceof Error && 'code' in error ? (error as any).code : undefined
          },
          context: { filters, page }
        });
        
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  });
};

export const useProductById = (id?: string) => {
  const cacheKey = `product_${id}`;
  useProductRealtime(id);
  
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Product ID is required");
        
        if (!isOnline()) {
          const cachedData = getFromCache<Product & { categories: Category }>(cacheKey);
          if (cachedData) {
            toast.info('Using cached product data. Connect to the internet for latest data.');
            return cachedData;
          }
          throw new Error('You are offline and no cached data is available');
        }
        
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error(`Product not found: ${id}`);
        
        // Cache the successful result
        saveToCache(cacheKey, data as Product & { categories: Category });
        
        return data as Product & { categories: Category };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load product';
        console.error('Error fetching product:', error);
        
        // If offline, try to use cached data
        if (!isOnline()) {
          const cachedData = getFromCache<Product & { categories: Category }>(cacheKey);
          if (cachedData) {
            toast.info('Using cached product data. Connect to the internet for latest data.');
            return cachedData;
          }
        }
        
        // Log the error
        logError({
          type: 'api_error',
          error: {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            code: error instanceof Error && 'code' in error ? (error as any).code : undefined
          },
          context: { productId: id }
        });
        
        throw error;
      }
    },
    enabled: !!id,
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  });
};

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        if (!isOnline()) {
          throw new Error('Cannot delete products while offline');
        }
        
        const { error } = await supabase
          .from('products')
          .delete()
          .in('id', ids);

        if (error) throw error;
        
        return ids;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete products';
        console.error('Error deleting products:', error);
        
        // Log the error
        logError({
          type: 'api_error',
          error: {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            code: error instanceof Error && 'code' in error ? (error as any).code : undefined
          },
          context: { productIds: ids }
        });
        
        throw error;
      }
    },
    onSuccess: (ids) => {
      toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} deleted successfully`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Remove deleted products from cache
      ids.forEach(id => {
        try {
          localStorage.removeItem(`${CACHE_PREFIX}product_${id}`);
        } catch (e) {
          console.error('Error clearing cache:', e);
        }
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error deleting products: ' + errorMessage);
    }
  });
};

export const useUpdateProductsStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: boolean }) => {
      try {
        if (!isOnline()) {
          throw new Error('Cannot update products while offline');
        }
        
        const { error } = await supabase
          .from('products')
          .update({ is_active: status })
          .in('id', ids);

        if (error) throw error;
        
        return { ids, status };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update products';
        console.error('Error updating products:', error);
        
        // Log the error
        logError({
          type: 'api_error',
          error: {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            code: error instanceof Error && 'code' in error ? (error as any).code : undefined
          },
          context: { productIds: ids, newStatus: status }
        });
        
        throw error;
      }
    },
    onSuccess: ({ ids, status }) => {
      toast.success(`${ids.length} product${ids.length === 1 ? '' : 's'} ${status ? 'activated' : 'deactivated'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Invalidate individual product caches
      ids.forEach(id => {
        queryClient.invalidateQueries({ queryKey: ['product', id] });
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error updating products: ' + errorMessage);
    }
  });
};

export const useCategories = () => {
  const cacheKey = 'categories';
  
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        if (!isOnline()) {
          const cachedData = getFromCache<any>(cacheKey);
          if (cachedData) {
            toast.info('Using cached category data. Connect to the internet for latest data.');
            return cachedData;
          }
          throw new Error('You are offline and no cached data is available');
        }
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        
        const result = buildCategoryTree(data as Category[]);
        
        // Cache the successful result
        saveToCache(cacheKey, result);
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
        console.error('Error fetching categories:', error);
        
        // If offline, try to use cached data
        if (!isOnline()) {
          const cachedData = getFromCache<any>(cacheKey);
          if (cachedData) {
            toast.info('Using cached category data. Connect to the internet for latest data.');
            return cachedData;
          }
        }
        
        // Log the error
        logError({
          type: 'api_error',
          error: {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            code: error instanceof Error && 'code' in error ? (error as any).code : undefined
          }
        });
        
        throw error;
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false
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

// Network status listener
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
      queryClient.invalidateQueries();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be limited.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);
  
  return { isOnline };
}
