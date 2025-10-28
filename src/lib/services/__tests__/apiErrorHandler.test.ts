import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiErrorHandler } from '../apiErrorHandler';
import sentryService from '../sentryService';

// Mock Sentry service
vi.mock('../sentryService', () => ({
  default: {
    captureError: vi.fn(),
    addBreadcrumb: vi.fn()
  }
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

describe('ApiErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle network errors', () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';

      const result = apiErrorHandler.handleError(networkError);

      expect(result.userMessage).toBe('Network connection failed. Please check your internet connection and try again.');
      expect(result.shouldRetry).toBe(true);
      expect(sentryService.captureError).toHaveBeenCalledWith(networkError, {
        level: 'error',
        tags: { errorType: 'network' }
      });
    });

    it('should handle authentication errors', () => {
      const authError = new Error('Unauthorized');
      (authError as any).status = 401;

      const result = apiErrorHandler.handleError(authError);

      expect(result.userMessage).toBe('Your session has expired. Please log in again.');
      expect(result.shouldRetry).toBe(false);
      expect(result.requiresAuth).toBe(true);
    });

    it('should handle validation errors', () => {
      const validationError = new Error('Validation failed');
      (validationError as any).status = 400;
      (validationError as any).details = { field: 'email', message: 'Invalid email' };

      const result = apiErrorHandler.handleError(validationError);

      expect(result.userMessage).toBe('Please check your input and try again.');
      expect(result.shouldRetry).toBe(false);
      expect(result.validationErrors).toEqual({ field: 'email', message: 'Invalid email' });
    });

    it('should handle server errors', () => {
      const serverError = new Error('Internal Server Error');
      (serverError as any).status = 500;

      const result = apiErrorHandler.handleError(serverError);

      expect(result.userMessage).toBe('Something went wrong on our end. Please try again later.');
      expect(result.shouldRetry).toBe(true);
    });

    it('should handle rate limiting errors', () => {
      const rateLimitError = new Error('Too Many Requests');
      (rateLimitError as any).status = 429;

      const result = apiErrorHandler.handleError(rateLimitError);

      expect(result.userMessage).toBe('Too many requests. Please wait a moment before trying again.');
      expect(result.shouldRetry).toBe(true);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Unknown error');

      const result = apiErrorHandler.handleError(unknownError);

      expect(result.userMessage).toBe('An unexpected error occurred. Please try again.');
      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('shouldRetry', () => {
    it('should return true for retryable errors', () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';

      expect(apiErrorHandler.shouldRetry(networkError)).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const authError = new Error('Unauthorized');
      (authError as any).status = 401;

      expect(apiErrorHandler.shouldRetry(authError)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff delay', () => {
      const delay1 = apiErrorHandler.getRetryDelay(1);
      const delay2 = apiErrorHandler.getRetryDelay(2);
      const delay3 = apiErrorHandler.getRetryDelay(3);

      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
      expect(delay3).toBeLessThanOrEqual(30000); // Max delay
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'fetchProducts' };

      apiErrorHandler.logError(error, context);

      expect(sentryService.captureError).toHaveBeenCalledWith(error, {
        level: 'error',
        extra: context
      });
    });
  });
});