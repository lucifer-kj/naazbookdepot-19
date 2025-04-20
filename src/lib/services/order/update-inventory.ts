
import { supabase } from "@/integrations/supabase/client";

export async function updateInventory(orderItems: any[]) {
  for (const item of orderItems) {
    // Get the current inventory
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('quantity_in_stock')
      .eq('id', item.product_id)
      .single();
    
    if (productError) {
      console.error('Error fetching product:', productError);
      throw productError;
    }
    
    // Calculate new inventory level
    const newQuantity = Math.max(0, productData.quantity_in_stock - item.quantity);
    
    // Update the inventory using RPC to ensure atomic operation
    const { error } = await supabase.rpc('decrement', { 
      inc_amount: item.quantity 
    });
      
    if (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }
}
