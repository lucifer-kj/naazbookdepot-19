import { errorHandler } from '../services/ErrorHandler';
import { logger } from '../services/Logger';

/**
 * Migration utility to replace console.error and console.warn statements
 * This file provides drop-in replacements for console methods
 */

// Drop-in replacements for console methods
export const console = {
  error: (message: string | Error, ...args: any[]) => {
    if (args.length > 0) {
      errorHandler.error(message instanceof Error ? message : message, {
        additionalData: { args }
      });
    } else {
      errorHandler.error(message);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      errorHandler.warn(message, {
        additionalData: { args }
      });
    } else {
      errorHandler.warn(message);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      logger.info(message, {
        additionalData: { args }
      });
    } else {
      logger.info(message);
    }
  },

  log: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      logger.info(message, {
        additionalData: { args }
      });
    } else {
      logger.info(message);
    }
  },

  debug: (message: string, ...args: any[]) => {
    if (args.length > 0) {
      logger.debug(message, {
        additionalData: { args }
      });
    } else {
      logger.debug(message);
    }
  }
};

// Specific error handlers for common patterns
export const handleApiError = (error: unknown, operation: string, context?: any) => {
  errorHandler.apiError(
    error instanceof Error ? error : new Error(String(error)),
    operation,
    {
      component: 'api',
      additionalData: context
    }
  );
};

export const handleAuthError = (error: unknown, context?: any) => {
  errorHandler.authError(
    error instanceof Error ? error : new Error(String(error)),
    {
      component: 'auth',
      additionalData: context
    }
  );
};

export const handleDatabaseError = (error: unknown, operation: string, context?: any) => {
  errorHandler.databaseError(
    error instanceof Error ? error : new Error(String(error)),
    operation,
    {
      component: 'database',
      additionalData: context
    }
  );
};

export const handleNetworkError = (error: unknown, url?: string, context?: any) => {
  errorHandler.networkError(
    error instanceof Error ? error : new Error(String(error)),
    url,
    {
      component: 'network',
      additionalData: context
    }
  );
};

export const handleValidationError = (errors: Record<string, string> | string, context?: any) => {
  errorHandler.validationError(errors, {
    component: 'validation',
    additionalData: context
  });
};

// Legacy console method replacements for gradual migration
export const logError = errorHandler.logError;
export const logWarning = errorHandler.logWarning;
export const logInfo = errorHandler.logInfo;
export const logDebug = errorHandler.logDebug;

export default {
  console,
  handleApiError,
  handleAuthError,
  handleDatabaseError,
  handleNetworkError,
  handleValidationError,
  logError,
  logWarning,
  logInfo,
  logDebug
};