import { supabase } from '../supabase';
import sentryService from './sentryService';

export interface CSRFToken {
  token: string;
  expiresAt: Date;
  sessionId?: string;
}

export interface CSRFValidationResult {
  isValid: boolean;
  error?: string;
  newToken?: string;
}

class CSRFService {
  private readonly TOKEN_HEADER = 'X-CSRF-Token';
  private readonly TOKEN_STORAGE_KEY = 'csrf_token';
  private readonly TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
  private readonly SESSION_STORAGE_KEY = 'csrf_session';

  /**
   * Generate a new CSRF token
   */
  generateToken(): CSRFToken {
    try {
      // Generate a cryptographically secure random token
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MS);
      const sessionId = this.getOrCreateSessionId();

      const csrfToken: CSRFToken = {
        token,
        expiresAt,
        sessionId
      };

      // Store token in localStorage for client-side access
      this.storeToken(csrfToken);

      sentryService.addBreadcrumb(
        'CSRF token generated',
        'security',
        'info',
        { tokenLength: token.length, expiresAt }
      );

      return csrfToken;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to generate CSRF token'),
        {
          action: 'generate_csrf_token'
        }
      );

      // Fallback to timestamp-based token if crypto is not available
      const fallbackToken = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        token: fallbackToken,
        expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_MS)
      };
    }
  }

  /**
   * Get the current CSRF token, generating a new one if needed
   */
  getToken(): CSRFToken {
    try {
      const stored = this.getStoredToken();
      
      if (stored && this.isTokenValid(stored)) {
        return stored;
      }

      // Generate new token if none exists or expired
      return this.generateToken();
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to get CSRF token'),
        {
          action: 'get_csrf_token'
        }
      );

      return this.generateToken();
    }
  }

  /**
   * Validate a CSRF token
   */
  async validateToken(
    providedToken: string,
    sessionId?: string
  ): Promise<CSRFValidationResult> {
    try {
      if (!providedToken || typeof providedToken !== 'string') {
        return {
          isValid: false,
          error: 'CSRF token is required'
        };
      }

      const stored = this.getStoredToken();
      
      if (!stored) {
        return {
          isValid: false,
          error: 'No CSRF token found in session'
        };
      }

      // Check if token matches
      if (stored.token !== providedToken) {
        sentryService.addBreadcrumb(
          'CSRF token mismatch detected',
          'security',
          'warning',
          { providedToken: providedToken.substring(0, 8) + '...', sessionId }
        );

        return {
          isValid: false,
          error: 'Invalid CSRF token'
        };
      }

      // Check if token is expired
      if (!this.isTokenValid(stored)) {
        const newToken = this.generateToken();
        return {
          isValid: false,
          error: 'CSRF token has expired',
          newToken: newToken.token
        };
      }

      // Check session ID if provided
      if (sessionId && stored.sessionId && stored.sessionId !== sessionId) {
        sentryService.addBreadcrumb(
          'CSRF session ID mismatch detected',
          'security',
          'warning',
          { providedSessionId: sessionId, storedSessionId: stored.sessionId }
        );

        return {
          isValid: false,
          error: 'Session mismatch'
        };
      }

      // Log successful validation for monitoring
      await this.logCSRFValidation(providedToken, true, sessionId);

      return {
        isValid: true
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('CSRF token validation failed'),
        {
          action: 'validate_csrf_token',
          additionalData: { providedToken: providedToken?.substring(0, 8) + '...', sessionId }
        }
      );

      return {
        isValid: false,
        error: 'Token validation failed'
      };
    }
  }

  /**
   * Refresh the CSRF token
   */
  refreshToken(): CSRFToken {
    this.clearStoredToken();
    return this.generateToken();
  }

  /**
   * Clear the CSRF token
   */
  clearToken(): void {
    this.clearStoredToken();
    this.clearSessionId();
  }

  /**
   * Get CSRF token for HTTP headers
   */
  getTokenHeader(): Record<string, string> {
    const token = this.getToken();
    return {
      [this.TOKEN_HEADER]: token.token
    };
  }

  /**
   * Middleware function to add CSRF token to requests
   */
  addCSRFToRequest = (config: unknown) => {
    const token = this.getToken();
    
    if (!config.headers) {
      config.headers = {};
    }
    
    config.headers[this.TOKEN_HEADER] = token.token;
    
    return config;
  };

  /**
   * Check if a token is valid (not expired)
   */
  private isTokenValid(token: CSRFToken): boolean {
    return new Date() < token.expiresAt;
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: CSRFToken): void {
    try {
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify({
        token: token.token,
        expiresAt: token.expiresAt.toISOString(),
        sessionId: token.sessionId
      }));
    } catch (error) {
      // Handle localStorage not available (e.g., private browsing)
      sentryService.addBreadcrumb(
        'Failed to store CSRF token in localStorage',
        'system',
        'warning'
      );
    }
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): CSRFToken | null {
    try {
      const stored = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        token: parsed.token,
        expiresAt: new Date(parsed.expiresAt),
        sessionId: parsed.sessionId
      };
    } catch (error) {
      // Clear invalid stored token
      this.clearStoredToken();
      return null;
    }
  }

  /**
   * Clear stored token
   */
  private clearStoredToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(this.SESSION_STORAGE_KEY, sessionId);
      }
      
      return sessionId;
    } catch (error) {
      // Fallback if sessionStorage is not available
      return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Clear session ID
   */
  private clearSessionId(): void {
    try {
      sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Log CSRF validation attempts for monitoring
   */
  private async logCSRFValidation(
    token: string,
    success: boolean,
    sessionId?: string
  ): Promise<void> {
    try {
      await supabase.from('csrf_validation_logs').insert({
        token_hash: this.hashToken(token),
        success,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      });
    } catch (error) {
      // Don't throw errors for logging failures
      sentryService.addBreadcrumb(
        'Failed to log CSRF validation',
        'system',
        'warning'
      );
    }
  }

  /**
   * Create a hash of the token for logging (security)
   */
  private hashToken(token: string): string {
    // Simple hash for logging purposes (not cryptographic)
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}

// Create singleton instance
export const csrfService = new CSRFService();

/**
 * React hook for CSRF protection
 */
export const useCSRF = () => {
  const getToken = () => csrfService.getToken();
  const refreshToken = () => csrfService.refreshToken();
  const clearToken = () => csrfService.clearToken();
  const getHeaders = () => csrfService.getTokenHeader();

  return {
    getToken,
    refreshToken,
    clearToken,
    getHeaders,
    validateToken: csrfService.validateToken.bind(csrfService)
  };
};

export default csrfService;
