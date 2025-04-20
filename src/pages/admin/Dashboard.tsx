
import React from 'react';
import DashboardHeader from '@/components/admin/dashboard/DashboardHeader';
import SalesSummaryCards from '@/components/admin/dashboard/SalesSummaryCards';
import OrderStatusChart from '@/components/admin/dashboard/OrderStatusChart';
import SalesTrendChart from '@/components/admin/dashboard/SalesTrendChart';
import RecentOrders from '@/components/admin/dashboard/RecentOrders';
import LowStockAlert from '@/components/admin/dashboard/LowStockAlert';
import NewCustomers from '@/components/admin/dashboard/NewCustomers';
import useDashboardData from '@/hooks/admin/useDashboardData';
import { OrderStatus } from '@/lib/api/admin-service';

const orderStatusColors: Record<OrderStatus, string> = {
  pending: "#f97316",    // Orange
  processing: "#0ea5e9", // Blue
  shipped: "#8b5cf6",    // Purple
  delivered: "#10b981",  // Green
  cancelled: "#ef4444"   // Red
};

// Sample sales trend data
const salesTrendData = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 1398 },
  { name: 'Mar', value: 9800 },
  { name: 'Apr', value: 3908 },
  { name: 'May', value: 4800 },
  { name: 'Jun', value: 3800 },
  { name: 'Jul', value: 4300 }
];

const Dashboard = () => {
  const { dashboardData, isLoading, timeframe, setTimeframe } = useDashboardData();

  const orderStatusData = Object.entries(dashboardData.ordersByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: Number(count),
    color: orderStatusColors[status as OrderStatus] || "#9ca3af"
  }));

  // Calculate total orders - sum all counts in the ordersByStatus object
  const totalOrders = Object.values(dashboardData.ordersByStatus).reduce((sum, count) => sum + Number(count), 0);
  
  // Get the pending orders count - safely access the property with optional chaining
  const pendingOrders = dashboardData.ordersByStatus?.pending || 0;

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <SalesSummaryCards
        salesSummary={dashboardData.salesSummary}
        orderCount={totalOrders}
        pendingOrders={pendingOrders}
        lowStockCount={dashboardData.lowStockProducts.length}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OrderStatusChart data={orderStatusData} />
        <SalesTrendChart data={salesTrendData} />
      </div>
      
      <RecentOrders orders={dashboardData.recentOrders} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <LowStockAlert products={dashboardData.lowStockProducts} />
        <NewCustomers customers={dashboardData.newCustomers} />
      </div>
    </div>
  );
};

export default Dashboard;
