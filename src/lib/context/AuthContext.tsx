
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: Record<string, any>) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user signs out, clear profile
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsAdmin(false);
        }
        
        // If user signs in, fetch profile in a setTimeout to avoid Supabase deadlock
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Record<string, any>) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else if (result.data.user) {
        toast.success('Registration successful. Please check your email to verify your account.');
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred during signup');
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Login successful');
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login');
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Password reset instructions sent to your email');
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred');
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const result = await supabase.auth.updateUser({
        password
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Password updated successfully');
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('An unexpected error occurred');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return { error: new Error('Not authenticated') };
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
        
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      // Refresh profile data
      fetchUserProfile(user.id);
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An unexpected error occurred');
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
