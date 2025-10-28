import React from 'react';
import ErrorHandler from './ErrorHandler';
import sentryService from '../lib/services/sentryService';

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
  React.useEffect(() => {
    // Set up global error handlers
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      sentryService.captureError(error, {
        action: 'unhandled_promise_rejection',
        page: window.location.pathname,
        additionalData: {
          type: 'unhandledrejection',
          reason: event.reason
        }
      });

      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      
      sentryService.captureError(error, {
        action: 'global_error',
        page: window.location.pathname,
        additionalData: {
          type: 'error',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message
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