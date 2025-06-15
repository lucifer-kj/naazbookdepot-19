
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_CACHE_KEY = 'admin-status';
const ADMIN_CACHE_EXPIRY_KEY = 'admin-status-expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAdminCheck = () => {
  const [isAdminState, setIsAdminState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check cached admin status
  const getCachedAdminStatus = useCallback((userId: string): boolean | null => {
    const cached = sessionStorage.getItem(`${ADMIN_CACHE_KEY}-${userId}`);
    const expiry = sessionStorage.getItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`);
    
    if (cached && expiry && Date.now() < parseInt(expiry)) {
      console.log('Using cached admin status:', cached === 'true');
      return cached === 'true';
    }
    
    return null;
  }, []);

  // Cache admin status
  const setCachedAdminStatus = useCallback((userId: string, isAdmin: boolean) => {
    sessionStorage.setItem(`${ADMIN_CACHE_KEY}-${userId}`, isAdmin.toString());
    sessionStorage.setItem(`${ADMIN_CACHE_EXPIRY_KEY}-${userId}`, (Date.now() + CACHE_DURATION).toString());
  }, []);

  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    if (!userId) {
      console.log('No userId provided for admin check');
      return false;
    }

    try {
      // Check cache first
      const cachedResult = getCachedAdminStatus(userId);
      if (cachedResult !== null) {
        return cachedResult;
      }

      console.log('Checking admin status for user:', userId);
      const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }
      
      const isAdmin = Boolean(isAdminResult);
      console.log('Admin check result:', isAdmin);
      
      // Cache the result
      setCachedAdminStatus(userId, isAdmin);
      
      return isAdmin;
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  }, [getCachedAdminStatus, setCachedAdminStatus]);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAdminCheck = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        if (user) {
          const adminStatus = await checkAdminStatus(user.id);
          if (isMounted) {
            setIsAdminState(adminStatus);
          }
        } else {
          if (isMounted) {
            setIsAdminState(false);
          }
        }
      } catch (error) {
        console.error('Error initializing admin check:', error);
        if (isMounted) {
          setIsAdminState(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAdminCheck();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state change:', event, !!session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        if (isMounted) {
          setIsAdminState(adminStatus);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setIsAdminState(false);
          // Clear cache on logout
          sessionStorage.clear();
        }
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  return {
    isAdmin: isAdminState,
    isAdminState,
    setIsAdminState,
    isLoading,
    checkAdminStatus
  };
};
