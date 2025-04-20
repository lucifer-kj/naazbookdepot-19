
import React, { createContext, useContext, ReactNode } from 'react';
import { useInitializeRealtime } from '../services/realtime-service';

interface RealtimeContextType {
  userId: string | null;
  initialized: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  userId: null,
  initialized: false
});

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { userId } = useInitializeRealtime();
  
  return (
    <RealtimeContext.Provider value={{ userId, initialized: true }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtimeContext = () => useContext(RealtimeContext);
