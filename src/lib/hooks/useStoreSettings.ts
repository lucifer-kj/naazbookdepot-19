import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// This ID should be constant and known. It represents the single row in your store_settings table.
// You must create a row with this ID in your Supabase table manually or ensure your upsert logic handles it.
const FIXED_SETTINGS_ID = '00000000-0000-0000-0000-000000000001'; // Example UUID

export type StoreSettings = {
  id: string;
  store_name?: string | null;
  contact_email?: string | null;
  support_phone?: string | null;
  // Add other settings fields here as needed, e.g.:
  // address?: string | null;
  // social_media_links?: Json | null;
  // currency_default?: string | null;
  updated_at?: string | null; // Supabase timestampz
};

// Hook to fetch store settings
export const useFetchStoreSettings = () => {
  return useQuery<StoreSettings | null, Error>({
    queryKey: ['storeSettings', FIXED_SETTINGS_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', FIXED_SETTINGS_ID)
        .maybeSingle(); // Use maybeSingle as the row might not exist initially

      if (error) {
        console.error('Error fetching store settings:', error);
        throw error;
      }
      return data;
    },
  });
};

// Hook to update store settings
export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<StoreSettings | null, Error, Partial<Omit<StoreSettings, 'id' | 'updated_at'>>>({
    mutationFn: async (settingsData) => {
      // Ensure the fixed ID is part of the upsert data, and 'updated_at' is handled by db.
      const dataToUpsert = {
        id: FIXED_SETTINGS_ID,
        ...settingsData,
        updated_at: new Date().toISOString(), // Explicitly set updated_at on client, or let db handle it
      };

      const { data, error } = await supabase
        .from('store_settings')
        .upsert(dataToUpsert, { onConflict: 'id' }) // Upsert based on the 'id' conflict
        .select()
        .single();

      if (error) {
        console.error('Error updating store settings:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch the storeSettings query to get fresh data
      queryClient.invalidateQueries({ queryKey: ['storeSettings', FIXED_SETTINGS_ID] });
      // Optionally, you can directly set the query data if needed, but invalidation is usually safer.
      // queryClient.setQueryData(['storeSettings', FIXED_SETTINGS_ID], data);
    },
  });
};
