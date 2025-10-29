import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cacheService } from '@/lib/services/cacheService';
import { CACHE_INVALIDATION } from '@/lib/config/cacheConfig';

interface CacheStats {
  memory: { size: number; entries: number };
  localStorage: { size: number; entries: number };
  sessionStorage: { size: number; entries: number };
  serviceWorker?: { [cacheName: string]: number };
}

interface CacheManagementOptions {
  autoCleanup?: boolean;
  cleanupInterval?: number;
  maxMemorySize?: number;
  maxStorageSize?: number;
}

export function useCacheManagement(options: CacheManagementOptions = {}) {
  const {
    autoCleanup = true,
    cleanupInterval = 5 * 60 * 1000, // 5 minutes
    maxMemorySize = 50 * 1024 * 1024, // 50MB
    maxStorageSize = 100 * 1024 * 1024 // 100MB
  } = options;

  const queryClient = useQueryClient();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Get cache statistics
  const getCacheStats = useCallback(async (): Promise<CacheStats> => {
    const stats = cacheService.getStats();
    
    // Get service worker cache stats if available
    let serviceWorkerStats = {};
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const channel = new MessageChannel();
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATS' },
          [channel.port2]
        );
        
        serviceWorkerStats = await new Promise((resolve) => {
          channel.port1.onmessage = (event) => {
            resolve(event.data);
          };
          // Timeout after 1 second
          setTimeout(() => resolve({}), 1000);
        });
      } catch (error) {
        console.warn('Failed to get service worker cache stats:', error);
      }
    }

    return {
      ...stats,
      serviceWorker: serviceWorkerStats
    };
  }, []);

  // Update cache statistics
  const updateStats = useCallback(async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  }, [getCacheStats]);

  // Clear specific cache type
  const clearCache = useCallback(async (
    type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'queryClient' | 'serviceWorker' | 'all'
  ) => {
    setIsClearing(true);
    
    try {
      switch (type) {
        case 'memory':
          await cacheService.clear('memory');
          break;
        case 'localStorage':
          await cacheService.clear('localStorage');
          break;
        case 'sessionStorage':
          await cacheService.clear('sessionStorage');
          break;
        case 'indexedDB':
          await cacheService.clear('indexedDB');
          break;
        case 'queryClient':
          queryClient.clear();
          break;
        case 'serviceWorker':
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const channel = new MessageChannel();
            navigator.serviceWorker.controller.postMessage(
              { type: 'CLEAR_CACHE' },
              [channel.port2]
            );
            
            await new Promise((resolve) => {
              channel.port1.onmessage = () => resolve(true);
              setTimeout(() => resolve(true), 2000);
            });
          }
          break;
        case 'all':
          await Promise.all([
            cacheService.clear(),
            queryClient.clear(),
            clearServiceWorkerCache()
          ]);
          break;
      }
      
      await updateStats();
    } catch (error) {
      console.error(`Failed to clear ${type} cache:`, error);
    } finally {
      setIsClearing(false);
    }
  }, [queryClient, updateStats]);

  // Clear service worker cache
  const clearServiceWorkerCache = useCallback(async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
      
      return new Promise((resolve) => {
        channel.port1.onmessage = () => resolve(true);
        setTimeout(() => resolve(true), 2000);
      });
    }
  }, []);

  // Cleanup expired cache entries
  const cleanup = useCallback(async () => {
    try {
      await cacheService.cleanup();
      await updateStats();
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }, [updateStats]);

  // Check if cache size exceeds limits
  const checkCacheLimits = useCallback((stats: CacheStats) => {
    const warnings: string[] = [];
    
    const totalStorageSize = stats.localStorage.size + stats.sessionStorage.size;
    
    if (totalStorageSize > maxStorageSize) {
      warnings.push(`Storage cache size (${(totalStorageSize / 1024 / 1024).toFixed(2)}MB) exceeds limit`);
    }
    
    return warnings;
  }, [maxStorageSize]);

  // Invalidate cache based on events
  const invalidateCache = useCallback((event: 'product' | 'cart' | 'order' | 'user' | 'logout', id?: string) => {
    switch (event) {
      case 'product':
        CACHE_INVALIDATION.onProductUpdate(queryClient, id);
        break;
      case 'cart':
        CACHE_INVALIDATION.onCartUpdate(queryClient);
        break;
      case 'order':
        CACHE_INVALIDATION.onOrderUpdate(queryClient);
        break;
      case 'user':
        CACHE_INVALIDATION.onUserUpdate(queryClient);
        break;
      case 'logout':
        CACHE_INVALIDATION.onLogout(queryClient);
        clearCache('all');
        break;
    }
  }, [queryClient, clearCache]);

  // Preload critical data
  const preloadCriticalData = useCallback(async () => {
    try {
      // Preload categories and featured products
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ['categories'],
          staleTime: 30 * 60 * 1000 // 30 minutes
        }),
        queryClient.prefetchQuery({
          queryKey: ['featured-products'],
          staleTime: 15 * 60 * 1000 // 15 minutes
        })
      ]);
    } catch (error) {
      console.error('Failed to preload critical data:', error);
    }
  }, [queryClient]);

  // Set up automatic cleanup
  useEffect(() => {
    if (!autoCleanup) return;

    const interval = setInterval(cleanup, cleanupInterval);
    return () => clearInterval(interval);
  }, [autoCleanup, cleanupInterval, cleanup]);

  // Initial stats load
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Monitor cache size and warn if limits exceeded
  useEffect(() => {
    if (cacheStats) {
      const warnings = checkCacheLimits(cacheStats);
      if (warnings.length > 0) {
        console.warn('Cache size warnings:', warnings);
        // Optionally trigger automatic cleanup
        if (autoCleanup) {
          cleanup();
        }
      }
    }
  }, [cacheStats, checkCacheLimits, autoCleanup, cleanup]);

  return {
    cacheStats,
    isClearing,
    clearCache,
    cleanup,
    updateStats,
    invalidateCache,
    preloadCriticalData,
    getCacheStats
  };
}

// Hook for cache-aware data fetching
export function useCachedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    fallbackCache?: boolean;
  } = {}
) {
  const { fallbackCache = true, ...queryOptions } = options;
  const queryClient = useQueryClient();

  // Try to get data from custom cache first if query fails
  const enhancedQueryFn = useCallback(async (): Promise<T> => {
    try {
      return await queryFn();
    } catch (error) {
      if (fallbackCache) {
        const cachedData = await cacheService.get(queryKey.join('-'), 'localStorage');
        if (cachedData) {
          return cachedData;
        }
      }
      throw error;
    }
  }, [queryFn, queryKey, fallbackCache]);

  return queryClient.useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    ...queryOptions
  });
}

export default useCacheManagement;
