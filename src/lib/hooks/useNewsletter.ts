
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNewsletterSubscription = () => {
  return useMutation({
    mutationFn: async ({ email, name }: { email: string; name?: string }) => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email,
        })
        .select()
        .single();

      if (error) {
        // If email already exists, update is_active to true
        if (error.code === '23505') {
          const { data: updatedData, error: updateError } = await supabase
            .from('newsletter_subscriptions')
            .update({ is_active: true })
            .eq('email', email)
            .select()
            .single();

          if (updateError) throw updateError;
          return updatedData;
        }
        throw error;
      }

      return data;
    },
  });
};

export const useNewsletterUnsubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .update({ is_active: false })
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};
