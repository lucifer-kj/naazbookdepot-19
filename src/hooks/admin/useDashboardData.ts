
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getDashboardStats, getRecentOrders, getNewCustomers, getLowStockProducts } from '@/lib/api/admin-service';

const useDashboardData = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    salesSummary: {
      daily: { amount: 0, change: 0 },
      weekly: { amount: 0, change: 0 },
      monthly: { amount: 0, change: 0 }
    },
    ordersByStatus: [],
    recentOrders: [],
    newCustomers: [],
    lowStockProducts: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const stats = await getDashboardStats();
        const orders = await getRecentOrders(5);
        const customers = await getNewCustomers(5);
        const lowStock = await getLowStockProducts(5);
        
        setDashboardData({
          salesSummary: stats.salesSummary,
          ordersByStatus: stats.ordersByStatus,
          recentOrders: orders,
          newCustomers: customers,
          lowStockProducts: lowStock
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
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);
    
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
