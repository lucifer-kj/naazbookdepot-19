
import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeAnalytics, trackPageView } from '../services/analytics-service';
import { logError } from '../services/error-service';

interface AnalyticsContextType {
  initialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  initialized: false
});

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  measurementId?: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children,
  measurementId = 'G-EXAMPLE123'  // Replace with your actual Measurement ID
}) => {
  const [initialized, setInitialized] = React.useState(false);
  const location = useLocation();
  
  // Initialize Google Analytics
  useEffect(() => {
    if (!measurementId) return;
    
    try {
      initializeAnalytics(measurementId);
      setInitialized(true);
    } catch (error) {
      logError({
        type: 'unknown',
        error: {
          message: error instanceof Error ? error.message : 'Failed to initialize analytics',
          stack: error instanceof Error ? error.stack : undefined
        }
      });
      console.error('Failed to initialize analytics:', error);
    }
  }, [measurementId]);
  
  // Track page views
  useEffect(() => {
    if (initialized) {
      try {
        trackPageView(location.pathname + location.search);
      } catch (error) {
        console.error('Page view tracking error:', error);
      }
    }
  }, [initialized, location]);
  
  return (
    <AnalyticsContext.Provider value={{ initialized }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
