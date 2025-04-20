
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{error?: any}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(userId: string) {
  try {
    // Use 'users' table instead of 'profiles' which doesn't exist
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Transform data to match UserProfile interface if needed
    const userProfile: UserProfile = {
      id: data.id,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      email: data.email || '',
      avatar_url: data.avatar_url,
      phone: data.phone,
      is_admin: data.is_admin || false
    };

    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid potential race conditions
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.is_admin ?? false);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id).then(userProfile => {
          setProfile(userProfile);
          setIsAdmin(userProfile?.is_admin ?? false);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(`Sign in error: ${error.message}`);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      
      toast.success('Check your email for the confirmation link');
    } catch (error: any) {
      toast.error(`Sign up error: ${error.message}`);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast.error(`Sign out error: ${error.message}`);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Check your email for the password reset link');
    } catch (error: any) {
      toast.error(`Password reset error: ${error.message}`);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(`Password update error: ${error.message}`);
      throw error;
    }
  };

  // Add updateProfile method
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('users')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          avatar_url: data.avatar_url,
          // Don't allow updating email or is_admin through this method for security
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh the profile after update
      const updatedProfile = await fetchUserProfile(user.id);
      setProfile(updatedProfile);
      
      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      toast.error(`Profile update error: ${error.message}`);
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
