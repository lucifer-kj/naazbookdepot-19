import React, { useState, useEffect } from 'react';
import { errorMonitoring } from '../../lib/services/ErrorMonitoring';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Bug, 
  Activity, 
  User, 
  Clock, 
  Download, 
  RefreshCw,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

/**
 * Debug panel for error monitoring (development only)
 * Shows real-time monitoring statistics and data
 */
export function ErrorMonitoringPanel() {
  const [stats, setStats] = useState(errorMonitoring.getStats());
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'session' | 'user' | 'performance'>('session');

  // Update stats every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(errorMonitoring.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  const exportData = () => {
    const data = errorMonitoring.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-monitoring-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refreshStats = () => {
    setStats(errorMonitoring.getStats());
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getBreadcrumbIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info':
        return <Info className="h-3 w-3 text-blue-500" />;
      default:
        return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Bug className="h-4 w-4 mr-2" />
          Error Monitor
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96">
      <Card className="bg-white shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Error Monitoring
            </CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={refreshStats}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                onClick={exportData}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3">
          <div className="w-full">
            <div className="flex gap-1 mb-2">
              <Button
                onClick={() => setActiveTab('session')}
                variant={activeTab === 'session' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-6"
              >
                Session
              </Button>
              <Button
                onClick={() => setActiveTab('user')}
                variant={activeTab === 'user' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-6"
              >
                User
              </Button>
              <Button
                onClick={() => setActiveTab('performance')}
                variant={activeTab === 'performance' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-6"
              >
                Performance
              </Button>
            </div>
            
            {activeTab === 'session' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatDuration(stats.session.duration || 0)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Page Views</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.session.pageViews}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Interactions</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.session.interactions}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                    Errors
                  </span>
                  <Badge 
                    variant={stats.session.errors > 0 ? "destructive" : "outline"} 
                    className="text-xs"
                  >
                    {stats.session.errors}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span>Breadcrumbs</span>
                  <Badge variant="outline" className="text-xs">
                    {stats.breadcrumbs}
                  </Badge>
                </div>
              </div>
            )}
            
            {activeTab === 'user' && (
              stats.user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      User ID
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {stats.user.id.slice(0, 8)}...
                    </Badge>
                  </div>
                  
                  {stats.user.email && (
                    <div className="flex items-center justify-between text-xs">
                      <span>Email</span>
                      <Badge variant="outline" className="text-xs">
                        {stats.user.email.slice(0, 15)}...
                      </Badge>
                    </div>
                  )}
                  
                  {stats.user.role && (
                    <div className="flex items-center justify-between text-xs">
                      <span>Role</span>
                      <Badge variant="outline" className="text-xs">
                        {stats.user.role}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 text-center py-4">
                  No user context set
                </div>
              )
            )}
            
            {activeTab === 'performance' && (
              <div className="space-y-2">
                {stats.performance.pageLoadTime && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Page Load
                    </span>
                    <Badge 
                      variant={stats.performance.pageLoadTime > 3000 ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {Math.round(stats.performance.pageLoadTime)}ms
                    </Badge>
                  </div>
                )}
                
                {stats.performance.firstContentfulPaint && (
                  <div className="flex items-center justify-between text-xs">
                    <span>FCP</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(stats.performance.firstContentfulPaint)}ms
                    </Badge>
                  </div>
                )}
                
                {stats.performance.timeToInteractive && (
                  <div className="flex items-center justify-between text-xs">
                    <span>TTI</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(stats.performance.timeToInteractive)}ms
                    </Badge>
                  </div>
                )}
                
                {Object.keys(stats.performance).length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No performance data available
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorMonitoringPanel;