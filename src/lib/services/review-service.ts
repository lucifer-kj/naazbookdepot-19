
import { supabase } from "@/integrations/supabase/client";

export const verifyPurchase = async (productId: string, userId: string) => {
  try {
    // Check if user has completed an order with this product
    const { data } = await supabase
      .from('order_items')
      .select(`
        id,
        order:orders!order_items_order_id_fkey (
          status
        )
      `)
      .eq('product_id', productId)
      .in('order.status', ['delivered', 'shipped'])
      .eq('order.user_id', userId)
      .limit(1)
      .maybeSingle();
      
    // Return verification data with correct properties
    return {
      verified: !!data,
      orderId: data?.id || null
    };
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return { verified: false, orderId: null };
  }
};
