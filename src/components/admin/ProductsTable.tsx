
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Package, Tag } from 'lucide-react';
import { ProductStockIndicator } from '@/components/product/ProductStockIndicator';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  tags?: string[];
  categories?: { name: string };
  average_rating?: number;
  review_count?: number;
}

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  stockUpdateId: string | null;
  newStock: number;
  onStockUpdate: (productId: string) => void;
  onStockEditStart: (productId: string, currentStock: number) => void;
  onStockEditCancel: () => void;
  onNewStockChange: (stock: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEdit,
  onDelete,
  stockUpdateId,
  newStock,
  onStockUpdate,
  onStockEditStart,
  onStockEditCancel,
  onNewStockChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded object-cover"
                        src={product.images?.[0] || '/placeholder.svg'}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.categories?.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1 max-w-32">
                    {product.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {product.tags && product.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{product.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ProductStockIndicator productId={product.id} />
                    </div>
                    <div>
                      {stockUpdateId === product.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={newStock}
                            onChange={(e) => onNewStockChange(parseInt(e.target.value))}
                            className="w-20"
                            min="0"
                          />
                          <Button
                            size="sm"
                            onClick={() => onStockUpdate(product.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onStockEditCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStockEditStart(product.id, product.stock)}
                        >
                          <Package className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.average_rating ? `${product.average_rating.toFixed(1)} (${product.review_count})` : 'No reviews'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
