
import { supabase } from '@/integrations/supabase/client';
import type { AuthUser } from '@/lib/types/auth';

export const authOperations = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
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
