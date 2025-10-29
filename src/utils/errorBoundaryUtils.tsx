import React, { ReactNode, ErrorInfo } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { errorHandler } from '../lib/services/ErrorHandler';

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for handling errors in functional components
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: Record<string, unknown>) => {
    errorHandler.error(error, {
      component: 'useErrorHandler',
      additionalData: context
    });
  }, []);

  return { handleError };
}
