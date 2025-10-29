import { ColumnDef, flexRender } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { format } from 'date-fns';

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  min_order_amount: number;
  is_active: boolean;
}

export const columns: ColumnDef<PromoCode>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      return (
        <code className="bg-muted px-2 py-1 rounded">
          {row.getValue('code')}
        </code>
      );
    },
  },
  {
    accessorKey: 'discount_percent',
    header: 'Discount',
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.getValue('discount_percent')}%
        </div>
      );
    },
  },
  {
    accessorKey: 'valid_from',
    header: 'Valid From',
    cell: ({ row }) => {
      return format(new Date(row.getValue('valid_from')), 'PPP');
    },
  },
  {
    accessorKey: 'valid_until',
    header: 'Valid Until',
    cell: ({ row }) => {
      return format(new Date(row.getValue('valid_until')), 'PPP');
    },
  },
  {
    accessorKey: 'current_uses',
    header: 'Usage',
    cell: ({ row }) => {
      const currentUses = row.getValue('current_uses') as number;
      const maxUses = row.original.max_uses;
      const percentage = (currentUses / maxUses) * 100;
      
      return (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentUses}/{maxUses}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'min_order_amount',
    header: 'Min. Order',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('min_order_amount'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
 
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const promoCode = row.original;
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                // Toggle active status
              }}
            >
              {promoCode.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Code
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
