import { captureException } from '@sentry/react';

export const logError = (error: Error, context?: Record<string, unknown>) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', error, context);
  }

  // Log to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    captureException(error, {
      extra: context
    });
  }
};

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
