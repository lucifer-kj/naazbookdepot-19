
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Calendar as CalendarIcon, Search, Filter, ArrowUpDown, MoreHorizontal, Eye, Edit, CheckCircle, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { getOrders, updateOrderStatus, OrderStatus } from '@/lib/api/admin-service';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const ITEMS_PER_PAGE = 10;

const statusOptions = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

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

const Orders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getOrders({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: filterStatus as OrderStatus | "",
        search: searchQuery,
        dateFrom: dateRange.from?.toISOString(),
        dateTo: dateRange.to?.toISOString(),
        sortBy: sortField,
        sortDirection: sortDirection,
      });
      
      setOrders(data.orders);
      setTotalOrders(data.totalCount);
      setTotalPages(Math.ceil(data.totalCount / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, sortField, sortDirection, dateRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchOrders();
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status"
      });
    }
  };

  const handleResetFilters = () => {
    setFilterStatus("");
    setSearchQuery("");
    setDateRange({ from: undefined, to: undefined });
    setSortField("created_at");
    setSortDirection("desc");
  };

  const getStatusCounts = () => {
    if (!orders.length) return {
      all: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    return orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      acc.all += 1;
      return acc;
    }, { all: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  };

  const statuses = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="default">
            Export Orders
          </Button>
        </div>
      </div>
      
      {/* Status Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="all" onClick={() => setFilterStatus("")}>
            All <span className="ml-1 opacity-70">({totalOrders})</span>
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setFilterStatus("pending")}>
            Pending <span className="ml-1 opacity-70">({statuses.pending})</span>
          </TabsTrigger>
          <TabsTrigger value="processing" onClick={() => setFilterStatus("processing")}>
            Processing <span className="ml-1 opacity-70">({statuses.processing})</span>
          </TabsTrigger>
          <TabsTrigger value="shipped" onClick={() => setFilterStatus("shipped")}>
            Shipped <span className="ml-1 opacity-70">({statuses.shipped})</span>
          </TabsTrigger>
          <TabsTrigger value="delivered" onClick={() => setFilterStatus("delivered")}>
            Delivered <span className="ml-1 opacity-70">({statuses.delivered})</span>
          </TabsTrigger>
          <TabsTrigger value="cancelled" onClick={() => setFilterStatus("cancelled")}>
            Cancelled <span className="ml-1 opacity-70">({statuses.cancelled})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search order ID, customer..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                      </>
                    ) : (
                      formatDate(dateRange.from)
                    )
                  ) : (
                    "Date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="flex gap-2">
              <Button type="submit">Apply Filters</Button>
              <Button type="button" variant="outline" onClick={handleResetFilters}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium px-0"
                    onClick={() => handleSort("id")}
                  >
                    Order ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium px-0"
                    onClick={() => handleSort("customer")}
                  >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium px-0"
                    onClick={() => handleSort("created_at")}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium px-0"
                    onClick={() => handleSort("total_amount")}
                  >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="font-medium px-0"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6} className="h-12 text-center">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                        #{order.id.substring(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {order.customer?.name || 'Anonymous'}
                    </TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          order.status === 'delivered' ? 'success' :
                          order.status === 'shipped' ? 'default' :
                          order.status === 'processing' ? 'outline' :
                          order.status === 'pending' ? 'secondary' : 'destructive'
                        }
                        className="flex w-fit items-center gap-1"
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">
                          {order.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[])
                            .filter(status => status !== order.status)
                            .map(status => (
                              <DropdownMenuItem 
                                key={status}
                                onClick={() => handleStatusChange(order.id, status)}
                              >
                                {getStatusIcon(status)}
                                <span className="ml-2 capitalize">{status}</span>
                              </DropdownMenuItem>
                            ))
                          }
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              
              // Show first page, last page, and pages around current page
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis for gaps
              if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Orders;
