import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { AuthContextType, UserProfile } from '../types/auth';
import { fetchUserProfile } from '../utils/auth-utils';
import * as authService from '../services/auth-service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
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

  const signIn = authService.signIn;
  const signUp = authService.signUp;
  const signOut = authService.signOut;
  const resetPassword = authService.resetPassword;
  const updatePassword = authService.updatePassword;
  
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not authenticated') };
    const result = await authService.updateProfile(user.id, data);
    if (result.profile) {
      setProfile(result.profile);
    }
    return result;
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
