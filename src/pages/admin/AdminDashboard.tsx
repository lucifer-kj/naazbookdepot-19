
import React from "react";
import { useNavigate } from 'react-router-dom';
import { useAdminProducts, useAdminOrders } from '@/lib/hooks/useAdmin';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Clock, Plus, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
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
  </div>
);

const StatsCard = ({ 
  icon: Icon, 
  title, 
  value, 
  change, 
  color, 
  bgColor, 
  onClick 
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: number | string;
  change?: string;
  color: string;
  bgColor: string;
  onClick?: () => void;
}) => (
  <div 
    className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 ${
      onClick ? 'cursor-pointer hover:scale-105' : ''
    }`}
    onClick={onClick}
  >
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
  const navigate = useNavigate();
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

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add new books to your catalog',
      icon: Package,
      color: 'bg-naaz-green',
      action: () => navigate('/admin/products')
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      action: () => navigate('/admin/orders')
    },
    {
      title: 'Manage Users',
      description: 'View and manage users',
      icon: Users,
      color: 'bg-green-500',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Promo Codes',
      description: 'Create discount codes',
      icon: Settings,
      color: 'bg-purple-500',
      action: () => navigate('/admin/promo-codes')
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-playfair">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your Naaz Books admin panel</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Total Books: {stats.totalProducts} | Active Orders: {stats.totalOrders}
            </p>
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
            onClick={() => navigate('/admin/products')}
          />
          <StatsCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            change="+12% from last month"
            color="text-white"
            bgColor="bg-blue-500"
            onClick={() => navigate('/admin/orders')}
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
            change={stats.lowStockProducts > 0 ? "Needs attention" : "All good"}
            color="text-white"
            bgColor={stats.lowStockProducts > 0 ? "bg-red-500" : "bg-gray-500"}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-naaz-green" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} hover:opacity-90 text-white p-4 h-auto flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105`}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-naaz-green" />
                  Recent Orders
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/orders')}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6">
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">#{order.order_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.order_items?.length || 0} items
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
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent orders</p>
                  <p className="text-sm text-gray-400">Orders will appear here when customers place them</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Low Stock Alert
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/products?filter=low-stock')}
                  className="flex items-center"
                >
                  <Package className="h-4 w-4 mr-1" />
                  Manage Stock
                </Button>
              </div>
            </div>
            <div className="p-6">
              {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
                      <div className="flex items-center flex-1">
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.categories?.name || 'Uncategorized'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className="inline-flex items-center px-2 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                          {product.stock} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">All products are well stocked</p>
                  <p className="text-sm text-gray-400">Great job maintaining inventory levels!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
