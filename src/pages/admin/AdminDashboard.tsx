
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboardStats } from '@/lib/hooks/admin/useAdminDashboard';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Plus, 
  Search,
  TrendingUp,
  AlertTriangle,
  Eye,
  ArrowUpRight
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminDashboardStats();
  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create a new product',
      icon: Plus,
      action: () => navigate('/admin/products'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: ShoppingCart,
      action: () => navigate('/admin/orders'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Users',
      description: 'View and manage users',
      icon: Users,
      action: () => navigate('/admin/users'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Promo Codes',
      description: 'Create discount codes',
      icon: DollarSign,
      action: () => navigate('/admin/promo-codes'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const statsCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: () => navigate('/admin/products'),
      change: '+12%'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: () => navigate('/admin/orders'),
      change: '+8%'
    },
    {
      title: 'Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: () => navigate('/admin/orders'),
      change: '+23%'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      action: () => navigate('/admin/users'),
      change: '+5%'
    }
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-naaz-green border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
          </div>
          
          {/* Mobile Search */}
          <div className="sm:hidden">
            <form onSubmit={handleGlobalSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Quick search..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              onClick={stat.action}
              className={`
                ${stat.bgColor} ${stat.borderColor} 
                border rounded-xl p-4 lg:p-6 cursor-pointer 
                hover:shadow-lg transition-all duration-200 
                transform hover:scale-[1.02] group
                relative overflow-hidden
              `}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <stat.icon className="w-full h-full" />
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.color} p-2 rounded-lg bg-white/50`}>
                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white h-auto flex flex-col items-center space-y-2 p-4 hover:scale-105 transition-transform`}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90 hidden sm:block">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/orders')}
                className="text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {stats?.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      #{order.order_number || order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.order_items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Low Stock Alert
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/products')}
                className="text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {stats?.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-600">₹{product.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-orange-600">
                      {product.stock}
                    </span>
                    <p className="text-xs text-gray-500">units left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
