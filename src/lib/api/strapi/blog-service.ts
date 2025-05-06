
import { useQuery } from '@tanstack/react-query';
import { fetchStrapi } from '../strapi-client';

export interface StrapiBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: {
    data: {
      id: number;
      attributes: {
        url: string;
        alternativeText?: string;
      };
    };
  };
  categories?: {
    data: Array<{
      id: number;
      attributes: {
        name: string;
        slug: string;
      };
    }>;
  };
  author?: {
    data: {
      id: number;
      attributes: {
        username: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface BlogQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
}

// Blog fetching function with query parameters
export async function fetchBlogPosts(params: BlogQueryParams = {}) {
  // Build query string
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('pagination[page]', params.page.toString());
  if (params.pageSize) queryParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  
  // Add population for related data
  queryParams.append('populate', 'featured_image,categories,author');
  
  // Add filters if they exist
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(`filters[${key}]`, value.toString());
      }
    });
  }
  
  const endpoint = `/blog-posts?${queryParams.toString()}`;
  return fetchStrapi<StrapiBlogPost[]>(endpoint);
}

// Fetch a single blog post by slug
export async function fetchBlogPostBySlug(slug: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('filters[slug][$eq]', slug);
  queryParams.append('populate', 'featured_image,categories,author');
  
  const endpoint = `/blog-posts?${queryParams.toString()}`;
  const posts = await fetchStrapi<StrapiBlogPost[]>(endpoint);
  
  return posts && posts.length > 0 ? posts[0] : null;
}

// Fetch a single blog post by ID
export async function fetchBlogPostById(id: string) {
  const endpoint = `/blog-posts/${id}?populate=featured_image,categories,author`;
  return fetchStrapi<StrapiBlogPost>(endpoint);
}

// React Query hooks for blog posts
export function useBlogPosts(params: BlogQueryParams = {}) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => fetchBlogPosts(params),
  });
}

export function useBlogPostBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['blog', 'slug', slug],
    queryFn: () => fetchBlogPostBySlug(slug || ''),
    enabled: !!slug,
  });
}

export function useBlogPostById(id: string | undefined) {
  return useQuery({
    queryKey: ['blog', 'id', id],
    queryFn: () => fetchBlogPostById(id || ''),
    enabled: !!id,
  });
}
