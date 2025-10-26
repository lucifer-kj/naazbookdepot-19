import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { columns } from './tables/productColumns';
import { DataTable } from '@/components/ui/data-table';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    stock: string;
    category_id: string;
    images: string[];
    tags: string[];
  }>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: [],
    tags: []
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([{
          ...formData,
          slug: formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [...prev, newProduct]);
      toast.success('Product created successfully');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create product');
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, ...data } : product
        )
      );
      toast.success('Product updated successfully');
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        toast.error('Failed to fetch products');
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your catalog.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={handleCreateProduct}
              isEditing={false}
              onCancel={() => setDialogOpen(false)}
              formData={formData}
              onFormDataChange={setFormData}
              isSubmitting={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns({
          onEdit: handleEditProduct,
          onDelete: handleDeleteProduct
        })}
        data={products}
        isLoading={isLoading}
      />
    </div>
  );
}