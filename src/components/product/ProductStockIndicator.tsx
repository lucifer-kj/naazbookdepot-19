import { Badge } from '@/components/ui/badge';
import { useProductStock, type ProductStock } from '@/lib/hooks/useProductStock';

export function ProductStockIndicator({ productId }: { productId: string }) {
  const { data: stock, isLoading } = useProductStock(productId);

  if (isLoading || !stock) return null;

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity < 5) return { label: 'Low Stock', variant: 'destructive' as const };
    if (quantity < 10) return { label: 'Limited', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const status = getStockStatus(stock.stock_quantity as number);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.variant}>{status.label}</Badge>
      {(stock.stock_quantity as number) > 0 && (
        <span className="text-sm text-muted-foreground">
          {(stock.stock_quantity as number)} available
        </span>
      )}
    </div>
  );
}