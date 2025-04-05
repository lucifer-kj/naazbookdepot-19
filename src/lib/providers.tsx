
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
};
