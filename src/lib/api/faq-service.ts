
import fetchAPI from './wordpress-client';
import { useQuery } from '@tanstack/react-query';

export interface FAQItem {
  id: string;
  title: string;
  content: string;
  categories: {
    nodes: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
}

// Get all FAQs with optional category filter
export async function getFAQs(category = '') {
  let categoryFilter = '';
  if (category) {
    categoryFilter = `, where: { categoryName: "${category}" }`;
  }

  const query = `
    query GetFAQs {
      faqs(first: 100${categoryFilter}) {
        nodes {
          id
          title
          content
          categories: faqCategories {
            nodes {
              id
              name
              slug
            }
          }
        }
      }
    }
  `;

  const data = await fetchAPI(query);
  return data.faqs.nodes;
}

// Get FAQ categories
export async function getFAQCategories() {
  const query = `
    query GetFAQCategories {
      faqCategories(first: 100) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }
  `;

  const data = await fetchAPI(query);
  return data.faqCategories.nodes;
}

// React Query hooks for FAQs
export function useFAQs(category = '') {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: () => getFAQs(category),
  });
}

export function useFAQCategories() {
  return useQuery({
    queryKey: ['faqCategories'],
    queryFn: getFAQCategories,
  });
}
