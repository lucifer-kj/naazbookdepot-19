import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { handleApiError as handleApiErrorNew } from './consoleMigration';

// Global error handler for API calls
export const handleApiError = (error: unknown, customMessage?: string) => {
  handleApiErrorNew(error, 'api_call', { customMessage });
  
  let message = customMessage || 'Something went wrong';
  
  if (error?.message) {
    message = error.message;
  } else if (error?.error_description) {
    message = error.error_description;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  // Don't show error toast for authentication errors in development
  if (process.env.NODE_ENV === 'development' && message.includes('JWT')) {
    return;
  }
  
  toast.error(message);
};

// Enhanced useQuery wrapper with error handling
export const useApiQuery = <T>(key: unknown[], queryFn: () => Promise<T>, options?: Record<string, unknown>) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    retry: (failureCount: number, error: { status?: number }) => {
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

// Loading component with skeleton
export const LoadingSpinner = ({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-naaz-green ${sizeClasses[size]}`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

// Error boundary hook
export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = () => setError(null);

  const captureError = (error: Error) => {
    setError(error);
    handleApiError(error);
  };

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// Form validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Debounce hook for search inputs
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Local storage hook with error handling
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      import('./consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'localStorage_read', { key });
      });
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      import('./consoleMigration').then(({ handleApiError: handleApiErrorNew }) => {
        handleApiErrorNew(error, 'localStorage_write', { key });
      });
      handleApiError(error, 'Failed to save data locally');
    }
  };

  return [storedValue, setValue] as const;
};

// Image loading hook with fallback
export const useImageLoader = (src: string, fallback: string) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSrc(src);

    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      setImageSrc(fallback);
    };
    img.src = src;
  }, [src, fallback]);

  return { imageSrc, isLoading, hasError };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

// Supabase error handler
export const handleSupabaseError = (error: unknown, context?: string) => {
  if (!error) return;

  let message = 'An unexpected error occurred';
  
  if (error.message) {
    message = error.message;
  } else if (error.error_description) {
    message = error.error_description;
  }

  if (context) {
    message = `${context}: ${message}`;
  }

  import('./consoleMigration').then(({ handleDatabaseError }) => {
    handleDatabaseError(error, 'supabase_operation', { context });
  });
  toast.error(message);
};

// Safe async function wrapper
export const safeAsync = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
};

export default {
  handleApiError,
  useApiQuery,
  LoadingSpinner,
  useErrorBoundary,
  validateEmail,
  validatePhone,
  validateRequired,
  useDebounce,
  useLocalStorage,
  useImageLoader,
  useIntersectionObserver,
  handleSupabaseError,
  safeAsync
};