import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types'; // Assuming your global types

// Define a more specific type for the user data we expect from the 'users' table (public schema)
// This might be different from Supabase's AuthUser or your AppUser type.
export type PublicUser = Pick<Tables<'users'>, 'id' | 'full_name' | 'email' | 'created_at' | 'phone'>;
// If your 'users' table in public schema has a different name or structure, adjust Tables<'users'> accordingly.
// If 'users' table doesn't exist and profile data is in 'profiles', query 'profiles' instead.
// For this task, we'll assume a 'users' table mirroring some auth.users fields plus 'full_name' and 'phone'.

export const useAdminAllUsers = () => {
  return useQuery<PublicUser[], Error>({
    queryKey: ['adminAllUsers'],
    queryFn: async () => {
      // This query targets a public 'users' table, NOT auth.users directly for listing.
      // Ensure RLS is set up on this 'users' table for admins to read.
      // If you store public user profiles in a 'profiles' table linked to auth.users.id,
      // you should query 'profiles' instead. e.g., .from('profiles').select(...).
      // Let's assume for now you have a 'users' table in the public schema that stores this info.
      // If 'full_name' and 'phone' are only in 'auth.users.raw_user_meta_data',
      // listing all users directly from 'auth.users' is a protected operation typically done server-side.
      // The most common pattern is a 'profiles' table.

      // Assuming a 'profiles' table is the standard way to store public user data linked to auth.users
      const { data, error } = await supabase
        .from('profiles') // CHANGED from 'users' to 'profiles' based on common Supabase patterns
        .select('id, full_name, email, created_at, phone'); // Ensure these columns exist in your 'profiles' table

      if (error) {
        console.error("Error fetching users/profiles:", error);
        throw error;
      }
      return data || []; // Return empty array if data is null
    },
  });
};
