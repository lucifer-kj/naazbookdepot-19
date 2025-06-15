
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from './ImageUpload';
import TagsInput from './TagsInput';
import EnhancedCategorySelect from './EnhancedCategorySelect';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  images: string[];
  tags: string[];
}

interface ProductFormProps {
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  errors = {},
  isSubmitting = false
}) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(e);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Product' : 'Create New Product'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-300' : ''}
              disabled={isSubmitting}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <EnhancedCategorySelect
              value={formData.category_id}
              onChange={(categoryId) => onFormDataChange({ ...formData, category_id: categoryId })}
              placeholder="Select Category"
              error={errors.category_id}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => onFormDataChange({ ...formData, price: e.target.value })}
              className={errors.price ? 'border-red-300' : ''}
              disabled={isSubmitting}
              required
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => onFormDataChange({ ...formData, stock: e.target.value })}
              className={errors.stock ? 'border-red-300' : ''}
              disabled={isSubmitting}
              required
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green disabled:bg-gray-100"
          />
        </div>

        <ImageUpload
          images={formData.images}
          onImagesChange={(images) => onFormDataChange({ ...formData, images })}
          disabled={isSubmitting}
        />

        <TagsInput
          tags={formData.tags}
          onTagsChange={(tags) => onFormDataChange({ ...formData, tags })}
          suggestions={['fiction', 'non-fiction', 'bestseller', 'new-release', 'classic', 'romance', 'mystery', 'science-fiction', 'biography', 'self-help']}
          placeholder="Add product tags (e.g., bestseller, new-release)..."
          disabled={isSubmitting}
        />

        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="bg-naaz-green hover:bg-naaz-green/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Product' : 'Create Product'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
