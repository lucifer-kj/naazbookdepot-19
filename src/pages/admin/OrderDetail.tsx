
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, Truck, CheckCircle, CheckCircle2, XCircle, FileText, Printer, Mail, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useOrderDetails, useUpdateOrderStatus, useAddOrderNote, useDeleteOrderNote, OrderStatus } from '@/lib/services/admin-order-service';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'processing':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'shipped':
      return <Truck className="h-4 w-4 text-purple-500" />;
    case 'delivered':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'processing':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'shipped':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useOrderDetails(orderId);
  
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  
  const updateStatus = useUpdateOrderStatus();
  const addNote = useAddOrderNote();
  const deleteNote = useDeleteOrderNote();

  const handleStatusChange = async () => {
    if (!orderId || !newStatus) return;
    
    try {
      await updateStatus.mutateAsync({
        orderId,
        status: newStatus as OrderStatus,
        note: note || undefined
      });
      setNewStatus('');
      setNote('');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!orderId || !note.trim()) return;
    
    try {
      await addNote.mutateAsync({
        orderId,
        note,
        isCustomerVisible
      });
      setNote('');
      setIsCustomerVisible(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!orderId) return;
    
    try {
      await deleteNote.mutateAsync({
        noteId,
        orderId
      });
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleGenerateInvoice = () => {
    // This would be implemented with a PDF generation library
    toast.info('Invoice generation functionality will be implemented');
  };

  const handleSendEmail = () => {
    // This would be implemented with an email sending service
    toast.info('Email sending functionality will be implemented');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
          <Button variant="outline" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">Failed to load order details. The order may not exist or you might not have permission to view it.</p>
              <Link to="/admin/orders">
                <Button className="mt-4">Back to Orders</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Order #{order.id.substring(0, 8)}</h2>
            <Badge 
              variant="outline" 
              className={`uppercase font-semibold ${getStatusColor(order.status as OrderStatus)}`}
            >
              {getStatusIcon(order.status as OrderStatus)}
              <span className="ml-1">{order.status}</span>
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleGenerateInvoice}>
            <FileText className="mr-2 h-4 w-4" />
            Invoice
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email Customer
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="default" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Items</h3>
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link 
                              to={`/admin/products/${item.product_id}`} 
                              className="hover:underline flex items-center"
                            >
                              {item.product.name}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                            <span className="text-xs text-gray-500">SKU: {item.product.sku}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.price_per_unit)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Totals */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Order Totals</h3>
                <div className="rounded-md border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(order.total_amount - order.shipping_cost - order.tax_amount + order.discount_amount)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Discount {order.coupon_code && `(${order.coupon_code})`}
                      </span>
                      <span className="text-red-600">-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="capitalize">{order.payment_method || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Status</span>
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                      {order.payment_status || 'Not specified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm">{order.customer.email}</p>
                {order.user?.phone && (
                  <p className="text-sm">{order.user.phone}</p>
                )}
              </div>
              
              {order.shippingAddress && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm">{order.shippingAddress.address_line1}</p>
                  {order.shippingAddress.address_line2 && (
                    <p className="text-sm">{order.shippingAddress.address_line2}</p>
                  )}
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postal_code}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                </div>
              )}
              
              {order.billingAddress && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Billing Address</h4>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm">{order.billingAddress.address_line1}</p>
                  {order.billingAddress.address_line2 && (
                    <p className="text-sm">{order.billingAddress.address_line2}</p>
                  )}
                  <p className="text-sm">
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postal_code}
                  </p>
                  <p className="text-sm">{order.billingAddress.country}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Status Update */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Update Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[])
                        .filter(status => status !== order.status)
                        .map(status => (
                          <SelectItem key={status} value={status}>
                            <div className="flex items-center">
                              {getStatusIcon(status)}
                              <span className="ml-2 capitalize">{status}</span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleStatusChange} 
                    disabled={!newStatus || updateStatus.isPending}
                    className="w-full md:w-auto"
                  >
                    Update Status
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Add a note (optional)</label>
                <Textarea 
                  placeholder="Enter additional information about this status update" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleSendEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Send Status Update
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleSendEmail}>
                <Truck className="mr-2 h-4 w-4" />
                Send Shipping Information
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Timeline and Notes */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
          <TabsTrigger value="notes">Order Notes ({order.notes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            {order.timeline.length > 0 ? (
              <ol className="relative border-l border-gray-200 ml-3">
                {order.timeline.map((event, index) => (
                  <li key={event.id} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white bg-white">
                      {getStatusIcon(event.status as OrderStatus) || <Clock className="h-4 w-4" />}
                    </span>
                    <h3 className="flex items-center mb-1 text-lg font-semibold">
                      Status changed to <span className="ml-1 capitalize">{event.status}</span>
                    </h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                      {formatDate(event.created_at)} {event.user && `by ${event.user.first_name} ${event.user.last_name}`}
                    </time>
                    {event.note && (
                      <p className="mb-4 text-base font-normal text-gray-500">
                        {event.note}
                      </p>
                    )}
                    {index === 0 && (
                      <Badge variant="outline" className="inline-flex items-center">
                        Latest update
                      </Badge>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-center text-gray-500">No timeline events recorded yet.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="notes" className="p-4 border rounded-md mt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Textarea 
                placeholder="Add a note about this order" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="customer-visible"
                    checked={isCustomerVisible}
                    onCheckedChange={(checked) => setIsCustomerVisible(!!checked)}
                  />
                  <label
                    htmlFor="customer-visible"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Visible to customer
                  </label>
                </div>
                <Button 
                  onClick={handleAddNote} 
                  disabled={!note.trim() || addNote.isPending}
                >
                  Add Note
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {order.notes.length > 0 ? (
                order.notes.map((note) => (
                  <div key={note.id} className="p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {note.user?.first_name} {note.user?.last_name}
                        </p>
                        <time className="text-xs text-gray-500">
                          {formatDate(note.created_at)}
                        </time>
                      </div>
                      <div className="flex items-center gap-2">
                        {note.is_customer_visible && (
                          <Badge variant="outline" className="h-6">
                            Customer Visible
                          </Badge>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-red-600 hover:text-red-800 hover:bg-red-50">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this note? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteNote(note.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="mt-2">{note.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No notes for this order yet.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderDetail;
