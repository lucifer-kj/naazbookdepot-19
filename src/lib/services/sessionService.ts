import { supabase } from '../supabase';
import sentryService from './sentryService';

export interface SessionConfig {
  maxAge: number; // Session timeout in milliseconds
  renewalThreshold: number; // Renew session when this much time is left (milliseconds)
  maxSessions: number; // Maximum concurrent sessions per user
  requireReauth: boolean; // Require re-authentication for sensitive operations
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: SessionInfo;
  requiresRenewal?: boolean;
  error?: string;
}

class SessionService {
  private readonly SESSION_STORAGE_KEY = 'app_session';
  private readonly ACTIVITY_STORAGE_KEY = 'last_activity';
  private readonly DEFAULT_CONFIG: SessionConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    renewalThreshold: 60 * 60 * 1000, // 1 hour
    maxSessions: 5,
    requireReauth: true
  };

  private config: SessionConfig;
  private activityTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.startActivityTracking();
  }

  /**
   * Create a new session
   */
  async createSession(userId: string, deviceInfo?: string): Promise<SessionInfo> {
    try {
      const sessionId = this.generateSessionId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.config.maxAge);

      const sessionInfo: SessionInfo = {
        sessionId,
        userId,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        isActive: true,
        deviceInfo: deviceInfo || this.getDeviceInfo(),
        ipAddress: await this.getClientIP()
      };

      // Store session in Supabase
      await supabase.from('user_sessions').insert({
        session_id: sessionId,
        user_id: userId,
        created_at: now.toISOString(),
        last_activity: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        is_active: true,
        device_info: sessionInfo.deviceInfo,
        ip_address: sessionInfo.ipAddress
      });

      // Store session locally
      this.storeSession(sessionInfo);

      // Clean up old sessions
      await this.cleanupOldSessions(userId);

      sentryService.addBreadcrumb(
        'New session created',
        'auth',
        'info',
        { sessionId, userId, expiresAt }
      );

      return sessionInfo;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to create session'),
        {
          action: 'create_session',
          additionalData: { userId, deviceInfo }
        }
      );
      throw error;
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<SessionValidationResult> {
    try {
      const storedSession = this.getStoredSession();
      
      if (!storedSession) {
        return {
          isValid: false,
          error: 'No session found'
        };
      }

      // Check if session is expired
      if (new Date() > storedSession.expiresAt) {
        await this.destroySession(storedSession.sessionId);
        return {
          isValid: false,
          error: 'Session expired'
        };
      }

      // Verify session in database
      const { data: dbSession, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', storedSession.sessionId)
        .eq('is_active', true)
        .single();

      if (error || !dbSession) {
        await this.destroyLocalSession();
        return {
          isValid: false,
          error: 'Session not found in database'
        };
      }

      // Check if session needs renewal
      const timeUntilExpiry = storedSession.expiresAt.getTime() - Date.now();
      const requiresRenewal = timeUntilExpiry < this.config.renewalThreshold;

      // Update last activity
      await this.updateActivity(storedSession.sessionId);

      return {
        isValid: true,
        session: storedSession,
        requiresRenewal
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Session validation failed'),
        {
          action: 'validate_session'
        }
      );

      return {
        isValid: false,
        error: 'Session validation failed'
      };
    }
  }

  /**
   * Renew current session
   */
  async renewSession(): Promise<SessionInfo> {
    try {
      const validation = await this.validateSession();
      
      if (!validation.isValid || !validation.session) {
        throw new Error('Cannot renew invalid session');
      }

      const newExpiresAt = new Date(Date.now() + this.config.maxAge);
      const updatedSession: SessionInfo = {
        ...validation.session,
        expiresAt: newExpiresAt,
        lastActivity: new Date()
      };

      // Update session in database
      await supabase
        .from('user_sessions')
        .update({
          expires_at: newExpiresAt.toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('session_id', validation.session.sessionId);

      // Update local storage
      this.storeSession(updatedSession);

      sentryService.addBreadcrumb(
        'Session renewed',
        'auth',
        'info',
        { sessionId: validation.session.sessionId, newExpiresAt }
      );

      return updatedSession;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to renew session'),
        {
          action: 'renew_session'
        }
      );
      throw error;
    }
  }

  /**
   * Destroy a specific session
   */
  async destroySession(sessionId: string): Promise<void> {
    try {
      // Mark session as inactive in database
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_id', sessionId);

      // Clear local storage if it's the current session
      const storedSession = this.getStoredSession();
      if (storedSession && storedSession.sessionId === sessionId) {
        this.destroyLocalSession();
      }

      sentryService.addBreadcrumb(
        'Session destroyed',
        'auth',
        'info',
        { sessionId }
      );
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to destroy session'),
        {
          action: 'destroy_session',
          additionalData: { sessionId }
        }
      );
    }
  }

  /**
   * Destroy all sessions for a user
   */
  async destroyAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    try {
      let query = supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (exceptSessionId) {
        query = query.neq('session_id', exceptSessionId);
      }

      await query;

      // Clear local storage if current session is being destroyed
      const storedSession = this.getStoredSession();
      if (storedSession && storedSession.userId === userId && 
          (!exceptSessionId || storedSession.sessionId !== exceptSessionId)) {
        this.destroyLocalSession();
      }

      sentryService.addBreadcrumb(
        'All user sessions destroyed',
        'auth',
        'info',
        { userId, exceptSessionId }
      );
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to destroy all sessions'),
        {
          action: 'destroy_all_sessions',
          additionalData: { userId, exceptSessionId }
        }
      );
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;

      return sessions.map(session => ({
        sessionId: session.session_id,
        userId: session.user_id,
        createdAt: new Date(session.created_at),
        lastActivity: new Date(session.last_activity),
        expiresAt: new Date(session.expires_at),
        isActive: session.is_active,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address
      }));
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to get user sessions'),
        {
          action: 'get_user_sessions',
          additionalData: { userId }
        }
      );
      return [];
    }
  }

  /**
   * Update session activity
   */
  private async updateActivity(sessionId: string): Promise<void> {
    try {
      const now = new Date();
      
      // Update database
      await supabase
        .from('user_sessions')
        .update({ last_activity: now.toISOString() })
        .eq('session_id', sessionId);

      // Update local storage
      localStorage.setItem(this.ACTIVITY_STORAGE_KEY, now.toISOString());
    } catch (error) {
      // Don't throw errors for activity updates
      sentryService.addBreadcrumb(
        'Failed to update session activity',
        'system',
        'warning'
      );
    }
  }

  /**
   * Start tracking user activity
   */
  private startActivityTracking(): void {
    // Update activity every 5 minutes
    this.activityTimer = setInterval(async () => {
      const session = this.getStoredSession();
      if (session) {
        await this.updateActivity(session.sessionId);
      }
    }, 5 * 60 * 1000);

    // Track user interactions
    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    const throttledUpdate = this.throttle(async () => {
      const session = this.getStoredSession();
      if (session) {
        await this.updateActivity(session.sessionId);
      }
    }, 60000); // Throttle to once per minute

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });
  }

  /**
   * Clean up old/expired sessions
   */
  private async cleanupOldSessions(userId: string): Promise<void> {
    try {
      // Get all active sessions for user
      const sessions = await this.getUserSessions(userId);
      
      // If user has too many sessions, deactivate oldest ones
      if (sessions.length > this.config.maxSessions) {
        const sessionsToDeactivate = sessions
          .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
          .slice(0, sessions.length - this.config.maxSessions);

        for (const session of sessionsToDeactivate) {
          await this.destroySession(session.sessionId);
        }
      }

      // Clean up expired sessions
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      sentryService.addBreadcrumb(
        'Failed to cleanup old sessions',
        'system',
        'warning'
      );
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): string {
    try {
      return `${navigator.userAgent} | ${window.screen.width}x${window.screen.height}`;
    } catch (error) {
      return 'Unknown Device';
    }
  }

  /**
   * Get client IP (placeholder - would be handled server-side)
   */
  private async getClientIP(): Promise<string> {
    try {
      // In a real implementation, this would be handled server-side
      // For client-side, we'll use a placeholder
      return 'client-side';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Store session in localStorage
   */
  private storeSession(session: SessionInfo): void {
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify({
        sessionId: session.sessionId,
        userId: session.userId,
        createdAt: session.createdAt.toISOString(),
        lastActivity: session.lastActivity.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        isActive: session.isActive,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress
      }));
    } catch (error) {
      sentryService.addBreadcrumb(
        'Failed to store session in localStorage',
        'system',
        'warning'
      );
    }
  }

  /**
   * Get stored session from localStorage
   */
  private getStoredSession(): SessionInfo | null {
    try {
      const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        sessionId: parsed.sessionId,
        userId: parsed.userId,
        createdAt: new Date(parsed.createdAt),
        lastActivity: new Date(parsed.lastActivity),
        expiresAt: new Date(parsed.expiresAt),
        isActive: parsed.isActive,
        deviceInfo: parsed.deviceInfo,
        ipAddress: parsed.ipAddress
      };
    } catch (error) {
      this.destroyLocalSession();
      return null;
    }
  }

  /**
   * Destroy local session data
   */
  private destroyLocalSession(): void {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
      localStorage.removeItem(this.ACTIVITY_STORAGE_KEY);
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Throttle function calls
   */
  private throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }
  }
}

// Create singleton instance
export const sessionService = new SessionService();

/**
 * React hook for session management
 */
export const useSession = () => {
  const validateSession = () => sessionService.validateSession();
  const renewSession = () => sessionService.renewSession();
  const destroySession = (sessionId: string) => sessionService.destroySession(sessionId);
  const destroyAllSessions = (userId: string, except?: string) => 
    sessionService.destroyAllSessions(userId, except);
  const getUserSessions = (userId: string) => sessionService.getUserSessions(userId);

  return {
    validateSession,
    renewSession,
    destroySession,
    destroyAllSessions,
    getUserSessions
  };
};

export default sessionService;