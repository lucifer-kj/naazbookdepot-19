
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [isAdminState, setIsAdminState] = useState(false);

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
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

  return {
    isAdminState,
    setIsAdminState,
    checkAdminStatus
  };
};
