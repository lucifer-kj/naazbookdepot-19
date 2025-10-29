import { handleApiError as handleApiErrorNew } from './consoleMigration';
import { toast } from 'sonner';

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
  
  toast.error(message);
};

// Safe async function wrapper
export const safeAsync = async <T,>(
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

// Retry wrapper for failed operations
export const withRetry = async <T,>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
};

// Debounced error handler
export const debouncedErrorHandler = (() => {
  let timeoutId: NodeJS.Timeout;
  const errorCounts = new Map<string, number>();
  
  return (error: unknown, key: string = 'default', delay: number = 1000) => {
    clearTimeout(timeoutId);
    
    const count = errorCounts.get(key) || 0;
    errorCounts.set(key, count + 1);
    
    timeoutId = setTimeout(() => {
      const finalCount = errorCounts.get(key) || 1;
      const message = finalCount > 1 
        ? `Error occurred ${finalCount} times` 
        : 'An error occurred';
      
      handleApiError(error, message);
      errorCounts.delete(key);
    }, delay);
  };
})();