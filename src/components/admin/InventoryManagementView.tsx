import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProductStock, useUpdateStock } from '@/lib/hooks/useProductStock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAdminProducts } from '@/lib/hooks/admin/useAdminProducts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export function InventoryManagementView() {
  const { data: products, isLoading } = useAdminProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="w-full h-12" />
                  </TableCell>
                </TableRow>
              ) : products?.map((product) => (
                <ProductStockRow
                  key={product.id}
                  productId={product.id}
                  productName={product.title || product.name || product.id}
                  onUpdate={() => setSelectedProductId(product.id)}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {selectedProductId && (
        <UpdateStockDialog
          productId={selectedProductId}
          productName={products?.find(p => p.id === selectedProductId)?.title || selectedProductId}
          open={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </Card>
  );
}

function ProductStockRow({ 
  productId, 
  productName,
  onUpdate
}: { 
  productId: string;
  productName: string;
  onUpdate: () => void;
}) {
  const { data: stock, isLoading } = useProductStock(productId);

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={4}>
          <Skeleton className="w-full h-8" />
        </TableCell>
      </TableRow>
    );
  }

  if (!stock) return null;

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity < 5) return { label: 'Low Stock', variant: 'secondary' as const };
    if (quantity < 10) return { label: 'Limited', variant: 'outline' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const status = getStockStatus(stock.stock);

  return (
    <TableRow>
      <TableCell>{productName}</TableCell>
      <TableCell>{stock.stock}</TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell>
        <Button variant="outline" size="sm" onClick={onUpdate}>
          Update Stock
        </Button>
      </TableCell>
    </TableRow>
  );
}

function UpdateStockDialog({ 
  productId,
  productName,
  open, 
  onClose 
}: { 
  productId: string;
  productName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: stock } = useProductStock(productId);
  const updateStock = useUpdateStock();
  const [quantity, setQuantity] = useState<number>(0);
  const [action, setAction] = useState<'add' | 'subtract' | 'set'>('set');
  const [reason, setReason] = useState('manual-update');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStock.mutateAsync({
      productId,
      quantity,
      action,
      reason
    });
    onClose();
  };

  if (!stock) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock: {productName}</DialogTitle>
          <DialogDescription>
            Current stock level: {stock.stock}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="action">Action</Label>
            <Select
              value={action}
              onValueChange={(value: 'add' | 'subtract' | 'set') => setAction(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add Stock</SelectItem>
                <SelectItem value="subtract">Remove Stock</SelectItem>
                <SelectItem value="set">Set Stock Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual-update">Manual Update</SelectItem>
                <SelectItem value="inventory-count">Inventory Count</SelectItem>
                <SelectItem value="damaged">Damaged/Lost</SelectItem>
                <SelectItem value="return">Return to Stock</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={updateStock.isPending || quantity < 0}
            >
              {updateStock.isPending ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}