
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  quantity_in_stock: number;
}

interface LowStockAlertProps {
  products: Product[];
}

const LowStockAlert = ({ products }: LowStockAlertProps) => {
  return (
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
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
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
  );
};

export default LowStockAlert;
