
import { supabase } from "@/integrations/supabase/client";

export async function saveOrderItems(orderId: string, orderItems: any[]) {
  const orderItemsData = orderItems.map(item => ({
    ...item,
    order_id: orderId
  }));

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (orderItemsError) throw orderItemsError;
}
