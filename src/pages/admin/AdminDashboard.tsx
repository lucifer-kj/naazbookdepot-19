
import React from 'react';
import { useAdminProducts, useAdminOrders } from '@/lib/hooks/useAdmin';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
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

    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const StatsCard = ({ icon: Icon, title, value, color }: {
  icon: React.ComponentType<any>;
  title: string;
  value: number;
  color: string;
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center">
      <div className={`p-2 ${color} rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data: products, isLoading: productsLoading } = useAdminProducts();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();

  const isLoading = productsLoading || ordersLoading;

  const stats = React.useMemo(() => ({
    totalProducts: products?.length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
    lowStockProducts: products?.filter(product => product.stock < 5).length || 0,
  }), [products, orders]);

  const recentOrders = React.useMemo(() => 
    orders?.slice(0, 5) || [], [orders]
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
        <div className="animate-fade-in">
          <h1 className="text-3xl font-playfair font-bold text-naaz-green">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <StatsCard
            icon={Package}
            title="Total Products"
            value={stats.totalProducts}
            color="bg-blue-500"
          />
          <StatsCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            color="bg-green-500"
          />
          <StatsCard
            icon={TrendingUp}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="bg-yellow-500"
          />
          <StatsCard
            icon={Users}
            title="Low Stock"
            value={stats.lowStockProducts}
            color="bg-red-500"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md animate-fade-in">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_number || `#${order.id.slice(0, 8)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.created_at!).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
