
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrderStatus } from "./admin-order-service";
import { logActivity } from "@/lib/api/protected-client";

export interface CheckoutInput {
  shippingAddress: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
  };
  billingAddress: {
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default?: boolean;
  };
  sameAsBilling: boolean;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

/**
 * Process a checkout operation, creating orders and handling inventory
 */
export const useCheckout = () => {
  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Store transaction ID for rollback if needed
      let transactionId: string | null = null;
      
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch cart items with product details
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select(`
            id,
            product_id,
            quantity,
            product:products(
              id,
              name,
              price,
              sale_price,
              quantity_in_stock
            )
          `)
          .eq('user_id', user.id);

        if (cartError) throw cartError;
        
        if (!cartItems || cartItems.length === 0) {
          throw new Error('Your cart is empty');
        }

        // Calculate order totals and prepare items
        const { subtotal, orderItems, discountAmount } = await processCartItems(cartItems, input.couponCode);
        
        // Fixed shipping cost, can be dynamic
        const shippingCost = 100; 
        // 5% tax rate, can be dynamic based on region
        const taxRate = 0.05; 
        // Calculate tax
        const taxAmount = (subtotal - discountAmount) * taxRate;
        // Calculate total
        const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

        // Start a transaction
        const { data: transactionResult } = await supabase.rpc('begin_transaction');
        if (transactionResult && typeof transactionResult === 'object') {
          // Safely extract transaction_id from JSON object
          transactionId = (transactionResult as any).transaction_id || null;
        }

        // Save addresses
        const { shippingAddress, billingAddress } = await saveAddresses(user.id, input);

        // Create order
        const order = await createOrder({
          userId: user.id,
          totalAmount,
          shippingAddress,
          billingAddress,
          shippingCost,
          taxAmount,
          discountAmount,
          paymentMethod: input.paymentMethod,
          couponCode: input.couponCode
        });

        // Add order items
        await saveOrderItems(order.id, orderItems);

        // Add customer note if provided
        if (input.notes) {
          await supabase.functions
            .invoke('order-helpers', {
              body: {
                action: 'addOrderNote',
                params: {
                  orderId: order.id,
                  userId: user.id,
                  note: input.notes,
                  isCustomerVisible: true
                }
              }
            });
        }

        // Update product inventory
        await updateInventory(orderItems);

        // Clear the cart
        const { error: clearCartError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (clearCartError) throw clearCartError;

        // Commit the transaction
        if (transactionId) {
          await supabase.rpc('commit_transaction', { transaction_id: transactionId });
        }

        // Log activity (using the extracted logActivity function that handles proper awaiting)
        await logActivity('place_order', { order_id: order.id, total: totalAmount });

        return {
          order_id: order.id,
          total: totalAmount
        };
      } catch (error: any) {
        // Rollback the transaction if started
        if (transactionId) {
          await supabase.rpc('rollback_transaction', { transaction_id: transactionId });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`Order placed successfully! Order #${data.order_id.substring(0, 8)}`);
    },
    onError: (error: any) => {
      toast.error(`Error placing order: ${error.message}`);
    }
  });
};

/**
 * Process cart items, checking inventory and calculating totals
 */
async function processCartItems(cartItems: any[], couponCode?: string) {
  // Calculate order totals
  let subtotal = 0;
  let discountAmount = 0;

  // Prepare order items and check inventory
  const orderItems = [];
  for (const item of cartItems) {
    const { product, quantity } = item;
    
    // Check if product is in stock
    if (product.quantity_in_stock < quantity) {
      throw new Error(`Not enough stock for ${product.name}. Only ${product.quantity_in_stock} available.`);
    }
    
    // Calculate price
    const price = product.sale_price || product.price;
    const totalItemPrice = price * quantity;
    
    subtotal += totalItemPrice;
    
    orderItems.push({
      product_id: product.id,
      quantity,
      price_per_unit: price,
      total_price: totalItemPrice
    });
  }

  // Apply coupon if provided
  if (couponCode) {
    discountAmount = await applyCoupon(couponCode, subtotal);
  }

  return { subtotal, orderItems, discountAmount };
}

/**
 * Apply coupon code and return discount amount
 */
async function applyCoupon(couponCode: string, subtotal: number): Promise<number> {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode)
    .eq('is_active', true)
    .maybeSingle();

  if (!coupon) return 0;

  // Check coupon validity
  const now = new Date();
  if (
    new Date(coupon.start_date) <= now &&
    new Date(coupon.end_date) >= now &&
    (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) &&
    coupon.min_purchase <= subtotal
  ) {
    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = subtotal * (coupon.discount_value / 100);
    } else {
      // Fixed amount
      discountAmount = Math.min(coupon.discount_value, subtotal);
    }

    // Update coupon usage if applied successfully
    if (discountAmount > 0) {
      await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('code', couponCode);
    }

    return discountAmount;
  }

  return 0;
}

/**
 * Save shipping and billing addresses
 */
async function saveAddresses(userId: string, input: CheckoutInput) {
  // Save shipping address
  const shippingAddressData = {
    ...input.shippingAddress,
    user_id: userId
  };
  const { data: shippingAddress, error: shippingAddressError } = await supabase
    .from('addresses')
    .insert(shippingAddressData)
    .select()
    .single();

  if (shippingAddressError) throw shippingAddressError;

  // Save billing address (if different from shipping)
  let billingAddress;
  if (input.sameAsBilling) {
    billingAddress = shippingAddress;
  } else {
    const billingAddressInput = {
      ...input.billingAddress,
      user_id: userId
    };
    const { data: billingData, error: billingAddressError } = await supabase
      .from('addresses')
      .insert(billingAddressInput)
      .select()
      .single();

    if (billingAddressError) throw billingAddressError;
    billingAddress = billingData;
  }

  return { shippingAddress, billingAddress };
}

/**
 * Create order record
 */
async function createOrder(params: {
  userId: string;
  totalAmount: number;
  shippingAddress: any;
  billingAddress: any;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  couponCode?: string;
}) {
  // Create order with properly typed status
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

/**
 * Save order items
 */
async function saveOrderItems(orderId: string, orderItems: any[]) {
  const orderItemsData = orderItems.map(item => ({
    ...item,
    order_id: orderId
  }));

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (orderItemsError) throw orderItemsError;
}

/**
 * Update product inventory
 */
async function updateInventory(orderItems: any[]) {
  for (const item of orderItems) {
    const { error: inventoryError } = await supabase
      .from('products')
      .update({ 
        quantity_in_stock: supabase.rpc('decrement', { 
          inc_amount: item.quantity 
        }) 
      })
      .eq('id', item.product_id);

    if (inventoryError) throw inventoryError;
  }
}
