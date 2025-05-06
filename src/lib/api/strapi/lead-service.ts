
import { fetchStrapi } from '../strapi-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface StrapiLead {
  id: string;
  email: string;
  name?: string;
  source?: string;
  createdAt: string;
}

// Submit a lead (e.g., newsletter subscription)
export async function submitLead(email: string, name?: string, source: string = 'newsletter') {
  try {
    return fetchStrapi<StrapiLead>('/leads', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          email,
          name,
          source
        }
      }),
    });
  } catch (error) {
    console.error('Error submitting lead:', error);
    throw error;
  }
}

// React Query hook for lead submission
export function useSubmitLead() {
  return useMutation({
    mutationFn: ({ email, name, source }: { email: string; name?: string; source?: string }) => 
      submitLead(email, name, source),
    onSuccess: () => {
      toast.success('Thank you for subscribing!');
    },
    onError: (error: any) => {
      toast.error(`Subscription failed: ${error.message}`);
    },
  });
}
