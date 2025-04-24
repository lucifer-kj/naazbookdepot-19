
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderStatus } from '@/lib/api/admin-service';

interface DashboardData {
  salesSummary: {
    daily: { amount: number; change: number };
    weekly: { amount: number; change: number };
    monthly: { amount: number; change: number };
  };
  ordersByStatus: Record<string, number>;
  recentOrders: any[];
  newCustomers: any[];
  lowStockProducts: any[];
}

const useDashboardData = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    salesSummary: {
      daily: { amount: 0, change: 0 },
      weekly: { amount: 0, change: 0 },
      monthly: { amount: 0, change: 0 }
    },
    ordersByStatus: {},
    recentOrders: [],
    newCustomers: [],
    lowStockProducts: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch low stock products
        const { data: lowStockProducts, error: lowStockError } = await supabase
          .from('products')
          .select('id, name, sku, price, quantity_in_stock')
          .lt('quantity_in_stock', 10)
          .order('quantity_in_stock', { ascending: true })
          .limit(5);

        if (lowStockError) {
          console.error('Error fetching low stock products:', lowStockError);
          throw new Error(`Failed to fetch low stock products: ${lowStockError.message}`);
        }

        // Fetch recent orders with customer info
        const { data: recentOrders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id, created_at, status, total_amount,
            user_id,
            users:user_id (first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) {
          console.error('Error fetching recent orders:', ordersError);
          throw new Error(`Failed to fetch recent orders: ${ordersError.message}`);
        }

        // Format the orders data for display
        const formattedOrders = recentOrders?.map(order => ({
          id: order.id,
          created_at: order.created_at,
          status: order.status,
          total_amount: order.total_amount,
          customer: {
            name: order.users ? `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() || 'Guest' : 'Guest',
            email: order.users?.email || 'guest@example.com'
          }
        })) || [];

        // Count orders by status
        const { data: statusCounts, error: statusError } = await supabase
          .from('orders')
          .select('status, count')
          .group('status');

        if (statusError) {
          console.error('Error fetching order status counts:', statusError);
          throw new Error(`Failed to fetch order status counts: ${statusError.message}`);
        }

        // Convert to expected format
        const ordersByStatus: Record<string, number> = {};
        statusCounts?.forEach(item => {
          ordersByStatus[item.status] = Number(item.count);
        });

        // 4. Get sales summary (still using the simpler calculation for now)
        const getSalesSummary = async (timeframe: string) => {
          try {
            // This is a simplified calculation for the example
            // In a real app, you'd want to use more accurate date filtering
            let amount = 0;
            let change = 0;
            
            if (timeframe === 'daily') {
              amount = 1000;
              change = 5;
            } else if (timeframe === 'weekly') {
              amount = 5000;
              change = 10;
            } else {
              amount = 20000;
              change = 15;
            }
            
            return { amount, change };
          } catch (error) {
            console.error(`Error calculating ${timeframe} sales:`, error);
            return { amount: 0, change: 0 };
          }
        };
        
        const dailySummary = await getSalesSummary('daily');
        const weeklySummary = await getSalesSummary('weekly');
        const monthlySummary = await getSalesSummary('monthly');

        // Set the dashboard data from our secure database function
        setDashboardData({
          salesSummary: {
            daily: dailySummary,
            weekly: weeklySummary,
            monthly: monthlySummary
          },
          ordersByStatus: ordersByStatus,
          recentOrders: formattedOrders,
          newCustomers: [], // Will implement later
          lowStockProducts: lowStockProducts || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [timeframe]);

  return {
    dashboardData,
    isLoading,
    timeframe,
    setTimeframe,
    error
  };
};

export default useDashboardData;
