
import { useState } from 'react';
import { useProducts, useDeleteProducts, useUpdateProductsStatus, type ProductFilters } from '@/lib/services/product-service';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from '@/components/ui/pagination';
import {
  ChevronDown,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  Edit,
  Eye
} from 'lucide-react';
import { toast } from "sonner";

export const ProductList = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  
  const { data, isLoading, isError } = useProducts(filters, page);
  const deleteProducts = useDeleteProducts();
  const updateStatus = useUpdateProductsStatus();

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const handleFilter = (key: keyof ProductFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (value: string) => {
    setFilters(prev => ({ ...prev, sort: value }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? (data?.products || []).map(p => p.id) : []);
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;
    if (window.confirm('Are you sure you want to delete the selected products?')) {
      await deleteProducts.mutateAsync(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleStatusUpdate = async (status: boolean) => {
    if (!selectedIds.length) return;
    await updateStatus.mutateAsync({ ids: selectedIds, status });
    setSelectedIds([]);
  };

  if (isError) {
    return <div>Error loading products</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Products</h2>
          <Button variant="outline" asChild>
            <a href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </a>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select onValueChange={(value) => handleFilter('category', value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {/* Add categories dynamically */}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilter('status', value as 'active' | 'inactive')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteProducts.isPending}
          >
            {deleteProducts.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate(true)}
            disabled={updateStatus.isPending}
          >
            Activate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate(false)}
            disabled={updateStatus.isPending}
          >
            Deactivate
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === (data?.products || []).length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data?.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              data?.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) => 
                        handleSelectOne(checked as boolean, product.id)
                      }
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.quantity_in_stock}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={`/admin/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/admin/products/${product.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedIds([product.id]);
                            handleDelete();
                          }}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="mx-4">
              Page {page} of {data.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
            >
              Next
            </Button>
          </Pagination>
        </div>
      )}
    </div>
  );
};
