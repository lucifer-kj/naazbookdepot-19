
import { supabase } from '@/integrations/supabase/client';
import type { AuthUser } from '@/lib/types/auth';

export const authOperations = {
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error, user: null, session: null };
      }

      console.log('Login successful:', { user: !!data.user, session: !!data.session });
      return { error: null, user: data.user, session: data.session };
    } catch (err) {
      console.error('Login exception:', err);
      return { error: err, user: null, session: null };
    }
  },

  register: async (userData: { email: string; password: string; name: string }) => {
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
      return { error };
    }

    return { error: null };
  },

  logout: async () => {
    try {
      console.log('Logging out user...');
      
      // Clear any cached admin status
      sessionStorage.removeItem('admin-status');
      sessionStorage.removeItem('admin-status-expiry');
      localStorage.removeItem('admin-pwa-prompt-dismissed');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Force logout even if there's an error
      }
      
      // Force navigation to home page
      window.location.href = '/';
      
    } catch (err) {
      console.error('Logout exception:', err);
      // Force navigation even on exception
      window.location.href = '/';
    }
  },

  updateProfile: async (user: AuthUser | null, userData: Partial<AuthUser>) => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: userData,
    });

    if (error) {
      console.error('Error updating profile:', error);
    }
  }
};
