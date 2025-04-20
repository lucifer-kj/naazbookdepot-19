
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
  is_active: boolean;
  is_automated: boolean;
  seo_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

// Get all FAQs with optional filters
export const getFAQs = async ({
  category,
  search,
  isActive,
}: {
  category?: string;
  search?: string;
  isActive?: boolean;
} = {}) => {
  let query = supabase.from('faqs').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  if (typeof isActive === 'boolean') {
    query = query.eq('is_active', isActive);
  }

  if (search) {
    query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
  }

  const { data, error } = await query.order('display_order');

  if (error) throw error;
  return data as FAQ[];
};

// Get FAQ categories
export const getFAQCategories = async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('category')
    .not('category', 'is', null)
    .order('category');

  if (error) throw error;

  // Remove duplicates and nulls
  const categories = [...new Set(data.map(item => item.category))].filter(Boolean);
  return categories as string[];
};

// Create or update a FAQ
export const saveFAQ = async (faq: Partial<FAQ> & { question: string; answer: string }) => {
  // Ensure required fields are present
  if (!faq.question || !faq.answer) {
    throw new Error('Question and answer are required');
  }
  
  if (faq.id) {
    const { data, error } = await supabase
      .from('faqs')
      .update(faq)
      .eq('id', faq.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('faqs')
      .insert(faq)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Delete a FAQ
export const deleteFAQ = async (id: string) => {
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// React Query hooks
export const useFAQs = (filters: Parameters<typeof getFAQs>[0] = {}) => {
  return useQuery({
    queryKey: ['faqs', filters],
    queryFn: () => getFAQs(filters),
  });
};

export const useFAQCategories = () => {
  return useQuery({
    queryKey: ['faq-categories'],
    queryFn: getFAQCategories,
  });
};

export const useSaveFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ saved successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error(`Error saving FAQ: ${error.message}`);
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error(`Error deleting FAQ: ${error.message}`);
    },
  });
};
