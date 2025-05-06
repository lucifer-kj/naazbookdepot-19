
import { useQuery } from '@tanstack/react-query';
import { fetchStrapi } from '../strapi-client';

export interface StrapiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: {
    data: {
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    };
  };
  products?: {
    data: Array<{
      id: number;
    }>;
  };
  image?: {
    data: {
      id: number;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
}

// Fetch categories with optional filtering
export async function fetchCategories(params: CategoryQueryParams = {}) {
  // Build query string
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('pagination[page]', params.page.toString());
  if (params.pageSize) queryParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  
  // Add population for related data
  queryParams.append('populate', 'image,parent');
  
  // Add filters if they exist
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(`filters[${key}]`, value.toString());
      }
    });
  }
  
  const endpoint = `/categories?${queryParams.toString()}`;
  return fetchStrapi<StrapiCategory[]>(endpoint);
}

// Fetch a single category by slug
export async function fetchCategoryBySlug(slug: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('filters[slug][$eq]', slug);
  queryParams.append('populate', 'image,parent,products');
  
  const endpoint = `/categories?${queryParams.toString()}`;
  const categories = await fetchStrapi<StrapiCategory[]>(endpoint);
  
  return categories && categories.length > 0 ? categories[0] : null;
}

// React Query hooks for categories
export function useCategories(params: CategoryQueryParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => fetchCategories(params),
  });
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategoryBySlug(slug || ''),
    enabled: !!slug,
  });
}
