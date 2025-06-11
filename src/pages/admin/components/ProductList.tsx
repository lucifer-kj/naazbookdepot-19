import React from 'react';
import { Button } from '@/components/ui/button';
import { useProducts, useDeleteProduct, ProductWithImages } from '@/lib/hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts();
  const deleteProductMutation = useDeleteProduct();

  const handleDelete = (productId: number, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      deleteProductMutation.mutate(productId, {
        onSuccess: () => {
          // Optionally show a success notification
          alert(`Product "${productName}" deleted successfully.`);
        },
        onError: (err) => {
          // Optionally show an error notification
          alert(`Error deleting product: ${err.message}`);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-naaz-green" />
        <p className="ml-2 text-lg">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Fetching Products</h2>
        <p className="text-center max-w-md">{error.message || 'An unexpected error occurred. Please try again later.'}</p>
        {/* You could add a retry button here */}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-naaz-green">Product Management</h1>
        <Button
          className="bg-naaz-green text-white hover:bg-naaz-green/90"
          onClick={() => navigate('/admin/products/add')}
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Product
        </Button>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left border-b">
              <th className="py-3 px-4 font-semibold text-gray-600">Image</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Price</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Stock</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600">Category</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products && products.length > 0 ? products.map((product: ProductWithImages) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <img
                    src={product.product_images && product.product_images.length > 0 ? product.product_images[0].image_url : '/placeholder-image.png'}
                    alt={product.name || 'Product image'}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="py-3 px-4 font-medium text-gray-800">{product.name}</td>
                <td className="py-3 px-4 text-gray-600">₹{product.price?.toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-600">{product.stock_quantity ?? 'N/A'}</td>
                <td className={`py-3 px-4 font-semibold ${product.is_active ? 'text-green-600' : 'text-red-500'}`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </td>
                <td className="py-3 px-4 text-gray-600">{product.categories?.name || 'N/A'}</td>
                <td className="py-3 px-4 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => navigate(`/product/${product.slug}`)} // View on site
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-naaz-gold border-naaz-gold hover:bg-naaz-gold/10 hover:text-naaz-gold"
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(product.id, product.name || 'Unknown Product')}
                    disabled={deleteProductMutation.isPending && deleteProductMutation.variables === product.id}
                  >
                    {deleteProductMutation.isPending && deleteProductMutation.variables === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  <p className="text-lg">No products found.</p>
                  <p>Click "Add Product" to get started.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
