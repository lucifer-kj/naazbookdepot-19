import React from 'react';
import { RefreshCw, Wifi, WifiOff, Cloud, CloudOff, AlertTriangle } from 'lucide-react';
import { useEnhancedCart } from '@/lib/hooks/useEnhancedCart';
import { useAuth } from '@/lib/context/AuthContext';

interface CartSyncStatusProps {
  showDetails?: boolean;
  className?: string;
}

const CartSyncStatus: React.FC<CartSyncStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { syncStatus, isSyncing } = useEnhancedCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <CloudOff className="h-4 w-4" />
        {showDetails && <span className="text-xs">Local storage</span>}
      </div>
    );
  }

  const getSyncStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-orange-500" />;
    }
    
    if (syncStatus.hasOfflineOperations) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    
    return <Cloud className="h-4 w-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (isSyncing) {
      return 'Syncing...';
    }
    
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    
    if (syncStatus.hasOfflineOperations) {
      return 'Pending sync';
    }
    
    return 'Synced';
  };

  const getSyncStatusColor = () => {
    if (isSyncing) return 'text-blue-500';
    if (!syncStatus.isOnline) return 'text-orange-500';
    if (syncStatus.hasOfflineOperations) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={`flex items-center space-x-2 ${getSyncStatusColor()} ${className}`}>
      {getSyncStatusIcon()}
      {showDetails && (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{getSyncStatusText()}</span>
          {syncStatus.lastSynced > 0 && (
            <span className="text-xs opacity-75">
              {new Date(syncStatus.lastSynced).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CartSyncStatus;