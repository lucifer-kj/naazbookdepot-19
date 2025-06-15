
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
    let didCancel = false;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (didCancel) return;
        
        console.log('Auth state change:', event, !!session);
        setSession(session);
        
        if (session?.user) {
          const userData = { 
            ...session.user, 
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
            joinDate: session.user.created_at 
          };
          setUser(userData);
          
          setTimeout(async () => {
            if (!didCancel) {
              try {
                console.log('Fetching roles and admin status for user:', session.user.id);
                
                const adminStatus = await checkAdminStatus(session.user.id);
                console.log('Admin status result:', adminStatus);
                setIsAdminState(adminStatus);
                
                const roles = await fetchUserRoles(session.user.id);
                console.log('Fetched roles:', roles);
                
                if (!didCancel) {
                  setUser(prev => prev ? { ...prev, roles } : null);
                }
              } catch (error) {
                console.error('Failed to fetch user roles or admin status:', error);
                setIsAdminState(false);
              }
            }
          }, 0);
        } else {
          setUser(null);
          setIsAdminState(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (didCancel) return;
      
      console.log('Initial session check:', !!session);
      setSession(session);
      
      if (session?.user) {
        const userData = { 
          ...session.user, 
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
          joinDate: session.user.created_at 
        };
        setUser(userData);
        
        setTimeout(async () => {
          if (!didCancel) {
            try {
              console.log('Initial fetch - roles and admin status for user:', session.user.id);
              
              const adminStatus = await checkAdminStatus(session.user.id);
              console.log('Initial admin status result:', adminStatus);
              setIsAdminState(adminStatus);
              
              const roles = await fetchUserRoles(session.user.id);
              console.log('Initial roles fetch:', roles);
              
              if (!didCancel) {
                setUser(prev => prev ? { ...prev, roles } : null);
              }
            } catch (error) {
              console.error('Failed to fetch initial user roles or admin status:', error);
              setIsAdminState(false);
            }
          }
        }, 0);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Session check error:', error);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      if (!didCancel) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 3000);

    return () => {
      didCancel = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [checkAdminStatus, fetchUserRoles, setIsAdminState]);

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
