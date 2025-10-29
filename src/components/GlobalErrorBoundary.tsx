import React from 'react';
import ErrorHandler from '@/components/ErrorHandler';
import { errorHandler } from '../lib/services/ErrorHandler';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
  React.useEffect(() => {
    // Set up global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      // Use our centralized error handler instead of direct Sentry calls
      errorHandler.error(error, {
        component: 'GlobalErrorBoundary',
        action: 'unhandled_promise_rejection',
        additionalData: {
          type: 'unhandledrejection',
          reason: event.reason,
          page: window.location.pathname
        }
      });

      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      
      // Use our centralized error handler instead of direct Sentry calls
      errorHandler.error(error, {
        component: 'GlobalErrorBoundary',
        action: 'global_error',
        additionalData: {
          type: 'error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message,
          page: window.location.pathname
        }
      });
    };

    // Add global error listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorHandler
      errorContext={{
        component: 'GlobalErrorBoundary',
        page: window.location.pathname
      }}
    >
      {children}
    </ErrorHandler>
  );
};

export default GlobalErrorBoundary;
