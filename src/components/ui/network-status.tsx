
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface NetworkStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ onStatusChange }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      toast.success('Connection restored');
      if (onStatusChange) onStatusChange(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      toast.error('You are offline. Some features may be limited.');
      if (onStatusChange) onStatusChange(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onStatusChange]);

  // Add periodic connection check
  useEffect(() => {
    if (!isOnline) {
      const intervalId = setInterval(() => {
        // Try to fetch a small resource to test connection
        fetch('/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
        })
          .then(() => {
            if (!navigator.onLine) {
              // Browser thinks we're offline but we just made a successful request
              // Force an online status update
              window.dispatchEvent(new Event('online'));
            }
          })
          .catch(() => {
            // Still offline, increment retry count
            setRetryCount(prev => prev + 1);
          });
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [isOnline]);

  // Handle manual retry
  const handleRetry = () => {
    // Manual connection test
    setRetryCount(prev => prev + 1);
    
    fetch('/favicon.ico', { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    })
      .then(() => {
        if (!navigator.onLine) {
          // Force an online status update
          window.dispatchEvent(new Event('online'));
        }
        toast.success('Connection restored');
      })
      .catch(() => {
        toast.error('Still offline. Please check your internet connection.');
      });
  };

  if (!showOfflineBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 p-2 flex items-center justify-between z-50">
      <div className="flex items-center text-yellow-800">
        <WifiOff className="h-5 w-5 text-yellow-600 mr-2" />
        <span>You are currently offline. Some features may be limited.</span>
      </div>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={handleRetry}
        className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Retry Connection
      </Button>
    </div>
  );
};

// Global status provider component
export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Track whether we've shown the initial offline warning
  const [hasShownOfflineWarning, setHasShownOfflineWarning] = useState(false);

  useEffect(() => {
    // Check if we're offline on initial load
    if (!navigator.onLine && !hasShownOfflineWarning) {
      setHasShownOfflineWarning(true);
      toast.warning('You are offline. Some features may be limited.', {
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => {}
        }
      });
    }
  }, [hasShownOfflineWarning]);

  return (
    <>
      {children}
      <NetworkStatus />
    </>
  );
};
