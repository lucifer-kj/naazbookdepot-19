
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/auth';
import { toast } from 'sonner';
import { fetchUserProfile } from '../utils/auth-utils';

export const signIn = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    toast.error(`Sign in error: ${error.message}`);
    throw error;
  }
};

export const signUp = async (email: string, password: string, metadata?: any) => {
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
    return { success: true };
  } catch (error: any) {
    toast.error(`Sign up error: ${error.message}`);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    toast.error(`Sign out error: ${error.message}`);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
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

export const updatePassword = async (newPassword: string) => {
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

export const updateProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('users')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      })
      .eq('id', userId);

    if (error) throw error;
    
    const updatedProfile = await fetchUserProfile(userId);
    
    toast.success('Profile updated successfully');
    return { error: null, profile: updatedProfile };
  } catch (error: any) {
    toast.error(`Profile update error: ${error.message}`);
    return { error, profile: null };
  }
};
