
import { supabase } from '@/integrations/supabase/client';
import type { AuthUser } from '@/lib/types/auth';

const ADMIN_CACHE_KEY = 'admin-status';
const ADMIN_CACHE_EXPIRY_KEY = 'admin-status-expiry';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const clearAuthCache = () => {
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
};

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
        console.error('Registration error:', error);
        return { error };
      }

      return { error: null, data };
    } catch (err) {
      console.error('Registration exception:', err);
      return { error: err };
    }
  },

  logout: async () => {
    try {
      console.log('Logging out user...');
      
      // Clear cached admin status and other auth-related data
      clearAuthCache();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('Logout error:', error);
      }
      
      console.log('Logout completed');
      return { error };
      
    } catch (err) {
      console.error('Logout exception:', err);
      return { error: err };
    }
  },

  updateProfile: async (user: AuthUser | null, userData: Partial<AuthUser>) => {
    if (!user) {
      throw new Error('No user provided for profile update');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: userData,
      });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }
};
