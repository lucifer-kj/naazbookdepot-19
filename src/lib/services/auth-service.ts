
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/auth';
import { toast } from 'sonner';
import { fetchUserProfile } from '../utils/auth-utils';
import { logError } from './error-service';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Return success with user data
    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    // Format user-friendly error message
    let errorMessage = 'Sign in failed';
    
    if (error.message) {
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
    
    // Log the error
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

export const signUp = async (email: string, password: string, metadata?: any) => {
  try {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Check for common patterns
    if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
      throw new Error('Password must include a mix of letters and numbers');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    
    toast.success('Check your email for the confirmation link');
    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    // Format user-friendly error message
    let errorMessage = 'Sign up failed';
    
    if (error.message) {
      if (error.message.includes('User already registered')) {
        errorMessage = 'This email is already registered';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
    
    // Log the error
    logError({
      type: 'auth_error',
      error: {
        message: error.message || 'Sign up failed',
        stack: error.stack,
        code: error.code
      },
      context: { email, hasMetadata: !!metadata }
    });
    
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
    
    // Log the error
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

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    toast.success('Check your email for the password reset link');
    return { success: true };
  } catch (error: any) {
    // Format user-friendly error message
    let errorMessage = 'Password reset error';
    
    if (error.message) {
      if (error.message.includes('User not found')) {
        errorMessage = 'No account found with this email';
      } else {
        errorMessage = error.message;
      }
    }
    
    toast.error(errorMessage);
    
    // Log the error
    logError({
      type: 'auth_error',
      error: {
        message: error.message || 'Password reset failed',
        stack: error.stack,
        code: error.code
      },
      context: { email }
    });
    
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    // Validate password strength
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Check for common patterns
    if (/^[a-zA-Z]+$/.test(newPassword) || /^[0-9]+$/.test(newPassword)) {
      throw new Error('Password must include a mix of letters and numbers');
    }
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    
    toast.success('Password updated successfully');
    return { success: true };
  } catch (error: any) {
    toast.error(`Password update error: ${error.message}`);
    
    // Log the error
    logError({
      type: 'auth_error',
      error: {
        message: error.message || 'Password update failed',
        stack: error.stack,
        code: error.code
      }
    });
    
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

    if (error) {
      // Check for common errors
      if (error.code === '23505') { // Unique violation
        throw new Error('This information is already in use by another account');
      } else if (error.code === '42P01') { // Undefined table
        throw new Error('Profile table not found. Please contact support.');
      } else {
        throw error;
      }
    }
    
    const updatedProfile = await fetchUserProfile(userId);
    
    toast.success('Profile updated successfully');
    return { error: null, profile: updatedProfile };
  } catch (error: any) {
    const errorMessage = error.message || 'Profile update failed';
    toast.error(errorMessage);
    
    // Log the error
    logError({
      type: 'auth_error',
      error: {
        message: errorMessage,
        stack: error.stack,
        code: error.code
      },
      context: { userId, profileData: data }
    });
    
    return { error, profile: null };
  }
};

// Utility function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to check password strength
export function getPasswordStrength(password: string): { score: number; feedback: string } {
  let score = 0;
  let feedback = 'Very weak';
  
  if (!password) {
    return { score, feedback };
  }
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety check
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1; // Has lowercase and uppercase
  if (/[0-9]/.test(password)) score += 1; // Has numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // Has special characters
  
  // Set feedback based on score
  if (score === 1) feedback = 'Weak';
  else if (score === 2) feedback = 'Fair';
  else if (score === 3) feedback = 'Good';
  else if (score === 4) feedback = 'Strong';
  else if (score === 5) feedback = 'Very strong';
  
  return { score, feedback };
}
