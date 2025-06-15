
import React from 'react';
import { usePWA } from '@/lib/hooks/usePWA';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  usePWA(); // Initialize PWA features

  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
};

export default AppLayout;
