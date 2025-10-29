import { rateLimitService, RateLimitConfig, rateLimitConfigs } from '../services/rateLimitService';
import sentryService from '../services/sentryService';

export interface RateLimitMiddlewareOptions {
  config: RateLimitConfig;
  getUserId?: () => string | undefined;
  getClientIP?: () => string | undefined;
  onLimitExceeded?: (result: any) => void;
  skipCondition?: () => boolean;
}

export interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
  message?: string;
}

/**
 * Rate limiting middleware for client-side API calls
 */
export class RateLimitMiddleware {
  /**
   * Check rate limit before making an API call
   */
  static async checkRateLimit(
    action: string,
    options: RateLimitMiddlewareOptions
  ): Promise<RateLimitResponse> {
    try {
      // Skip rate limiting if condition is met
      if (options.skipCondition && options.skipCondition()) {
        return {
          allowed: true,
          remaining: options.config.maxRequests,
          resetTime: new Date(Date.now() + options.config.windowMs)
        };
      }

      const userId = options.getUserId?.();
      const clientIP = options.getClientIP?.();

      const result = await rateLimitService.checkRateLimit(
        options.config,
        userId,
        clientIP
      );

      if (!result.allowed) {
        const message = `Rate limit exceeded for ${action}. Please try again in ${result.retryAfter} seconds.`;
        
        // Call custom handler if provided
        if (options.onLimitExceeded) {
          options.onLimitExceeded(result);
        }

        // Log rate limit violation
        sentryService.addBreadcrumb(
          `Rate limit exceeded for action: ${action}`,
          'security',
          'warning',
          { action, userId, clientIP, result }
        );

        return {
          ...result,
          message
        };
      }

      return result;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Rate limit check failed'),
        {
          action: 'rate_limit_middleware',
          additionalData: { action, options }
        }
      );

      // Allow request on error
      return {
        allowed: true,
        remaining: options.config.maxRequests,
        resetTime: new Date(Date.now() + options.config.windowMs)
      };
    }
  }

  /**
   * Record the result of an API call for rate limiting purposes
   */
  static async recordRequest(
    action: string,
    success: boolean,
    options: RateLimitMiddlewareOptions
  ): Promise<void> {
    try {
      const userId = options.getUserId?.();
      const clientIP = options.getClientIP?.();

      await rateLimitService.recordRequest(
        options.config,
        success,
        userId,
        clientIP
      );
    } catch (error) {
      // Don't throw errors for recording failures
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to record rate limit request'),
        {
          action: 'record_rate_limit_request',
          additionalData: { action, success, options }
        }
      );
    }
  }

  /**
   * Create a rate-limited wrapper for API functions
   */
  static createRateLimitedWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    action: string,
    options: RateLimitMiddlewareOptions
  ): T {
    return (async (...args: Parameters<T>) => {
      // Check rate limit before executing
      const rateLimitResult = await this.checkRateLimit(action, options);
      
      if (!rateLimitResult.allowed) {
        throw new Error(rateLimitResult.message || 'Rate limit exceeded');
      }

      let success = false;
      try {
        const result = await fn(...args);
        success = true;
        
        // Record successful request
        await this.recordRequest(action, success, options);
        
        return result;
      } catch (error) {
        // Record failed request
        await this.recordRequest(action, success, options);
        throw error;
      }
    }) as T;
  }

  /**
   * Get current rate limit status
   */
  static getRateLimitStatus(
    options: RateLimitMiddlewareOptions
  ): any {
    const userId = options.getUserId?.();
    const clientIP = options.getClientIP?.();

    return rateLimitService.getRateLimitStatus(
      options.config,
      userId,
      clientIP
    );
  }

  /**
   * Reset rate limit for current user/IP
   */
  static resetRateLimit(options: RateLimitMiddlewareOptions): void {
    const userId = options.getUserId?.();
    const clientIP = options.getClientIP?.();

    rateLimitService.resetRateLimit(userId, clientIP, options.config.keyGenerator);
  }
}

/**
 * Pre-configured rate limit middleware for common actions
 */
export const rateLimitMiddlewares = {
  auth: {
    signIn: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.auth,
      getUserId,
      getClientIP,
      onLimitExceeded: (result: any) => {
        sentryService.addBreadcrumb(
          'Authentication rate limit exceeded',
          'security',
          'warning',
          { result }
        );
      }
    }),

    signUp: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.auth,
      getUserId,
      getClientIP,
      onLimitExceeded: (result: any) => {
        sentryService.addBreadcrumb(
          'Sign up rate limit exceeded',
          'security',
          'warning',
          { result }
        );
      }
    }),

    passwordReset: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.passwordReset,
      getUserId,
      getClientIP,
      onLimitExceeded: (result: any) => {
        sentryService.addBreadcrumb(
          'Password reset rate limit exceeded',
          'security',
          'warning',
          { result }
        );
      }
    })
  },

  api: {
    general: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.api,
      getUserId,
      getClientIP
    }),

    search: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.search,
      getUserId,
      getClientIP
    }),

    uploads: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.uploads,
      getUserId,
      getClientIP,
      onLimitExceeded: (result: any) => {
        sentryService.addBreadcrumb(
          'File upload rate limit exceeded',
          'security',
          'warning',
          { result }
        );
      }
    })
  },

  forms: {
    contact: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.forms,
      getUserId,
      getClientIP
    }),

    newsletter: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.forms,
      getUserId,
      getClientIP
    }),

    review: (getUserId?: () => string, getClientIP?: () => string) => ({
      config: rateLimitConfigs.forms,
      getUserId,
      getClientIP
    })
  }
};

/**
 * Utility function to get client IP (browser environment)
 */
export const getClientIP = (): string | undefined => {
  // In a browser environment, we can't directly get the client IP
  // This would typically be handled by the server
  // For client-side rate limiting, we'll use a fallback identifier
  try {
    // Use a combination of user agent and screen resolution as a fingerprint
    const userAgent = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Create a simple hash of these values
    const fingerprint = btoa(`${userAgent}-${screen}-${timezone}`).slice(0, 16);
    return `client:${fingerprint}`;
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Utility function to get current user ID
 */
export const getCurrentUserId = (): string | undefined => {
  try {
    // This would typically come from your auth context
    // For now, we'll check localStorage for user session
    const session = localStorage.getItem('supabase.auth.token');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed?.user?.id;
    }
  } catch (error) {
    // Ignore errors
  }
  return undefined;
};

export default RateLimitMiddleware;