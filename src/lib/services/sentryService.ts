import * as Sentry from '@sentry/react';

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  page?: string;
  action?: string;
  component?: string;
  additionalData?: Record<string, unknown>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

class SentryService {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;

    try {
      // Use dynamic import to avoid circular dependencies
      import('../config/env').then(({ getSentryConfig, isProduction, isDevelopment }) => {
        const config = getSentryConfig();
        
        if (!config.enabled || !config.dsn) {
          console.warn('Sentry DSN not found or disabled. Error tracking will be disabled.');
          return;
        }

        this.initializeSentry(config, isProduction(), isDevelopment());
      }).catch(() => {
        console.warn('Failed to load environment configuration. Sentry disabled.');
      });
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  private initializeSentry(config: Record<string, unknown>, isProduction: boolean, isDevelopment: boolean) {
    try {

      Sentry.init({
        dsn: config.dsn,
        integrations: [
          Sentry.browserTracingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0,
        // Environment
        environment: config.environment,
        release: config.release,
        // Debug mode in development
        debug: isDevelopment,
        // Before send hook to filter out unwanted errors
        beforeSend: (event, hint) => {
          // Filter out network errors that are not actionable
          const error = hint.originalException as Error;
          if (error?.message?.includes('NetworkError')) {
            return null;
          }
          
          // Filter out extension errors
          if (error?.stack?.includes('extension://')) {
            return null;
          }

          return event;
        },
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  captureError(error: Error, context?: ErrorContext) {
    if (!this.isInitialized) {
      console.error('Sentry not initialized. Error:', error);
      return;
    }

    Sentry.withScope((scope) => {
      if (context) {
        // Set user context
        if (context.userId || context.userEmail) {
          scope.setUser({
            id: context.userId,
            email: context.userEmail,
          });
        }

        // Set tags
        if (context.page) scope.setTag('page', context.page);
        if (context.action) scope.setTag('action', context.action);
        if (context.component) scope.setTag('component', context.component);

        // Set extra context
        if (context.additionalData) {
          Object.entries(context.additionalData).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
      }

      // Add browser and environment context
      scope.setContext('browser', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      });

      scope.setContext('page', {
        url: window.location.href,
        referrer: document.referrer,
        title: document.title,
      });

      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: ErrorContext) {
    if (!this.isInitialized) {
      console.log('Sentry not initialized. Message:', message);
      return;
    }

    Sentry.withScope((scope) => {
      scope.setLevel(level);
      
      if (context) {
        if (context.userId || context.userEmail) {
          scope.setUser({
            id: context.userId,
            email: context.userEmail,
          });
        }

        if (context.additionalData) {
          Object.entries(context.additionalData).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
      }

      Sentry.captureMessage(message);
    });
  }

  setUserContext(userId: string, userEmail?: string, additionalData?: Record<string, unknown>) {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: userId,
      email: userEmail,
      ...additionalData,
    });
  }

  clearUserContext() {
    if (!this.isInitialized) return;
    
    Sentry.setUser(null);
  }

  addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info', data?: Record<string, unknown>) {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  capturePerformanceMetric(metric: PerformanceMetric) {
    if (!this.isInitialized) return;

    this.addBreadcrumb(
      `Performance: ${metric.name} = ${metric.value}${metric.unit}`,
      'performance',
      'info',
      {
        metricName: metric.name,
        metricValue: metric.value,
        metricUnit: metric.unit,
        timestamp: metric.timestamp.toISOString(),
      }
    );
  }

  startTransaction(name: string, operation: string) {
    if (!this.isInitialized) return null;

    return Sentry.startSpan({
      name,
      op: operation,
    }, () => {});
  }

  // Wrapper for async operations with automatic error capture
  async wrapAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: ErrorContext
  ): Promise<T | null> {
    try {
      const result = await Sentry.startSpan({
        name: operationName,
        op: 'async_operation',
      }, async () => {
        return await operation();
      });
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.captureError(errorObj, {
        ...context,
        action: operationName,
      });
      
      return null;
    }
  }
}

// Create singleton instance
export const sentryService = new SentryService();

// Initialize Sentry when the service is imported
sentryService.initialize();

export default sentryService;