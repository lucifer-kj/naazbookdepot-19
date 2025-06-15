import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Shield } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AdminPWAPrompt = () => {
  const { isAdmin, loading: isLoading } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (!isAdmin || isLoading) return;

    // Check if already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt for admin after a delay
      setTimeout(() => {
        if (!localStorage.getItem('admin-pwa-prompt-dismissed')) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAdmin, isLoading]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Admin accepted the install prompt');
    } else {
      console.log('Admin dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('admin-pwa-prompt-dismissed', 'true');
    
    // Show again after 30 days for admin
    setTimeout(() => {
      localStorage.removeItem('admin-pwa-prompt-dismissed');
    }, 30 * 24 * 60 * 60 * 1000);
  };

  if (!isAdmin || isLoading || isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 w-80 bg-gradient-to-r from-naaz-green to-green-600 text-white rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-top-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Admin Dashboard App</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-sm text-white/90 mb-4">
        Install the admin dashboard as an app for quick access to order management on your mobile device.
      </p>
      
      <div className="flex space-x-2">
        <Button 
          onClick={handleInstall} 
          className="flex-1 bg-white text-naaz-green hover:bg-white/90" 
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Install Admin App
        </Button>
        <Button 
          variant="ghost" 
          onClick={handleDismiss} 
          size="sm"
          className="text-white hover:bg-white/20"
        >
          Later
        </Button>
      </div>
    </div>
  );
};

export default AdminPWAPrompt;
