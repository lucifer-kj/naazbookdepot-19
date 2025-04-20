
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
        
        // Use Promise.all to fetch data in parallel
        const [stats, orders, customers, lowStock] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(5),
          getNewCustomers(5),
          getLowStockProducts(5)
        ]);
        
        setDashboardData({
          salesSummary: stats.salesSummary,
          ordersByStatus: stats.ordersByStatus || {},
          recentOrders: orders || [],
          newCustomers: customers || [],
          lowStockProducts: lowStock || []
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Set up auto-refresh interval
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
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
