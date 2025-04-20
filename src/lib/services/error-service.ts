
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorLogPayload {
  type: 'api_error' | 'react_error_boundary' | 'form_validation' | 'network_error' | 'auth_error' | 'unknown';
  error: {
    message: string;
    stack?: string;
    code?: string | number;
  };
  context?: Record<string, any>;
  componentStack?: string;
  url?: string;
}

/**
 * Log errors to our error tracking system
 */
export async function logError(payload: ErrorLogPayload): Promise<void> {
  // Add additional context to all errors
  const enhancedPayload = {
    ...payload,
    url: payload.url || window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  console.error('Error logged:', enhancedPayload);

  // Log to Supabase if authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('activity_logs').insert({
        action_type: 'error',
        details: enhancedPayload,
        user_id: session.user.id
      });
    }
  } catch (loggingError) {
    // Silent fail for logging errors to avoid recursive errors
    console.error('Failed to log error:', loggingError);
  }
}

/**
 * Display user-friendly error messages
 */
export function handleError(error: unknown, userMessage?: string): void {
  // Extract error message
  const errorMessage = getErrorMessage(error);
  
  // Log the error
  logError({
    type: 'unknown',
    error: {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    }
  });

  // Show user-friendly toast
  toast.error(userMessage || 'An error occurred', {
    description: userMessage ? errorMessage : 'Please try again or contact support if the problem persists.',
    duration: 5000,
  });
}

/**
 * Extract error message from different error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle Supabase error format
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Handle API error responses
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Create a function that executes an async operation with error handling
 */
export function createSafeAsyncFunction<T, A extends any[]>(
  asyncFn: (...args: A) => Promise<T>,
  errorHandler?: (error: unknown) => void
): (...args: A) => Promise<T | undefined> {
  return async (...args: A) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const handler = errorHandler || handleError;
      handler(error);
      return undefined;
    }
  };
}

/**
 * Create a form error handler that formats errors for react-hook-form
 */
export function createFormErrorHandler(setError: (name: string, error: { type: string; message: string }) => void) {
  return (error: unknown) => {
    // Log the error
    logError({
      type: 'form_validation',
      error: {
        message: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    });

    // Handle different error formats
    if (typeof error === 'object' && error !== null && 'errors' in error) {
      const errors = error.errors as Record<string, string>;
      Object.entries(errors).forEach(([field, message]) => {
        setError(field, { type: 'manual', message });
      });
      return;
    }

    // Show a generic error toast
    toast.error('Form submission failed', {
      description: getErrorMessage(error),
    });
  };
}
