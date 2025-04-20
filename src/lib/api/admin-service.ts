
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logActivity } from './protected-client';
import { Database } from '@/integrations/supabase/types';

// Type for order status to prevent errors
type OrderStatus = Database['public']['Enums']['order_status'];

// Dashboard statistics
export async function getDashboardStats() {
  try {
    // Get sales statistics
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    // Daily sales
    const { data: dailySales, error: dailyError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfDay);

    // Weekly sales
    const { data: weeklySales, error: weeklyError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfWeek);

    // Monthly sales
    const { data: monthlySales, error: monthlyError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfMonth);

    // Total orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Orders by status - Fixed the groupBy issue
    const { data: ordersByStatus, error: statusError } = await supabase
      .from('orders')
      .select('status, count')
      .select('status, count(*)')
      // Remove the groupBy call as it's not supported in the type definitions
      // The Supabase API actually performs the grouping based on the select statement

    // Low stock products
    const { data: lowStockProducts, error: stockError } = await supabase
      .from('products')
      .select('id, name, sku, quantity_in_stock, price')
      .lt('quantity_in_stock', 10)
      .order('quantity_in_stock');

    // Recent orders
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount,
        status,
        created_at,
        users!inner(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // New customers
    const { data: newCustomers, error: customersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (
      dailyError || 
      weeklyError || 
      monthlyError || 
      ordersError || 
      statusError || 
      stockError || 
      recentError || 
      customersError
    ) {
      throw new Error('Error fetching dashboard data');
    }

    // Calculate totals
    const dailyTotal = dailySales?.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;
    const weeklyTotal = weeklySales?.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;
    const monthlyTotal = monthlySales?.reduce((sum: number, order: any) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Format orders by status for chart
    const formattedOrdersByStatus = ordersByStatus?.map((item: any) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: parseInt(item.count)
    })) || [];

    // Format recent orders
    const formattedRecentOrders = recentOrders?.map((order: any) => ({
      id: order.id,
      customer: `${order.users.first_name} ${order.users.last_name}`,
      date: new Date(order.created_at).toISOString().split('T')[0],
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      total: parseFloat(order.total_amount)
    })) || [];

    // Format new customers
    const formattedNewCustomers = newCustomers?.map((customer: any) => ({
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      date: new Date(customer.created_at).toISOString().split('T')[0]
    })) || [];

    return {
      salesStats: {
        daily: dailyTotal,
        weekly: weeklyTotal,
        monthly: monthlyTotal,
        totalOrders: totalOrders || 0
      },
      ordersByStatus: formattedOrdersByStatus,
      lowStockProducts: lowStockProducts || [],
      recentOrders: formattedRecentOrders,
      newCustomers: formattedNewCustomers
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

// Get all orders with pagination and filtering
export async function getOrders({ 
  page = 1, 
  limit = 10, 
  status = '', 
  search = '', 
  dateFrom = '', 
  dateTo = '' 
}: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        users!inner(first_name, last_name, email)
      `, { count: 'exact' });
    
    // Apply filters - Fixed the status type issue by casting to OrderStatus
    if (status) {
      // Cast the status string to OrderStatus to satisfy type requirements
      query = query.eq('status', status as OrderStatus);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    
    if (search) {
      query = query.or(`id.ilike.%${search}%,users.email.ilike.%${search}%,users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%`);
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      throw error;
    }
    
    // Format orders
    const formattedOrders = data?.map((order: any) => ({
      id: order.id,
      customer: `${order.users.first_name} ${order.users.last_name}`,
      email: order.users.email,
      date: new Date(order.created_at).toISOString().split('T')[0],
      status: order.status,
      total: parseFloat(order.total_amount),
      paymentStatus: order.payment_status,
      raw: order
    })) || [];
    
    return {
      orders: formattedOrders,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

// Get order details
export async function getOrderDetails(id: string) {
  try {
    // Get order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        users(first_name, last_name, email, phone),
        billing_address:billing_address_id(address_line1, address_line2, city, state, postal_code, country),
        shipping_address:shipping_address_id(address_line1, address_line2, city, state, postal_code, country)
      `)
      .eq('id', id)
      .single();
    
    if (orderError) {
      throw orderError;
    }
    
    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products(name, sku, slug, image_url)
      `)
      .eq('order_id', id);
    
    if (itemsError) {
      throw itemsError;
    }
    
    return {
      order,
      items: items || []
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(id: string, status: string) {
  try {
    // Cast the status string to OrderStatus to satisfy type requirements
    const orderStatus = status as OrderStatus;
    
    const { error } = await supabase
      .from('orders')
      .update({ status: orderStatus })
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    // Log activity
    await logActivity('order_status_update', { 
      order_id: id, 
      new_status: status 
    });
    
    toast.success('Order status updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error('Failed to update order status');
    throw error;
  }
}

// Get all users with pagination and filtering
export async function getUsers({ 
  page = 1, 
  limit = 10,
  search = ''
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  try {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    // Apply search filter
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      throw error;
    }
    
    return {
      users: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get activity logs with filtering
export async function getActivityLogs({
  page = 1,
  limit = 20,
  userId = '',
  actionType = '',
  dateFrom = '',
  dateTo = ''
}: {
  page?: number;
  limit?: number;
  userId?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        users:user_id(first_name, last_name, email)
      `, { count: 'exact' });
    
    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (actionType) {
      query = query.eq('action_type', actionType);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    
    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      throw error;
    }
    
    return {
      logs: data || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
}
