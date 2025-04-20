
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sendEmail } from "./utils.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function sendOrderConfirmation(orderId: string): Promise<boolean> {
  try {
    // Fetch order details with items and address
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        status,
        total_amount,
        shipping_cost,
        tax_amount,
        discount_amount,
        payment_method,
        payment_status,
        shipping_address_id,
        billing_address_id,
        user_id,
        order_items (
          id,
          product_id,
          quantity,
          price_per_unit,
          total_price,
          products (
            id,
            name
          )
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order for confirmation email:", orderError);
      return false;
    }

    // Fetch the user's email and name
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", order.user_id)
      .single();

    if (userError || !user) {
      console.error("Error fetching user for confirmation email:", userError);
      return false;
    }

    // Fetch shipping address
    const { data: shippingAddress, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", order.shipping_address_id)
      .single();

    if (addressError || !shippingAddress) {
      console.error("Error fetching shipping address for confirmation email:", addressError);
      return false;
    }

    // Format order items
    const items = order.order_items.map((item: any) => ({
      productName: item.products.name,
      quantity: item.quantity,
      price: item.price_per_unit,
    }));

    // Calculate subtotal from items
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Send the confirmation email
    return await sendEmail({
      to: user.email,
      template: "orderConfirmation",
      data: {
        orderId: order.id,
        customerName: `${user.first_name} ${user.last_name}`,
        orderDate: order.created_at,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        items,
        subtotal,
        shippingCost: order.shipping_cost,
        taxAmount: order.tax_amount,
        discountAmount: order.discount_amount,
        shippingAddress
      }
    });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}
