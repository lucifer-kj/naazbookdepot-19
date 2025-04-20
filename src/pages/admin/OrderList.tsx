
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter, Search, RefreshCw } from 'lucide-react';
import { getOrders, OrderStatus } from '@/lib/api/admin-service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Define the order status colors
const orderStatusColors = {
  pending: "bg-orange-100 text-orange-600",
  processing: "bg-blue-100 text-blue-600",
  shipped: "bg-purple-100 text-purple-600",
  delivered: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600"
};

const OrderList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch orders
  React.useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const { orders, totalCount } = await getOrders({
          page,
          limit: 10,
          status: filter.status as OrderStatus | '',
          search: filter.search,
          dateFrom: filter.dateFrom,
          dateTo: filter.dateTo
        });
        
        setOrders(orders);
        setTotalCount(totalCount);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, filter]);

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setFilter(prev => ({
      ...prev,
      status: value
    }));
    setPage(1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Handle row click to view order details
  const handleRowClick = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <Button onClick={() => navigate('/admin/orders/new')}>
          Create Order
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Select value={filter.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8"
                  value={filter.search}
                  onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                />
              </form>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  placeholder="To Date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => {
                setFilter({
                  status: '',
                  search: '',
                  dateFrom: '',
                  dateTo: ''
                });
                setPage(1);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>
              {totalCount > 0 ? (
                <div className="flex items-center justify-between py-4">
                  <div>
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} orders
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div>No orders found</div>
              )}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleRowClick(order.id)}
                  >
                    <TableCell>{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${orderStatusColors[order.status as OrderStatus] || ""}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderList;
