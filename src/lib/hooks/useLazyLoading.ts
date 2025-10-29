import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  disabled?: boolean;
}

export function useLazyLoading<T extends HTMLElement = HTMLElement>(
  options: UseLazyLoadingOptions = {}
) {
  const {
    rootMargin = '50px 0px',
    threshold = 0.01,
    triggerOnce = true,
    disabled = false
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (disabled || (triggerOnce && hasTriggered)) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Fallback for browsers without Intersection Observer
    if (!('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && triggerOnce) {
          setHasTriggered(true);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, disabled, hasTriggered]);

  return {
    elementRef,
    isIntersecting: disabled ? true : isIntersecting,
    hasTriggered
  };
}

// Hook specifically for image lazy loading
export function useImageLazyLoading(options: UseLazyLoadingOptions = {}) {
  const { elementRef, isIntersecting, hasTriggered } = useLazyLoading<HTMLImageElement>({
    rootMargin: '100px 0px', // Load images a bit earlier
    ...options
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return {
    elementRef,
    isIntersecting,
    hasTriggered,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
    shouldLoad: isIntersecting || hasTriggered
  };
}

// Hook for lazy loading content sections
export function useContentLazyLoading(options: UseLazyLoadingOptions = {}) {
  return useLazyLoading<HTMLDivElement>({
    rootMargin: '200px 0px', // Load content sections earlier
    threshold: 0.1,
    ...options
  });
}

// Hook for infinite scroll
export function useInfiniteScroll<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  options: UseLazyLoadingOptions & { enabled?: boolean } = {}
) {
  const { enabled = true, ...lazyOptions } = options;
  const { elementRef, isIntersecting } = useLazyLoading<T>({
    rootMargin: '100px 0px',
    triggerOnce: false,
    disabled: !enabled,
    ...lazyOptions
  });

  useEffect(() => {
    if (isIntersecting && enabled) {
      callback();
    }
  }, [isIntersecting, enabled, callback]);

  return {
    elementRef,
    isIntersecting
  };
}
