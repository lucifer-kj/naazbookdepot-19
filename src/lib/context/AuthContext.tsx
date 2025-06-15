
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { useAdminCheck } from '@/lib/hooks/useAdminCheck';
import { useRoleFetch } from '@/lib/hooks/useRoleFetch';
import { useAddressManagement } from '@/lib/hooks/useAddressManagement';
import { authOperations } from '@/lib/utils/authOperations';
import type { AuthUser, AuthContextType, Order } from '@/lib/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders] = useState<Order[]>([]);

  const { isAdminState, setIsAdminState, checkAdminStatus } = useAdminCheck();
  const { fetchUserRoles } = useRoleFetch();
  const { addresses, addAddress, updateAddress, deleteAddress } = useAddressManagement();

  useEffect(() => {
    let isMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth context - Auth state change:', event, !!session);
        setSession(session);
        
        if (session?.user) {
          const userData = { 
            ...session.user, 
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
            joinDate: session.user.created_at 
          };
          setUser(userData);
          
          // Fetch roles immediately after setting user
          try {
            const roles = await fetchUserRoles(session.user.id);
            if (isMounted) {
              setUser(prev => prev ? { ...prev, roles } : null);
            }
          } catch (error) {
            console.error('Failed to fetch user roles:', error);
          }
        } else {
          setUser(null);
          setIsAdminState(false);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Initialize session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log('Auth context - Initial session check:', !!session);
        setSession(session);
        
        if (session?.user) {
          const userData = { 
            ...session.user, 
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
            joinDate: session.user.created_at 
          };
          setUser(userData);
          
          // Fetch roles for initial session
          try {
            const roles = await fetchUserRoles(session.user.id);
            if (isMounted) {
              setUser(prev => prev ? { ...prev, roles } : null);
            }
          } catch (error) {
            console.error('Failed to fetch initial user roles:', error);
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Failsafe timeout
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('Auth context - Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchUserRoles, setIsAdminState]);

  const isAdmin = isAdminState || user?.roles?.some(role => 
    ['super_admin', 'admin', 'inventory_manager'].includes(role.role)
  ) || false;

  console.log('Auth context state:', { 
    user: !!user, 
    isAdmin, 
    isAdminState,
    roles: user?.roles, 
    loading 
  });

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    login: authOperations.login,
    register: authOperations.register,
    logout: authOperations.logout,
    updateProfile: (userData) => authOperations.updateProfile(user, userData),
    orders,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
