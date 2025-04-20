
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SaleData {
  name: string;
  value: number;
}

interface SalesTrendChartProps {
  data: SaleData[];
}

const SalesTrendChart = ({ data }: SalesTrendChartProps) => {
  return (
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
            <BarChart data={data}>
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
  );
};

export default SalesTrendChart;
