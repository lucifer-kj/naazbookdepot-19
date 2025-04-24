
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
          
          // Fallback to direct query with better error handling
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role, is_super_admin')
              .eq('id', user.id)
              .single();

            if (userError) {
              if (userError.code === 'PGRST116') {
                console.error('User not found in database:', userError);
                setError('User profile not found. Please contact an administrator.');
                toast.error('User profile not found.');
              } else {
                console.error('Error fetching user data:', userError);
                setError(`Database error: ${userError.message}`);
                toast.error('Failed to verify admin privileges');
              }
              setIsVerified(false);
            } else {
              const isAdmin = userData?.role === 'admin' || userData?.is_super_admin === true;
              setIsVerified(isAdmin);
              
              if (!isAdmin) {
                setError('Access denied. Admin privileges required.');
                toast.error('Access denied. Admin privileges required.');
              }
            }
          } catch (innerError) {
            console.error('Inner verification error:', innerError);
            setError('Failed to verify admin status');
            toast.error('Failed to verify admin status');
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
