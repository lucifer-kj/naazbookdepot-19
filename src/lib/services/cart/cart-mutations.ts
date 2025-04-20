
import { supabase } from "@/integrations/supabase/client";

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { removed: true };
  }

  const { data: cartItem, error: cartItemError } = await supabase
    .from('cart_items')
    .select('product_id')
    .eq('id', cartItemId)
    .eq('user_id', user.id)
    .single();

  if (cartItemError) throw cartItemError;

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('quantity_in_stock, name')
    .eq('id', cartItem.product_id)
    .single();

  if (productError) throw productError;

  if (product.quantity_in_stock < quantity) {
    throw new Error(`Not enough stock for ${product.name}. Only ${product.quantity_in_stock} available.`);
  }

  const { error: updateError } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .eq('user_id', user.id);

  if (updateError) throw updateError;
  
  return { updated: true, quantity };
}

export async function removeFromCart(cartItemId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id);

  if (error) throw error;
  
  return { removed: true };
}

export async function clearCart() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
  
  return { cleared: true };
}
