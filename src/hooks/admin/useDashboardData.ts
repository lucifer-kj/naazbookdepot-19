
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

        // Fetch orders data
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            users (
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) throw ordersError;

        // Fetch low stock products
        const { data: lowStockData, error: lowStockError } = await supabase
          .from('products')
          .select('*')
          .lt('quantity_in_stock', 10)
          .order('quantity_in_stock', { ascending: true })
          .limit(5);

        if (lowStockError) throw lowStockError;

        // Fetch order status counts
        const { data: statusCounts, error: statusError } = await supabase
          .from('orders')
          .select('status', { count: 'exact' })
          .eq('status', 'pending');

        if (statusError) throw statusError;

        // Calculate summary data (simplified for example)
        const summary = {
          daily: { amount: 1000, change: 5 },
          weekly: { amount: 5000, change: 10 },
          monthly: { amount: 20000, change: 15 }
        };

        setDashboardData({
          salesSummary: summary,
          ordersByStatus: {
            pending: statusCounts?.length || 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
          },
          recentOrders: ordersData || [],
          newCustomers: [], // Will implement later
          lowStockProducts: lowStockData || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
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
    setTimeframe
  };
};

export default useDashboardData;
