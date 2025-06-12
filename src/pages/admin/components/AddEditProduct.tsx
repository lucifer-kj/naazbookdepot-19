import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProductById, useAddProduct, useUpdateProduct, ProductWithImages } from '@/lib/hooks/useProducts';
import { useCategories, Category } from '@/lib/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/lable';
import { Loader2, UploadCloud, XCircle } from 'lucide-react';
import type { TablesInsert, TablesUpdate, Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import BookDetailsFormSection from './formSections/BookDetailsFormSection';
import ProductImageManagement from './formSections/ProductImageManagement';

// Helper to generate slug
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

type ProductFormState = Omit<TablesInsert<'products'>, 'id' | 'created_at' | 'updated_at' | 'is_featured' | 'shop_type'> & {
  tags_string?: string; // For handling tags as a comma-separated string in the form
};

const initialProductData: ProductFormState = {
  name: '',
  description: '',
  price: 0,
  category_id: null,
  sku: '',
  tags: [],
  tags_string: '',
  is_active: true,
  slug: '',
  author: '',
  isbn: '',
  publisher: '',
  publication_year: null,
  language: 'English',
  pages: null,
  dimensions_json: null,
  weight_grams: null,
};


const AddEditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [productData, setProductData] = useState<ProductFormState>(initialProductData);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Tables<'product_images', 'Row'>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data fetching hooks
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: fetchedProduct, isLoading: isLoadingProduct, error: productError } = useProductById(productId);

  // Mutation hooks
  const addProductMutation = useAddProduct();
  const updateProductMutation = useUpdateProduct();

  useEffect(() => {
    if (fetchedProduct) {
      setProductData({
        name: fetchedProduct.name || '',
        description: fetchedProduct.description || '',
        price: fetchedProduct.price || 0,
        category_id: fetchedProduct.category_id || null,
        sku: fetchedProduct.sku || '',
        tags: fetchedProduct.tags || [],
        tags_string: (fetchedProduct.tags || []).join(', '),
        is_active: fetchedProduct.is_active === null ? true : fetchedProduct.is_active,
        slug: fetchedProduct.slug || '',
        author: fetchedProduct.author || '',
        isbn: fetchedProduct.isbn || '',
        publisher: fetchedProduct.publisher || '',
        publication_year: fetchedProduct.publication_year || null,
        language: fetchedProduct.language || 'English',
        pages: fetchedProduct.pages || null,
        dimensions_json: fetchedProduct.dimensions_json || null,
        weight_grams: fetchedProduct.weight_grams || null,
      });
      setExistingImages(fetchedProduct.product_images || []);
    }
  }, [fetchedProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setProductData(prev => ({ ...prev, [name]: value === '' ? null : parseFloat(value) }));
    } else {
      setProductData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductData(prev => ({ ...prev, category_id: e.target.value }));
    if (errors.category_id) {
      setErrors(prev => ({ ...prev, category_id: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const updatedPreviews = prev.filter((_, i) => i !== index);
      updatedPreviews.forEach(preview => URL.revokeObjectURL(preview));
      return updatedPreviews;
    });
  };

  const removeExistingImage = async (imageId: string, imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this image? This is permanent.")) return;
    try {
      let storagePath = '';
      try {
        const url = new URL(imageUrl);
        const pathSegments = url.pathname.split('/');
        const bucketNameIndex = pathSegments.findIndex(segment => segment === 'product_images');
        if (bucketNameIndex !== -1 && bucketNameIndex + 1 < pathSegments.length) {
          storagePath = pathSegments.slice(bucketNameIndex + 1).join('/');
        } else {
          throw new Error('Could not determine storage path from URL.');
        }
      } catch (e: any) {
        console.error("Error parsing image URL for storage deletion:", imageUrl, e);
        toast.error(`Error parsing image URL: ${e.message}. Deletion from storage may fail.`);
      }
      if (storagePath) {
        const { error: storageError } = await supabase.storage.from('product_images').remove([storagePath]);
        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
          toast.error(`Failed to delete image from storage: ${storageError.message}. It might still be listed.`);
        }
      }
      const { error: dbError } = await supabase.from('product_images').delete().eq('id', imageId);
      if (dbError) {
        throw dbError;
      }
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Image deleted successfully.");
    } catch (error: any) {
      console.error('Error deleting existing image:', error);
      toast.error(`Failed to delete image: ${error.message}`);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const validateForm = (data: ProductFormState): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!data.name.trim()) {
      newErrors.name = 'Product name is required.';
    }
    if (data.price === null || data.price === undefined || data.price <= 0) {
      newErrors.price = 'Price must be a positive number.';
    }
    if (!data.category_id) {
      newErrors.category_id = 'Category is required.';
    }
    if (data.publication_year !== null && data.publication_year !== undefined) {
      const year = Number(data.publication_year);
      if (!Number.isInteger(year) || year < 1000 || year > new Date().getFullYear() + 5) {
        newErrors.publication_year = `Enter a valid year (e.g., 1000 - ${new Date().getFullYear() + 5}).`;
      }
    }
    if (data.isbn && data.isbn.trim().length > 0 && (data.isbn.trim().length < 10 || data.isbn.trim().length > 13)) {
      newErrors.isbn = 'ISBN should be 10 or 13 characters long if provided.';
    }
    if (data.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens (e.g., my-product-slug).';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const formErrors = validateForm(productData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSaving(false);
      return;
    }
    setErrors({});
    let currentSlug = productData.slug || generateSlug(productData.name);
    if (!productData.slug && !productId) {
      productData.slug = currentSlug;
    }
    const payload: TablesInsert<'products'> | TablesUpdate<'products'> = {
      ...productData,
      price: Number(productData.price) || 0,
      tags: productData.tags_string ? productData.tags_string.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      category_id: productData.category_id || null,
      publication_year: productData.publication_year ? Number(productData.publication_year) : null,
      pages: productData.pages ? Number(productData.pages) : null,
      weight_grams: productData.weight_grams ? Number(productData.weight_grams) : null,
      shop_type: 'islamic-books',
    };
    delete (payload as any).tags_string;
    try {
      if (productId) {
        await updateProductMutation.mutateAsync({
          productId: Number(productId),
          productData: payload as TablesUpdate<'products'>,
          images: newImages
        });
        toast.success('Product updated successfully!');
      } else {
        await addProductMutation.mutateAsync({
          productData: payload as TablesInsert<'products'>,
          images: newImages
        });
        toast.success('Product added successfully!');
      }
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Error: ${error.message || 'Failed to save product.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProduct && productId) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-naaz-green" /> Loading product details...</div>;
  if (productError) return <div className="text-red-500 p-4">Error loading product: {productError.message}</div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl md:text-3xl font-bold text-naaz-green mb-8 text-center">
        {productId ? 'Edit Product' : 'Add New Product'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" value={productData.name} onChange={handleInputChange} placeholder="Product Name" required className="w-full border rounded-lg px-3 py-2"/>
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="slug" className="block text-sm font-medium mb-1">Slug (URL Path)</Label>
            <Input id="slug" name="slug" value={productData.slug} onChange={handleInputChange} placeholder="product-slug (auto-generated if blank)" className="w-full border rounded-lg px-3 py-2"/>
            {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="block text-sm font-medium mb-1">Description</Label>
          <Textarea id="description" name="description" value={productData.description || ''} onChange={handleInputChange} placeholder="Detailed product description" rows={4} className="w-full border rounded-lg px-3 py-2"/>
        </div>
        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="price" className="block text-sm font-medium mb-1">Price (₹) <span className="text-red-500">*</span></Label>
            <Input id="price" name="price" type="number" value={productData.price || ''} onChange={handleInputChange} placeholder="0.00" required min="0" step="0.01" className="w-full border rounded-lg px-3 py-2"/>
            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
          </div>
        </div>
        {/* Category & SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="category_id" className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></Label>
            <select id="category_id" name="category_id" value={productData.category_id || ''} onChange={handleCategoryChange} required className="w-full border rounded-lg px-3 py-2">
              <option value="">Select a category</option>
              {isLoadingCategories && <option value="loading" disabled>Loading categories...</option>}
              {categories?.map((category: Category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
          </div>
          <div>
            <Label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</Label>
            <Input id="sku" name="sku" value={productData.sku || ''} onChange={handleInputChange} placeholder="Product SKU" className="w-full border rounded-lg px-3 py-2"/>
          </div>
        </div>
        <BookDetailsFormSection
          productData={productData}
          handleInputChange={handleInputChange}
          errors={errors}
        />
        {/* Tags & Status */}
        <div>
          <Label htmlFor="tags_string" className="block text-sm font-medium mb-1">Tags</Label>
          <Input id="tags_string" name="tags_string" value={productData.tags_string || ''} onChange={handleInputChange} placeholder="Comma, separated, tags" className="w-full border rounded-lg px-3 py-2"/>
          <p className="text-xs text-gray-500 mt-1">Use commas to separate tags.</p>
        </div>
        <div className="flex items-center space-x-2">
          <input id="is_active" name="is_active" type="checkbox" checked={productData.is_active === null ? true : productData.is_active} onChange={handleInputChange} />
          <Label htmlFor="is_active" className="text-sm font-medium">Product is Active</Label>
        </div>
        <ProductImageManagement
          existingImages={existingImages}
          newImages={newImages}
          imagePreviews={imagePreviews}
          onImageChange={handleImageChange}
          onRemoveNewImage={removeNewImage}
          onRemoveExistingImage={(imageId, imageUrl) => removeExistingImage(String(imageId), imageUrl)}
        />
        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4">
           <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="bg-naaz-green text-white hover:bg-naaz-green/90 min-w-[120px]" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : (productId ? 'Save Changes' : 'Add Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
