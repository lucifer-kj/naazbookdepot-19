import { Badge } from '@/components/ui/badge';
import { useProductStock } from '@/lib/hooks/useProductStock';

export function ProductStockIndicator({ productId }: { productId: string }) {
  const { data: stock, isLoading } = useProductStock(productId);

  if (isLoading || !stock) return null;

  const quantity = (stock.stock ?? 0) as number;

  const getStockStatus = (q: number) => {
    if (q <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (q < 5) return { label: 'Low Stock', variant: 'destructive' as const };
    if (q < 10) return { label: 'Limited', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const status = getStockStatus(quantity);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={status.variant}>{status.label}</Badge>
      {quantity > 0 && (
        <span className="text-sm text-muted-foreground">
          {quantity} available
        </span>
      )}
    </div>
  );
}
