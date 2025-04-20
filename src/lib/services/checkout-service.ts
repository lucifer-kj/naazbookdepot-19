
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { logActivity } from "@/lib/api/protected-client";
import { saveAddresses } from "./address-service";
import { validateCoupon } from "./coupon-service";
import { createOrder, saveOrderItems, updateInventory } from "./order";
import type { CheckoutInput } from "../types/checkout";

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
        let subtotal = 0;
        const orderItems = [];

        // Prepare order items and check inventory
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
        const { discountAmount } = input.couponCode ? 
          await validateCoupon(input.couponCode, subtotal) : 
          { discountAmount: 0 };

        // Fixed shipping cost and tax rate
        const shippingCost = 100;
        const taxRate = 0.05;
        const taxAmount = (subtotal - discountAmount) * taxRate;
        const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;

        // Start transaction
        const { data: transactionResult } = await supabase.rpc('begin_transaction');
        if (transactionResult && typeof transactionResult === 'object') {
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

        // Commit transaction
        if (transactionId) {
          await supabase.rpc('commit_transaction', { transaction_id: transactionId });
        }

        // Log activity
        await logActivity('place_order', { order_id: order.id, total: totalAmount });

        return {
          order_id: order.id,
          total: totalAmount
        };
      } catch (error: any) {
        // Rollback transaction if started
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
