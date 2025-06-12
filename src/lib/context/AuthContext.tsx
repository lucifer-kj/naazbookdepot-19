import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Define a Profile type (can be expanded later)
interface Profile {
  id?: string; // Supabase Auth User ID
  full_name?: string;
  phone?: string;
  // Add other profile fields as needed, e.g., avatar_url
}

// Combine SupabaseUser with our Profile data for the app's user object
// For simplicity, we can make Profile fields optional on SupabaseUser or create a merged type.
// Let's try to keep `user` as `SupabaseUser` and manage profile separately if complex,
// or merge `full_name` if available from `user_metadata`.
export type AppUser = SupabaseUser & { profile?: Profile };


interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // To handle initial session loading
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  register: (userData: any) => Promise<{ success: boolean; error?: any; requiresConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Profile) => Promise<{ success: boolean; error?: any; data?: Profile | null }>;
  // Orders and Addresses will be handled by dedicated hooks
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // You might fetch profile data here and combine it
        // For now, user_metadata might contain full_name if set during sign-up
        const appUser: AppUser = {
          ...session.user,
          profile: { full_name: session.user.user_metadata?.full_name }
        };
        setUser(appUser);
      }
      setIsLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const appUser: AppUser = {
          ...session.user,
          profile: { full_name: session.user.user_metadata?.full_name }
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      // If loading was due to no initial session, this ensures it's set to false after auth state change.
      // However, initial getSession() should handle the very first load.
      if (isLoading) setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isLoading]); // Added isLoading to dependencies to ensure it runs once after initial load attempt

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) return { success: false, error };
    if (data.user) return { success: true };
    return { success: false, error: { message: "Login failed, user data not found."}}; // Should not happen if no error
  };

  const register = async (userData: { email: string, password: string, name?: string, phone?: string }) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          // phone: userData.phone, // Store phone in user_metadata if desired
        }
      }
    });
    setIsLoading(false);
    if (error) return { success: false, error };

    // If sign up requires email confirmation, data.user will exist but data.session might be null.
    const requiresConfirmation = data.user && !data.session;
    return { success: !!data.user, error, requiresConfirmation };
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    // onAuthStateChange will handle setting user to null and isLoading to false
    // Forcing isLoading to false here in case onAuthStateChange is slow or doesn't fire as expected in some edge cases
    setIsLoading(false);
  };

  const updateProfile = async (profileData: Profile) => {
    if (!user) return { success: false, error: { message: "User not authenticated" } };
    setIsLoading(true);

    // 1. Update public.users table (replace 'users' with your actual table name if different)
    const { data: profileUpdateData, error: profileUpdateError } = await supabase
      .from('users')
      .update({ full_name: profileData.full_name /* other fields */ })
      .eq('id', user.id) // Assuming user.id is the foreign key to users.id
      .select()
      .single();

    if (profileUpdateError) {
      setIsLoading(false);
      return { success: false, error: profileUpdateError, data: null };
    }

    // 2. Optionally, update Supabase Auth user_metadata if some profile fields are stored there
    // For example, if full_name is also in user_metadata for quick access
    if (profileData.full_name && profileData.full_name !== user.user_metadata?.full_name) {
        const { data: userUpdateData, error: userUpdateError } = await supabase.auth.updateUser({
            data: { ...user.user_metadata, full_name: profileData.full_name }
        });
        if (userUpdateError) {
            // Log this error but might not fail the whole operation if profiles table updated
            console.error("Error updating user_metadata:", userUpdateError);
        } else if (userUpdateData) {
            // Update local user state with new metadata
            setUser(prevUser => prevUser ? ({ ...prevUser, ...userUpdateData.user, user_metadata: { ...prevUser.user_metadata, ...userUpdateData.user?.user_metadata } }) : null);
        }
    }

    // Update local user state, specifically the profile part or full_name from user_metadata
    // This ensures the UI reflects changes immediately if user object in context is used for display
    if (profileUpdateData) {
       setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profile: { ...(prevUser.profile || {}), ...profileUpdateData },
          // If full_name is primarily from user_metadata, ensure it's updated from there
          user_metadata: { ...(prevUser.user_metadata || {}), full_name: profileData.full_name }
        };
      });
    }

    setIsLoading(false);
    return { success: true, data: profileUpdateData as Profile };
  };


  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
