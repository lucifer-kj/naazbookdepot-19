/**
 * Cache Configuration
 * Centralized caching strategies for optimal performance
 */

import { QueryClient } from '@tanstack/react-query';

// Cache durations in milliseconds
export const CACHE_TIMES = {
  VERY_SHORT: 1 * 60 * 1000,      // 1 minute
  SHORT: 5 * 60 * 1000,           // 5 minutes
  MEDIUM: 15 * 60 * 1000,         // 15 minutes
  LONG: 30 * 60 * 1000,           // 30 minutes
  VERY_LONG: 60 * 60 * 1000,      // 1 hour
  PERSISTENT: 24 * 60 * 60 * 1000  // 24 hours
};

// Query keys for consistent caching
export const QUERY_KEYS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'product-detail',
  CATEGORIES: 'categories',
  CART: 'cart',
  USER: 'user',
  ORDERS: 'orders',
  ADMIN_STATS: 'admin-stats',
  ADMIN_PRODUCTS: 'admin-products',
  ADMIN_ORDERS: 'admin-orders',
  ADMIN_USERS: 'admin-users'
} as const;

// Cache configuration by data type
export const CACHE_CONFIG = {
  // Static or rarely changing data
  categories: {
    staleTime: CACHE_TIMES.VERY_LONG,
    gcTime: CACHE_TIMES.PERSISTENT
  },
  
  // Product data - moderate caching
  products: {
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG
  },
  
  // User-specific data - short caching
  cart: {
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM
  },
  
  // Real-time data - very short caching
  orders: {
    staleTime: CACHE_TIMES.VERY_SHORT,
    gcTime: CACHE_TIMES.SHORT
  },
  
  // Admin data - short caching for freshness
  admin: {
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM
  }
};

// Browser storage configuration
export const STORAGE_CONFIG = {
  localStorage: {
    maxAge: CACHE_TIMES.PERSISTENT,
    serialize: JSON.stringify,
    deserialize: JSON.parse
  },
  sessionStorage: {
    maxAge: CACHE_TIMES.LONG,
    serialize: JSON.stringify,
    deserialize: JSON.parse
  },
  indexedDB: {
    maxAge: CACHE_TIMES.PERSISTENT * 7, // 7 days
    dbName: 'naaz-cache',
    version: 1
  }
};

// Memory cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private maxSize = 100; // Maximum number of entries

  set(key: string, data: unknown, ttl: number = CACHE_TIMES.SHORT): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const memoryCache = new MemoryCache();

// Optimized Query Client configuration with persistence
export const createOptimizedQueryClient = (): QueryClient => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Default cache settings
        staleTime: CACHE_TIMES.SHORT,
        gcTime: CACHE_TIMES.MEDIUM,
        
        // Retry configuration
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors except timeout and rate limit
          if (error?.status && error.status >= 400 && error.status < 500) {
            return error.status === 408 || error.status === 429;
          }
          return failureCount < 2;
        },
        
        // Progressive retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Network mode for offline support
        networkMode: 'offlineFirst',
        
        // Refetch configuration
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true
      },
      
      mutations: {
        // Mutation retry configuration
        retry: (failureCount, error: unknown) => {
          // Don't retry mutations on client errors
          if (error?.status && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 1; // Only retry once for mutations
        },
        
        networkMode: 'offlineFirst'
      }
    }
  });

  // Note: Persistence can be added later with proper packages

  return queryClient;
};

// Cache invalidation strategies
export const CACHE_INVALIDATION = {
  // Invalidate product cache when product is updated
  onProductUpdate: (queryClient: QueryClient, productId?: string) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    if (productId) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT_DETAIL, productId] });
    }
  },
  
  // Invalidate cart cache when cart is updated
  onCartUpdate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
  },
  
  // Invalidate order cache when order is created/updated
  onOrderUpdate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_ORDERS] });
  },
  
  // Invalidate user cache when user data changes
  onUserUpdate: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER] });
  },
  
  // Clear all cache on logout
  onLogout: (queryClient: QueryClient) => {
    queryClient.clear();
  }
};

// Prefetch strategies for better performance
export const PREFETCH_STRATEGIES = {
  // Prefetch product details when hovering over product cards
  prefetchProductDetails: (queryClient: QueryClient, productId: string) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.PRODUCT_DETAIL, productId],
      staleTime: CACHE_TIMES.MEDIUM
    });
  },
  
  // Prefetch cart data on app initialization
  prefetchCartData: (queryClient: QueryClient) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.CART],
      staleTime: CACHE_TIMES.SHORT
    });
  },
  
  // Prefetch categories for navigation
  prefetchCategories: (queryClient: QueryClient) => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEYS.CATEGORIES],
      staleTime: CACHE_TIMES.VERY_LONG
    });
  }
};

export default {
  CACHE_TIMES,
  QUERY_KEYS,
  CACHE_CONFIG,
  createOptimizedQueryClient,
  CACHE_INVALIDATION,
  PREFETCH_STRATEGIES
};
