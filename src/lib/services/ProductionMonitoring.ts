/**
 * Production Monitoring Service
 * Provides comprehensive monitoring for production environments
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
}

interface UserInteraction {
  type: 'click' | 'navigation' | 'form_submit' | 'error';
  target: string;
  timestamp: string;
  duration?: number;
  metadata?: Record<string, any>;
}

class ProductionMonitoringService {
  private sessionId: string;
  private userId?: string;
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private interactions: UserInteraction[] = [];
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = import.meta.env.PROD;
    
    if (this.isProduction) {
      this.initializeMonitoring();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        userId: this.userId,
        sessionId: this.sessionId
      });
    });

    // Performance observer for Core Web Vitals
    this.initializePerformanceObserver();

    // User interaction tracking
    this.initializeInteractionTracking();

    // Periodic metrics collection
    this.startPeriodicCollection();
  }

  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.captureMetric({
            name: 'largest_contentful_paint',
            value: lastEntry.startTime,
            timestamp: new Date().toISOString(),
            metadata: {
              element: (lastEntry as any).element?.tagName,
              url: (lastEntry as any).url
            }
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.captureMetric({
              name: 'first_input_delay',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: new Date().toISOString(),
              metadata: {
                eventType: (entry as any).name
              }
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          });

          this.captureMetric({
            name: 'cumulative_layout_shift',
            value: clsValue,
            timestamp: new Date().toISOString()
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const navEntry = entry as PerformanceNavigationTiming;
            
            this.captureMetric({
              name: 'page_load_time',
              value: navEntry.loadEventEnd - navEntry.fetchStart,
              timestamp: new Date().toISOString(),
              metadata: {
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstByte: navEntry.responseStart - navEntry.fetchStart,
                domComplete: navEntry.domComplete - navEntry.fetchStart
              }
            });
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

      } catch (error) {
        console.warn('Performance observer initialization failed:', error);
      }
    }
  }

  private initializeInteractionTracking(): void {
    // Track critical user interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const targetInfo = this.getElementInfo(target);

      this.captureInteraction({
        type: 'click',
        target: targetInfo,
        timestamp: new Date().toISOString()
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formInfo = this.getElementInfo(form);

      this.captureInteraction({
        type: 'form_submit',
        target: formInfo,
        timestamp: new Date().toISOString()
      });
    });

    // Track navigation
    let navigationStartTime = performance.now();
    
    const trackNavigation = () => {
      const duration = performance.now() - navigationStartTime;
      
      this.captureInteraction({
        type: 'navigation',
        target: window.location.pathname,
        timestamp: new Date().toISOString(),
        duration
      });
      
      navigationStartTime = performance.now();
    };

    // Listen for route changes (for SPA)
    window.addEventListener('popstate', trackNavigation);
    
    // Override pushState and replaceState to track programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      trackNavigation();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      trackNavigation();
    };
  }

  private getElementInfo(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const className = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const text = element.textContent?.slice(0, 50) || '';
    
    return `${tag}${id}${className} "${text}"`.trim();
  }

  private startPeriodicCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Send batched data every 5 minutes
    setInterval(() => {
      this.sendBatchedData();
    }, 300000);
  }

  private collectSystemMetrics(): void {
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.captureMetric({
        name: 'memory_usage',
        value: memory.usedJSHeapSize,
        timestamp: new Date().toISOString(),
        metadata: {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        }
      });
    }

    // Connection information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      this.captureMetric({
        name: 'network_info',
        value: connection.downlink || 0,
        timestamp: new Date().toISOString(),
        metadata: {
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData
        }
      });
    }
  }

  public captureMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Send critical metrics immediately
    if (this.isCriticalMetric(metric)) {
      this.sendMetric(metric);
    }
  }

  public captureError(error: ErrorEvent): void {
    this.errors.push(error);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }

    // Send errors immediately in production
    if (this.isProduction) {
      this.sendError(error);
    }
  }

  public captureInteraction(interaction: UserInteraction): void {
    this.interactions.push(interaction);
    
    // Keep only last 200 interactions
    if (this.interactions.length > 200) {
      this.interactions = this.interactions.slice(-200);
    }
  }

  private isCriticalMetric(metric: PerformanceMetric): boolean {
    const criticalMetrics = [
      'largest_contentful_paint',
      'first_input_delay',
      'cumulative_layout_shift'
    ];
    
    return criticalMetrics.includes(metric.name);
  }

  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    if (!this.isProduction) return;

    try {
      // In a real implementation, send to your analytics service
      // Example: Sentry, DataDog, Google Analytics, etc.
      console.log('Sending metric:', metric);
      
      // Example implementation:
      // await fetch('/api/metrics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric)
      // });
    } catch (error) {
      console.warn('Failed to send metric:', error);
    }
  }

  private async sendError(error: ErrorEvent): Promise<void> {
    if (!this.isProduction) return;

    try {
      // In a real implementation, send to your error tracking service
      console.error('Sending error:', error);
      
      // Example implementation:
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // });
    } catch (sendError) {
      console.warn('Failed to send error:', sendError);
    }
  }

  private async sendBatchedData(): Promise<void> {
    if (!this.isProduction || this.metrics.length === 0) return;

    try {
      const batchData = {
        sessionId: this.sessionId,
        userId: this.userId,
        metrics: this.metrics.splice(0),
        interactions: this.interactions.splice(0),
        timestamp: new Date().toISOString()
      };

      console.log('Sending batched data:', batchData);
      
      // Example implementation:
      // await fetch('/api/analytics/batch', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(batchData)
      // });
    } catch (error) {
      console.warn('Failed to send batched data:', error);
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  public getInteractions(): UserInteraction[] {
    return [...this.interactions];
  }
}

// Create singleton instance
export const productionMonitoring = new ProductionMonitoringService();

export default productionMonitoring;