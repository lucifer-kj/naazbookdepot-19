
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [salesStats, setSalesStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    totalOrders: 0
  });
  
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [newCustomers, setNewCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This would normally come from Supabase, using mock data for now
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // This would be replaced with actual Supabase queries
        // Simulate API calls with timeout
        setTimeout(() => {
          // Mock sales data
          setSalesStats({
            daily: 1250,
            weekly: 8450,
            monthly: 32600,
            totalOrders: 156
          });
          
          // Mock orders by status
          setOrdersByStatus([
            { name: 'Pending', value: 35 },
            { name: 'Processing', value: 45 },
            { name: 'Shipped', value: 60 },
            { name: 'Delivered', value: 80 },
            { name: 'Cancelled', value: 15 }
          ]);
          
          // Mock low stock products
          setLowStockProducts([
            { id: 1, name: 'The Alchemist', sku: 'BK-001', stock: 5, price: 12.99 },
            { id: 2, name: 'Amber Oud Perfume', sku: 'PF-003', stock: 3, price: 89.99 },
            { id: 3, name: 'Prayer Mat - Premium', sku: 'ES-010', stock: 8, price: 34.99 },
            { id: 4, name: 'Quran with Tafsir', sku: 'BK-023', stock: 2, price: 45.99 },
          ]);
          
          // Mock recent orders
          setRecentOrders([
            { id: 'ORD-1001', customer: 'Aisha Khan', date: '2025-04-19', status: 'Processing', total: 124.95 },
            { id: 'ORD-1002', customer: 'Mohammed Ali', date: '2025-04-18', status: 'Shipped', total: 89.99 },
            { id: 'ORD-1003', customer: 'Sara Ahmed', date: '2025-04-18', status: 'Pending', total: 56.50 },
            { id: 'ORD-1004', customer: 'Yusuf Rahman', date: '2025-04-17', status: 'Delivered', total: 210.75 },
            { id: 'ORD-1005', customer: 'Fatima Hussein', date: '2025-04-17', status: 'Processing', total: 45.99 }
          ]);
          
          // Mock new customers
          setNewCustomers([
            { id: 1, name: 'Aisha Khan', email: 'aisha.khan@example.com', date: '2025-04-19' },
            { id: 2, name: 'Mohammed Ali', email: 'mohammed.ali@example.com', date: '2025-04-18' },
            { id: 3, name: 'Sara Ahmed', email: 'sara.ahmed@example.com', date: '2025-04-17' },
            { id: 4, name: 'Yusuf Rahman', email: 'yusuf.rahman@example.com', date: '2025-04-15' }
          ]);
          
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83232'];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={[{ label: "Dashboard" }]} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Daily Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-naaz-green mr-2" />
              <div className="text-2xl font-bold">${salesStats.daily.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Weekly Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-naaz-green mr-2" />
              <div className="text-2xl font-bold">${salesStats.weekly.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-naaz-green mr-2" />
              <div className="text-2xl font-bold">${salesStats.monthly.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingCart className="h-6 w-6 text-naaz-green mr-2" />
              <div className="text-2xl font-bold">{salesStats.totalOrders}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Low Stock Products</CardTitle>
            <Button size="sm" variant="outline">View All</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>In Stock</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{product.stock}</TableCell>
                    <TableCell>${product.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Orders</CardTitle>
            <Button size="sm" variant="outline">View All Orders</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>New Customers</CardTitle>
            <Button size="sm" variant="outline">View All Customers</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.date}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
