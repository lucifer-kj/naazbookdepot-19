import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types/auth';
import { fetchUserProfile, checkIsAdminByEmail } from '../utils/auth-utils';
import * as authService from '../services/auth-service';
import { toast } from 'sonner';
import { logError } from '../services/error-service';

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
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  const refreshUserProfile = useCallback(async (userId: string) => {
    try {
      const userProfile = await fetchUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
        setIsAdmin(userProfile.is_admin);
        setIsSuperAdmin(userProfile.is_super_admin);
        return true;
      } else {
        console.log('No profile data returned from fetchUserProfile, checking admin by email');
        
        const isAdminByEmail = await checkIsAdminByEmail();
        setIsAdmin(isAdminByEmail);
        
        const authUser = await supabase.auth.getUser();
        if (authUser.data?.user?.email) {
          const email = authUser.data.user.email;
          setProfile({
            id: userId,
            first_name: '',
            last_name: '',
            email: email,
            phone: '',
            is_admin: isAdminByEmail,
            is_super_admin: false
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      logError({
        type: 'auth_error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error refreshing profile',
          stack: error instanceof Error ? error.stack : undefined,
        }
      });
      return false;
    }
  }, []);

  const recoverSession = useCallback(async () => {
    try {
      setRefreshAttempts(prev => prev + 1);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setConnectionStatus('connected');
        
        if (data.session.user) {
          await refreshUserProfile(data.session.user.id);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session recovery failed:', error);
      logError({
        type: 'auth_error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error recovering session',
          stack: error instanceof Error ? error.stack : undefined,
        },
        context: { refreshAttempts }
      });
      return false;
    }
  }, [refreshUserProfile, refreshAttempts]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await supabase.auth.getSession();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionStatus('disconnected');
      }
    };
    
    checkConnection();
    
    const intervalId = window.setInterval(() => {
      if (connectionStatus !== 'connected') {
        checkConnection();
      }
    }, 30000);
    
    return () => window.clearInterval(intervalId);
  }, [connectionStatus]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('Auth state changed:', event);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
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

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        refreshUserProfile(currentSession.user.id);
      }
      setIsLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setIsLoading(false);
      setConnectionStatus('disconnected');
      
      logError({
        type: 'auth_error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error getting session',
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUserProfile]);

  useEffect(() => {
    if (connectionStatus === 'disconnected' && refreshAttempts < 3) {
      const timer = setTimeout(() => {
        recoverSession();
      }, 5000 * (refreshAttempts + 1));
      
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, refreshAttempts, recoverSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      return result;
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      logError({
        type: 'auth_error',
        error: {
          message: error.message || 'Sign in failed',
          stack: error.stack,
          code: error.code
        },
        context: { email }
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await authService.signUp(email, password, metadata);
      return result;
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      logError({
        type: 'auth_error',
        error: {
          message: error.message || 'Sign up failed',
          stack: error.stack,
          code: error.code
        },
        context: { email, metadata }
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await authService.signOut();
      return result;
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      logError({
        type: 'auth_error',
        error: {
          message: error.message || 'Sign out failed',
          stack: error.stack
        }
      });
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
      logError({
        type: 'auth_error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error updating profile',
          stack: error instanceof Error ? error.stack : undefined
        },
        context: { profileData: data }
      });
      return { error };
    }
  };

  const reconnect = async () => {
    setConnectionStatus('connecting');
    try {
      const recovered = await recoverSession();
      if (recovered) {
        toast.success('Connection restored');
      } else {
        setConnectionStatus('disconnected');
        toast.error('Unable to restore connection');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      toast.error('Connection recovery failed');
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
        connectionStatus,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        reconnect
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
