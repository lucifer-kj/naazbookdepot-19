import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminOrders, OrderWithItems } from '@/lib/hooks/useOrders';
import { Loader2, AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { getStatusBadgeVariant, formatCurrency } from '@/lib/utils'; // Import helpers


const OrdersList: React.FC = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useAdminOrders();
  const [searchTerm, setSearchTerm] = useState('');
  // const [statusFilter, setStatusFilter] = useState('All'); // For future use

  // Basic search functionality (client-side for now)
  const filteredOrders = orders?.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.shipping_address as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-naaz-green" />
        <p className="ml-2 text-lg">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Fetching Orders</h2>
        <p className="text-center max-w-md">{error.message || 'An unexpected error occurred. Please try again later.'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-naaz-green">Orders Management</h1>
        <input
          type="text"
          placeholder="Search by Order #, Email, Name..."
          className="border rounded-lg px-4 py-2 w-full md:w-72 focus:ring-2 focus:ring-naaz-green focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Filter UI (non-functional for now as per instructions) */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="defaultOutline" className="border-naaz-green text-naaz-green hover:bg-naaz-green/10">All</Button>
        <Button variant="defaultOutline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10">Pending</Button>
        <Button variant="defaultOutline" className="border-naaz-gold text-naaz-gold hover:bg-naaz-gold/10">Shipped</Button>
        <Button variant="defaultOutline" className="border-green-500 text-green-500 hover:bg-green-500/10">Delivered</Button>
        {/* <input type="date" className="border rounded-lg px-2 py-1" />
        <input type="date" className="border rounded-lg px-2 py-1" /> */}
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-100">
              <TableHead className="py-3 px-4 font-semibold text-gray-600">Order #</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-600">Customer</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-600">Date</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-600">Status</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-600 text-right">Total</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-gray-600 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders && filteredOrders.length > 0 ? filteredOrders.map((order: OrderWithItems) => (
              <TableRow key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <TableCell className="py-3 px-4 font-mono text-sm text-gray-700">{order.order_number}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-gray-700">
                  <div>{(order.shipping_address as any)?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{order.customer_email || (order.shipping_address as any)?.email}</div>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-gray-700">{format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}</TableCell>
                <TableCell className="py-3 px-4">
                  <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                    {order.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-gray-700 text-right">{formatCurrency(order.total_amount)}</TableCell>
                <TableCell className="py-3 px-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1 md:mr-2" /> View
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  <p className="text-lg">No orders found.</p>
                  {searchTerm && <p>Try adjusting your search term.</p>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersList;
