
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAdminVerification = () => {
  const { user, isAdmin } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        if (!user) {
          setError('No user found');
          return;
        }

        // Verify admin status using the RLS-safe function we created
        const { data, error: verifyError } = await supabase
          .rpc('is_admin', { user_id: user.id });

        if (verifyError) {
          throw verifyError;
        }

        setIsVerified(!!data);
        if (!data) {
          setError('Access denied. Admin privileges required.');
          toast.error('Access denied. Admin privileges required.');
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
  }, [user, isAdmin]);

  return { isVerifying, isVerified, error };
};
