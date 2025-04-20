
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '../types/auth';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
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
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
