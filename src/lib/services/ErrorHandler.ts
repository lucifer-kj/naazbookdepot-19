import { toast } from 'sonner';
import sentryService, { ErrorContext } from './sentryService';
import { apiErrorHandler } from './apiErrorHandler';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext extends ErrorContext {
  level?: LogLevel;
  timestamp?: string;
  userAgent?: string;
  url?: string;
}

export interface ErrorHandlerConfig {
  enableConsoleLogging: boolean;
  enableSentryLogging: boolean;
  enableUserNotifications: boolean;
  logLevel: LogLevel;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Centralized error handling service to replace console.error statements
 * Provides structured logging for development vs production environments
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor() {
    this.config = {
      enableConsoleLogging: import.meta.env.DEV,
      enableSentryLogging: import.meta.env.PROD,
      enableUserNotifications: true,
      logLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.ERROR,
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD
    };
  }

  /**
   * Updates the error handler configuration
   */
  configure(config: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Creates a standardized log context
   */
  private createLogContext(context?: Partial<LogContext>): LogContext {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };
  }

  /**
   * Determines if a log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Formats console output for development
   */
  private formatConsoleOutput(level: LogLevel, message: string, data?: any): void {
    if (!this.config.enableConsoleLogging || !this.shouldLog(level)) return;

    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data);
        break;
    }
  }

  /**
   * Logs debug messages (development only)
   */
  debug(message: string, context?: Partial<LogContext>): void {
    if (!this.config.isDevelopment) return;

    const logContext = this.createLogContext({ ...context, level: LogLevel.DEBUG });
    
    this.formatConsoleOutput(LogLevel.DEBUG, message, logContext);
    
    if (this.config.enableSentryLogging) {
      sentryService.addBreadcrumb(message, 'debug', 'debug', logContext.additionalData);
    }
  }

  /**
   * Logs informational messages
   */
  info(message: string, context?: Partial<LogContext>): void {
    const logContext = this.createLogContext({ ...context, level: LogLevel.INFO });
    
    this.formatConsoleOutput(LogLevel.INFO, message, logContext);
    
    if (this.config.enableSentryLogging) {
      sentryService.addBreadcrumb(message, logContext.component || 'app', 'info', logContext.additionalData);
    }
  }

  /**
   * Logs warning messages
   */
  warn(message: string, context?: Partial<LogContext>): void {
    const logContext = this.createLogContext({ ...context, level: LogLevel.WARN });
    
    this.formatConsoleOutput(LogLevel.WARN, message, logContext);
    
    if (this.config.enableSentryLogging) {
      sentryService.addBreadcrumb(message, logContext.component || 'app', 'warning', logContext.additionalData);
    }

    // Show user notification for warnings in production
    if (this.config.isProduction && this.config.enableUserNotifications) {
      toast.warning(message);
    }
  }

  /**
   * Logs error messages and handles error objects
   */
  error(error: Error | string, context?: Partial<LogContext>): void {
    const logContext = this.createLogContext({ ...context, level: LogLevel.ERROR });
    
    let errorMessage: string;
    let errorObject: Error;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorObject = error;
    } else {
      errorMessage = error;
      errorObject = new Error(error);
    }

    this.formatConsoleOutput(LogLevel.ERROR, errorMessage, {
      ...logContext,
      stack: errorObject.stack,
      name: errorObject.name
    });

    // Log to Sentry
    if (this.config.enableSentryLogging) {
      sentryService.captureError(errorObject, logContext);
    }

    // Show user notification
    if (this.config.enableUserNotifications) {
      const userMessage = this.getUserFriendlyMessage(errorObject);
      toast.error(userMessage);
    }
  }

  /**
   * Handles API-specific errors
   */
  apiError(error: Error | string, operation: string, context?: Partial<LogContext>): void {
    const enhancedContext = {
      ...context,
      component: 'api',
      action: operation,
      additionalData: {
        ...context?.additionalData,
        operation,
        online: navigator.onLine
      }
    };

    this.error(error, enhancedContext);
  }

  /**
   * Handles authentication errors
   */
  authError(error: Error | string, context?: Partial<LogContext>): void {
    const enhancedContext = {
      ...context,
      component: 'auth',
      additionalData: {
        ...context?.additionalData,
        sessionExists: !!localStorage.getItem('supabase.auth.token')
      }
    };

    this.error(error, enhancedContext);
  }

  /**
   * Handles database/Supabase errors
   */
  databaseError(error: Error | string, operation: string, context?: Partial<LogContext>): void {
    const enhancedContext = {
      ...context,
      component: 'database',
      action: operation,
      additionalData: {
        ...context?.additionalData,
        operation
      }
    };

    this.error(error, enhancedContext);
  }

  /**
   * Handles network/fetch errors
   */
  networkError(error: Error | string, url?: string, context?: Partial<LogContext>): void {
    const enhancedContext = {
      ...context,
      component: 'network',
      additionalData: {
        ...context?.additionalData,
        url,
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType
      }
    };

    this.error(error, enhancedContext);
  }

  /**
   * Handles validation errors
   */
  validationError(errors: Record<string, string> | string, context?: Partial<LogContext>): void {
    const errorMessage = typeof errors === 'string' 
      ? errors 
      : Object.values(errors).join(', ');

    const enhancedContext = {
      ...context,
      component: 'validation',
      additionalData: {
        ...context?.additionalData,
        validationErrors: errors
      }
    };

    this.error(errorMessage, enhancedContext);
  }

  /**
   * Gets user-friendly error messages
   */
  private getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection failed. Please check your internet connection.';
    }

    if (message.includes('auth') || message.includes('jwt') || message.includes('token')) {
      return 'Your session has expired. Please sign in again.';
    }

    if (message.includes('permission') || message.includes('forbidden')) {
      return 'You do not have permission to perform this action.';
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'The requested resource was not found.';
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return 'Please check your input and try again.';
    }

    if (message.includes('server') || message.includes('500')) {
      return 'Server error. Our team has been notified.';
    }

    // Return original message if no pattern matches, but sanitize it
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Creates a performance timer for measuring operation duration
   */
  createTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.info(`Operation completed: ${operation}`, {
        component: 'performance',
        additionalData: {
          operation,
          duration: `${duration.toFixed(2)}ms`
        }
      });
    };
  }

  /**
   * Logs performance metrics
   */
  performance(operation: string, duration: number, context?: Partial<LogContext>): void {
    this.info(`Performance: ${operation} took ${duration.toFixed(2)}ms`, {
      ...context,
      component: 'performance',
      additionalData: {
        ...context?.additionalData,
        operation,
        duration
      }
    });
  }

  /**
   * Replacement for console.error - use this instead of console.error
   */
  logError = this.error.bind(this);

  /**
   * Replacement for console.warn - use this instead of console.warn
   */
  logWarning = this.warn.bind(this);

  /**
   * Replacement for console.log - use this instead of console.log
   */
  logInfo = this.info.bind(this);

  /**
   * Replacement for console.debug - use this instead of console.debug
   */
  logDebug = this.debug.bind(this);
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export convenience functions for easy migration from console methods
export const logError = errorHandler.logError;
export const logWarning = errorHandler.logWarning;
export const logInfo = errorHandler.logInfo;
export const logDebug = errorHandler.logDebug;

export default errorHandler;