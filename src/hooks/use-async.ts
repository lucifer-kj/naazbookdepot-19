
import { useState, useCallback } from 'react';
import { handleError } from '@/lib/services/error-service';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

type AsyncFunction<T, P extends any[]> = (...params: P) => Promise<T>;

/**
 * Hook for handling async operations with loading, error, and success states
 */
export function useAsync<T, P extends any[] = any[]>(
  asyncFunction: AsyncFunction<T, P>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    initialData?: T | null;
    errorMessage?: string;
  }
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: options?.initialData || null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P) => {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
      
      try {
        const data = await asyncFunction(...params);
        setState({ data, isLoading: false, error: null });
        
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        
        return data;
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error(String(error));
        
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: errorObject,
        }));
        
        if (options?.onError) {
          options.onError(errorObject);
        } else {
          handleError(error, options?.errorMessage);
        }
        
        throw errorObject;
      }
    },
    [asyncFunction, options]
  );

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({
        data: options?.initialData || null,
        isLoading: false,
        error: null,
      });
    }, [options?.initialData]),
  };
}
