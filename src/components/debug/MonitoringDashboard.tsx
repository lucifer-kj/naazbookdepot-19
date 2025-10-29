/**
 * Monitoring Dashboard Component
 * Development-only dashboard for monitoring application health and performance
 */

import { useState, useEffect } from 'react';
import { healthCheckService } from '@/lib/services/HealthCheck';
import { productionMonitoring } from '@/lib/services/ProductionMonitoring';
import { criticalPathMonitoring } from '@/lib/services/CriticalPathMonitoring';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: any;
}

export const MonitoringDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [pathSummaries, setPathSummaries] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (isOpen) {
      // Refresh data when dashboard is open
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const refreshData = async () => {
    try {
      const health = await healthCheckService.getHealthStatus();
      setHealthStatus(health);
      
      const currentMetrics = productionMonitoring.getMetrics();
      setMetrics(currentMetrics.slice(-10)); // Last 10 metrics
      
      const summaries = criticalPathMonitoring.getAllPathSummaries();
      setPathSummaries(summaries);
    } catch (error) {
      console.error('Failed to refresh monitoring data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return 'text-green-600';
      case 'degraded':
      case 'warn':
        return 'text-yellow-600';
      case 'unhealthy':
      case 'fail':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-20 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Monitoring Dashboard"
      >
        📊
      </button>

      {/* Dashboard Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Monitoring Dashboard</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Health Status */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Health Status</h4>
              {healthStatus ? (
                <div className="space-y-2">
                  <div className={`font-medium ${getStatusColor(healthStatus.status)}`}>
                    Overall: {healthStatus.status.toUpperCase()}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(healthStatus.checks).map(([key, check]: [string, any]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key}:</span>
                        <span className={getStatusColor(check.status)}>
                          {check.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Loading...</div>
              )}
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recent Metrics</h4>
              <div className="space-y-1 text-sm">
                {metrics.length > 0 ? (
                  metrics.map((metric, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate">{metric.name}:</span>
                      <span className="font-mono">
                        {formatDuration(metric.value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No metrics available</div>
                )}
              </div>
            </div>

            {/* Critical Paths */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Critical Paths</h4>
              <div className="space-y-2 text-sm">
                {pathSummaries.size > 0 ? (
                  Array.from(pathSummaries.entries()).map(([path, summary]) => (
                    <div key={path} className="border border-gray-200 rounded p-2">
                      <div className="font-medium text-gray-800 capitalize">
                        {path.replace(/_/g, ' ')}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                        <span>Duration: {formatDuration(summary.averageDuration)}</span>
                        <span>Success: {summary.successRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No path data available</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={refreshData}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    console.log('Health Status:', healthStatus);
                    console.log('Metrics:', metrics);
                    console.log('Path Summaries:', pathSummaries);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  Log Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonitoringDashboard;