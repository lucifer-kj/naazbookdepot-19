import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminOrderDetails, useUpdateOrderStatus, OrderWithItems, OrderItem } from '@/lib/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, ArrowLeft, ShoppingCart, User, Truck, CreditCardIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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

// Helper function to determine badge variant based on status (can be shared or defined locally)
const getStatusBadgeVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'on_hold':
      return 'warning';
    case 'processing':
      return 'secondary';
    case 'shipped':
      return 'default';
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'secondary';
  }
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';
  return `₹${amount.toLocaleString()}`;
};

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

  const shippingAddress = order.shipping_address as any; // Type assertion for easier access
  const billingAddress = order.billing_address as any;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Button
        onClick={() => navigate('/admin/orders')}
        variant="outline"
        className="mb-6 text-naaz-green border-naaz-green hover:bg-naaz-green/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders List
      </Button>

      {/* Order Header */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-naaz-green">Order #{order.order_number}</h1>
            <p className="text-sm text-gray-500">
              Placed on: {format(new Date(order.created_at), "PPP p")}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
             <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm capitalize px-3 py-1">
              {order.status || 'Unknown'}
            </Badge>
            <p className="text-2xl font-semibold text-naaz-gold">{formatCurrency(order.total_amount)}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">Update Order Status:</Label>
            <div className="flex gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="orderStatus" className="flex-grow border rounded-lg px-3 py-2 focus:ring-2 focus:ring-naaz-green">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending || selectedStatus === order.status}
                className="bg-naaz-green text-white hover:bg-naaz-green/90 px-6 min-w-[120px]"
              >
                {updateStatusMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update'}
              </Button>
            </div>
          </div>
        </div>
         {updateStatusMutation.isError && (
          <p className="text-sm text-red-500 mt-2">Error updating status: {updateStatusMutation.error?.message}</p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Order Items */}
        <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4 flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-naaz-green" /> Order Items ({order.order_items.length})
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items.map((item: OrderItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.product_name}</div>
                      {item.variant_name && <div className="text-xs text-gray-500">{item.variant_name}</div>}
                      {item.product_sku && <div className="text-xs text-gray-500">SKU: {item.product_sku}</div>}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end items-center">
              <span className="text-gray-600 mr-2">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-end items-center">
              <span className="text-gray-600 mr-2">Shipping:</span>
              <span className="font-semibold">{formatCurrency(order.shipping_amount)}</span>
            </div>
             <div className="flex justify-end items-center">
              <span className="text-gray-600 mr-2">Tax:</span>
              <span className="font-semibold">{formatCurrency(order.tax_amount)}</span>
            </div>
            {order.discount_amount && order.discount_amount > 0 ? (
              <div className="flex justify-end items-center text-green-600">
                <span className="mr-2">Discount:</span>
                <span className="font-semibold">- {formatCurrency(order.discount_amount)}</span>
              </div>
            ) : null}
            <div className="flex justify-end items-center text-xl font-bold text-naaz-gold">
              <span className="text-gray-800 mr-2">Grand Total:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Other Details */}
        <div className="space-y-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4 flex items-center">
              <User className="mr-3 h-6 w-6 text-naaz-green" /> Customer Details
            </h2>
            {order.users && (
                 <p className="text-sm text-gray-700"><strong>Registered User:</strong> {order.users.full_name || order.users.email} (ID: {order.users.id})</p>
            )}
            <p className="text-sm text-gray-700"><strong>Name:</strong> {shippingAddress?.name || 'N/A'}</p>
            <p className="text-sm text-gray-700"><strong>Email:</strong> {order.customer_email || shippingAddress?.email || 'N/A'}</p>
            <p className="text-sm text-gray-700"><strong>Phone:</strong> {order.customer_phone || shippingAddress?.phone || 'N/A'}</p>
            <div className="mt-3">
              <h3 className="text-md font-semibold text-gray-600 mb-1">Shipping Address:</h3>
              <address className="text-sm text-gray-700 not-italic">
                {shippingAddress?.address || 'N/A'}<br />
                {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.pincode}<br />
                {shippingAddress?.country || 'India'}
              </address>
            </div>
            {billingAddress && (Object.keys(billingAddress).length > 0 && JSON.stringify(shippingAddress) !== JSON.stringify(billingAddress)) && (
              <div className="mt-3">
                <h3 className="text-md font-semibold text-gray-600 mb-1">Billing Address:</h3>
                <address className="text-sm text-gray-700 not-italic">
                  {billingAddress?.name}<br />
                  {billingAddress?.address}<br />
                  {billingAddress?.city}, {billingAddress?.state} {billingAddress?.pincode}<br />
                  {billingAddress?.country || 'India'}
                </address>
              </div>
            )}
          </div>

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
