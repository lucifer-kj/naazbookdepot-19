import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import type { OrderWithItems } from '@/lib/hooks/useOrders'; // Adjust path as needed

interface DashboardRecentOrdersProps {
  recentOrders: OrderWithItems[];
  isLoading: boolean;
  error: Error | null;
  onViewOrder: (orderId: string) => void; // Callback to handle navigation
  onViewAllOrders: () => void; // Callback for "View All Orders"
}

const DashboardRecentOrders: React.FC<DashboardRecentOrdersProps> = ({
  recentOrders,
  isLoading,
  error,
  onViewOrder,
  onViewAllOrders,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-playfair font-bold text-gray-900">Recent Orders</h3>
        <Button variant="outline" size="sm" onClick={onViewAllOrders}>
          View All Orders
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-naaz-green" />
            <p className="ml-2">Loading recent orders...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-10 text-red-500">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Error loading orders: {error.message}</p>
          </div>
        )}
        {!isLoading && !error && recentOrders.length === 0 && (
          <p className="text-center text-gray-500 py-10">You haven't placed any orders yet.</p>
        )}
        {!isLoading && !error && recentOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Order #{order.order_number}</h4>
                <p className="text-sm text-gray-600">
                  {format(new Date(order.created_at), "dd MMMM yyyy")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ₹{order.total_amount?.toLocaleString() || '0.00'}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'shipped'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'processing' || order.status === 'pending' || order.status === 'on_hold'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800' // for cancelled, failed, refunded
                }`}>
                  {order.status?.replace('_', ' ').charAt(0).toUpperCase() + (order.status?.replace('_', ' ').slice(1) || '')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {order.order_items?.slice(0, 3).map((item, index) => (
                <div key={item.id || index} className="flex items-center space-x-2 flex-shrink-0 w-40">
                  <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <ShoppingBag size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.order_items && order.order_items.length > 3 && (
                <div className="text-xs text-gray-500 flex-shrink-0">
                  +{order.order_items.length - 3} more items
                </div>
              )}
               {order.order_items && order.order_items.length === 0 && (
                 <p className="text-xs text-gray-500">No items found in this order.</p>
               )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {order.tracking_number && (
                  <span className="text-xs text-gray-600">
                    Tracking: {order.tracking_number}
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => onViewOrder(order.id)}>
                  View Details
                </Button>
                {/* Reorder functionality can be complex, stubbed or disabled */}
                {order.status === 'delivered' && (
                  <Button size="sm" disabled>
                    Reorder
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardRecentOrders;
