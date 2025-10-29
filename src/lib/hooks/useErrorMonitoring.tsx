import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { errorMonitoring, trackError, trackInteraction, addBreadcrumb } from '../services/ErrorMonitoring';

/**
 * React hook for error monitoring integration
 * Provides easy access to error tracking functionality
 */
export function useErrorMonitoring() {
  const location = useLocation();

  // Track page views automatically
  useEffect(() => {
    errorMonitoring.trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Capture and track errors
  const captureError = useCallback((error: Error, context?: unknown) => {
    trackError(error, {
      component: 'useErrorMonitoring',
      action: 'manual_error_capture',
      additionalData: context
    });
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback((action: string, element: string, details?: unknown) => {
    trackInteraction(action, element, details);
  }, []);

  // Add breadcrumb for debugging
  const addDebugBreadcrumb = useCallback((message: string, category: string = 'debug', data?: unknown) => {
    addBreadcrumb(message, category, 'info', data);
  }, []);

  // Track component lifecycle
  const trackComponentLifecycle = useCallback((componentName: string, event: 'mount' | 'unmount' | 'update') => {
    addBreadcrumb(`Component ${componentName} ${event}`, 'component', 'debug', {
      component: componentName,
      event,
      path: location.pathname
    });
  }, [location.pathname]);

  // Track API calls
  const trackApiCall = useCallback((endpoint: string, method: string, success: boolean, duration?: number) => {
    addBreadcrumb(`API ${method} ${endpoint} ${success ? 'success' : 'failed'}`, 'api', success ? 'info' : 'error', {
      endpoint,
      method,
      success,
      duration
    });
  }, []);

  // Track form submissions
  const trackFormSubmission = useCallback((formName: string, success: boolean, errors?: unknown) => {
    addBreadcrumb(`Form ${formName} ${success ? 'submitted' : 'failed'}`, 'form', success ? 'info' : 'error', {
      formName,
      success,
      errors
    });
  }, []);

  return {
    captureError,
    trackUserInteraction,
    addDebugBreadcrumb,
    trackComponentLifecycle,
    trackApiCall,
    trackFormSubmission,
    getStats: errorMonitoring.getStats.bind(errorMonitoring),
    exportData: errorMonitoring.exportData.bind(errorMonitoring)
  };
}

/**
 * Higher-order component for automatic error monitoring
 */
export function withErrorMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { trackComponentLifecycle, captureError } = useErrorMonitoring();
    const name = componentName || Component.displayName || Component.name || 'UnknownComponent';

    useEffect(() => {
      trackComponentLifecycle(name, 'mount');
      return () => {
        trackComponentLifecycle(name, 'unmount');
      };
    }, [trackComponentLifecycle, name]);

    // Error boundary for the component
    useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        captureError(event.error || new Error(event.message), {
          component: name,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, [captureError, name]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withErrorMonitoring(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default useErrorMonitoring;
