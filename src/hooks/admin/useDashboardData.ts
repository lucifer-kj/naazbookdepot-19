
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

        // Use the secure admin dashboard function to avoid recursion
        const { data, error: dbError } = await supabase.rpc('get_admin_dashboard_data');
        
        if (dbError) {
          console.error('Error fetching dashboard data:', dbError);
          throw new Error(`Failed to fetch dashboard data: ${dbError.message}`);
        }

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
          ordersByStatus: data?.ordersByStatus || {},
          recentOrders: data?.recentOrders || [],
          newCustomers: [], // Will implement later
          lowStockProducts: data?.lowStockProducts || []
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
