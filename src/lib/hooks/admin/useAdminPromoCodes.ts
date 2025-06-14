
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type PromoCode = Tables<'promo_codes'>;

export const usePromoCodes = () => {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromoCode[];
    },
  });
};

export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (promoCode: Omit<PromoCode, 'id' | 'created_at' | 'current_uses' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert(promoCode)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
};

export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async ({ code, orderValue }: { code: string; orderValue: number }) => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) throw new Error('Invalid promo code');

      const promoCode = data as PromoCode;

      // Check validity period
      const now = new Date();
      if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
        throw new Error('Promo code has expired');
      }

      // Check usage limits
      if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
        throw new Error('Promo code usage limit reached');
      }

      // Check minimum order value
      if (promoCode.minimum_order_value && orderValue < promoCode.minimum_order_value) {
        throw new Error(`Minimum order value of ₹${promoCode.minimum_order_value} required`);
      }

      return promoCode;
    },
  });
};
