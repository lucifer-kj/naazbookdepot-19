
import fetchAPI from './wordpress-client';
import { useQuery } from '@tanstack/react-query';

export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: {
    sourceUrl: string;
    altText: string;
  };
  price: string;
  regularPrice: string;
  salePrice: string;
  onSale: boolean;
  stockStatus: string;
  categories: {
    nodes: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  description: string;
  children?: {
    nodes: Category[];
  };
}

// Get all products with pagination
export async function getProducts({ 
  first = 12,
  after = null,
  category = '',
  search = ''
}: {
  first?: number;
  after?: string | null;
  category?: string;
  search?: string;
}) {
  let categoryFilter = '';
  if (category) {
    categoryFilter = `, where: { categoryIn: "${category}" }`;
  }
  
  let searchFilter = '';
  if (search) {
    searchFilter = `, where: { search: "${search}" }`;
  }

  const query = `
    query GetProducts {
      products(first: ${first}${after ? `, after: "${after}"` : ''}${categoryFilter}${searchFilter}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          databaseId
          name
          slug
          description
          shortDescription
          image {
            sourceUrl
            altText
          }
          ... on SimpleProduct {
            price
            regularPrice
            salePrice
            onSale
            stockStatus
          }
          ... on VariableProduct {
            price
            regularPrice
            onSale
            stockStatus
          }
          categories {
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
  return data.products;
}

// Get a single product by slug
export async function getProduct(slug: string) {
  const query = `
    query GetProduct {
      product(id: "${slug}", idType: SLUG) {
        id
        databaseId
        name
        slug
        description
        shortDescription
        image {
          sourceUrl
          altText
        }
        galleryImages {
          nodes {
            sourceUrl
            altText
          }
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          onSale
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          onSale
          stockStatus
          variations {
            nodes {
              id
              name
              price
              regularPrice
              attributes {
                nodes {
                  name
                  value
                }
              }
            }
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
        attributes {
          nodes {
            name
            options
          }
        }
        related(first: 4) {
          nodes {
            id
            name
            slug
            image {
              sourceUrl
              altText
            }
            ... on SimpleProduct {
              price
            }
          }
        }
      }
    }
  `;

  const data = await fetchAPI(query);
  return data.product;
}

// Get all product categories
export async function getCategories() {
  const query = `
    query GetCategories {
      productCategories(first: 100) {
        nodes {
          id
          name
          slug
          count
          description
          children {
            nodes {
              id
              name
              slug
              count
              description
            }
          }
        }
      }
    }
  `;

  const data = await fetchAPI(query);
  return data.productCategories.nodes;
}

// React Query hooks for products
export function useProducts(options = {}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => getProducts(options),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}
