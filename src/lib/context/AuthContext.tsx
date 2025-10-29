
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { useRoleFetch } from '@/lib/hooks/useRoleFetch';
import { useAddressManagement } from '@/lib/hooks/useAddressManagement';
import { clearAuthCache } from '@/lib/utils/authOperations';
import type { AuthUser, AuthContextType, Order, LoginResult } from '@/lib/types/auth';
import { errorMonitoring } from '../services/ErrorMonitoring';

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
    import('../utils/consoleMigration').then(({ logWarning }) => {
      logWarning('Failed to get cached admin status', { error });
    });
  }
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean) {
  try {
    sessionStorage.setItem(`${ADMIN_CACHE_KEY}-${userId}`, isAdmin.toString());
    sessionStorage.setItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`, (Date.now() + CACHE_DURATION).toString());
  } catch (error) {
    import('../utils/consoleMigration').then(({ logWarning }) => {
      logWarning('Failed to cache admin status', { error });
    });
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
      import('../utils/consoleMigration').then(({ handleDatabaseError }) => {
        handleDatabaseError(adminError, 'admin_check');
      });
      return false;
    }
    const isAdmin = Boolean(isAdminResult);
    setCachedAdminStatus(userId, isAdmin);
    return isAdmin;
  } catch (error) {
    import('../utils/consoleMigration').then(({ handleAuthError }) => {
      handleAuthError(error, { operation: 'admin_check' });
    });
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
      
      import('../utils/consoleMigration').then(({ logInfo }) => {
        logInfo('Auth state change', { event, hasSession: !!session });
      });
      
      setSession(session);
      
      if (session?.user) {
        const userData: AuthUser = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          joinDate: session.user.created_at
        };
        setUser(userData);
        
        // Set user context in error monitoring
        errorMonitoring.setUserContext({
          id: userData.id,
          email: userData.email,
          username: userData.name,
          role: 'user' // Will be updated when roles are fetched
        });
        
        // Fetch user roles
        try {
          const roles = await fetchUserRoles(session.user.id);
          if (isMounted) {
            setUser(prev => prev ? { ...prev, roles } : null);
          }
        } catch (error) {
          import('../utils/consoleMigration').then(({ handleAuthError }) => {
            handleAuthError(error, { operation: 'fetch_user_roles' });
          });
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
        import('../utils/consoleMigration').then(({ handleAuthError }) => {
          handleAuthError(error, { operation: 'auth_initialization' });
        });
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

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        import('../utils/consoleMigration').then(({ handleAuthError }) => {
          handleAuthError(error, { operation: 'login' });
        });
        return { error, user: null, session: null };
      }

      import('../utils/consoleMigration').then(({ logInfo }) => {
        logInfo('Login successful', { hasUser: !!data.user, hasSession: !!data.session });
      });
      return { error: null, user: data.user, session: data.session };
    } catch (err) {
      import('../utils/consoleMigration').then(({ handleAuthError }) => {
        handleAuthError(err, { operation: 'login_exception' });
      });
      return { error: err, user: null, session: null };
    }
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        import('../utils/consoleMigration').then(({ handleAuthError }) => {
          handleAuthError(error, { operation: 'registration' });
        });
        return { error };
      }

      return { error: null, data };
    } catch (err) {
      import('../utils/consoleMigration').then(({ handleAuthError }) => {
        handleAuthError(err, { operation: 'registration_exception' });
      });
      return { error: err };
    }
  };

  const logout = async () => {
    try {
      import('../utils/consoleMigration').then(({ logInfo }) => {
        logInfo('Logging out user', { userId: user?.id });
      });
      
      // Clear cache before logout
      clearAuthCache();
      
      // Perform Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) {
        import('../utils/consoleMigration').then(({ handleAuthError }) => {
          handleAuthError(error, { operation: 'logout' });
        });
      }
      
      // Clear context state immediately
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Clear user context in error monitoring
      errorMonitoring.clearUserContext();
      
      import('../utils/consoleMigration').then(({ logInfo }) => {
        logInfo('Logout completed successfully');
      });
    } catch (error) {
      import('../utils/consoleMigration').then(({ handleAuthError }) => {
        handleAuthError(error, { operation: 'logout_exception' });
      });
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
        import('../utils/consoleMigration').then(({ handleAuthError }) => {
          handleAuthError(error, { operation: 'profile_update' });
        });
        throw error;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      import('../utils/consoleMigration').then(({ handleAuthError }) => {
        handleAuthError(error, { operation: 'profile_update_exception' });
      });
      throw error;
    }
  };

  import('../utils/consoleMigration').then(({ logDebug }) => {
    logDebug('Auth context state', { 
      hasUser: !!user, 
      isAdmin, 
      roles: user?.roles, 
      loading 
    });
  });

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
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
