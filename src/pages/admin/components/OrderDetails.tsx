import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminOrderDetails, useUpdateOrderStatus, OrderWithItems, OrderItem } from '@/lib/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Badge might be used by AdminOrderDetailHeader
// Table components are now in AdminOrderItemsTable
// Select components are now in AdminOrderDetailHeader
import { Loader2, AlertTriangle, ArrowLeft, ShoppingCart, User, Truck, CreditCardIcon } from 'lucide-react'; // Keep icons used directly
import { Label } from '@/components/ui/label'; // Label is used in AdminOrderDetailHeader
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getStatusBadgeVariant, formatCurrency } from '@/lib/utils';

// Import new section components
import AdminOrderDetailHeader from './orderDetailsSections/AdminOrderDetailHeader';
import AdminOrderItemsTable from './orderDetailsSections/AdminOrderItemsTable';
import AdminOrderCustomerInfo from './orderDetailsSections/AdminOrderCustomerInfo';


const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'failed',
  'on_hold'
];

// Helper functions getStatusBadgeVariant and formatCurrency are now imported from '@/lib/utils'

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error: fetchError } = useAdminOrderDetails(orderId || '');
  const updateStatusMutation = useUpdateOrderStatus();

  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }
  }, [order]);

  const handleUpdateStatus = async () => {
    if (!orderId || !selectedStatus) return;
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: selectedStatus });
      toast.success('Order status updated successfully!');
      // Data will be refetched by query invalidation in the hook
    } catch (err: any) {
      toast.error(`Failed to update order status: ${err.message}`);
      console.error("Error updating status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-naaz-green" />
        <p className="ml-3 text-xl text-gray-700">Loading order details...</p>
      </div>
    );
  }

  if (fetchError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-700 mb-3">Error Fetching Order</h2>
        <p className="text-center text-gray-600 mb-6 max-w-md">
          {fetchError?.message || 'The order could not be found or an unexpected error occurred.'}
        </p>
        <Button onClick={() => navigate('/admin/orders')} variant="outline" className="text-naaz-green border-naaz-green hover:bg-naaz-green/10">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  // const shippingAddress = order.shipping_address as any; // Now handled in AdminOrderCustomerInfo
  // const billingAddress = order.billing_address as any; // Now handled in AdminOrderCustomerInfo

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Button
        onClick={() => navigate('/admin/orders')}
        variant="outline"
        className="mb-6 text-naaz-green border-naaz-green hover:bg-naaz-green/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders List
      </Button>

      <AdminOrderDetailHeader
        order={order}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={updateStatusMutation.isPending}
        updateError={updateStatusMutation.error as Error | null}
        orderStatuses={ORDER_STATUSES}
        getStatusBadgeVariant={getStatusBadgeVariant}
        formatCurrency={formatCurrency}
      />

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <AdminOrderItemsTable
          items={order.order_items}
          orderTotals={order} // Pass the whole order object for totals
          formatCurrency={formatCurrency}
        />

        {/* Right Column: Customer & Other Details */}
        <div className="space-y-8">
          <AdminOrderCustomerInfo order={order} />

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4 flex items-center">
               <Truck className="mr-3 h-6 w-6 text-naaz-green" /> Shipping Information
            </h2>
            <p className="text-sm text-gray-700"><strong>Method:</strong> {order.shipping_method || 'Standard Shipping'}</p>
            <p className="text-sm text-gray-700"><strong>Tracking #:</strong> {order.tracking_number || 'Not available yet'}</p>
            {/* Add more shipping details if available, e.g., carrier */}
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
             <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4 flex items-center">
               <CreditCardIcon className="mr-3 h-6 w-6 text-naaz-green" /> Payment Information
            </h2>
            <p className="text-sm text-gray-700"><strong>Method:</strong> {order.payment_method || 'Online'}</p>
            <div className="text-sm text-gray-700 flex items-center">
                <strong>Status:</strong>&nbsp;
                <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'} className="capitalize ml-1">
                    {order.payment_status || 'Pending'}
                </Badge>
            </div>
            {/* Add Transaction ID if available: order.transaction_id */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
