/**
 * Performance Optimization Utilities
 * Provides utilities for bundle optimization and performance monitoring
 */

// Preload critical routes for better performance
export const preloadCriticalRoutes = () => {
  if (typeof window !== 'undefined') {
    // Preload critical routes that users are likely to visit
    const criticalRoutes = [
      () => import('@/pages/Products'),
      () => import('@/pages/Cart'),
      () => import('@/pages/ProductPage'),
    ];

    // Use requestIdleCallback to preload during idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        criticalRoutes.forEach(route => {
          route().catch(() => {
            // Silently fail if preloading fails
          });
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        criticalRoutes.forEach(route => {
          route().catch(() => {
            // Silently fail if preloading fails
          });
        });
      }, 2000);
    }
  }
};

// Optimize images with lazy loading and proper sizing
export const optimizeImageLoading = () => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Bundle size analyzer for development
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    console.group('📦 Bundle Analysis');
    
    // Estimate chunk sizes based on loaded modules
    const loadedModules = performance.getEntriesByType('navigation');
    console.log('Navigation timing:', loadedModules);
    
    // Monitor resource loading
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    console.log('JavaScript resources:', jsResources.length);
    console.log('CSS resources:', cssResources.length);
    
    // Calculate total transfer size
    const totalTransferSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    console.log(`Total transfer size: ${(totalTransferSize / 1024).toFixed(2)} KB`);
    console.groupEnd();
  }
};

// Cache optimization strategies
export const optimizeCaching = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    // Register service worker for caching in production
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silently fail if service worker registration fails
    });
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (import.meta.env.DEV && 'memory' in performance) {
    const memory = (performance as unknown).memory;
    console.log('Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
};

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  if (typeof window !== 'undefined') {
    // Collect Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (import.meta.env.DEV && entry.name.includes('LCP') || entry.name.includes('FID') || entry.name.includes('CLS')) {
          console.log(`${entry.name}: ${entry.value}`);
        }
        
        // In production, send to analytics service
        if (import.meta.env.PROD) {
          // Send to analytics service (implement based on your analytics provider)
          // analytics.track('performance_metric', {
          //   name: entry.name,
          //   value: entry.value,
          //   rating: entry.rating
          // });
        }
      });
    });

    // Observe different performance metrics
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      // Some browsers might not support all entry types
      console.warn('Performance observer not fully supported:', error);
    }
  }
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  preloadCriticalRoutes();
  optimizeImageLoading();
  optimizeCaching();
  
  if (import.meta.env.DEV) {
    analyzeBundleSize();
    monitorMemoryUsage();
  }
  
  collectPerformanceMetrics();
};

// Export individual functions for selective use
export default {
  preloadCriticalRoutes,
  optimizeImageLoading,
  analyzeBundleSize,
  optimizeCaching,
  monitorMemoryUsage,
  collectPerformanceMetrics,
  initializePerformanceOptimizations
};
