import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from '../pages/ErrorPage';
import sentryService, { ErrorContext } from '../lib/services/sentryService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  errorContext?: Partial<ErrorContext>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'server' | 'forbidden' | 'timeout' | 'chunk' | 'generic';
  retryCount: number;
  errorId: string | null;
}

class ErrorHandler extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: number[] = [1000, 3000, 5000]; // Progressive retry delays

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'generic',
      retryCount: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine error type based on error message or properties
    let errorType: State['errorType'] = 'generic';
    
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      errorType = 'network';
    } else if (error.message.includes('500') || error.message.includes('Internal Server')) {
      errorType = 'server';
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorType = 'forbidden';
    } else if (error.message.includes('timeout') || error.message.includes('408')) {
      errorType = 'timeout';
    } else if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      errorType = 'chunk';
    }

    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorType,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to Sentry with enhanced context
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    const context: ErrorContext = {
      ...this.props.errorContext,
      page: window.location.pathname,
      component: 'ErrorBoundary',
      additionalData: {
        errorId: this.state.errorId,
        retryCount: this.state.retryCount,
        errorType: this.state.errorType,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt
        } : null
      }
    };

    // Log to Sentry
    sentryService.captureError(error, context);

    // Add breadcrumb for error boundary activation
    sentryService.addBreadcrumb(
      `Error boundary caught error: ${error.message}`,
      'error',
      'error',
      {
        errorType: this.state.errorType,
        errorId: this.state.errorId,
        retryCount: this.state.retryCount
      }
    );

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', context);
      console.groupEnd();
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      sentryService.captureMessage(
        `Max retry attempts reached for error: ${this.state.error?.message}`,
        'warning',
        {
          errorId: this.state.errorId,
          retryCount,
          additionalData: { maxRetries: this.maxRetries }
        }
      );
      return;
    }

    // Add breadcrumb for retry attempt
    sentryService.addBreadcrumb(
      `Retrying error recovery (attempt ${retryCount + 1}/${this.maxRetries})`,
      'user',
      'info',
      {
        errorId: this.state.errorId,
        errorType: this.state.errorType,
        retryCount: retryCount + 1
      }
    );

    // Handle chunk loading errors by reloading the page
    if (this.state.errorType === 'chunk') {
      window.location.reload();
      return;
    }

    // Progressive retry with delay
    const delay = this.retryTimeouts[retryCount] || this.retryTimeouts[this.retryTimeouts.length - 1];
    
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: 'generic',
        retryCount: retryCount + 1,
        errorId: null
      });
    }, delay);
  };

  private handleReload = () => {
    sentryService.addBreadcrumb(
      'User initiated page reload from error boundary',
      'user',
      'info',
      {
        errorId: this.state.errorId,
        errorType: this.state.errorType
      }
    );
    
    window.location.reload();
  };

  private shouldShowRetry = (): boolean => {
    const { errorType, retryCount } = this.state;
    
    // Always allow retry for chunk errors (they usually resolve with reload)
    if (errorType === 'chunk') return true;
    
    // Allow retry for network and timeout errors
    if (errorType === 'network' || errorType === 'timeout') {
      return retryCount < this.maxRetries;
    }
    
    // Allow limited retries for server errors
    if (errorType === 'server') {
      return retryCount < 2;
    }
    
    // No retry for forbidden errors
    if (errorType === 'forbidden') return false;
    
    // Default: allow one retry for generic errors
    return retryCount < 1;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error page with enhanced functionality
      return (
        <ErrorPage
          errorType={this.state.errorType}
          errorMessage={this.state.error?.message}
          errorId={this.state.errorId}
          showRetry={this.shouldShowRetry()}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          retryCount={this.state.retryCount}
          maxRetries={this.maxRetries}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler;

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const captureError = (error: Error, context?: ErrorContext) => {
    // Log to Sentry before throwing
    sentryService.captureError(error, {
      ...context,
      component: 'useErrorHandler',
      page: window.location.pathname
    });
    
    setError(error);
  };

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// Higher-order component for wrapping components with error handling
export const withErrorHandler = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  errorContext?: Partial<ErrorContext>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorHandler fallback={fallback} errorContext={errorContext}>
      <Component {...props} />
    </ErrorHandler>
  );
  
  // Preserve component name for debugging
  WrappedComponent.displayName = `withErrorHandler(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Utility function to handle async errors with Sentry integration
export const handleAsyncError = async <T,>(
  asyncFn: () => Promise<T>,
  context?: ErrorContext,
  onError?: (error: Error) => void
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    
    // Log to Sentry
    sentryService.captureError(err, {
      ...context,
      action: 'async_operation'
    });
    
    if (onError) {
      onError(err);
    }
    
    return null;
  }
};

// Enhanced network error handler with Sentry integration
export const handleNetworkError = (error: any, context?: ErrorContext) => {
  let errorMessage = '';
  let errorType = 'network';

  if (!navigator.onLine) {
    errorMessage = 'Network error: You appear to be offline. Please check your internet connection.';
  } else if (error.name === 'AbortError') {
    errorMessage = 'Network error: Request was cancelled or timed out.';
    errorType = 'timeout';
  } else if (error.status === 0) {
    errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
  } else if (error.status >= 500) {
    errorMessage = 'Server error: Our servers are experiencing issues. Please try again later.';
    errorType = 'server';
  } else if (error.status === 403) {
    errorMessage = 'Forbidden: You don\'t have permission to access this resource.';
    errorType = 'forbidden';
  } else if (error.status === 404) {
    errorMessage = 'Not found: The requested resource could not be found.';
  } else {
    errorMessage = `Network error: ${error.message || 'An unexpected error occurred'}`;
  }

  const networkError = new Error(errorMessage);
  
  // Log to Sentry with network context
  sentryService.captureError(networkError, {
    ...context,
    action: 'network_request',
    additionalData: {
      errorType,
      status: error.status,
      statusText: error.statusText,
      url: error.url || error.config?.url,
      method: error.config?.method,
      online: navigator.onLine,
      connectionType: (navigator as any).connection?.effectiveType
    }
  });

  throw networkError;
};

// Retry wrapper for network operations
export const withRetry = async <T,>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: ErrorContext
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        sentryService.captureError(lastError, {
          ...context,
          action: 'retry_failed',
          additionalData: {
            attempts: attempt,
            maxRetries
          }
        });
        throw lastError;
      }
      
      // Log retry attempt
      sentryService.addBreadcrumb(
        `Retry attempt ${attempt}/${maxRetries} failed`,
        'retry',
        'warning',
        {
          error: lastError.message,
          attempt,
          maxRetries,
          nextDelay: delay * attempt
        }
      );
      
      // Progressive delay
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};