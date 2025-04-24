
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getDashboardStats, getRecentOrders, getNewCustomers, getLowStockProducts } from '@/lib/api/admin-service';
import { OrderStatus } from '@/lib/api/admin-service';

// Define proper type for the dashboard data
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
  const { toast } = useToast();
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
        
        const [stats, orders, customers, lowStock] = await Promise.allSettled([
          getDashboardStats(),
          getRecentOrders(5),
          getNewCustomers(5),
          getLowStockProducts(5)
        ]);

        const processResult = (result: PromiseSettledResult<any>) => {
          if (result.status === 'fulfilled') {
            return result.value;
          }
          console.error('Error fetching dashboard data:', result.reason);
          return null;
        };

        const statsData = processResult(stats);
        const ordersData = processResult(orders);
        const customersData = processResult(customers);
        const lowStockData = processResult(lowStock);

        if (!statsData) {
          throw new Error('Failed to load dashboard statistics');
        }
        
        setDashboardData({
          salesSummary: statsData.salesSummary,
          ordersByStatus: statsData.ordersByStatus || {},
          recentOrders: ordersData || [],
          newCustomers: customersData || [],
          lowStockProducts: lowStockData || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Dashboard Error",
          description: "Failed to load dashboard data. Please check your permissions and try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  return {
    dashboardData,
    isLoading,
    timeframe,
    setTimeframe
  };
};

export default useDashboardData;
