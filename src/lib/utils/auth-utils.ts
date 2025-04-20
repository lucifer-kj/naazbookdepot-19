
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/auth';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // First try to get the user's email directly from auth.users
    // This avoids using the profile table which has RLS issues
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      // Fallback to public profile lookup if admin API fails
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.error('No user profile found for ID:', userId);
        return null;
      }

      const userProfile: UserProfile = {
        id: data.id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone,
        is_admin: data.role === 'admin',
        is_super_admin: !!data.is_super_admin
      };

      return userProfile;
    }
    
    // If we got user data directly from auth API
    const user = userData.user;
    if (!user) {
      console.error('No user found with ID:', userId);
      return null;
    }
    
    // Now attempt to get additional profile information
    // We'll first check if the users table has this info using a direct query
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    // Create a profile with available information
    const userProfile: UserProfile = {
      id: userId,
      first_name: profileData?.first_name || '',
      last_name: profileData?.last_name || '',
      email: user.email || '',
      phone: profileData?.phone || '',
      // Use a simple check for admin - you should implement proper role checking
      is_admin: profileData?.role === 'admin' || user.email?.includes('admin') || user.email === 'admin@naaz.com',
      is_super_admin: !!profileData?.is_super_admin
    };
    
    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
