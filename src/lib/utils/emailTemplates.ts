
interface OrderItem {
  quantity: number;
  products?: {
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  total: number;
  order_items?: OrderItem[];
}

interface Customer {
  name?: string;
  email?: string;
}

export const generateOrderConfirmationEmail = (order: Order, customer: Customer) => {
  const orderItems = order.order_items?.map((item: OrderItem) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.products?.name || 'Product'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.price}
      </td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2D5016; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .order-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f5f5f5; padding: 10px; text-align: left; }
        .total { font-weight: bold; font-size: 18px; color: #2D5016; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
        </div>
        
        <div class="content">
          <p>Dear ${customer.name || 'Customer'},</p>
          
          <p>We're excited to confirm that we've received your order. Here are the details:</p>
          
          <div class="order-details">
            <h3>Order #${order.order_number}</h3>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <h4>Items Ordered:</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems}
                <tr>
                  <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">
                    Total:
                  </td>
                  <td style="padding: 15px 10px; text-align: right;" class="total">
                    ₹${order.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p>We'll send you another email with tracking information once your order ships.</p>
          
          <p>Thank you for choosing us!</p>
          
          <p>Best regards,<br>The Naaz Books Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateOrderStatusUpdateEmail = (order: Order, customer: Customer, newStatus: string) => {
  const statusMessages = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const message = statusMessages[newStatus as keyof typeof statusMessages] || `Your order status has been updated to ${newStatus}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2D5016; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .status-update { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .status { font-size: 24px; font-weight: bold; color: #2D5016; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Update</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customer.name || 'Customer'},</p>
          
          <div class="status-update">
            <h3>Order #${order.order_number}</h3>
            <div class="status">${message}</div>
            ${order.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.tracking_number}</p>` : ''}
          </div>
          
          <p>You can track your order status anytime by visiting your account dashboard.</p>
          
          <p>Thank you for choosing us!</p>
          
          <p>Best regards,<br>The Naaz Books Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateWelcomeEmail = (customer: Customer) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2D5016; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Naaz Books!</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customer.name || 'Customer'},</p>
          
          <p>Welcome to Naaz Books! We're thrilled to have you join our community of book lovers.</p>
          
          <p>As a member, you can:</p>
          <ul>
            <li>Browse our extensive collection of books</li>
            <li>Save your favorite books to your wishlist</li>
            <li>Track your orders and order history</li>
            <li>Receive personalized recommendations</li>
          </ul>
          
          <p>Start exploring our collection today and discover your next great read!</p>
          
          <p>Happy reading!</p>
          
          <p>Best regards,<br>The Naaz Books Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
