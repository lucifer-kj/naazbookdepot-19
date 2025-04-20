
import { supabase } from '@/integrations/supabase/client';
import { callProtectedApi, logActivity } from '@/lib/api/protected-client';
import { toast } from 'sonner';

// Define types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type TimeRange = 'daily' | 'weekly' | 'monthly';

interface OrdersFilter {
  page?: number;
  limit?: number;
  status?: OrderStatus | '';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Get sales summary
    const salesSummary = {
      daily: await getSalesSummary('daily'),
      weekly: await getSalesSummary('weekly'),
      monthly: await getSalesSummary('monthly')
    };
    
    // Get orders by status
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('status, count')
      .order('count', { ascending: false });
    
    if (ordersError) throw ordersError;
    
    const ordersByStatus = ordersData.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {
      pending: 0,
      processing: 0, 
      shipped: 0,
      delivered: 0,
      cancelled: 0
    });
    
    return {
      salesSummary,
      ordersByStatus
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get sales summary for a specific time range
const getSalesSummary = async (timeRange: TimeRange) => {
  try {
    let intervalStart: Date;
    let previousIntervalStart: Date;
    const now = new Date();
    
    switch (timeRange) {
      case 'daily':
        intervalStart = new Date(now);
        intervalStart.setHours(0, 0, 0, 0);
        previousIntervalStart = new Date(intervalStart);
        previousIntervalStart.setDate(previousIntervalStart.getDate() - 1);
        break;
      case 'weekly':
        intervalStart = new Date(now);
        intervalStart.setDate(intervalStart.getDate() - intervalStart.getDay());
        intervalStart.setHours(0, 0, 0, 0);
        previousIntervalStart = new Date(intervalStart);
        previousIntervalStart.setDate(previousIntervalStart.getDate() - 7);
        break;
      case 'monthly':
        intervalStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousIntervalStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
    }
    
    // Get current period sales
    const { data: currentData, error: currentError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', intervalStart.toISOString())
      .not('status', 'eq', 'cancelled');
    
    if (currentError) throw currentError;
    
    // Get previous period sales
    const { data: previousData, error: previousError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousIntervalStart.toISOString())
      .lt('created_at', intervalStart.toISOString())
      .not('status', 'eq', 'cancelled');
    
    if (previousError) throw previousError;
    
    const currentAmount = currentData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const previousAmount = previousData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    // Calculate percentage change
    let percentChange = 0;
    if (previousAmount > 0) {
      percentChange = Math.round(((currentAmount - previousAmount) / previousAmount) * 100);
    } else if (currentAmount > 0) {
      percentChange = 100; // If previous was 0 and current is > 0, that's a 100% increase
    }
    
    return {
      amount: currentAmount,
      change: percentChange
    };
  } catch (error) {
    console.error(`Error fetching ${timeRange} sales:`, error);
    return { amount: 0, change: 0 };
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        user_id,
        users:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Format the response
    return data.map(order => ({
      ...order,
      customer: {
        name: order.users ? `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() : 'Guest',
        email: order.users?.email || 'N/A'
      }
    }));
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
};

// Get new customers
export const getNewCustomers = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching new customers:', error);
    return [];
  }
};

// Get low stock products
export const getLowStockProducts = async (limit = 5, threshold = 10) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('quantity_in_stock', threshold)
      .order('quantity_in_stock', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

// Get all orders with pagination and filtering
export const getOrders = async (filters: OrdersFilter = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      search = '',
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortDirection = 'desc'
    } = filters;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Start building the query
    let query = supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        user_id,
        users:user_id (
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status as OrderStatus);
    }
    
    if (search) {
      query = query.or(`id.ilike.%${search}%, users.first_name.ilike.%${search}%, users.last_name.ilike.%${search}%`);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Format the response
    const orders = data.map(order => ({
      ...order,
      customer: {
        name: order.users ? `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() : 'Guest',
        email: order.users?.email || 'N/A'
      }
    }));
    
    return {
      orders,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get order details
export const getOrderDetails = async (orderId: string) => {
  try {
    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_id (
          *
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    
    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:product_id (
          name,
          slug,
          sku
        )
      `)
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    // Fetch shipping address
    const { data: shippingAddress, error: shippingError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', order.shipping_address_id)
      .single();
    
    if (shippingError && shippingError.code !== 'PGRST116') throw shippingError;
    
    // Fetch billing address
    const { data: billingAddress, error: billingError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', order.billing_address_id)
      .single();
    
    if (billingError && billingError.code !== 'PGRST116') throw billingError;
    
    return {
      ...order,
      items,
      shippingAddress,
      billingAddress
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) throw error;
    
    // Log the activity
    await logActivity('update_order_status', {
      orderId,
      newStatus: status
    });
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get users with pagination and filtering
export const getUsers = async (
  page = 1,
  limit = 10,
  search = '',
  sortBy = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc'
) => {
  try {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%, last_name.ilike.%${search}%, email.ilike.%${search}%`);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      users: data,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user details with order history
export const getUserDetails = async (userId: string) => {
  try {
    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Fetch addresses
    const { data: addresses, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);
    
    if (addressesError) throw addressesError;
    
    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (ordersError) throw ordersError;
    
    return {
      ...user,
      addresses,
      orders
    };
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

// Get activity logs
export const getActivityLogs = async (
  page = 1,
  limit = 20,
  filters: { 
    user_id?: string; 
    action_type?: string; 
    date_from?: string; 
    date_to?: string;
  } = {}
) => {
  try {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('activity_logs')
      .select(`
        *,
        user:user_id (
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });
    
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    
    if (filters.action_type) {
      query = query.eq('action_type', filters.action_type);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    // Apply sorting and pagination
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      logs: data,
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};
