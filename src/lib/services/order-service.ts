
import { supabase } from "@/integrations/supabase/client";
import type { OrderStatus } from "./admin-order-service";

interface OrderInput {
  userId: string;
  totalAmount: number;
  shippingAddress: any;
  billingAddress: any;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  couponCode?: string;
}

export async function createOrder(params: OrderInput) {
  const orderData = {
    user_id: params.userId,
    status: 'pending' as OrderStatus,
    total_amount: params.totalAmount,
    shipping_address_id: params.shippingAddress.id,
    billing_address_id: params.billingAddress.id,
    shipping_cost: params.shippingCost,
    tax_amount: params.taxAmount,
    discount_amount: params.discountAmount,
    payment_method: params.paymentMethod,
    payment_status: 'pending',
    coupon_code: params.couponCode || null
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderError) throw orderError;
  return order;
}

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

export async function updateInventory(orderItems: any[]) {
  for (const item of orderItems) {
    // Fix: This was incorrectly typed as a number
    await supabase
      .from('products')
      .update({ 
        quantity_in_stock: supabase.rpc('decrement', { 
          inc_amount: item.quantity 
        }) 
      })
      .eq('id', item.product_id);
  }
}
