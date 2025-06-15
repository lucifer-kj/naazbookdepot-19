
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole } from '@/lib/types/auth';

export const useRoleFetch = () => {
  const fetchUserRole = useCallback(async (userId: string): Promise<string | null> => {
    try {
      console.log('Fetching user role for:', userId);
      const { data: roleResult, error: roleError } = await supabase.rpc('get_current_user_role');
      
      if (roleError) {
        console.error('Error fetching user role:', roleError);
        return null;
      }
      
      console.log('User role result:', roleResult);
      return roleResult;
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      return null;
    }
  }, []);

  const fetchUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
      console.log('Fetching user roles for:', userId);
      
      const role = await fetchUserRole(userId);
      
      if (!role) {
        console.log('No role found for user');
        return [];
      }

      const userRole: UserRole = {
        id: userId,
        role: role as 'super_admin' | 'admin' | 'inventory_manager' | 'customer',
        created_at: new Date().toISOString()
      };

      console.log('Mapped user roles:', [userRole]);
      return [userRole];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, [fetchUserRole]);

  return {
    fetchUserRole,
    fetchUserRoles
  };
};
