
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { Toaster } from 'sonner';
import { NetworkStatusProvider } from '@/components/ui/network-status';
import { initErrorTracking } from './services/error-service';
import ErrorBoundary from '@/components/ui/error-boundary';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize error tracking on mount
  React.useEffect(() => {
    initErrorTracking();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RealtimeProvider>
          <NetworkStatusProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </NetworkStatusProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
