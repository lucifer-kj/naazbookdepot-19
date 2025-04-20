
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/auth';
import { logError } from '../services/error-service';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    if (!userId) {
      console.log('No user ID provided to fetchUserProfile');
      return null;
    }

    // Get the user's email directly from auth.user without admin privileges
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    // Create a baseline profile with auth data
    const user = userData.user;
    if (!user) {
      console.error('No user found with ID:', userId);
      return null;
    }
    
    // Check if user email indicates admin status as fallback
    const isAdminEmail = user.email?.includes('admin') || user.email === 'admin@naaz.com';
    
    // Create a basic profile with auth data
    const basicProfile: UserProfile = {
      id: userId,
      first_name: '',
      last_name: '',
      email: user.email || '',
      phone: '',
      is_admin: isAdminEmail,
      is_super_admin: false
    };
    
    // Attempt to get additional profile info from public.users table using a direct query
    // to avoid RLS recursion issues
    try {
      // Use the from method instead of rpc since the RPC function definition isn't available
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name, phone, role, is_super_admin')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching extended profile, using basic profile:', profileError);
        return basicProfile;
      }
      
      if (profileData) {
        // Complete profile with data from users table
        return {
          id: userId,
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: user.email || '',
          phone: profileData.phone || '',
          is_admin: profileData.role === 'admin' || isAdminEmail,
          is_super_admin: !!profileData.is_super_admin
        };
      }
      
      return basicProfile;
    } catch (error) {
      // In case of any uncaught error, still return a basic profile
      console.error('Unexpected error in fetchUserProfile:', error);
      logError({
        type: 'auth_error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error in fetchUserProfile',
          stack: error instanceof Error ? error.stack : undefined
        }
      });
      
      return basicProfile;
    }
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    logError({
      type: 'auth_error',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error in fetchUserProfile',
        stack: error instanceof Error ? error.stack : undefined
      }
    });
    return null;
  }
}

// Utility function to check admin status without causing recursion issues
export async function checkIsAdminByEmail(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    
    if (!email) return false;
    
    // Simple email check for admin privileges
    return email.includes('admin') || email === 'admin@naaz.com';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Function to safely check if the current user is an admin
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    // First try the email-based check as a fallback
    const isAdminByEmail = await checkIsAdminByEmail();
    if (isAdminByEmail) return true;
    
    // Then try the more robust check against the users table
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();
    
    if (error || !userData) {
      console.log('Could not retrieve user role, falling back to email check');
      return isAdminByEmail;
    }
    
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error in isCurrentUserAdmin:', error);
    return false;
  }
}

// Token refresh helper
export async function refreshToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return !!data.session && !error;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}
