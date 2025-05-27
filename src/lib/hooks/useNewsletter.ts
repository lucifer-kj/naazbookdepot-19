
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useNewsletterSubscription = () => {
  return useMutation({
    mutationFn: async ({ email, name }: { email: string; name?: string }) => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useNewsletterUnsubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', email);

      if (error) throw error;
    },
  });
};
