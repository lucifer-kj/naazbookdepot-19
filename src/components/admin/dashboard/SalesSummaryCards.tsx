
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, ChartBar, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SalesSummaryProps {
  salesSummary: {
    [key: string]: { amount: number; change: number };
  };
  orderCount: number;
  pendingOrders: number;
  lowStockCount: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (value: 'daily' | 'weekly' | 'monthly') => void;
}

const SalesSummaryCards = ({ 
  salesSummary, 
  orderCount, 
  pendingOrders, 
  lowStockCount, 
  timeframe, 
  onTimeframeChange 
}: SalesSummaryProps) => {
  return (
    <Tabs defaultValue={timeframe} onValueChange={(v) => onTimeframeChange(v as any)}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesSummary[timeframe].amount)}
            </div>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              {salesSummary[timeframe].change >= 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">
                    {Math.abs(salesSummary[timeframe].change)}% increase
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">
                    {Math.abs(salesSummary[timeframe].change)}% decrease
                  </span>
                </>
              )}
              &nbsp;from previous {timeframe === 'daily' ? 'day' : timeframe === 'weekly' ? 'week' : 'month'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <div className="text-xs text-muted-foreground">
              {pendingOrders} pending orders
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <div className="text-xs text-muted-foreground">
              Products requiring attention
            </div>
          </CardContent>
        </Card>
      </div>
    </Tabs>
  );
};

export default SalesSummaryCards;
