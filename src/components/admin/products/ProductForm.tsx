
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/lib/services/product-service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRealTimeProducts } from '@/lib/hooks/useRealTimeProducts';
import { Loader2, Save } from 'lucide-react';

interface ProductFormProps {
  productId?: string;
  initialData?: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    price: '',
    sale_price: '',
    quantity_in_stock: '0',
    category_id: '',
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categoriesData } = useCategories();
  
  // Set up real-time updates for this product if editing
  useRealTimeProducts({
    enabled: !!productId,
    productId,
    onProductUpdate: (updatedProduct) => {
      // Update form data if product was updated elsewhere
      if (updatedProduct && productId === updatedProduct.id) {
        setFormData({
          name: updatedProduct.name || '',
          sku: updatedProduct.sku || '',
          slug: updatedProduct.slug || '',
          description: updatedProduct.description || '',
          price: updatedProduct.price.toString() || '',
          sale_price: updatedProduct.sale_price?.toString() || '',
          quantity_in_stock: updatedProduct.quantity_in_stock.toString() || '0',
          category_id: updatedProduct.category_id || '',
          is_active: updatedProduct.is_active,
          is_featured: updatedProduct.is_featured,
          meta_title: updatedProduct.meta_title || '',
          meta_description: updatedProduct.meta_description || ''
        });
        toast.info('Product data refreshed with latest changes');
      }
    }
  });

  useEffect(() => {
    // Populate form with initial data if available
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        price: initialData.price.toString() || '',
        sale_price: initialData.sale_price?.toString() || '',
        quantity_in_stock: initialData.quantity_in_stock.toString() || '0',
        category_id: initialData.category_id || '',
        is_active: initialData.is_active,
        is_featured: initialData.is_featured,
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || ''
      });
    }
  }, [initialData]);

  // Create or update mutation
  const saveProductMutation = useMutation({
    mutationFn: async (data: any) => {
      if (productId) {
        // Update existing product
        const { data: updatedData, error } = await supabase
          .from('products')
          .update(data)
          .eq('id', productId)
          .select()
          .single();
          
        if (error) throw error;
        return updatedData;
      } else {
        // Create new product
        const { data: newData, error } = await supabase
          .from('products')
          .insert(data)
          .select()
          .single();
          
        if (error) throw error;
        return newData;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        toast.success('Product updated successfully');
      } else {
        toast.success('Product created successfully');
        navigate(`/admin/products/${data.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Error saving product: ${error.message}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare data for submission
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        quantity_in_stock: parseInt(formData.quantity_in_stock, 10),
      };
      
      // Check for required fields
      if (!productData.name || !productData.sku || !productData.slug || !productData.price) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      // Submit the data
      await saveProductMutation.mutateAsync(productData);
    } catch (error) {
      console.error('Error in form submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Product name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="Stock keeping unit"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug">Slug *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateSlug}
              className="text-xs"
            >
              Generate from name
            </Button>
          </div>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="product-url-slug"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleSelectChange('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {categoriesData?.flat.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sale_price">Sale Price</Label>
          <Input
            id="sale_price"
            name="sale_price"
            type="number"
            step="0.01"
            value={formData.sale_price}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity_in_stock">Quantity in Stock</Label>
          <Input
            id="quantity_in_stock"
            name="quantity_in_stock"
            type="number"
            value={formData.quantity_in_stock}
            onChange={handleChange}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-4 flex flex-col justify-end">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => handleSwitchChange('is_featured', checked)}
            />
            <Label htmlFor="is_featured">Featured</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Product description"
          rows={5}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meta_title">Meta Title</Label>
          <Input
            id="meta_title"
            name="meta_title"
            value={formData.meta_title || ''}
            onChange={handleChange}
            placeholder="SEO meta title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta Description</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            value={formData.meta_description || ''}
            onChange={handleChange}
            placeholder="SEO meta description"
            rows={2}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/products')}
          disabled={isLoading || saveProductMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || saveProductMutation.isPending}
          className="bg-naaz-green hover:bg-naaz-green/90"
        >
          {(isLoading || saveProductMutation.isPending) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Product
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
