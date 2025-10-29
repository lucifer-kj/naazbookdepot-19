import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

export interface LoadingOptions {
  initialMessage?: string;
  showProgress?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

export const useLoadingState = (options: LoadingOptions = {}) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: options.initialMessage,
    error: undefined
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      message: message || options?.initialMessage,
      error: undefined
    });

    startTimeRef.current = Date.now();

    // Set timeout if specified
    if (options?.timeout) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          error: 'Operation timed out'
        }));
        options?.onTimeout?.();
      }, options?.timeout);
    }
  }, [options]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const stopLoading = useCallback((finalMessage?: string) => {
    setState({
      isLoading: false,
      progress: 100,
      message: finalMessage,
      error: undefined
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      message: options.initialMessage,
      error: undefined
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [options.initialMessage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calculate elapsed time
  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) return 0;
    return Date.now() - startTimeRef.current;
  }, []);

  return {
    ...state,
    startLoading,
    updateProgress,
    setMessage,
    setError,
    stopLoading,
    reset,
    getElapsedTime
  };
};

// Hook for managing multiple loading states
export const useMultipleLoadingStates = () => {
  const [states, setStates] = useState<Record<string, LoadingState>>({});

  const startLoading = useCallback((key: string, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        progress: 0,
        message,
        error: undefined
      }
    }));
  }, []);

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.min(100, Math.max(0, progress)),
        message: message || prev[key]?.message
      }
    }));
  }, []);

  const setError = useCallback((key: string, error: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
        isLoading: false
      }
    }));
  }, []);

  const stopLoading = useCallback((key: string, finalMessage?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        progress: 100,
        message: finalMessage,
        error: undefined
      }
    }));
  }, []);

  const removeState = useCallback((key: string) => {
    setStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const getState = useCallback((key: string): LoadingState => {
    return states[key] || {
      isLoading: false,
      progress: 0,
      message: undefined,
      error: undefined
    };
  }, [states]);

  const isAnyLoading = Object.values(states).some(state => state.isLoading);

  return {
    states,
    startLoading,
    updateProgress,
    setError,
    stopLoading,
    removeState,
    getState,
    isAnyLoading
  };
};

// Hook for async operations with loading state
export const useAsyncOperation = <T = unknown>(
  operation: (...args: unknown[]) => Promise<T>,
  options: LoadingOptions = {}
) => {
  const loadingState = useLoadingState(options);

  const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
    try {
      loadingState.startLoading();
      const result = await operation(...args);
      loadingState.stopLoading('Operation completed successfully');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      loadingState.setError(errorMessage);
      return null;
    }
  }, [operation, loadingState]);

  return {
    ...loadingState,
    execute
  };
};

// Hook for debounced loading state
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading
  };
};
