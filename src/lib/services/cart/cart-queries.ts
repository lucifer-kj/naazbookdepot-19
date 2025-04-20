
import { supabase } from "@/integrations/supabase/client";
import type { CartSummary, CartItem, AddToCartInput } from "@/lib/types/cart";

export async function fetchCartItems() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      product_id,
      quantity,
      product:products(
        id,
        name,
        slug,
        price,
        sale_price,
        quantity_in_stock
      )
    `)
    .eq('user_id', user.id);

  if (error) throw error;

  // Calculate subtotal
  let subtotal = 0;
  let itemCount = 0;
  
  const items = (data || []).map((item: any) => {
    const price = item.product?.sale_price || item.product?.price || 0;
    subtotal += price * item.quantity;
    itemCount += item.quantity;
    return item as CartItem;
  });

  return {
    items,
    subtotal,
    itemCount
  } as CartSummary;
}

export async function addItemToCart({ productId, quantity = 1 }: AddToCartInput) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check product stock
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('quantity_in_stock, name')
    .eq('id', productId)
    .single();

  if (productError) throw productError;

  if (!product || product.quantity_in_stock < quantity) {
    throw new Error(`Not enough stock for ${product?.name || 'product'}. Only ${product?.quantity_in_stock || 0} available.`);
  }

  // Check existing cart item
  const { data: existingItem, error: existingItemError } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existingItemError) throw existingItemError;

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    
    if (newQuantity > product.quantity_in_stock) {
      throw new Error(`Cannot add ${quantity} more. Only ${product.quantity_in_stock - existingItem.quantity} more available.`);
    }
    
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', existingItem.id);

    if (updateError) throw updateError;
    
    return { updated: true, quantity: newQuantity };
  }

  const { error: insertError } = await supabase
    .from('cart_items')
    .insert({
      user_id: user.id,
      product_id: productId,
      quantity
    });

  if (insertError) throw insertError;
  
  return { added: true, quantity };
}
