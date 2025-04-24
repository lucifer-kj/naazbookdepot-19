
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

        // 1. Fetch low stock products
        const { data: lowStockData, error: lowStockError } = await supabase
          .from('products')
          .select('*')
          .lt('quantity_in_stock', 10)
          .order('quantity_in_stock', { ascending: true })
          .limit(5);

        if (lowStockError) {
          console.error('Error fetching low stock products:', lowStockError);
          throw new Error(`Failed to fetch low stock products: ${lowStockError.message}`);
        }

        // 2. Fetch orders data without joining user data
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) {
          console.error('Error fetching orders data:', ordersError);
          throw new Error(`Failed to fetch recent orders: ${ordersError.message}`);
        }

        // 3. Fetch order status counts
        const getOrderCount = async (status: OrderStatus) => {
          const { count, error } = await supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('status', status);
            
          if (error) {
            console.error(`Error fetching ${status} order count:`, error);
            return 0;
          }
          
          return count || 0;
        };
        
        // Get counts for each status using the proper OrderStatus type
        const pendingCount = await getOrderCount('pending');
        const processingCount = await getOrderCount('processing');
        const shippedCount = await getOrderCount('shipped');
        const deliveredCount = await getOrderCount('delivered');
        const cancelledCount = await getOrderCount('cancelled');

        // 4. Get sales summary
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

        // Format orders with simple user info to avoid RLS issues
        const formattedOrders = ordersData?.map(order => ({
          ...order,
          customer: {
            name: `Customer ${order.user_id ? order.user_id.substring(0, 5) : 'Guest'}`,
            email: order.user_id ? `user${order.user_id.substring(0, 5)}@example.com` : 'guest@example.com'
          }
        })) || [];

        // Set all gathered data
        setDashboardData({
          salesSummary: {
            daily: dailySummary,
            weekly: weeklySummary,
            monthly: monthlySummary
          },
          ordersByStatus: {
            pending: pendingCount,
            processing: processingCount,
            shipped: shippedCount,
            delivered: deliveredCount,
            cancelled: cancelledCount
          },
          recentOrders: formattedOrders,
          newCustomers: [], // Will implement later
          lowStockProducts: lowStockData || []
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
