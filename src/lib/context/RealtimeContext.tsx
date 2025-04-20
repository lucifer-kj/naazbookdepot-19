
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeContextType {
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  connected: false,
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();
  
  // Initialize realtime connection
  useEffect(() => {
    if (!user) {
      setConnected(false);
      return;
    }
    
    const channel = supabase.channel('public:products');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        setConnected(true);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else {
          setConnected(false);
        }
      });
    
    return () => {
      channel.unsubscribe();
    };
  }, [user]);
  
  const value = {
    connected,
  };
  
  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
