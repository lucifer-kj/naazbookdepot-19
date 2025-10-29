/**
 * Critical Path Monitoring Service
 * Monitors performance and health of critical user journeys
 */

interface CriticalPathMetric {
  path: string;
  step: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface CriticalPathSummary {
  path: string;
  totalDuration: number;
  steps: number;
  successRate: number;
  averageDuration: number;
  errors: string[];
}

class CriticalPathMonitoringService {
  private activePaths: Map<string, CriticalPathMetric[]> = new Map();
  private completedPaths: CriticalPathMetric[][] = [];
  private pathSummaries: Map<string, CriticalPathSummary> = new Map();

  // Define critical paths for the e-commerce application
  private readonly CRITICAL_PATHS = {
    USER_REGISTRATION: 'user_registration',
    USER_LOGIN: 'user_login',
    PRODUCT_BROWSE: 'product_browse',
    ADD_TO_CART: 'add_to_cart',
    CHECKOUT_FLOW: 'checkout_flow',
    ORDER_COMPLETION: 'order_completion',
    ADMIN_LOGIN: 'admin_login',
    ADMIN_PRODUCT_MANAGEMENT: 'admin_product_management',
    ADMIN_ORDER_MANAGEMENT: 'admin_order_management'
  } as const;

  public startPath(pathName: string, metadata?: Record<string, any>): string {
    const pathId = `${pathName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const initialMetric: CriticalPathMetric = {
      path: pathName,
      step: 'start',
      startTime: performance.now(),
      success: true,
      metadata
    };

    this.activePaths.set(pathId, [initialMetric]);
    
    console.log(`🚀 Started critical path: ${pathName} (${pathId})`);
    return pathId;
  }

  public addStep(pathId: string, stepName: string, metadata?: Record<string, any>): void {
    const pathMetrics = this.activePaths.get(pathId);
    if (!pathMetrics) {
      console.warn(`Path ${pathId} not found`);
      return;
    }

    const stepMetric: CriticalPathMetric = {
      path: pathMetrics[0].path,
      step: stepName,
      startTime: performance.now(),
      success: true,
      metadata
    };

    pathMetrics.push(stepMetric);
    console.log(`📍 Added step to ${pathMetrics[0].path}: ${stepName}`);
  }

  public completeStep(pathId: string, success: boolean = true, error?: string): void {
    const pathMetrics = this.activePaths.get(pathId);
    if (!pathMetrics || pathMetrics.length === 0) {
      console.warn(`Path ${pathId} not found or empty`);
      return;
    }

    const lastStep = pathMetrics[pathMetrics.length - 1];
    lastStep.endTime = performance.now();
    lastStep.duration = lastStep.endTime - lastStep.startTime;
    lastStep.success = success;
    
    if (error) {
      lastStep.error = error;
    }

    console.log(`✅ Completed step ${lastStep.step} in ${lastStep.duration?.toFixed(2)}ms`);
  }

  public completePath(pathId: string, success: boolean = true, error?: string): CriticalPathSummary | null {
    const pathMetrics = this.activePaths.get(pathId);
    if (!pathMetrics) {
      console.warn(`Path ${pathId} not found`);
      return null;
    }

    // Complete the last step if not already completed
    const lastStep = pathMetrics[pathMetrics.length - 1];
    if (!lastStep.endTime) {
      this.completeStep(pathId, success, error);
    }

    // Calculate path summary
    const pathName = pathMetrics[0].path;
    const totalDuration = pathMetrics.reduce((total, metric) => total + (metric.duration || 0), 0);
    const successfulSteps = pathMetrics.filter(metric => metric.success).length;
    const successRate = (successfulSteps / pathMetrics.length) * 100;
    const errors = pathMetrics.filter(metric => metric.error).map(metric => metric.error!);

    const summary: CriticalPathSummary = {
      path: pathName,
      totalDuration,
      steps: pathMetrics.length,
      successRate,
      averageDuration: totalDuration / pathMetrics.length,
      errors
    };

    // Store completed path
    this.completedPaths.push([...pathMetrics]);
    this.activePaths.delete(pathId);

    // Update path summary statistics
    this.updatePathSummary(pathName, summary);

    console.log(`🏁 Completed critical path: ${pathName}`, summary);

    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      this.sendPathMetrics(pathMetrics, summary);
    }

    return summary;
  }

  private updatePathSummary(pathName: string, newSummary: CriticalPathSummary): void {
    const existingSummary = this.pathSummaries.get(pathName);
    
    if (!existingSummary) {
      this.pathSummaries.set(pathName, newSummary);
      return;
    }

    // Calculate running averages
    const totalPaths = this.completedPaths.filter(path => path[0].path === pathName).length;
    
    const updatedSummary: CriticalPathSummary = {
      path: pathName,
      totalDuration: (existingSummary.totalDuration + newSummary.totalDuration) / 2,
      steps: newSummary.steps,
      successRate: (existingSummary.successRate + newSummary.successRate) / 2,
      averageDuration: (existingSummary.averageDuration + newSummary.averageDuration) / 2,
      errors: [...existingSummary.errors, ...newSummary.errors].slice(-10) // Keep last 10 errors
    };

    this.pathSummaries.set(pathName, updatedSummary);
  }

  private async sendPathMetrics(metrics: CriticalPathMetric[], summary: CriticalPathSummary): Promise<void> {
    try {
      const payload = {
        metrics,
        summary,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // In production, send to your monitoring service
      console.log('Sending critical path metrics:', payload);
      
      // Example implementation:
      // await fetch('/api/monitoring/critical-paths', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
    } catch (error) {
      console.warn('Failed to send critical path metrics:', error);
    }
  }

  // Convenience methods for common critical paths
  public startUserRegistration(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.USER_REGISTRATION, metadata);
  }

  public startUserLogin(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.USER_LOGIN, metadata);
  }

  public startProductBrowse(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.PRODUCT_BROWSE, metadata);
  }

  public startAddToCart(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.ADD_TO_CART, metadata);
  }

  public startCheckoutFlow(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.CHECKOUT_FLOW, metadata);
  }

  public startOrderCompletion(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.ORDER_COMPLETION, metadata);
  }

  public startAdminLogin(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.ADMIN_LOGIN, metadata);
  }

  public startAdminProductManagement(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.ADMIN_PRODUCT_MANAGEMENT, metadata);
  }

  public startAdminOrderManagement(metadata?: Record<string, any>): string {
    return this.startPath(this.CRITICAL_PATHS.ADMIN_ORDER_MANAGEMENT, metadata);
  }

  // Analytics and reporting methods
  public getPathSummary(pathName: string): CriticalPathSummary | undefined {
    return this.pathSummaries.get(pathName);
  }

  public getAllPathSummaries(): Map<string, CriticalPathSummary> {
    return new Map(this.pathSummaries);
  }

  public getActivePaths(): string[] {
    return Array.from(this.activePaths.keys());
  }

  public getCompletedPathsCount(): number {
    return this.completedPaths.length;
  }

  public generateReport(): string {
    let report = '\n📊 Critical Path Monitoring Report\n';
    report += '=====================================\n\n';

    this.pathSummaries.forEach((summary, pathName) => {
      report += `🛤️  ${pathName.toUpperCase()}\n`;
      report += `   Duration: ${summary.totalDuration.toFixed(2)}ms (avg: ${summary.averageDuration.toFixed(2)}ms)\n`;
      report += `   Success Rate: ${summary.successRate.toFixed(1)}%\n`;
      report += `   Steps: ${summary.steps}\n`;
      
      if (summary.errors.length > 0) {
        report += `   Recent Errors: ${summary.errors.slice(-3).join(', ')}\n`;
      }
      
      report += '\n';
    });

    report += `📈 Total Completed Paths: ${this.completedPaths.length}\n`;
    report += `🔄 Active Paths: ${this.activePaths.size}\n`;

    return report;
  }
}

// Create singleton instance
export const criticalPathMonitoring = new CriticalPathMonitoringService();

export default criticalPathMonitoring;