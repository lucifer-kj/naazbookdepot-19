
import React from "react";
import { useAdminProducts, useAdminOrders } from '@/lib/hooks/useAdmin';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, title, value, change, color, bgColor }: {
  icon: React.ComponentType<any>;
  title: string;
  value: number | string;
  change?: string;
  color: string;
  bgColor: string;
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-xs text-naaz-green font-medium">{change}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const isLoading = productsLoading || ordersLoading;

  const stats = React.useMemo(() => {
    const totalProducts = products?.length || 0;
    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
    const lowStockProducts = products?.filter(product => product.stock < 5).length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0) || 0;
    
    return {
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStockProducts,
      totalRevenue,
    };
  }, [products, orders]);

  const recentOrders = React.useMemo(() => 
    orders?.slice(0, 5) || [], [orders]
  );

  const lowStockProducts = React.useMemo(() => 
    products?.filter(product => product.stock < 5).slice(0, 5) || [], [products]
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-playfair">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your Naaz Books admin panel</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={Package}
            title="Total Products"
            value={stats.totalProducts}
            change="+2 this week"
            color="text-white"
            bgColor="bg-naaz-green"
          />
          <StatsCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            change="+12% from last month"
            color="text-white"
            bgColor="bg-blue-500"
          />
          <StatsCard
            icon={TrendingUp}
            title="Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            change="+8.2% from last month"
            color="text-white"
            bgColor="bg-green-500"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Low Stock Alert"
            value={stats.lowStockProducts}
            change="Needs attention"
            color="text-white"
            bgColor="bg-red-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">#{order.order_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{parseFloat(order.total.toString()).toLocaleString()}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="p-6">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          Category: {product.categories?.name || 'Uncategorized'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">All products are well stocked</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-4 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors">
              <Package className="h-5 w-5 mr-2" />
              Add Product
            </button>
            <button className="flex items-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Orders
            </button>
            <button className="flex items-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <Users className="h-5 w-5 mr-2" />
              Manage Users
            </button>
            <button className="flex items-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Reports
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
