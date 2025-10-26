import { ColumnDef, flexRender } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Product {
  id: string;
  title: string;
  price: number;
  category: { name: string };
  stock_quantity: number;
  is_featured: boolean;
  is_published: boolean;
}

interface ProductColumnsProps {
  onEdit: (id: string, data: Partial<Product>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const columns = ({ onEdit, onDelete }: ProductColumnsProps): ColumnDef<Product>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(price);
 
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'category.name',
    header: 'Category',
  },
  {
    accessorKey: 'stock_quantity',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.getValue('stock_quantity') as number;
      return (
        <Badge variant={stock > 10 ? 'default' : stock > 0 ? 'secondary' : 'destructive'}>
          {stock}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'is_featured',
    header: 'Featured',
    cell: ({ row }) => {
      const isFeatured = row.getValue('is_featured') as boolean;
      return (
        <Badge variant={isFeatured ? 'default' : 'secondary'}>
          {isFeatured ? 'Yes' : 'No'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'is_published',
    header: 'Status',
    cell: ({ row }) => {
      const isPublished = row.getValue('is_published') as boolean;
      return (
        <Badge variant={isPublished ? 'default' : 'secondary'}>
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;
 
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
              onClick={() => onEdit(product.id, {
                is_published: !product.is_published
              })}
            >
              {product.is_published ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(product.id, {
                is_featured: !product.is_featured
              })}
            >
              {product.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => window.location.href = `/admin/products/${product.id}/edit`}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(product.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];