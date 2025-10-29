import React from 'react';
import { csrfService } from '../services/csrfService';
import { sessionService } from '../services/sessionService';
import sentryService from '../services/sentryService';

export interface SecurityMiddlewareConfig {
  enableCSRF: boolean;
  enableSessionValidation: boolean;
  requireHTTPS: boolean;
  enableHSTS: boolean;
  enableCSP: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
}

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  headers: Record<string, string>;
}

class SecurityMiddleware {
  private readonly DEFAULT_CONFIG: SecurityMiddlewareConfig = {
    enableCSRF: true,
    enableSessionValidation: true,
    requireHTTPS: true,
    enableHSTS: true,
    enableCSP: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true
  };

  private config: SecurityMiddlewareConfig;

  constructor(config: Partial<SecurityMiddlewareConfig> = {}) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate security requirements for a request
   */
  async validateRequest(
    request: {
      headers?: Record<string, string>;
      method?: string;
      url?: string;
      body?: any;
    }
  ): Promise<SecurityValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const headers: Record<string, string> = {};

    try {
      // HTTPS validation
      if (this.config.requireHTTPS && this.isProductionEnvironment()) {
        if (!this.isHTTPS(request.url)) {
          errors.push('HTTPS is required in production');
        }
      }

      // CSRF validation for state-changing operations
      if (this.config.enableCSRF && this.isStateChangingRequest(request.method)) {
        const csrfResult = await this.validateCSRF(request.headers);
        if (!csrfResult.isValid) {
          errors.push(csrfResult.error || 'CSRF validation failed');
        }
      }

      // Session validation
      if (this.config.enableSessionValidation) {
        const sessionResult = await this.validateSession();
        if (!sessionResult.isValid) {
          warnings.push(sessionResult.error || 'Session validation failed');
        }
      }

      // Add security headers
      Object.assign(headers, this.getSecurityHeaders());

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        headers
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Security validation failed'),
        {
          action: 'security_middleware_validation',
          additionalData: { request, config: this.config }
        }
      );

      return {
        isValid: false,
        errors: ['Security validation failed'],
        warnings,
        headers
      };
    }
  }

  /**
   * Get security headers for responses
   */
  getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.enableHSTS && this.isProductionEnvironment()) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    if (this.config.enableCSP) {
      headers['Content-Security-Policy'] = this.getCSPHeader();
    }

    if (this.config.enableXFrameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    if (this.config.enableXContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    if (this.config.enableReferrerPolicy) {
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    }

    // Additional security headers
    headers['X-XSS-Protection'] = '1; mode=block';
    headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    return headers;
  }

  /**
   * Create a request interceptor for API calls
   */
  createRequestInterceptor() {
    return async (config: any) => {
      try {
        // Add CSRF token to state-changing requests
        if (this.config.enableCSRF && this.isStateChangingRequest(config.method)) {
          const csrfHeaders = csrfService.getTokenHeader();
          config.headers = { ...config.headers, ...csrfHeaders };
        }

        // Add security headers
        const securityHeaders = this.getSecurityHeaders();
        config.headers = { ...config.headers, ...securityHeaders };

        // Validate session if required
        if (this.config.enableSessionValidation) {
          const sessionResult = await sessionService.validateSession();
          if (!sessionResult.isValid) {
            sentryService.addBreadcrumb(
              'Request made with invalid session',
              'security',
              'warning',
              { url: config.url, method: config.method }
            );
          }
        }

        return config;
      } catch (error) {
        sentryService.captureError(
          error instanceof Error ? error : new Error('Request interceptor failed'),
          {
            action: 'security_request_interceptor',
            additionalData: { config }
          }
        );

        // Return config even if security checks fail to avoid breaking requests
        return config;
      }
    };
  }

  /**
   * Create a response interceptor for API calls
   */
  createResponseInterceptor() {
    return {
      onFulfilled: (response: any) => {
        // Add security headers to response
        const securityHeaders = this.getSecurityHeaders();
        if (response.headers) {
          Object.assign(response.headers, securityHeaders);
        }

        return response;
      },
      onRejected: (error: any) => {
        // Handle security-related errors
        if (error.response?.status === 403) {
          sentryService.addBreadcrumb(
            'Security-related request rejected',
            'security',
            'warning',
            { 
              status: error.response.status,
              url: error.config?.url,
              method: error.config?.method
            }
          );

          // Check if CSRF token needs refresh
          if (this.config.enableCSRF) {
            csrfService.refreshToken();
          }
        }

        return Promise.reject(error);
      }
    };
  }

  /**
   * Validate CSRF token
   */
  private async validateCSRF(headers?: Record<string, string>): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!headers) {
        return { isValid: false, error: 'No headers provided' };
      }

      const csrfToken = headers['X-CSRF-Token'] || headers['x-csrf-token'];
      if (!csrfToken) {
        return { isValid: false, error: 'CSRF token missing' };
      }

      const result = await csrfService.validateToken(csrfToken);
      return {
        isValid: result.isValid,
        error: result.error
      };
    } catch (error) {
      return { isValid: false, error: 'CSRF validation failed' };
    }
  }

  /**
   * Validate session
   */
  private async validateSession(): Promise<{ isValid: boolean; error?: string }> {
    try {
      const result = await sessionService.validateSession();
      return {
        isValid: result.isValid,
        error: result.error
      };
    } catch (error) {
      return { isValid: false, error: 'Session validation failed' };
    }
  }

  /**
   * Check if request is state-changing
   */
  private isStateChangingRequest(method?: string): boolean {
    if (!method) return false;
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  /**
   * Check if URL uses HTTPS
   */
  private isHTTPS(url?: string): boolean {
    if (!url) return false;
    return url.startsWith('https://') || url.startsWith('wss://');
  }

  /**
   * Check if running in production environment
   */
  private isProductionEnvironment(): boolean {
    return process.env.NODE_ENV === 'production' || 
           window.location.protocol === 'https:';
  }

  /**
   * Generate Content Security Policy header
   */
  private getCSPHeader(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Consider removing unsafe-* in production
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];

    // Add report-uri in production
    if (this.isProductionEnvironment()) {
      directives.push("report-uri /api/csp-report");
    }

    return directives.join('; ');
  }
}

// Create singleton instance
export const securityMiddleware = new SecurityMiddleware();

/**
 * React hook for security middleware
 */
export const useSecurity = () => {
  const validateRequest = (request: any) => securityMiddleware.validateRequest(request);
  const getSecurityHeaders = () => securityMiddleware.getSecurityHeaders();
  const createRequestInterceptor = () => securityMiddleware.createRequestInterceptor();
  const createResponseInterceptor = () => securityMiddleware.createResponseInterceptor();

  return {
    validateRequest,
    getSecurityHeaders,
    createRequestInterceptor,
    createResponseInterceptor
  };
};

/**
 * Higher-order component for security protection
 */
export const withSecurity = <P extends object>(
  Component: React.ComponentType<P>,
  config?: Partial<SecurityMiddlewareConfig>
) => {
  const SecurityWrapper: React.FC<P> = (props) => {
    const middleware = new SecurityMiddleware(config);

    React.useEffect(() => {
      // Apply security headers to the document
      const headers = middleware.getSecurityHeaders();
      
      // Set meta tags for security headers that can be set via HTML
      Object.entries(headers).forEach(([name, value]) => {
        if (name === 'Content-Security-Policy') {
          let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('http-equiv', 'Content-Security-Policy');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', value);
        }
      });
    }, [middleware]);

    return React.createElement(Component, props);
  };

  SecurityWrapper.displayName = `withSecurity(${Component.displayName || Component.name})`;
  
  return SecurityWrapper;
};

export default securityMiddleware;