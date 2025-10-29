import React, { useState, useEffect } from 'react';
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEnhancedCart } from '@/lib/hooks/useEnhancedCart';
import { useAuth } from '@/lib/context/AuthContext';

interface CartRecoveryProps {
  className?: string;
}

const CartRecovery: React.FC<CartRecoveryProps> = ({ className = '' }) => {
  const { syncStatus, syncWithServer, recoverCart, isSyncing } = useEnhancedCart();
  const { isAuthenticated } = useAuth();
  const [showRecovery, setShowRecovery] = useState(false);
  const [lastRecoveryAttempt, setLastRecoveryAttempt] = useState<number>(0);

  useEffect(() => {
    // Show recovery options if there are offline operations or sync issues
    const shouldShowRecovery = 
      syncStatus.hasOfflineOperations || 
      (!syncStatus.isOnline && isAuthenticated) ||
      (isAuthenticated && syncStatus.lastSynced > 0 && Date.now() - syncStatus.lastSynced > 300000); // 5 minutes

    setShowRecovery(shouldShowRecovery);
  }, [syncStatus, isAuthenticated]);

  const handleRecoverCart = async () => {
    try {
      setLastRecoveryAttempt(Date.now());
      await recoverCart();
    } catch (error) {
      console.error('Cart recovery failed:', error);
    }
  };

  const handleSyncCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLastRecoveryAttempt(Date.now());
      await syncWithServer();
    } catch (error) {
      console.error('Cart sync failed:', error);
    }
  };

  if (!showRecovery) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Network Status Indicator */}
      <Alert className={`${syncStatus.isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <div className="flex items-center space-x-2">
          {syncStatus.isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={syncStatus.isOnline ? 'text-green-800' : 'text-orange-800'}>
            {syncStatus.isOnline ? 'Connected' : 'Offline - Changes will sync when reconnected'}
          </AlertDescription>
        </div>
      </Alert>

      {/* Offline Operations Alert */}
      {syncStatus.hasOfflineOperations && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You have pending cart changes that will sync when you're back online.
            {isAuthenticated && syncStatus.isOnline && (
              <Button
                variant="link"
                size="sm"
                onClick={handleSyncCart}
                disabled={isSyncing}
                className="ml-2 p-0 h-auto text-blue-600 hover:text-blue-800"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Sync now'
                )}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Cart Recovery Options */}
      {isAuthenticated && syncStatus.lastSynced > 0 && Date.now() - syncStatus.lastSynced > 300000 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your cart hasn't synced in a while. 
            <Button
              variant="link"
              size="sm"
              onClick={handleSyncCart}
              disabled={isSyncing}
              className="ml-2 p-0 h-auto text-yellow-600 hover:text-yellow-800"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync cart'
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Local Cart Recovery */}
      {!isAuthenticated && (
        <Alert className="border-gray-200 bg-gray-50">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            Cart saved locally. 
            <Button
              variant="link"
              size="sm"
              onClick={handleRecoverCart}
              className="ml-2 p-0 h-auto text-gray-600 hover:text-gray-800"
            >
              Recover cart
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {lastRecoveryAttempt > 0 && Date.now() - lastRecoveryAttempt < 3000 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Cart recovered successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Status Info */}
      {syncStatus.lastSynced > 0 && (
        <div className="text-xs text-gray-500 text-center">
          Last synced: {new Date(syncStatus.lastSynced).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default CartRecovery;
