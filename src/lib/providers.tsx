
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <AnalyticsProvider measurementId="G-EXAMPLE123">
              {children}
            </AnalyticsProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};
