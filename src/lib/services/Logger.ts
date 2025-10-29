import { ErrorHandler, LogLevel, LogContext } from './ErrorHandler';
import sentryService from './sentryService';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  component?: string;
  action?: string;
}

export interface LoggerConfig {
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  enableLocalStorage: boolean;
  maxLocalStorageEntries: number;
  logLevel: LogLevel;
}

/**
 * Structured logging system for development vs production environments
 * Provides centralized logging with different outputs based on environment
 */
export class Logger {
  private errorHandler: ErrorHandler;
  private config: LoggerConfig;
  private localStorageKey = 'app_logs';

  constructor(errorHandler: ErrorHandler) {
    this.errorHandler = errorHandler;
    this.config = {
      enableConsoleOutput: import.meta.env.DEV,
      enableRemoteLogging: import.meta.env.PROD,
      enableLocalStorage: import.meta.env.DEV,
      maxLocalStorageEntries: 1000,
      logLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN
    };
  }

  /**
   * Updates logger configuration
   */
  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Creates a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Partial<LogContext>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      component: context?.component,
      action: context?.action
    };
  }

  /**
   * Stores log entry in localStorage (development only)
   */
  private storeLogEntry(entry: LogEntry): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const existingLogs = this.getStoredLogs();
      const updatedLogs = [entry, ...existingLogs].slice(0, this.config.maxLocalStorageEntries);
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(updatedLogs));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Gets stored logs from localStorage
   */
  getStoredLogs(): LogEntry[] {
    if (!this.config.enableLocalStorage) return [];

    try {
      const logs = localStorage.getItem(this.localStorageKey);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clears stored logs
   */
  clearStoredLogs(): void {
    if (!this.config.enableLocalStorage) return;

    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Exports logs as JSON for debugging
   */
  exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Logs debug messages (development only)
   */
  debug(message: string, context?: Partial<LogContext>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    
    this.storeLogEntry(entry);
    this.errorHandler.debug(message, context);
  }

  /**
   * Logs informational messages
   */
  info(message: string, context?: Partial<LogContext>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    
    this.storeLogEntry(entry);
    this.errorHandler.info(message, context);
  }

  /**
   * Logs warning messages
   */
  warn(message: string, context?: Partial<LogContext>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    
    this.storeLogEntry(entry);
    this.errorHandler.warn(message, context);
  }

  /**
   * Logs error messages
   */
  error(error: Error | string, context?: Partial<LogContext>): void {
    const message = error instanceof Error ? error.message : error;
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    
    this.storeLogEntry(entry);
    this.errorHandler.error(error, context);
  }

  /**
   * Logs API operations with timing
   */
  apiCall(
    operation: string,
    method: string,
    endpoint: string,
    duration?: number,
    success: boolean = true,
    context?: Partial<LogContext>
  ): void {
    const message = `API ${method} ${endpoint} ${success ? 'succeeded' : 'failed'}${
      duration ? ` in ${duration.toFixed(2)}ms` : ''
    }`;

    const logContext = {
      ...context,
      component: 'api',
      action: operation,
      additionalData: {
        ...context?.additionalData,
        method,
        endpoint,
        duration,
        success
      }
    };

    if (success) {
      this.info(message, logContext);
    } else {
      this.error(message, logContext);
    }
  }

  /**
   * Logs user actions for analytics
   */
  userAction(
    action: string,
    component: string,
    details?: Record<string, unknown>,
    context?: Partial<LogContext>
  ): void {
    const message = `User action: ${action} in ${component}`;
    
    const logContext = {
      ...context,
      component,
      action,
      additionalData: {
        ...context?.additionalData,
        userAction: action,
        details
      }
    };

    this.info(message, logContext);

    // Send to analytics in production
    if (this.config.enableRemoteLogging) {
      sentryService.addBreadcrumb(message, component, 'info', details);
    }
  }

  /**
   * Logs performance metrics
   */
  performance(
    operation: string,
    duration: number,
    component?: string,
    context?: Partial<LogContext>
  ): void {
    const message = `Performance: ${operation} took ${duration.toFixed(2)}ms`;
    
    const logContext = {
      ...context,
      component: component || 'performance',
      action: operation,
      additionalData: {
        ...context?.additionalData,
        operation,
        duration
      }
    };

    // Only log slow operations in production
    if (import.meta.env.PROD && duration < 1000) {
      return;
    }

    this.info(message, logContext);
  }

  /**
   * Creates a performance timer
   */
  startTimer(operation: string, component?: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.performance(operation, duration, component);
    };
  }

  /**
   * Logs component lifecycle events (development only)
   */
  componentLifecycle(
    component: string,
    event: 'mount' | 'unmount' | 'update' | 'error',
    details?: Record<string, unknown>
  ): void {
    if (!import.meta.env.DEV) return;

    const message = `Component ${component} ${event}`;
    
    this.debug(message, {
      component,
      action: event,
      additionalData: details
    });
  }

  /**
   * Logs navigation events
   */
  navigation(from: string, to: string, context?: Partial<LogContext>): void {
    const message = `Navigation: ${from} → ${to}`;
    
    this.info(message, {
      ...context,
      component: 'router',
      action: 'navigate',
      additionalData: {
        ...context?.additionalData,
        from,
        to
      }
    });
  }

  /**
   * Gets log statistics for debugging
   */
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byComponent: Record<string, number>;
    recent: LogEntry[];
  } {
    const logs = this.getStoredLogs();
    
    const byLevel = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    const byComponent = logs.reduce((acc, log) => {
      const component = log.component || 'unknown';
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: logs.length,
      byLevel,
      byComponent,
      recent: logs.slice(0, 10)
    };
  }
}

// Create singleton instance
export const logger = new Logger(new ErrorHandler());

// Export convenience functions
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logApiCall = logger.apiCall.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const startTimer = logger.startTimer.bind(logger);

export default logger;
