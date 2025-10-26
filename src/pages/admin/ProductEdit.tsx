import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  images: string[];
  tags: string[];
}

export default function ProductEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // const product = await getProduct(id);
        // setFormData({
        //   name: product.name,
        //   description: product.description || '',
        //   price: product.price.toString(),
        //   stock: product.stock.toString(),
        //   category_id: product.category_id,
        //   images: product.images || [],
        //   tags: product.tags || []
        // });
      } catch (error) {
        console.error('Error loading product:', error);
        setErrors({
          submit: 'Failed to load product. Please try again.'
        });
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // await updateProduct(id, formData);
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({
        submit: 'Failed to update product. Please try again.'
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
                Edit Product
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Update product information and settings.
            </p>
          </div>
        </div>

        <ProductForm 
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
          errors={errors}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
}