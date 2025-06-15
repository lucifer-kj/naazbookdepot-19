import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/admin/useAdminProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { useUpdateStock, useStockHistory } from '@/lib/hooks/useStockHistory';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductFilters from '@/components/admin/ProductFilters';
import ProductForm from '@/components/admin/ProductForm';
import ProductsTable from '@/components/admin/ProductsTable';
import StockHistoryPanel from '@/components/admin/StockHistoryPanel';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useCategories();
  const { data: stockHistory } = useStockHistory();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStock = useUpdateStock();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [stockUpdateId, setStockUpdateId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [showStockHistory, setShowStockHistory] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: [] as string[],
    tags: [] as string[],
  });

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    if (query !== searchQuery) {
      setSearchParams(prev => {
        if (query) {
          prev.set('search', query);
        } else {
          prev.delete('search');
        }
        return prev;
      });
    }
  };

  const handleClearFilters = () => {
    setLocalSearchQuery('');
    setCategoryFilter('');
    setSearchParams({});
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = !localSearchQuery || 
      product.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(localSearchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: formData.category_id,
      images: formData.images,
      tags: formData.tags,
    };

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, ...productData });
        setEditingProduct(null);
      } else {
        await createProduct.mutateAsync(productData);
        setShowCreateForm(false);
      }
      
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        images: [],
        tags: [],
      });
    } catch (error) {
      console.error('Error saving product:', error);
      setFormErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id,
      images: product.images || [],
      tags: product.tags || [],
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleStockUpdate = async (productId: string) => {
    try {
      await updateStock.mutateAsync({
        productId,
        newStock,
        changeType: 'adjustment',
        reason: 'Manual stock adjustment',
      });
      setStockUpdateId(null);
      setNewStock(0);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleStockEditStart = (productId: string, currentStock: number) => {
    setStockUpdateId(productId);
    setNewStock(currentStock);
  };

  const handleStockEditCancel = () => {
    setStockUpdateId(null);
    setNewStock(0);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
    setFormErrors({});
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: [],
      tags: [],
    });
  };

  const handleAddProduct = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
    setFormErrors({});
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      images: [],
      tags: [],
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-naaz-green">Products</h1>
            <p className="text-gray-600">Manage your product catalog ({filteredProducts.length} products)</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button
              onClick={() => setShowStockHistory(!showStockHistory)}
              variant="outline"
              className="flex items-center"
            >
              <History className="h-4 w-4 mr-2" />
              Stock History
            </Button>
            <Button
              onClick={handleAddProduct}
              className="bg-naaz-green hover:bg-naaz-green/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <ProductFilters
          searchQuery={localSearchQuery}
          onSearchChange={handleSearch}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categories={categories}
          onClearFilters={handleClearFilters}
        />

        {showStockHistory && <StockHistoryPanel stockHistory={stockHistory} />}

        {showCreateForm && (
          <ProductForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingProduct}
            errors={formErrors}
            isSubmitting={isSubmitting}
          />
        )}

        <ProductsTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          stockUpdateId={stockUpdateId}
          newStock={newStock}
          onStockUpdate={handleStockUpdate}
          onStockEditStart={handleStockEditStart}
          onStockEditCancel={handleStockEditCancel}
          onNewStockChange={setNewStock}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
