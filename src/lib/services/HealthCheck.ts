/**
 * Health Check Service
 * Provides health monitoring endpoints and system status checks
 */

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthStatus;
    authentication: HealthStatus;
    externalServices: HealthStatus;
    performance: HealthStatus;
  };
  metadata: {
    buildVersion: string;
    deploymentTime: string;
    environment: string;
  };
}

interface HealthStatus {
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

class HealthCheckService {
  private startTime: number;
  private version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkAuthentication(),
      this.checkExternalServices(),
      this.checkPerformance()
    ]);

    const [database, authentication, externalServices, performance] = checks.map(
      result => result.status === 'fulfilled' ? result.value : this.createFailedCheck('Check failed')
    );

    const overallStatus = this.determineOverallStatus([database, authentication, externalServices, performance]);

    return {
      status: overallStatus,
      timestamp,
      version: this.version,
      uptime,
      checks: {
        database,
        authentication,
        externalServices,
        performance
      },
      metadata: {
        buildVersion: this.version,
        deploymentTime: import.meta.env.VITE_BUILD_TIME || timestamp,
        environment: import.meta.env.MODE
      }
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    const startTime = performance.now();
    
    try {
      // Import Supabase client dynamically to avoid circular dependencies
      const { supabase } = await import('@/lib/supabase');
      
      // Simple query to test database connectivity
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      const responseTime = performance.now() - startTime;

      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: `Database error: ${error.message}`,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        status: responseTime > 1000 ? 'warn' : 'pass',
        responseTime,
        message: responseTime > 1000 ? 'Slow database response' : 'Database connection healthy',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: performance.now() - startTime,
        message: `Database connection failed: ${error}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkAuthentication(): Promise<HealthStatus> {
    const startTime = performance.now();
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Check if auth service is responsive
      const { data: { session }, error } = await supabase.auth.getSession();
      
      const responseTime = performance.now() - startTime;

      if (error) {
        return {
          status: 'fail',
          responseTime,
          message: `Auth service error: ${error.message}`,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        status: 'pass',
        responseTime,
        message: 'Authentication service healthy',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: performance.now() - startTime,
        message: `Auth service failed: ${error}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkExternalServices(): Promise<HealthStatus> {
    const startTime = performance.now();
    
    try {
      // Check if we can reach external services (like CDN, payment providers, etc.)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        return {
          status: 'fail',
          responseTime: performance.now() - startTime,
          message: 'Supabase URL not configured',
          lastChecked: new Date().toISOString()
        };
      }

      // Simple connectivity check
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });

      const responseTime = performance.now() - startTime;

      if (!response.ok) {
        return {
          status: 'fail',
          responseTime,
          message: `External service error: ${response.status}`,
          lastChecked: new Date().toISOString()
        };
      }

      return {
        status: responseTime > 2000 ? 'warn' : 'pass',
        responseTime,
        message: responseTime > 2000 ? 'Slow external service response' : 'External services healthy',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: performance.now() - startTime,
        message: `External services failed: ${error}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private async checkPerformance(): Promise<HealthStatus> {
    const startTime = performance.now();
    
    try {
      // Check memory usage if available
      let memoryStatus = 'pass';
      let memoryMessage = 'Performance metrics healthy';

      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        const usagePercent = (usedMB / limitMB) * 100;

        if (usagePercent > 80) {
          memoryStatus = 'warn';
          memoryMessage = `High memory usage: ${usagePercent.toFixed(1)}%`;
        } else if (usagePercent > 90) {
          memoryStatus = 'fail';
          memoryMessage = `Critical memory usage: ${usagePercent.toFixed(1)}%`;
        }
      }

      const responseTime = performance.now() - startTime;

      return {
        status: memoryStatus as 'pass' | 'warn' | 'fail',
        responseTime,
        message: memoryMessage,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'warn',
        responseTime: performance.now() - startTime,
        message: `Performance check failed: ${error}`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  private createFailedCheck(message: string): HealthStatus {
    return {
      status: 'fail',
      message,
      lastChecked: new Date().toISOString()
    };
  }

  private determineOverallStatus(checks: HealthStatus[]): 'healthy' | 'degraded' | 'unhealthy' {
    const failedChecks = checks.filter(check => check.status === 'fail').length;
    const warnChecks = checks.filter(check => check.status === 'warn').length;

    if (failedChecks > 0) {
      return failedChecks >= 2 ? 'unhealthy' : 'degraded';
    }

    if (warnChecks > 1) {
      return 'degraded';
    }

    return 'healthy';
  }

  // Expose health check endpoint
  async getHealthStatus(): Promise<HealthCheckResult> {
    return this.performHealthCheck();
  }

  // Simple liveness check
  isAlive(): boolean {
    return true;
  }

  // Readiness check
  async isReady(): Promise<boolean> {
    try {
      const health = await this.performHealthCheck();
      return health.status !== 'unhealthy';
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const healthCheckService = new HealthCheckService();

// Export health check endpoints for use in routing
export const healthCheckEndpoints = {
  // Full health check
  '/health': () => healthCheckService.getHealthStatus(),
  
  // Simple liveness probe
  '/health/live': () => ({ status: 'ok', timestamp: new Date().toISOString() }),
  
  // Readiness probe
  '/health/ready': async () => {
    const ready = await healthCheckService.isReady();
    return { 
      status: ready ? 'ready' : 'not ready', 
      timestamp: new Date().toISOString() 
    };
  }
};

export default healthCheckService;