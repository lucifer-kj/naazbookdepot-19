
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminStatus = useCallback(async (userId?: string): Promise<boolean> => {
    try {
      console.log('Checking admin status for user:', userId);
      const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }
      
      console.log('Admin check result:', isAdminResult);
      return isAdminResult || false;
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkCurrentUserAdmin = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const adminStatus = await checkAdminStatus(user.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    checkCurrentUserAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  return {
    isAdmin,
    isLoading,
    checkAdminStatus
  };
};
