import { lazy, ComponentType } from 'react';
import { ChunkLoadingIndicator } from '@/components/common/LoadingBar';

interface LazyComponentOptions {
  fallback?: ComponentType;
  chunkName?: string;
  preload?: boolean;
  retryCount?: number;
}

/**
 * Enhanced lazy loading with better error handling and preloading
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): ComponentType {
  const {
    fallback,
    chunkName,
    preload = false,
    retryCount = 3
  } = options;

  // Create a wrapper for retry logic
  const importWithRetry = async (attempt = 1): Promise<{ default: T }> => {
    try {
      return await importFn();
    } catch (error) {
      if (attempt < retryCount) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        return importWithRetry(attempt + 1);
      }
      throw error;
    }
  };

  const LazyComponent = lazy(importWithRetry);

  // Preload the component if requested
  if (preload) {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importWithRetry().catch(() => {
        // Silently fail preloading
      });
    }, 100);
  }

  // Return the lazy component with custom fallback
  const WrappedComponent = (props: any) => {
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent {...props} />;
    }

    return (
      <ChunkLoadingIndicator 
        isLoading={true} 
        chunkName={chunkName}
      />
    );
  };

  // Add preload method to the component
  (LazyComponent as any).preload = () => importWithRetry();

  return LazyComponent;
}

/**
 * Preload multiple components
 */
export function preloadComponents(components: Array<() => Promise<any>>): Promise<any[]> {
  return Promise.all(components.map(comp => comp().catch(() => null)));
}

/**
 * Create route-based lazy components with automatic preloading
 */
export const createRouteComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  routeName: string
) => {
  return createLazyComponent(importFn, {
    chunkName: routeName,
    preload: false, // Routes are loaded on demand
    retryCount: 3
  });
};

/**
 * Create feature-based lazy components (admin, checkout, etc.)
 */
export const createFeatureComponent = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  featureName: string,
  preload = false
) => {
  return createLazyComponent(importFn, {
    chunkName: featureName,
    preload,
    retryCount: 2
  });
};

/**
 * Lazy load heavy libraries
 */
export async function loadLibrary<T>(
  importFn: () => Promise<T>,
  libraryName: string
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    import('./consoleMigration').then(({ logError }) => {
      logError(`Failed to load library: ${libraryName}`, { error });
    });
    throw error;
  }
}

/**
 * Conditional imports based on feature flags or conditions
 */
export async function conditionalImport<T>(
  condition: boolean | (() => boolean),
  importFn: () => Promise<T>
): Promise<T | null> {
  const shouldImport = typeof condition === 'function' ? condition() : condition;
  
  if (!shouldImport) {
    return null;
  }

  return await importFn();
}

/**
 * Bundle splitting utilities
 */
export const bundleUtils = {
  // Preload critical route components
  preloadCriticalRoutes: () => {
    const criticalRoutes = [
      () => import('@/pages/Home'),
      () => import('@/pages/Products'),
      () => import('@/pages/ProductPage'),
      () => import('@/pages/Cart')
    ];

    // Preload after initial page load
    if (document.readyState === 'complete') {
      preloadComponents(criticalRoutes);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => preloadComponents(criticalRoutes), 2000);
      });
    }
  },

  // Preload components based on user interaction
  preloadOnHover: (element: HTMLElement, importFn: () => Promise<any>) => {
    let hasPreloaded = false;
    
    const preload = () => {
      if (!hasPreloaded) {
        hasPreloaded = true;
        importFn().catch(() => {});
      }
    };

    element.addEventListener('mouseenter', preload, { once: true });
    element.addEventListener('focus', preload, { once: true });
  },

  // Preload based on viewport intersection
  preloadOnIntersection: (
    element: HTMLElement, 
    importFn: () => Promise<any>,
    options: IntersectionObserverInit = {}
  ) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          importFn().catch(() => {});
          observer.disconnect();
        }
      },
      { rootMargin: '100px', ...options }
    );

    observer.observe(element);
  }
};

// Initialize critical route preloading
bundleUtils.preloadCriticalRoutes();