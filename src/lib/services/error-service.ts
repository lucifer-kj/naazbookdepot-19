
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
    online: navigator.onLine
  };

  console.error('Error logged:', enhancedPayload);

  // Log to Supabase if authenticated and online
  try {
    if (navigator.onLine) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('activity_logs').insert({
          action_type: 'error',
          details: enhancedPayload,
          user_id: session.user.id,
          ip_address: null // Will be populated by RLS policy if needed
        });
      } else {
        // Fallback to anonymous error logging
        await supabase.from('activity_logs').insert({
          action_type: 'error',
          details: enhancedPayload,
          user_id: null
        });
      }
    } else {
      // Store offline errors in localStorage to sync later
      storeOfflineError(enhancedPayload);
    }
  } catch (loggingError) {
    // Silent fail for logging errors to avoid recursive errors
    console.error('Failed to log error:', loggingError);
    // Attempt to store locally if remote logging fails
    storeOfflineError(enhancedPayload);
  }
}

/**
 * Store errors offline for later sync
 */
function storeOfflineError(payload: any): void {
  try {
    const offlineErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
    offlineErrors.push(payload);
    localStorage.setItem('offline_errors', JSON.stringify(offlineErrors.slice(-20))); // Keep last 20 errors
  } catch (e) {
    console.error('Failed to store offline error:', e);
  }
}

/**
 * Sync offline errors when coming back online
 */
export function setupErrorSync(): void {
  window.addEventListener('online', async () => {
    try {
      const offlineErrors = JSON.parse(localStorage.getItem('offline_errors') || '[]');
      if (offlineErrors.length === 0) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Process in batches of 5
      for (let i = 0; i < offlineErrors.length; i += 5) {
        const batch = offlineErrors.slice(i, i + 5);
        
        try {
          await supabase.from('activity_logs').insert(
            batch.map(error => ({
              action_type: 'error',
              details: {
                ...error,
                synced_from_offline: true
              },
              user_id: session.user.id
            }))
          );
          
          // Remove successfully synced errors
          offlineErrors.splice(i, batch.length);
          localStorage.setItem('offline_errors', JSON.stringify(offlineErrors));
        } catch (e) {
          console.error('Failed to sync batch of offline errors:', e);
          break; // Stop processing if batch fails
        }
      }
    } catch (e) {
      console.error('Error syncing offline errors:', e);
    }
  });
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

  // Customize message based on error type
  let displayMessage = userMessage || 'An error occurred';
  let description = userMessage ? errorMessage : 'Please try again or contact support if the problem persists.';
  let duration = 5000;
  
  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('offline')) {
      displayMessage = 'Network Error';
      description = 'Please check your internet connection and try again.';
    } else if (error.message.includes('permission') || error.message.includes('access denied')) {
      displayMessage = 'Permission Denied';
      description = 'You don\'t have permission to perform this action.';
    } else if (error.message.includes('session') || error.message.includes('token')) {
      displayMessage = 'Session Error';
      description = 'Your session has expired. Please log in again.';
    }
  }

  // Show user-friendly toast
  toast.error(displayMessage, {
    description,
    duration,
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
    
    // Handle detailed error objects
    if ('details' in error && typeof error.details === 'string') {
      return error.details;
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

/**
 * Convert validation errors to a user-friendly format
 */
export function formatValidationErrors(errors: Record<string, string>): string {
  return Object.entries(errors)
    .map(([field, message]) => `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}: ${message}`)
    .join('\n');
}

/**
 * Classify errors into categories for better handling
 */
export function classifyError(error: unknown): {
  type: 'network' | 'auth' | 'validation' | 'permission' | 'timeout' | 'server' | 'unknown';
  message: string;
} {
  const message = getErrorMessage(error);
  
  // Network errors
  if (
    message.includes('network') || 
    message.includes('offline') || 
    message.includes('connection') ||
    !navigator.onLine
  ) {
    return { type: 'network', message };
  }
  
  // Authentication errors
  if (
    message.includes('auth') || 
    message.includes('login') || 
    message.includes('password') ||
    message.includes('token') ||
    message.includes('session') ||
    message.includes('unauthorized')
  ) {
    return { type: 'auth', message };
  }
  
  // Validation errors
  if (
    message.includes('valid') || 
    message.includes('required') || 
    message.includes('format') ||
    message.includes('must be')
  ) {
    return { type: 'validation', message };
  }
  
  // Permission errors
  if (
    message.includes('permission') || 
    message.includes('access denied') || 
    message.includes('forbidden')
  ) {
    return { type: 'permission', message };
  }
  
  // Timeout errors
  if (
    message.includes('timeout') || 
    message.includes('timed out')
  ) {
    return { type: 'timeout', message };
  }
  
  // Server errors
  if (
    message.includes('server') || 
    message.includes('500') || 
    message.includes('internal')
  ) {
    return { type: 'server', message };
  }
  
  // Default
  return { type: 'unknown', message };
}

/**
 * Initialize error tracking and sync
 */
export function initErrorTracking(): void {
  setupErrorSync();
  
  // Set up global error handler for unhandled errors
  window.addEventListener('error', (event) => {
    logError({
      type: 'unknown',
      error: {
        message: event.message,
        stack: event.error?.stack
      },
      url: event.filename
    });
  });
  
  // Set up unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logError({
      type: 'unknown',
      error: {
        message: typeof event.reason === 'string' ? event.reason : 'Unhandled Promise Rejection',
        stack: event.reason instanceof Error ? event.reason.stack : undefined
      }
    });
  });
}
