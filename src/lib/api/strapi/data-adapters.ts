
import { StrapiProduct } from './product-service';
import { StrapiCategory } from './category-service';
import { StrapiMedia, getMediaUrl } from './media-service';
import { Product, Category } from '@/lib/types/product';

/**
 * Adapts Strapi product data to our app's internal Product type
 */
export function adaptStrapiProduct(strapiProduct: StrapiProduct): Product {
  // Get the first image URL or empty string if none
  const imageUrl = strapiProduct.images?.data?.[0]?.attributes?.url || '';
  const imageAlt = strapiProduct.images?.data?.[0]?.attributes?.alternativeText || strapiProduct.name;
  
  // Map categories
  const categories = strapiProduct.categories?.data?.map(category => ({
    id: category.id.toString(),
    name: category.attributes.name,
    slug: category.attributes.slug,
  })) || [];
  
  return {
    id: strapiProduct.id,
    name: strapiProduct.name,
    slug: strapiProduct.slug,
    description: strapiProduct.description || '',
    short_description: strapiProduct.description?.substring(0, 150) || '',
    price: strapiProduct.price.toString(),
    regular_price: strapiProduct.price.toString(),
    sale_price: strapiProduct.sale_price?.toString() || null,
    on_sale: !!strapiProduct.sale_price && strapiProduct.sale_price < strapiProduct.price,
    stock_status: strapiProduct.stock_quantity > 0 ? 'instock' : 'outofstock',
    quantity_in_stock: strapiProduct.stock_quantity,
    categories,
    images: strapiProduct.images?.data?.map(img => ({
      id: img.id,
      src: getMediaUrl({url: img.attributes.url}),
      alt: img.attributes.alternativeText || strapiProduct.name
    })) || [],
    attributes: [], // Add attributes mapping if your Strapi schema has them
    sku: strapiProduct.sku || ''
  };
}

/**
 * Adapts Strapi category data to our app's internal Category type
 */
export function adaptStrapiCategory(strapiCategory: StrapiCategory): Category {
  return {
    id: strapiCategory.id,
    name: strapiCategory.name,
    slug: strapiCategory.slug,
    description: strapiCategory.description || '',
    count: strapiCategory.products?.data?.length || 0,
    image: strapiCategory.image?.data ? {
      src: getMediaUrl({url: strapiCategory.image.data.attributes.url}),
      alt: strapiCategory.image.data.attributes.alternativeText || strapiCategory.name
    } : undefined,
    parent: strapiCategory.parent?.data ? {
      id: strapiCategory.parent.data.id.toString(),
      name: strapiCategory.parent.data.attributes.name,
      slug: strapiCategory.parent.data.attributes.slug
    } : undefined
  };
}

/**
 * Convert our internal product type to Strapi format for creating/updating
 */
export function prepareProductForStrapi(product: Partial<Product>): any {
  return {
    name: product.name,
    description: product.description,
    price: parseFloat(product.price || '0'),
    sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
    stock_quantity: product.quantity_in_stock || 0,
    sku: product.sku,
    slug: product.slug,
    is_featured: product.is_featured || false,
    // Add handling for categories if needed
    // categories: product.categories?.map(c => c.id)
  };
}
