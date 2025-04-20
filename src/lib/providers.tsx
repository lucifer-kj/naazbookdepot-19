
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { HelmetProvider } from 'react-helmet';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <AnalyticsProvider>
            {children}
          </AnalyticsProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};
