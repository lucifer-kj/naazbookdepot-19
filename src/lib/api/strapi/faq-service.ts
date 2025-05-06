
import { useQuery } from '@tanstack/react-query';
import { fetchStrapi } from '../strapi-client';

export interface StrapiFAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface FAQQueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filters?: Record<string, any>;
}

// FAQ fetching function with query parameters
export async function fetchFAQs(params: FAQQueryParams = {}) {
  // Build query string
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('pagination[page]', params.page.toString());
  if (params.pageSize) queryParams.append('pagination[pageSize]', params.pageSize.toString());
  if (params.sort) queryParams.append('sort', params.sort || 'category:asc,order:asc');
  
  // Add filters if they exist
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(`filters[${key}]`, value.toString());
      }
    });
  }
  
  const endpoint = `/faqs?${queryParams.toString()}`;
  return fetchStrapi<StrapiFAQ[]>(endpoint);
}

// Fetch FAQs by category
export async function fetchFAQsByCategory(category: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('filters[category][$eq]', category);
  queryParams.append('sort', 'order:asc');
  
  const endpoint = `/faqs?${queryParams.toString()}`;
  return fetchStrapi<StrapiFAQ[]>(endpoint);
}

// React Query hooks for FAQs
export function useFAQs(params: FAQQueryParams = {}) {
  return useQuery({
    queryKey: ['faqs', params],
    queryFn: () => fetchFAQs(params),
  });
}

export function useFAQsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['faqs', 'category', category],
    queryFn: () => fetchFAQsByCategory(category || ''),
    enabled: !!category,
  });
}

// Get unique FAQ categories
export function useFAQCategories() {
  const { data: faqs } = useFAQs({ pageSize: 100 });
  
  if (!faqs) return { data: [] };
  
  const categories = Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)));
  return { data: categories };
}
