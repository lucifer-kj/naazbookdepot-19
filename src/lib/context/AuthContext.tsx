import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { useRoleFetch } from '@/lib/hooks/useRoleFetch';
import { useAddressManagement } from '@/lib/hooks/useAddressManagement';
import { authOperations } from '@/lib/utils/authOperations';
import type { AuthUser, AuthContextType, Order } from '@/lib/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CACHE_KEY = 'admin-status';
const ADMIN_CACHE_EXPIRY_KEY = 'admin-status-expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedAdminStatus(userId: string): boolean | null {
  const cached = sessionStorage.getItem(`${ADMIN_CACHE_KEY}-${userId}`);
  const expiry = sessionStorage.getItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`);
  if (cached && expiry && Date.now() < parseInt(expiry)) {
    return cached === 'true';
  }
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  sessionStorage.setItem(`${ADMIN_CACHE_KEY}-${userId}`, isAdmin.toString());
  sessionStorage.setItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`, (Date.now() + CACHE_DURATION).toString());
}

async function checkAdminStatus(userId?: string): Promise<boolean> {
  if (!userId) return false;
  // Check cache first
  const cachedResult = getCachedAdminStatus(userId);
  if (cachedResult !== null) return cachedResult;
  try {
    const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) return false;
    const isAdmin = Boolean(isAdminResult);
    setCachedAdminStatus(userId, isAdmin);
    return isAdmin;
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const { fetchUserRoles } = useRoleFetch();
  const { addresses, addAddress, updateAddress, deleteAddress } = useAddressManagement();

  useEffect(() => {
    let isMounted = true;
    
    const handleAuthChange = async (event: string, session: Session | null) => {
      if (!isMounted) return;
      setSession(session);
      if (session?.user) {
        const userData = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          joinDate: session.user.created_at
        };
        setUser(userData);
        try {
          const roles = await fetchUserRoles(session.user.id);
          if (isMounted) {
            setUser(prev => prev ? { ...prev, roles } : null);
          }
        } catch {}
        // Admin check
        const adminStatus = await checkAdminStatus(session.user.id);
        if (isMounted) setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      if (isMounted) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(session);
        if (session?.user) {
          const userData = {
            ...session.user,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            joinDate: session.user.created_at
          };
          setUser(userData);
          try {
            const roles = await fetchUserRoles(session.user.id);
            if (isMounted) {
              setUser(prev => prev ? { ...prev, roles } : null);
            }
          } catch {}
          // Admin check
          const adminStatus = await checkAdminStatus(session.user.id);
          if (isMounted) setIsAdmin(adminStatus);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch {
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initializeAuth();
    // Failsafe timeout
    const timeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  console.log('Auth context state:', { 
    user: !!user, 
    isAdmin, 
    roles: user?.roles, 
    loading 
  });

  // Replace the logout in value with a custom function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    // Clear all context state
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    // Clear storage
    sessionStorage.removeItem('admin-status');
    sessionStorage.removeItem('admin-status-expiry');
    localStorage.removeItem('admin-pwa-prompt-dismissed');
    // Optionally, you can also clear other app-specific storage here
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    login: authOperations.login,
    register: authOperations.register,
    logout,
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
