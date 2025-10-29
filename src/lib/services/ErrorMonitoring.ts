import sentryService, { ErrorContext } from './sentryService';
import { errorHandler } from './ErrorHandler';
import { logger } from './Logger';

export interface BreadcrumbData {
  message: string;
  category: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
  timestamp?: string;
}

export interface UserContext {
  id: string;
  email?: string;
  username?: string;
  role?: string;
  subscription?: string;
}

export interface SessionContext {
  sessionId: string;
  startTime: string;
  duration?: number;
  pageViews: number;
  interactions: number;
  errors: number;
}

export interface PerformanceMetrics {
  pageLoadTime?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
}

/**
 * Enhanced error monitoring service with comprehensive tracking
 * Integrates with Sentry and provides additional monitoring capabilities
 */
export class ErrorMonitoring {
  private breadcrumbs: BreadcrumbData[] = [];
  private maxBreadcrumbs = 100;
  private sessionContext: SessionContext;
  private userContext: UserContext | null = null;
  private performanceMetrics: PerformanceMetrics = {};
  private isInitialized = false;

  constructor() {
    this.sessionContext = {
      sessionId: this.generateSessionId(),
      startTime: new Date().toISOString(),
      pageViews: 0,
      interactions: 0,
      errors: 0
    };
  }

  /**
   * Initialize error monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry service
      await sentryService.initialize();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      // Set up user interaction tracking
      this.setupInteractionTracking();

      // Set up navigation tracking
      this.setupNavigationTracking();

      // Set up error tracking
      this.setupErrorTracking();

      this.isInitialized = true;

      this.addBreadcrumb('Error monitoring initialized', 'system', 'info', {
        sessionId: this.sessionContext.sessionId
      });

      logger.info('Error monitoring service initialized', {
        component: 'ErrorMonitoring',
        additionalData: {
          sessionId: this.sessionContext.sessionId,
          sentryEnabled: true // Assume enabled if initialization succeeded
        }
      });
    } catch (error) {
      errorHandler.error(error instanceof Error ? error : new Error(String(error)), {
        component: 'ErrorMonitoring',
        action: 'initialize'
      });
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(user: UserContext): void {
    this.userContext = user;
    
    // Set user context in Sentry
    sentryService.setUserContext(user.id, user.email, {
      username: user.username,
      role: user.role,
      subscription: user.subscription
    });

    this.addBreadcrumb('User context set', 'auth', 'info', {
      userId: user.id,
      role: user.role
    });

    logger.info('User context updated', {
      component: 'ErrorMonitoring',
      additionalData: {
        userId: user.id,
        role: user.role
      }
    });
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    this.userContext = null;
    sentryService.clearUserContext();

    this.addBreadcrumb('User context cleared', 'auth', 'info');

    logger.info('User context cleared', {
      component: 'ErrorMonitoring'
    });
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    level: BreadcrumbData['level'] = 'info',
    data?: Record<string, unknown>
  ): void {
    const breadcrumb: BreadcrumbData = {
      message,
      category,
      level,
      data,
      timestamp: new Date().toISOString()
    };

    // Add to local breadcrumbs
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    // Add to Sentry
    sentryService.addBreadcrumb(message, category, level, data);
  }

  /**
   * Capture error with enhanced context
   */
  captureError(error: Error, context?: Partial<ErrorContext>): void {
    this.sessionContext.errors++;

    const enhancedContext: ErrorContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        sessionContext: this.sessionContext,
        userContext: this.userContext,
        performanceMetrics: this.performanceMetrics,
        breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: this.getConnectionInfo(),
        memory: this.getMemoryInfo()
      }
    };

    // Log to our error handler
    errorHandler.error(error, enhancedContext);

    // Add error breadcrumb
    this.addBreadcrumb(`Error occurred: ${error.message}`, 'error', 'error', {
      errorName: error.name,
      errorStack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
    });
  }

  /**
   * Capture message with context
   */
  captureMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    context?: Partial<ErrorContext>
  ): void {
    const enhancedContext: ErrorContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        sessionContext: this.sessionContext,
        userContext: this.userContext,
        timestamp: new Date().toISOString()
      }
    };

    sentryService.captureMessage(message, level, enhancedContext);

    this.addBreadcrumb(message, 'message', level, context?.additionalData);
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    action: string,
    element: string,
    details?: Record<string, unknown>
  ): void {
    this.sessionContext.interactions++;

    this.addBreadcrumb(`User interaction: ${action}`, 'user', 'info', {
      action,
      element,
      ...details
    });

    logger.userAction(action, element, details, {
      component: 'ErrorMonitoring'
    });
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    this.sessionContext.pageViews++;

    this.addBreadcrumb(`Page view: ${path}`, 'navigation', 'info', {
      path,
      title,
      pageViews: this.sessionContext.pageViews
    });

    logger.navigation(document.referrer || 'direct', path, {
      component: 'ErrorMonitoring',
      additionalData: { title }
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };

    this.addBreadcrumb('Performance metrics updated', 'performance', 'info', metrics);

    // Log slow performance
    if (metrics.pageLoadTime && metrics.pageLoadTime > 3000) {
      logger.warn('Slow page load detected', {
        component: 'ErrorMonitoring',
        additionalData: metrics
      });
    }
  }

  /**
   * Get connection information
   */
  private getConnectionInfo(): unknown {
    const connection = (navigator as unknown).connection;
    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): unknown {
    const memory = (performance as unknown).memory;
    if (!memory) return null;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance({
            pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
            timeToInteractive: navigation.domInteractive - navigation.fetchStart
          });
        }

        // Monitor Web Vitals if available
        if ('web-vitals' in window) {
          this.setupWebVitalsMonitoring();
        }
      }, 0);
    });
  }

  /**
   * Set up Web Vitals monitoring
   */
  private setupWebVitalsMonitoring(): void {
    // This would integrate with web-vitals library if available
    // For now, we'll use basic performance API
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          if (entry.name === 'first-contentful-paint') {
            this.trackPerformance({
              firstContentfulPaint: entry.startTime
            });
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      // Performance observer not supported
    }
  }

  /**
   * Set up user interaction tracking
   */
  private setupInteractionTracking(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        const id = target.id;
        const className = target.className;
        
        this.trackInteraction('click', tagName, {
          id,
          className,
          text: target.textContent?.slice(0, 50)
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const target = event.target as HTMLFormElement;
      if (target) {
        this.trackInteraction('form_submit', 'form', {
          id: target.id,
          action: target.action,
          method: target.method
        });
      }
    });
  }

  /**
   * Set up navigation tracking
   */
  private setupNavigationTracking(): void {
    // Track initial page load
    this.trackPageView(window.location.pathname, document.title);

    // Track navigation changes (for SPAs)
    let currentPath = window.location.pathname;
    
    const checkForNavigation = () => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.trackPageView(currentPath, document.title);
      }
    };

    // Check for navigation changes
    setInterval(checkForNavigation, 1000);

    // Listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(checkForNavigation, 0);
    });
  }

  /**
   * Set up error tracking
   */
  private setupErrorTracking(): void {
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.captureError(error, {
        component: 'window',
        action: 'unhandled_promise_rejection'
      });
    });

    // Track global errors
    window.addEventListener('error', (event) => {
      const error = event.error || new Error(event.message);
      this.captureError(error, {
        component: 'window',
        action: 'global_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    session: SessionContext;
    breadcrumbs: number;
    user: UserContext | null;
    performance: PerformanceMetrics;
  } {
    return {
      session: {
        ...this.sessionContext,
        duration: Date.now() - new Date(this.sessionContext.startTime).getTime()
      },
      breadcrumbs: this.breadcrumbs.length,
      user: this.userContext,
      performance: this.performanceMetrics
    };
  }

  /**
   * Export monitoring data for debugging
   */
  exportData(): string {
    return JSON.stringify({
      session: this.sessionContext,
      user: this.userContext,
      breadcrumbs: this.breadcrumbs,
      performance: this.performanceMetrics,
      stats: this.getStats()
    }, null, 2);
  }
}

// Create singleton instance
export const errorMonitoring = new ErrorMonitoring();

// Export convenience functions
export const trackError = errorMonitoring.captureError.bind(errorMonitoring);
export const trackMessage = errorMonitoring.captureMessage.bind(errorMonitoring);
export const trackInteraction = errorMonitoring.trackInteraction.bind(errorMonitoring);
export const trackPageView = errorMonitoring.trackPageView.bind(errorMonitoring);
export const trackPerformance = errorMonitoring.trackPerformance.bind(errorMonitoring);
export const addBreadcrumb = errorMonitoring.addBreadcrumb.bind(errorMonitoring);

export default errorMonitoring;
