
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;
export type ProductWithImages = Product & {
  product_images?: Tables<'product_images'>[];
  categories?: Tables<'categories'>;
};

export const useProducts = (shopType?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['products', shopType, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (shopType) {
        query = query.eq('shop_type', shopType);
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ProductWithImages[];
    },
  });
};

// Add Product Mutation
export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productData, images }: { productData: TablesInsert<'products'>, images?: File[] }) => {
      // 1. Insert product data (excluding images for now)
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;
      if (!product) throw new Error('Product creation failed.');

      // 2. If images are provided, upload them and link to product
      if (images && images.length > 0) {
        const imageUrls: { product_id: number; image_url: string }[] = [];
        for (const imageFile of images) {
          const timestamp = new Date().toISOString();
          const uniqueFileName = `${timestamp}_${imageFile.name.replace(/\s+/g, '_')}`;
          const path = `public/${product.id}/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(path, imageFile);

          if (uploadError) {
            console.error('Error uploading image:', uploadError.message);
            // Decide on error handling: continue without this image, or throw error
            continue; // Simple: skip this image
          }

          const { data: publicUrlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(path);

          if (publicUrlData?.publicUrl) {
            imageUrls.push({ product_id: product.id, image_url: publicUrlData.publicUrl });
          }
        }

        // 3. Insert image metadata into product_images table
        if (imageUrls.length > 0) {
          const { error: imageInsertError } = await supabase
            .from('product_images')
            .insert(imageUrls);
          if (imageInsertError) {
            console.error('Error inserting image metadata:', imageInsertError.message);
            // Potentially clean up uploaded images if this fails
          }
        }
      }
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Update Product Mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, productData, images }: { productId: number, productData: TablesUpdate<'products'>, images?: File[] }) => {
      // 1. Update product details
      const { data: updatedProduct, error: productUpdateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single();

      if (productUpdateError) throw productUpdateError;
      if (!updatedProduct) throw new Error('Product update failed.');

      // 2. Handle image updates (simplified: add new images, does not delete old ones for now)
      // For a more complete solution, you'd need to:
      //    - Identify existing images.
      //    - Allow deleting specific images.
      //    - Update existing image entries if needed (e.g., order).
      if (images && images.length > 0) {
        const newImageUrls: { product_id: number; image_url: string }[] = [];
        // Optional: Delete old images first if that's the desired behavior
        // const { error: deleteOldImagesError } = await supabase.from('product_images').delete().eq('product_id', productId);
        // if (deleteOldImagesError) console.error("Error deleting old images:", deleteOldImagesError.message);
        // const { data: oldStorageImages, error: listError } = await supabase.storage.from('product_images').list(`public/${productId}`);
        // if (oldStorageImages) {
        //   const filesToRemove = oldStorageImages.map(file => `public/${productId}/${file.name}`);
        //   await supabase.storage.from('product_images').remove(filesToRemove);
        // }


        for (const imageFile of images) {
          const timestamp = new Date().toISOString();
          const uniqueFileName = `${timestamp}_${imageFile.name.replace(/\s+/g, '_')}`;
          const path = `public/${updatedProduct.id}/${uniqueFileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(path, imageFile);

          if (uploadError) {
            console.error('Error uploading new image:', uploadError.message);
            continue;
          }

          const { data: publicUrlData } = supabase.storage
            .from('product_images')
            .getPublicUrl(path);

          if (publicUrlData?.publicUrl) {
            newImageUrls.push({ product_id: updatedProduct.id, image_url: publicUrlData.publicUrl });
          }
        }

        if (newImageUrls.length > 0) {
          const { error: imageInsertError } = await supabase
            .from('product_images')
            .insert(newImageUrls);
          if (imageInsertError) {
            console.error('Error inserting new image metadata:', imageInsertError.message);
          }
        }
      }
      return updatedProduct;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['product', data.id] });
        queryClient.invalidateQueries({ queryKey: ['product', data.slug] }); // Assuming slug might be used
      }
    },
  });
};

// Delete Product Mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      // Optional: More robustly delete associated images from storage and product_images table first
      // 1. Get all image URLs for the product
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      if (imagesError) {
        console.error("Error fetching product images for deletion:", imagesError.message);
      }

      // 2. Delete images from storage
      if (images && images.length > 0) {
        const filesToRemove: string[] = [];
        images.forEach(img => {
          // Extract the path from the public URL. This is a bit simplistic and might need adjustment
          // based on your exact URL structure and if you have a dedicated 'path' column.
          // Example: https://<project_ref>.supabase.co/storage/v1/object/public/product_images/public/123/image.jpg
          // We need the part after 'product_images/' which is 'public/123/image.jpg'
          try {
            const urlParts = new URL(img.image_url);
            const pathSegments = urlParts.pathname.split('/');
            // Find 'product_images' and take everything after it
            const bucketNameIndex = pathSegments.findIndex(segment => segment === 'product_images');
            if (bucketNameIndex !== -1 && bucketNameIndex + 1 < pathSegments.length) {
              filesToRemove.push(pathSegments.slice(bucketNameIndex + 1).join('/'));
            }
          } catch (e) {
            console.error("Error parsing image URL for storage deletion:", img.image_url, e);
          }
        });

        if (filesToRemove.length > 0) {
          const { error: storageDeleteError } = await supabase.storage
            .from('product_images')
            .remove(filesToRemove);
          if (storageDeleteError) {
            console.error("Error deleting images from storage:", storageDeleteError.message);
            // Decide if you want to proceed with deleting the product row if storage deletion fails
          }
        }
      }

      // 3. Delete image records from product_images table
      const { error: dbImagesDeleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (dbImagesDeleteError) {
        console.error("Error deleting product image records from DB:", dbImagesDeleteError.message);
      }

      // 4. Delete product from products table
      const { error: productDeleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (productDeleteError) throw productDeleteError;

      return productId;
    },
    onSuccess: (productId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Optionally, if you have individual product queries by ID that need invalidation:
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*),
          product_variants(*),
          product_reviews(*, users(full_name))
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });
};

export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['featured-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ProductWithImages[];
    },
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['search-products', query],
    queryFn: async () => {
      if (!query) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(*)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%,tags.cs.{${query}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithImages[];
    },
    enabled: !!query,
  });
};

export const useProductById = (productId: number | string | undefined) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      // Ensure productId is a number if it's a string representation of a number
      const numProductId = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      if (isNaN(numProductId)) return null; // Or throw an error if appropriate

      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('id', numProductId)
        .single();

      if (error) {
        // Handle case where product is not found, e.g., when creating a new product
        if (error.code === 'PGRST116') { // PostgREST error code for "Not Found"
          return null;
        }
        throw error;
      }
      return data as ProductWithImages; // Cast to ProductWithImages
    },
    enabled: !!productId,
  });
};
