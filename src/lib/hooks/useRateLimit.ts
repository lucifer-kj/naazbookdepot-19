import { useState, useCallback, useRef, useEffect } from 'react';
import { RateLimitMiddleware, rateLimitMiddlewares, getClientIP, getCurrentUserId } from '../middleware/rateLimitMiddleware';
import { RateLimitConfig } from '../services/rateLimitService';
import { useAuth } from './useAuth';

interface RateLimitOptions {
  maxAttempts?: number;
  timeWindow?: number; // in milliseconds
  blockDuration?: number; // in milliseconds
}

interface UseRateLimitResult {
  isRateLimited: boolean;
  attempts: number;
  remaining: number;
  resetTime: Date | null;
  retryAfter: number | null;
  checkRateLimit: () => Promise<boolean>;
  resetRateLimit: () => void;
  executeWithRateLimit: <T>(fn: () => Promise<T>) => Promise<T>;
}

interface UseAdvancedRateLimitOptions {
  config: RateLimitConfig;
  action: string;
  skipCondition?: () => boolean;
}

/**
 * Legacy rate limit hook for backward compatibility
 */
export function useRateLimit({
  maxAttempts = 5,
  timeWindow = 60000, // 1 minute
  blockDuration = 300000, // 5 minutes
}: RateLimitOptions = {}) {
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const attemptsTimestamps = useRef<number[]>([]);
  const blockTimeout = useRef<NodeJS.Timeout>();

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    attemptsTimestamps.current = [];
  }, []);

  const checkRateLimit = useCallback(() => {
    if (isBlocked) {
      return false;
    }

    const now = Date.now();
    const windowStart = now - timeWindow;

    // Remove old attempts
    attemptsTimestamps.current = attemptsTimestamps.current.filter(
      (timestamp) => timestamp > windowStart
    );

    // Add new attempt
    attemptsTimestamps.current.push(now);
    setAttempts(attemptsTimestamps.current.length);

    // Check if rate limit is exceeded
    if (attemptsTimestamps.current.length > maxAttempts) {
      setIsBlocked(true);
      blockTimeout.current = setTimeout(() => {
        setIsBlocked(false);
        resetAttempts();
      }, blockDuration);
      return false;
    }

    return true;
  }, [isBlocked, maxAttempts, timeWindow, blockDuration, resetAttempts]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (blockTimeout.current) {
      clearTimeout(blockTimeout.current);
    }
    resetAttempts();
    setIsBlocked(false);
  }, [resetAttempts]);

  return {
    isRateLimited: isBlocked,
    attempts,
    checkRateLimit,
    resetRateLimit: cleanup,
  };
}

/**
 * Advanced rate limit hook with server-side integration
 */
export function useAdvancedRateLimit({
  config,
  action,
  skipCondition
}: UseAdvancedRateLimitOptions): UseRateLimitResult {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [remaining, setRemaining] = useState(config.maxRequests);
  const [resetTime, setResetTime] = useState<Date | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const getUserId = useCallback(() => user?.id, [user?.id]);
  const getIP = useCallback(() => getClientIP(), []);

  const middlewareOptions = {
    config,
    getUserId,
    getClientIP: getIP,
    skipCondition,
    onLimitExceeded: (result: unknown) => {
      setIsRateLimited(true);
      setRetryAfter(result.retryAfter || null);
    }
  };

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RateLimitMiddleware.checkRateLimit(action, middlewareOptions);
      
      setIsRateLimited(!result.allowed);
      setRemaining(result.remaining);
      setResetTime(result.resetTime);
      setRetryAfter(result.retryAfter || null);
      
      if (!result.allowed) {
        setAttempts(config.maxRequests);
      }

      return result.allowed;
    } catch (error) {
      // Allow on error
      return true;
    }
  }, [action, middlewareOptions, config.maxRequests]);

  const resetRateLimit = useCallback(() => {
    RateLimitMiddleware.resetRateLimit(middlewareOptions);
    setIsRateLimited(false);
    setAttempts(0);
    setRemaining(config.maxRequests);
    setResetTime(null);
    setRetryAfter(null);
  }, [middlewareOptions, config.maxRequests]);

  const executeWithRateLimit = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    const allowed = await checkRateLimit();
    
    if (!allowed) {
      throw new Error(`Rate limit exceeded for ${action}. Please try again in ${retryAfter} seconds.`);
    }

    let success = false;
    try {
      const result = await fn();
      success = true;
      
      // Record successful request
      await RateLimitMiddleware.recordRequest(action, success, middlewareOptions);
      
      return result;
    } catch (error) {
      // Record failed request
      await RateLimitMiddleware.recordRequest(action, success, middlewareOptions);
      throw error;
    }
  }, [checkRateLimit, action, retryAfter, middlewareOptions]);

  // Update status periodically if rate limited
  useEffect(() => {
    if (!isRateLimited) return;

    const interval = setInterval(async () => {
      const status = RateLimitMiddleware.getRateLimitStatus(middlewareOptions);
      if (status) {
        setIsRateLimited(!status.allowed);
        setRemaining(status.remaining);
        setResetTime(status.resetTime);
        setRetryAfter(status.retryAfter || null);
      } else {
        // Status expired, reset
        resetRateLimit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, middlewareOptions, resetRateLimit]);

  return {
    isRateLimited,
    attempts,
    remaining,
    resetTime,
    retryAfter,
    checkRateLimit,
    resetRateLimit,
    executeWithRateLimit
  };
}

/**
 * Pre-configured rate limit hooks for common actions
 */
export const useAuthRateLimit = (action: 'signIn' | 'signUp' | 'passwordReset') => {
  const { user } = useAuth();
  
  const config = action === 'passwordReset' 
    ? rateLimitMiddlewares.auth.passwordReset(() => user?.id, getClientIP)
    : rateLimitMiddlewares.auth[action](() => user?.id, getClientIP);

  return useAdvancedRateLimit({
    config: config.config,
    action: `auth/${action}`,
    skipCondition: config.skipCondition
  });
};

export const useApiRateLimit = (action: 'general' | 'search' | 'uploads') => {
  const { user } = useAuth();
  
  const config = rateLimitMiddlewares.api[action](() => user?.id, getClientIP);

  return useAdvancedRateLimit({
    config: config.config,
    action: `api/${action}`,
    skipCondition: config.skipCondition
  });
};

export const useFormRateLimit = (action: 'contact' | 'newsletter' | 'review') => {
  const { user } = useAuth();
  
  const config = rateLimitMiddlewares.forms[action](() => user?.id, getClientIP);

  return useAdvancedRateLimit({
    config: config.config,
    action: `forms/${action}`,
    skipCondition: config.skipCondition
  });
};
