
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types/auth';
import { fetchUserProfile } from '../utils/auth-utils';
import * as authService from '../services/auth-service';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  const refreshUserProfile = useCallback(async (userId: string) => {
    try {
      const userProfile = await fetchUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setIsAdmin(userProfile.is_admin);
        setIsSuperAdmin(userProfile.is_super_admin);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent deadlocks with Supabase client
          setTimeout(async () => {
            await refreshUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        refreshUserProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      // We don't need to check for error here since authService.signIn handles errors
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await authService.signUp(email, password, metadata);
      // We don't need to check for error here since authService.signUp handles errors
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await authService.signOut();
      // We don't need to check for error here since authService.signOut handles errors
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      throw error;
    }
  };
  
  const resetPassword = authService.resetPassword;
  const updatePassword = authService.updatePassword;
  
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    try {
      const result = await authService.updateProfile(user.id, data);
      if (result.profile) {
        setProfile(result.profile);
        setIsAdmin(result.profile.is_admin);
        setIsSuperAdmin(result.profile.is_super_admin);
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
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
        isSuperAdmin,
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
