
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminVerification = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!user) {
          setError('No user found');
          setIsVerifying(false);
          return;
        }

        // First try to verify using the database function
        const { data: isAdminResult, error: verifyError } = await supabase
          .rpc('is_admin', { user_id: user.id });

        if (verifyError) {
          console.error('Admin verification error:', verifyError);
          // If the RPC fails, try to verify directly through the users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, is_super_admin')
            .eq('id', user.id)
            .single();

          if (userError) {
            throw userError;
          }

          const isAdmin = userData?.role === 'admin' || userData?.is_super_admin === true;
          setIsVerified(isAdmin);
          
          if (!isAdmin) {
            setError('Access denied. Admin privileges required.');
            toast.error('Access denied. Admin privileges required.');
          }
        } else {
          setIsVerified(!!isAdminResult);
          if (!isAdminResult) {
            setError('Access denied. Admin privileges required.');
            toast.error('Access denied. Admin privileges required.');
          }
        }
      } catch (err) {
        console.error('Admin verification error:', err);
        setError('Failed to verify admin privileges');
        toast.error('Failed to verify admin privileges');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, [user]);

  return { isVerifying, isVerified, error };
};
