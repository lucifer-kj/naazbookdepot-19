import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductsTable from '@/components/admin/ProductsTable';
import { Button } from '@/components/ui/button';
import ProductFilters from '@/components/admin/ProductFilters';

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

export default function AdminProducts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [stockUpdateId, setStockUpdateId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState(0);

  const handleEdit = (product: Product) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
          handleDatabaseError(error, 'delete_product', { productId: id });
        });
      }
    }
  };

  const handleStockEditStart = (productId: string, currentStock: number) => {
    setStockUpdateId(productId);
    setNewStock(currentStock);
  };

  const handleStockUpdate = async (productId: string) => {
    try {
      // await updateProductStock(productId, newStock);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));
      setStockUpdateId(null);
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
        handleDatabaseError(error, 'update_stock', { productId: id, newStock });
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <Button onClick={() => navigate('/admin/products/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onClearFilters={() => {
            setSearchQuery('');
            setCategoryFilter('');
          }}
        />

        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          stockUpdateId={stockUpdateId}
          newStock={newStock}
          onStockUpdate={handleStockUpdate}
          onStockEditStart={handleStockEditStart}
          onStockEditCancel={() => setStockUpdateId(null)}
          onNewStockChange={setNewStock}
        />
      </div>
    </AdminLayout>
  );
}