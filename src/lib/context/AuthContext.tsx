
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
  try {
    const cached = sessionStorage.getItem(`${ADMIN_CACHE_KEY}-${userId}`);
    const expiry = sessionStorage.getItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`);
    if (cached && expiry && Date.now() < parseInt(expiry)) {
      return cached === 'true';
    }
  } catch (error) {
    console.warn('Failed to get cached admin status:', error);
  }
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  try {
    sessionStorage.setItem(`${ADMIN_CACHE_KEY}-${userId}`, isAdmin.toString());
    sessionStorage.setItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`, (Date.now() + CACHE_DURATION).toString());
  } catch (error) {
    console.warn('Failed to cache admin status:', error);
  }
}

function clearAuthCache() {
  try {
    // Clear all admin cache entries
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes(ADMIN_CACHE_KEY) || key.includes(ADMIN_CACHE_EXPIRY_KEY))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Clear localStorage admin entries
    localStorage.removeItem('admin-pwa-prompt-dismissed');
  } catch (error) {
    console.warn('Failed to clear auth cache:', error);
  }
}

async function checkAdminStatus(userId?: string): Promise<boolean> {
  if (!userId) return false;
  
  // Check cache first
  const cachedResult = getCachedAdminStatus(userId);
  if (cachedResult !== null) return cachedResult;
  
  try {
    const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
    if (adminError) {
      console.warn('Admin check error:', adminError);
      return false;
    }
    const isAdmin = Boolean(isAdminResult);
    setCachedAdminStatus(userId, isAdmin);
    return isAdmin;
  } catch (error) {
    console.warn('Admin check failed:', error);
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
      
      console.log('Auth state change:', event, !!session);
      
      setSession(session);
      
      if (session?.user) {
        const userData: AuthUser = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          joinDate: session.user.created_at
        };
        setUser(userData);
        
        // Fetch user roles
        try {
          const roles = await fetchUserRoles(session.user.id);
          if (isMounted) {
            setUser(prev => prev ? { ...prev, roles } : null);
          }
        } catch (error) {
          console.warn('Failed to fetch user roles:', error);
        }
        
        // Check admin status
        const adminStatus = await checkAdminStatus(session.user.id);
        if (isMounted) {
          setIsAdmin(adminStatus);
        }
      } else {
        // User logged out
        setUser(null);
        setIsAdmin(false);
        clearAuthCache();
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        await handleAuthChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Failsafe timeout
    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchUserRoles]);

  const logout = async () => {
    try {
      console.log('Logging out user...');
      
      // Clear cache before logout
      clearAuthCache();
      
      // Perform Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Logout error:', error);
      }
      
      // Clear context state immediately
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout exception:', error);
      // Clear state even on error
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      clearAuthCache();
    }
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  console.log('Auth context state:', { 
    user: !!user, 
    isAdmin, 
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
    logout,
    updateProfile,
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
