
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  ChartBar, 
  AlertTriangle, 
  User, 
  Package, 
  ArrowRight, 
  Calendar, 
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  getDashboardStats, 
  getRecentOrders,
  getNewCustomers,
  getLowStockProducts,
  OrderStatus
} from '@/lib/api/admin-service';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

interface SaleData {
  name: string;
  value: number;
}

const orderStatusColors = {
  pending: "#f97316",    // Orange
  processing: "#0ea5e9", // Blue
  shipped: "#8b5cf6",    // Purple
  delivered: "#10b981",  // Green
  cancelled: "#ef4444"   // Red
};

const Dashboard = () => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    salesSummary: {
      daily: { amount: 0, change: 0 },
      weekly: { amount: 0, change: 0 },
      monthly: { amount: 0, change: 0 }
    },
    ordersByStatus: [] as OrderStatusData[],
    recentOrders: [],
    newCustomers: [],
    lowStockProducts: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard statistics
        const stats = await getDashboardStats();
        
        // Fetch recent orders
        const orders = await getRecentOrders(5);
        
        // Fetch new customers
        const customers = await getNewCustomers(5);
        
        // Fetch low stock products
        const lowStock = await getLowStockProducts(5);
        
        // Format order status data for pie chart
        const orderStatusData = Object.entries(stats.ordersByStatus).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color: orderStatusColors[status as OrderStatus] || "#9ca3af"
        }));
        
        setDashboardData({
          salesSummary: stats.salesSummary,
          ordersByStatus: orderStatusData,
          recentOrders: orders,
          newCustomers: customers,
          lowStockProducts: lowStock
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Set up polling for real-time updates every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [toast]);
  
  // Mock data for sales trend chart
  const salesTrendData = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 1398 },
    { name: 'Mar', value: 9800 },
    { name: 'Apr', value: 3908 },
    { name: 'May', value: 4800 },
    { name: 'Jun', value: 3800 },
    { name: 'Jul', value: 4300 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date Range
          </Button>
          <Button size="sm">
            <DollarSign className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Sales Summary Cards */}
      <Tabs defaultValue="daily" onValueChange={(v) => setTimeframe(v as any)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardData.salesSummary[timeframe].amount)}
              </div>
              <div className="flex items-center pt-1 text-xs text-muted-foreground">
                {dashboardData.salesSummary[timeframe].change >= 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    <span className="text-green-500">
                      {Math.abs(dashboardData.salesSummary[timeframe].change)}% increase
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    <span className="text-red-500">
                      {Math.abs(dashboardData.salesSummary[timeframe].change)}% decrease
                    </span>
                  </>
                )}
                &nbsp;from previous {timeframe === 'daily' ? 'day' : timeframe === 'weekly' ? 'week' : 'month'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Orders
              </CardTitle>
              <ChartBar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(dashboardData.ordersByStatus).reduce((sum, item) => sum + item.value, 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                {dashboardData.ordersByStatus.find(status => status.name === 'Pending')?.value || 0} pending orders
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Products
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.lowStockProducts.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Products requiring attention
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Charts & Tables Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Orders by Status Chart */}
        <Card className="md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {dashboardData.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Sales Trend Chart */}
        <Card className="md:col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>
              Last 7 months sales performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Sales']} />
                  <Bar dataKey="value" fill="#0A4F3C" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/orders">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'shipped' ? 'default' :
                        order.status === 'processing' ? 'outline' :
                        order.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/admin/orders/${order.id}`}>
                          View
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No recent orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Low Stock Alert & New Customers */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Products</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/products?filter=low-stock">
                  View All
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.lowStockProducts.map((product: any) => (
                  <Alert key={product.id} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="ml-2 font-medium">
                      {product.name}
                    </AlertTitle>
                    <AlertDescription className="ml-2">
                      Only {product.quantity_in_stock} {product.quantity_in_stock === 1 ? 'unit' : 'units'} left in stock
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-center text-muted-foreground">
                <p>No low stock products at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* New Customers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New Customers</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/customers">
                  View All
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.newCustomers.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.newCustomers.map((customer: any) => (
                  <div key={customer.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-naaz-green text-white">
                        {customer.first_name?.[0]}{customer.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Joined {formatDate(customer.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-6 text-center text-muted-foreground">
                <p>No new customers recently</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
