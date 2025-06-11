import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart } from 'lucide-react';
import type { OrderItem } from '@/lib/hooks/useOrders'; // Assuming OrderItem is exported or define it

interface AdminOrderItemsTableProps {
  items: OrderItem[];
  orderTotals: {
    subtotal?: number | null;
    shipping_amount?: number | null;
    tax_amount?: number | null;
    discount_amount?: number | null;
    total_amount?: number | null;
  };
  formatCurrency: (amount: number | null | undefined) => string;
}

const AdminOrderItemsTable: React.FC<AdminOrderItemsTableProps> = ({
  items,
  orderTotals,
  formatCurrency,
}) => {
  return (
    <div className="md:col-span-2 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4 flex items-center">
        <ShoppingCart className="mr-3 h-6 w-6 text-naaz-green" /> Order Items ({items.length})
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
            {items.map((item: OrderItem) => (
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
          <span className="font-semibold">{formatCurrency(orderTotals.subtotal)}</span>
        </div>
        <div className="flex justify-end items-center">
          <span className="text-gray-600 mr-2">Shipping:</span>
          <span className="font-semibold">{formatCurrency(orderTotals.shipping_amount)}</span>
        </div>
        <div className="flex justify-end items-center">
          <span className="text-gray-600 mr-2">Tax:</span>
          <span className="font-semibold">{formatCurrency(orderTotals.tax_amount)}</span>
        </div>
        {orderTotals.discount_amount && orderTotals.discount_amount > 0 ? (
          <div className="flex justify-end items-center text-green-600">
            <span className="mr-2">Discount:</span>
            <span className="font-semibold">- {formatCurrency(orderTotals.discount_amount)}</span>
          </div>
        ) : null}
        <div className="flex justify-end items-center text-xl font-bold text-naaz-gold">
          <span className="text-gray-800 mr-2">Grand Total:</span>
          <span>{formatCurrency(orderTotals.total_amount)}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderItemsTable;
