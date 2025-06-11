import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProductById, useAddProduct, useUpdateProduct, ProductWithImages } from '@/lib/hooks/useProducts';
import { useCategories, Category } from '@/lib/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, XCircle } from 'lucide-react';
import type { TablesInsert, TablesUpdate, Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

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
  category_id: undefined,
  sku: '',
  tags: [],
  tags_string: '',
  stock_quantity: 0,
  low_stock_threshold: 5,
  is_active: true,
  slug: '',
  author: '',
  isbn: '',
  publisher: '',
  publication_year: null,
  language: 'English',
  page_count: null,
  dimensions: '',
  weight: null,
  // shop_type: 'islamic-books', // Default or make it selectable
};


const AddEditProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [productData, setProductData] = useState<ProductFormState>(initialProductData);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Tables<'product_images'>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Data fetching hooks
  const { data: categories, isLoading: isLoadingCategories } = useCategories(); // Assuming 'islamic-books' or make it dynamic
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
        category_id: fetchedProduct.category_id || undefined,
        sku: fetchedProduct.sku || '',
        tags: fetchedProduct.tags || [],
        tags_string: (fetchedProduct.tags || []).join(', '),
        stock_quantity: fetchedProduct.stock_quantity || 0,
        low_stock_threshold: fetchedProduct.low_stock_threshold || 5,
        is_active: fetchedProduct.is_active === null ? true : fetchedProduct.is_active,
        slug: fetchedProduct.slug || '',
        author: fetchedProduct.author || '',
        isbn: fetchedProduct.isbn || '',
        publisher: fetchedProduct.publisher || '',
        publication_year: fetchedProduct.publication_year || null,
        language: fetchedProduct.language || 'English',
        page_count: fetchedProduct.page_count || null,
        dimensions: fetchedProduct.dimensions || '',
        weight: fetchedProduct.weight || null,
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
    }
    else {
        setProductData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setProductData(prev => ({ ...prev, category_id: parseInt(value, 10) }));
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
      updatedPreviews.forEach(preview => URL.revokeObjectURL(preview)); // Clean up old preview
      return updatedPreviews;
    });
  };

  const removeExistingImage = async (imageId: number, imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this image? This is permanent.")) return;

    try {
      // 1. Extract path from URL for storage deletion
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
        // Proceed with DB deletion anyway or stop? For now, proceed.
      }

      // 2. Delete from storage if path is valid
      if (storagePath) {
        const { error: storageError } = await supabase.storage.from('product_images').remove([storagePath]);
        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
          toast.error(`Failed to delete image from storage: ${storageError.message}. It might still be listed.`);
          // Optionally, you might decide to not proceed with DB deletion if storage deletion fails critically
        }
      }

      // 3. Delete from product_images table
      const { error: dbError } = await supabase.from('product_images').delete().eq('id', imageId);
      if (dbError) { // If DB deletion fails, this is a more critical error.
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
    // Clean up image previews on component unmount
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
    if (data.stock_quantity === null || data.stock_quantity === undefined || data.stock_quantity < 0 || !Number.isInteger(data.stock_quantity)) {
      newErrors.stock_quantity = 'Stock quantity must be a non-negative integer.';
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
    // Basic ISBN check (very simplified) - allows empty or basic length check
    if (data.isbn && data.isbn.trim().length > 0 && (data.isbn.trim().length < 10 || data.isbn.trim().length > 13)) {
        newErrors.isbn = 'ISBN should be 10 or 13 characters long if provided.';
    }
    // Basic slug check
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
    setErrors({}); // Clear previous errors

    let currentSlug = productData.slug || generateSlug(productData.name);
    if (!productData.slug && !productId) { // Only auto-generate slug for new products if not manually set
        // Potentially check for slug uniqueness here if critical, or rely on DB constraints
        productData.slug = currentSlug;
    }

    const payload: TablesInsert<'products'> | TablesUpdate<'products'> = {
      ...productData,
      price: Number(productData.price) || 0,
      stock_quantity: Number(productData.stock_quantity) || 0,
      low_stock_threshold: Number(productData.low_stock_threshold) || 0,
      tags: productData.tags_string ? productData.tags_string.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      category_id: productData.category_id ? Number(productData.category_id) : null,
      publication_year: productData.publication_year ? Number(productData.publication_year) : null,
      page_count: productData.page_count ? Number(productData.page_count) : null,
      weight: productData.weight ? Number(productData.weight) : null,
      shop_type: 'islamic-books', // Hardcoded for now, make dynamic if needed
    };
    // Remove fields not in DB or handled separately
    delete (payload as any).tags_string;


    try {
      if (productId) {
        await updateProductMutation.mutateAsync({
          productId: parseInt(productId, 10),
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
          <div>
            <Label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">Stock Quantity <span className="text-red-500">*</span></Label>
            <Input id="stock_quantity" name="stock_quantity" type="number" value={productData.stock_quantity || ''} onChange={handleInputChange} placeholder="0" required min="0" step="1" className="w-full border rounded-lg px-3 py-2"/>
            {errors.stock_quantity && <p className="text-sm text-red-500 mt-1">{errors.stock_quantity}</p>}
          </div>
           <div>
            <Label htmlFor="low_stock_threshold" className="block text-sm font-medium mb-1">Low Stock Alert</Label>
            <Input id="low_stock_threshold" name="low_stock_threshold" type="number" value={productData.low_stock_threshold || ''} onChange={handleInputChange} placeholder="5" min="0" step="1" className="w-full border rounded-lg px-3 py-2"/>
          </div>
        </div>

        {/* Category & SKU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="category_id" className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></Label>
            <Select name="category_id" value={productData.category_id?.toString()} onValueChange={handleCategoryChange} required>
              <SelectTrigger className="w-full border rounded-lg px-3 py-2">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories && <SelectItem value="loading" disabled>Loading categories...</SelectItem>}
                {categories?.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
          </div>
          <div>
            <Label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</Label>
            <Input id="sku" name="sku" value={productData.sku || ''} onChange={handleInputChange} placeholder="Product SKU" className="w-full border rounded-lg px-3 py-2"/>
          </div>
        </div>

        {/* Book Specific Fields - Assuming shop_type is 'islamic-books' */}
        <fieldset className="border p-4 rounded-lg">
            <legend className="text-lg font-medium text-naaz-green px-2">Book Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                 <div>
                    <Label htmlFor="author" className="block text-sm font-medium mb-1">Author</Label>
                    <Input id="author" name="author" value={productData.author || ''} onChange={handleInputChange} placeholder="Author Name" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div>
                    <Label htmlFor="isbn" className="block text-sm font-medium mb-1">ISBN</Label>
                    <Input id="isbn" name="isbn" value={productData.isbn || ''} onChange={handleInputChange} placeholder="978-xxxxxxxxxx" className="w-full border rounded-lg px-3 py-2"/>
                    {errors.isbn && <p className="text-sm text-red-500 mt-1">{errors.isbn}</p>}
                </div>
                <div>
                    <Label htmlFor="publisher" className="block text-sm font-medium mb-1">Publisher</Label>
                    <Input id="publisher" name="publisher" value={productData.publisher || ''} onChange={handleInputChange} placeholder="Publisher Name" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div>
                    <Label htmlFor="publication_year" className="block text-sm font-medium mb-1">Publication Year</Label>
                    <Input id="publication_year" name="publication_year" type="number" value={productData.publication_year || ''} onChange={handleInputChange} placeholder="YYYY" min="1000" max={new Date().getFullYear() + 5} className="w-full border rounded-lg px-3 py-2"/>
                    {errors.publication_year && <p className="text-sm text-red-500 mt-1">{errors.publication_year}</p>}
                </div>
                 <div>
                    <Label htmlFor="language" className="block text-sm font-medium mb-1">Language</Label>
                    <Input id="language" name="language" value={productData.language || ''} onChange={handleInputChange} placeholder="e.g., English, Arabic" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div>
                    <Label htmlFor="page_count" className="block text-sm font-medium mb-1">Page Count</Label>
                    <Input id="page_count" name="page_count" type="number" value={productData.page_count || ''} onChange={handleInputChange} placeholder="Number of pages" min="1" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                <div>
                    <Label htmlFor="dimensions" className="block text-sm font-medium mb-1">Dimensions (cm)</Label>
                    <Input id="dimensions" name="dimensions" value={productData.dimensions || ''} onChange={handleInputChange} placeholder="e.g., 15 x 22 x 3" className="w-full border rounded-lg px-3 py-2"/>
                </div>
                 <div>
                    <Label htmlFor="weight" className="block text-sm font-medium mb-1">Weight (grams)</Label>
                    <Input id="weight" name="weight" type="number" value={productData.weight || ''} onChange={handleInputChange} placeholder="e.g., 500" min="1" className="w-full border rounded-lg px-3 py-2"/>
                </div>
            </div>
        </fieldset>

        {/* Tags & Status */}
        <div>
          <Label htmlFor="tags_string" className="block text-sm font-medium mb-1">Tags</Label>
          <Input id="tags_string" name="tags_string" value={productData.tags_string || ''} onChange={handleInputChange} placeholder="Comma, separated, tags" className="w-full border rounded-lg px-3 py-2"/>
          <p className="text-xs text-gray-500 mt-1">Use commas to separate tags.</p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="is_active" name="is_active" checked={productData.is_active === null ? true : productData.is_active} onCheckedChange={(checked) => setProductData(prev => ({...prev, is_active: Boolean(checked)}))} />
          <Label htmlFor="is_active" className="text-sm font-medium">Product is Active</Label>
        </div>

        {/* Image Upload */}
        <div>
          <Label className="block text-sm font-medium mb-2">Product Images</Label>
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Current Images:</h4>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt="Existing product" className="w-24 h-24 object-cover rounded-md border border-gray-300" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(img.id, img.image_url)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <Label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-naaz-green hover:text-naaz-green-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-naaz-green-light">
                  <span>Upload files</span>
                  <Input id="file-upload" name="file-upload" type="file" multiple onChange={handleImageChange} className="sr-only" accept="image/*" />
                </Label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">New Images Preview:</h4>
              <div className="flex flex-wrap gap-3">
                {imagePreviews.map((previewUrl, index) => (
                  <div key={index} className="relative group">
                    <img src={previewUrl} alt={`New preview ${index + 1}`} className="w-24 h-24 object-cover rounded-md border border-gray-300" />
                     <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeNewImage(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
