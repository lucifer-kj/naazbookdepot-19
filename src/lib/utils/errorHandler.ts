import { toast } from 'sonner';
import sentryService from '../services/sentryService';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToSentry?: boolean;
  fallbackMessage?: string;
  context?: Record<string, unknown>;
}

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', 0);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logToSentry = true,
    fallbackMessage = 'An unexpected error occurred',
    context = {}
  } = options;

  let errorMessage = fallbackMessage;
  let errorCode = 'UNKNOWN_ERROR';

  // Parse different error types
  if (error instanceof AppError) {
    errorMessage = error.message;
    errorCode = error.code;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    
    // Check for specific error patterns
    if (error.message.includes('fetch')) {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message.includes('supabase') || error.message.includes('database')) {
      errorCode = 'DATABASE_ERROR';
      errorMessage = 'Database connection failed. Please try again.';
    } else if (error.message.includes('auth')) {
      errorCode = 'AUTH_ERROR';
      errorMessage = 'Authentication failed. Please sign in again.';
    }
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Show user-friendly toast
  if (showToast) {
    toast.error(errorMessage);
  }

  // Log to Sentry
  if (logToSentry) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    sentryService.captureError(errorObj, {
      action: 'error_handler',
      additionalData: {
        errorCode,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });
  }

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error handled:', {
      error,
      errorMessage,
      errorCode,
      context
    });
  }
}

// Specific error handlers for common scenarios
export function handleSupabaseError(error: Error, operation: string): void {
  let message = 'Database operation failed';
  
  if (error?.message) {
    if (error.message.includes('JWT')) {
      message = 'Session expired. Please sign in again.';
    } else if (error.message.includes('network')) {
      message = 'Network connection failed. Please check your internet connection.';
    } else if (error.message.includes('permission')) {
      message = 'You do not have permission to perform this action.';
    } else {
      message = error.message;
    }
  }

  handleError(new DatabaseError(message), {
    context: { operation, originalError: error }
  });
}

export function handleNetworkError(error: Error, url?: string): void {
  handleError(new NetworkError('Network request failed'), {
    context: { url, originalError: error }
  });
}

export function handleValidationError(errors: Record<string, string>): void {
  const message = Object.values(errors)[0] || 'Validation failed';
  handleError(new ValidationError(message), {
    context: { validationErrors: errors }
  });
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason, {
    context: { type: 'unhandled_promise_rejection' }
  });
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  handleError(event.error, {
    context: { 
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }
  });
});

export default {
  handleError,
  handleSupabaseError,
  handleNetworkError,
  handleValidationError,
  AppError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  DatabaseError
};