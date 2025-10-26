import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCreateProduct } from '@/lib/hooks/admin/useAdminProducts';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  images: string[];
  tags: string[];
}

export default function AdminProductNew() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: [],
    tags: []
  });

  const createProduct = useCreateProduct();

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productPayload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price || '0'),
        stock: parseInt(formData.stock || '0', 10),
        category_id: formData.category_id,
        images: formData.images,
        tags: formData.tags,
      };

      const product = await createProduct.mutateAsync(productPayload as any);
      if (product?.id) {
        navigate(`/admin/products/${product.id}/edit`);
      } else {
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({
        submit: 'Failed to create product. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/products')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-2xl font-semibold tracking-tight">
                New Product
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a new product listing.
            </p>
          </div>
        </div>

        <ProductForm 
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={false}
          errors={errors}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
}