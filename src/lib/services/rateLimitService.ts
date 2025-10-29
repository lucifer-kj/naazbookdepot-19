import { supabase } from '../supabase';
import sentryService from './sentryService';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (userId?: string, ip?: string) => string; // Custom key generation
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number; // Seconds to wait before retry
}

export interface RateLimitEntry {
  key: string;
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

class RateLimitService {
  private cache = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request is allowed based on rate limiting rules
   */
  async checkRateLimit(
    config: RateLimitConfig,
    userId?: string,
    ip?: string
  ): Promise<RateLimitResult> {
    try {
      const key = config.keyGenerator 
        ? config.keyGenerator(userId, ip)
        : this.generateKey(userId, ip);

      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      let entry = this.cache.get(key);

      // Check if currently blocked
      if (entry?.blockedUntil && now < entry.blockedUntil) {
        const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(entry.blockedUntil),
          retryAfter
        };
      }

      // Initialize or reset entry if window has passed
      if (!entry || entry.windowStart < windowStart) {
        entry = {
          key,
          count: 0,
          windowStart: now
        };
      }

      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        const blockUntil = now + (config.blockDurationMs || config.windowMs);
        entry.blockedUntil = blockUntil;
        this.cache.set(key, entry);

        // Log rate limit violation
        await this.logRateLimitViolation(key, config, userId, ip);

        const retryAfter = Math.ceil((blockUntil - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetTime: new Date(blockUntil),
          retryAfter
        };
      }

      // Increment counter
      entry.count++;
      this.cache.set(key, entry);

      const remaining = Math.max(0, config.maxRequests - entry.count);
      const resetTime = new Date(entry.windowStart + config.windowMs);

      return {
        allowed: true,
        remaining,
        resetTime
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Rate limit check failed'),
        {
          action: 'rate_limit_check',
          additionalData: { config, userId, ip }
        }
      );

      // Allow request on error to avoid blocking legitimate users
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: new Date(Date.now() + config.windowMs)
      };
    }
  }

  /**
   * Record a request attempt (for tracking purposes)
   */
  async recordRequest(
    config: RateLimitConfig,
    success: boolean,
    userId?: string,
    ip?: string
  ): Promise<void> {
    try {
      // Skip recording based on config
      if (success && config.skipSuccessfulRequests) return;
      if (!success && config.skipFailedRequests) return;

      const key = config.keyGenerator 
        ? config.keyGenerator(userId, ip)
        : this.generateKey(userId, ip);

      // Store request record in Supabase for analytics
      await supabase.from('rate_limit_logs').insert({
        key,
        user_id: userId,
        ip_address: ip,
        success,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Don't throw errors for logging failures
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to record rate limit request'),
        {
          action: 'record_rate_limit_request',
          additionalData: { config, success, userId, ip }
        }
      );
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  resetRateLimit(userId?: string, ip?: string, keyGenerator?: (userId?: string, ip?: string) => string): void {
    const key = keyGenerator 
      ? keyGenerator(userId, ip)
      : this.generateKey(userId, ip);
    
    this.cache.delete(key);
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(
    config: RateLimitConfig,
    userId?: string,
    ip?: string
  ): RateLimitResult | null {
    const key = config.keyGenerator 
      ? config.keyGenerator(userId, ip)
      : this.generateKey(userId, ip);

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Check if window has expired
    if (entry.windowStart < windowStart) {
      return null;
    }

    // Check if blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(entry.blockedUntil),
        retryAfter
      };
    }

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = new Date(entry.windowStart + config.windowMs);

    return {
      allowed: entry.count < config.maxRequests,
      remaining,
      resetTime
    };
  }

  /**
   * Generate a unique key for rate limiting
   */
  private generateKey(userId?: string, ip?: string): string {
    if (userId) {
      return `user:${userId}`;
    }
    if (ip) {
      return `ip:${ip}`;
    }
    return 'anonymous';
  }

  /**
   * Log rate limit violations for monitoring
   */
  private async logRateLimitViolation(
    key: string,
    config: RateLimitConfig,
    userId?: string,
    ip?: string
  ): Promise<void> {
    try {
      await supabase.from('rate_limit_violations').insert({
        key,
        user_id: userId,
        ip_address: ip,
        window_ms: config.windowMs,
        max_requests: config.maxRequests,
        timestamp: new Date().toISOString()
      });

      sentryService.addBreadcrumb(
        'Rate limit violation detected',
        'security',
        'warning',
        { key, userId, ip, config }
      );
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to log rate limit violation'),
        {
          action: 'log_rate_limit_violation',
          additionalData: { key, config, userId, ip }
        }
      );
    }
  }

  /**
   * Clean up expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      // Remove entries that are older than their window and not blocked
      const isExpired = entry.windowStart < (now - 60 * 60 * 1000); // 1 hour old
      const isNotBlocked = !entry.blockedUntil || now >= entry.blockedUntil;
      
      if (isExpired && isNotBlocked) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      sentryService.addBreadcrumb(
        `Cleaned up ${expiredKeys.length} expired rate limit entries`,
        'system',
        'info'
      );
    }
  }

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Pre-configured rate limit configurations
export const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
    skipSuccessfulRequests: true
  },

  // API endpoints - moderate limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    blockDurationMs: 5 * 60 * 1000 // Block for 5 minutes
  },

  // Form submissions - strict limits
  forms: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 submissions per minute
    blockDurationMs: 5 * 60 * 1000 // Block for 5 minutes
  },

  // Search queries - lenient limits
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    blockDurationMs: 2 * 60 * 1000 // Block for 2 minutes
  },

  // File uploads - very strict limits
  uploads: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    blockDurationMs: 60 * 60 * 1000 // Block for 1 hour
  },

  // Password reset - very strict limits
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 attempts per hour
    blockDurationMs: 2 * 60 * 60 * 1000 // Block for 2 hours
  }
} as const;

// Create singleton instance
export const rateLimitService = new RateLimitService();

export default rateLimitService;
