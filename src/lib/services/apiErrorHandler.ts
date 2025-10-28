import sentryService, { ErrorContext } from './sentryService';

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  details?: any;
  endpoint?: string;
  method?: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: ApiError) => boolean;
}

export interface ApiErrorHandlerConfig {
  enableRetry: boolean;
  retryConfig: RetryConfig;
  enableLogging: boolean;
  enableUserNotification: boolean;
}

class ApiErrorHandlerService {
  private defaultConfig: ApiErrorHandlerConfig = {
    enableRetry: true,
    retryConfig: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      retryCondition: (error: ApiError) => {
        // Retry on network errors and 5xx server errors
        return !error.status || error.status >= 500 || error.status === 0;
      }
    },
    enableLogging: true,
    enableUserNotification: true
  };

  /**
   * Creates a standardized API error from various error types
   */
  createApiError(
    error: any,
    endpoint?: string,
    method?: string,
    context?: ErrorContext
  ): ApiError {
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = error as ApiError;
    } else if (typeof error === 'string') {
      apiError = new Error(error) as ApiError;
    } else {
      apiError = new Error('Unknown API error') as ApiError;
    }

    // Enhance error with API-specific information
    if (error?.response) {
      apiError.status = error.response.status;
      apiError.statusText = error.response.statusText;
      apiError.details = error.response.data;
    } else if (error?.status) {
      apiError.status = error.status;
      apiError.statusText = error.statusText;
    }

    apiError.endpoint = endpoint;
    apiError.method = method;

    // Determine error code based on status
    if (!apiError.code) {
      apiError.code = this.getErrorCode(apiError.status);
    }

    return apiError;
  }

  /**
   * Gets a standardized error code based on HTTP status
   */
  private getErrorCode(status?: number): string {
    if (!status) return 'NETWORK_ERROR';
    
    if (status >= 500) return 'SERVER_ERROR';
    if (status === 404) return 'NOT_FOUND';
    if (status === 403) return 'FORBIDDEN';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 400) return 'BAD_REQUEST';
    if (status === 429) return 'RATE_LIMITED';
    if (status >= 400) return 'CLIENT_ERROR';
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Gets a user-friendly error message
   */
  getUserFriendlyMessage(error: ApiError): string {
    const status = error.status;
    
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection.';
    }

    switch (status) {
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      case 400:
        return error.details?.message || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'The request timed out. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'Server error. Our team has been notified and is working on a fix.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      default:
        if (status && status >= 500) {
          return 'Server error. Please try again later.';
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Logs error to monitoring service
   */
  private logError(error: ApiError, context?: ErrorContext) {
    if (!this.defaultConfig.enableLogging) return;

    const errorContext: ErrorContext = {
      ...context,
      action: 'api_call',
      additionalData: {
        endpoint: error.endpoint,
        method: error.method,
        status: error.status,
        statusText: error.statusText,
        code: error.code,
        details: error.details,
        online: navigator.onLine,
        timestamp: new Date().toISOString()
      }
    };

    sentryService.captureError(error, errorContext);
  }

  /**
   * Determines if an error should be retried
   */
  private shouldRetry(error: ApiError, retryCount: number, config: RetryConfig): boolean {
    if (retryCount >= config.maxRetries) return false;
    if (config.retryCondition) return config.retryCondition(error);
    
    // Default retry logic
    const status = error.status;
    
    // Don't retry client errors (4xx) except for specific cases
    if (status && status >= 400 && status < 500) {
      return status === 408 || status === 429; // Timeout or rate limit
    }
    
    // Retry network errors and server errors
    return !status || status >= 500;
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number, config: RetryConfig): number {
    const delay = config.baseDelay * Math.pow(config.backoffFactor, retryCount);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Wraps an API call with error handling and retry logic
   */
  async handleApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint?: string,
    method?: string,
    context?: ErrorContext,
    config?: Partial<ApiErrorHandlerConfig>
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: ApiError;
    let retryCount = 0;

    while (retryCount <= finalConfig.retryConfig.maxRetries) {
      try {
        const result = await apiCall();
        
        // Log successful retry if this wasn't the first attempt
        if (retryCount > 0) {
          sentryService.addBreadcrumb(
            `API call succeeded after ${retryCount} retries`,
            'api',
            'info',
            {
              endpoint,
              method,
              retryCount
            }
          );
        }
        
        return result;
      } catch (error) {
        lastError = this.createApiError(error, endpoint, method, context);
        
        // Log the error
        this.logError(lastError, context);
        
        // Check if we should retry
        if (!finalConfig.enableRetry || !this.shouldRetry(lastError, retryCount, finalConfig.retryConfig)) {
          break;
        }
        
        retryCount++;
        
        // Add breadcrumb for retry attempt
        sentryService.addBreadcrumb(
          `API call failed, retrying (${retryCount}/${finalConfig.retryConfig.maxRetries})`,
          'api',
          'warning',
          {
            endpoint,
            method,
            error: lastError.message,
            status: lastError.status,
            retryCount
          }
        );
        
        // Wait before retrying
        const delay = this.calculateRetryDelay(retryCount - 1, finalConfig.retryConfig);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All retries failed, throw the last error
    throw lastError;
  }

  /**
   * Handles Supabase-specific errors
   */
  handleSupabaseError(error: any, operation: string, context?: ErrorContext): never {
    const apiError = this.createApiError(error, `supabase/${operation}`, 'POST', context);
    
    // Enhance with Supabase-specific error information
    if (error?.code) {
      apiError.code = error.code;
    }
    
    if (error?.details) {
      apiError.details = error.details;
    }

    // Log Supabase error
    this.logError(apiError, {
      ...context,
      action: 'supabase_operation',
      additionalData: {
        operation,
        supabaseCode: error?.code,
        supabaseDetails: error?.details,
        supabaseHint: error?.hint
      }
    });

    throw apiError;
  }

  /**
   * Creates a wrapper for fetch calls with error handling
   */
  createFetchWrapper() {
    return async <T>(
      url: string,
      options: RequestInit = {},
      context?: ErrorContext
    ): Promise<T> => {
      return this.handleApiCall(
        async () => {
          const response = await fetch(url, options);
          
          if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as ApiError;
            error.status = response.status;
            error.statusText = response.statusText;
            error.endpoint = url;
            error.method = options.method || 'GET';
            
            try {
              error.details = await response.json();
            } catch {
              // Response body is not JSON
            }
            
            throw error;
          }
          
          return response.json();
        },
        url,
        options.method || 'GET',
        context
      );
    };
  }
}

// Create singleton instance
export const apiErrorHandler = new ApiErrorHandlerService();

// Export convenience functions
export const handleApiCall = apiErrorHandler.handleApiCall.bind(apiErrorHandler);
export const handleSupabaseError = apiErrorHandler.handleSupabaseError.bind(apiErrorHandler);
export const createFetchWrapper = apiErrorHandler.createFetchWrapper.bind(apiErrorHandler);

export default apiErrorHandler;