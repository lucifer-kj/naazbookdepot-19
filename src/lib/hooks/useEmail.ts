
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const useSendEmail = () => {
  return useMutation({
    mutationFn: async (emailData: EmailData) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });

      if (error) throw error;
      return data;
    },
  });
};
