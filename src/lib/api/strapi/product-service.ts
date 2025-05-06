
import { useQuery } from '@tanstack/react-query';
import { fetchStrapi } from '../strapi-client';

// Define types that match Strapi's content structure
export interface StrapiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  sku: string;
  slug: string;
  is_featured: boolean;
  categories?: {
    data: Array<{
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    }>;
  };
  images?: {
    data: Array<{
      id: number;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    }>;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
  populate?: string | string[];
}

// Product fetching function with query parameters
export async function fetchProducts(params: ProductQueryParams = {}) {
  // Build query string
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('pagination[page]', params.page.toString());
  if (params.pageSize) queryParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  
  // Add population for related data
  const populate = Array.isArray(params.populate) ? params.populate : ['images', 'categories'];
  queryParams.append('populate', populate.join(','));
  
  // Add filters if they exist
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(`filters[${key}]`, value.toString());
      }
    });
  }
  
  const endpoint = `/products?${queryParams.toString()}`;
  return fetchStrapi<StrapiProduct[]>(endpoint);
}

// Fetch a single product by slug
export async function fetchProductBySlug(slug: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('filters[slug][$eq]', slug);
  queryParams.append('populate', 'images,categories');
  
  const endpoint = `/products?${queryParams.toString()}`;
  const products = await fetchStrapi<StrapiProduct[]>(endpoint);
  
  return products && products.length > 0 ? products[0] : null;
}

// Fetch a single product by ID
export async function fetchProductById(id: string) {
  const endpoint = `/products/${id}?populate=images,categories`;
  return fetchStrapi<StrapiProduct>(endpoint);
}

// React Query hooks for products
export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', 'slug', slug],
    queryFn: () => fetchProductBySlug(slug || ''),
    enabled: !!slug,
  });
}

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => fetchProductById(id || ''),
    enabled: !!id,
  });
}
