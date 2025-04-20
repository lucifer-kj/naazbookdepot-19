
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductById } from '@/lib/services/product-service';
import ProductForm from '@/components/admin/products/ProductForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProductEditor = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewProduct = productId === 'new';
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch product data if editing an existing product
  const { data: product, isLoading, error } = useProductById(
    isNewProduct ? undefined : productId
  );
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      if (!productId || isNewProduct) return;
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    },
    onError: (error: any) => {
      toast.error(`Error deleting product: ${error.message}`);
    }
  });
  
  const handleDelete = () => {
    deleteProductMutation.mutate();
  };

  // If there's an error fetching the product
  if (error && !isNewProduct) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
        
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-red-600">Error loading product</h3>
          <p className="mt-2 text-gray-500">
            Could not load the requested product. It may have been deleted or you don't have permission to view it.
          </p>
          <Button className="mt-4" onClick={() => navigate('/admin/products')}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-2xl font-bold">
            {isNewProduct ? 'Create New Product' : 'Edit Product'}
          </h1>
        </div>
        
        {!isNewProduct && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product and remove its data from the server.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {isLoading && !isNewProduct ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductForm
            productId={isNewProduct ? undefined : productId}
            initialData={isNewProduct ? undefined : product}
          />
        </div>
      )}
    </div>
  );
};

export default ProductEditor;
