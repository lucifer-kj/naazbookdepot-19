
import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initializeAnalytics, trackPageView } from '../services/analytics-service';

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
      console.error('Failed to initialize analytics:', error);
    }
  }, [measurementId]);
  
  // Track page views
  useEffect(() => {
    if (initialized) {
      trackPageView(location.pathname + location.search);
    }
  }, [initialized, location]);
  
  return (
    <AnalyticsContext.Provider value={{ initialized }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
