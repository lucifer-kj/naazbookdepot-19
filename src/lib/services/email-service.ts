
import { supabase } from "@/integrations/supabase/client";

export type EmailTemplate = 
  | "orderConfirmation" 
  | "shippingUpdate" 
  | "passwordReset" 
  | "welcomeEmail";

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

/**
 * Sends a transactional email using the Supabase Edge Function
 */
export async function sendEmail({ to, template, data }: SendEmailParams): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: { to, template, data }
    });

    if (error) {
      console.error("Error sending email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Sends an order confirmation email
 */
export async function sendOrderConfirmationEmail(orderId: string): Promise<boolean> {
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

/**
 * Sends a shipping update email
 */
export async function sendShippingUpdateEmail(
  orderId: string, 
  trackingInfo: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    trackingUrl?: string;
  }
): Promise<boolean> {
  try {
    // Fetch order and user details (similar to order confirmation)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        shipping_address_id
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order for shipping email:", orderError);
      return false;
    }

    // Fetch the user's email and name
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", order.user_id)
      .single();

    if (userError || !user) {
      console.error("Error fetching user for shipping email:", userError);
      return false;
    }

    // Fetch shipping address
    const { data: shippingAddress, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", order.shipping_address_id)
      .single();

    if (addressError || !shippingAddress) {
      console.error("Error fetching shipping address for shipping email:", addressError);
      return false;
    }

    // Send the shipping update email
    return await sendEmail({
      to: user.email,
      template: "shippingUpdate",
      data: {
        orderId: order.id,
        customerName: `${user.first_name} ${user.last_name}`,
        carrier: trackingInfo.carrier,
        trackingNumber: trackingInfo.trackingNumber,
        estimatedDelivery: trackingInfo.estimatedDelivery,
        trackingUrl: trackingInfo.trackingUrl,
        shippingAddress
      }
    });
  } catch (error) {
    console.error("Failed to send shipping update email:", error);
    return false;
  }
}

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(userId: string): Promise<boolean> {
  try {
    // Fetch user information
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      console.error("Error fetching user for welcome email:", userError);
      return false;
    }

    // Send welcome email
    return await sendEmail({
      to: user.email,
      template: "welcomeEmail",
      data: {
        customerName: `${user.first_name} ${user.last_name}`,
        storeUrl: window.location.origin
      }
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    // Construct reset URL
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    // Send password reset email
    return await sendEmail({
      to: email,
      template: "passwordReset",
      data: {
        resetUrl
      }
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}
