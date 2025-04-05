
import fetchAPI from './wordpress-client';
import { useQuery } from '@tanstack/react-query';

export interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    }
  };
  categories: {
    nodes: {
      id: string;
      name: string;
      slug: string;
    }[];
  };
  author: {
    node: {
      name: string;
      avatar: {
        url: string;
      };
    };
  };
}

// Get all posts with pagination
export async function getPosts({
  first = 10,
  after = null,
  category = ''
}: {
  first?: number;
  after?: string | null;
  category?: string;
}) {
  let categoryFilter = '';
  if (category) {
    categoryFilter = `, where: { categoryName: "${category}" }`;
  }

  const query = `
    query GetPosts {
      posts(first: ${first}${after ? `, after: "${after}"` : ''}${categoryFilter}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          slug
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          categories {
            nodes {
              id
              name
              slug
            }
          }
          author {
            node {
              name
              avatar {
                url
              }
            }
          }
        }
      }
    }
  `;

  const data = await fetchAPI(query);
  return data.posts;
}

// Get a single post by slug
export async function getPost(slug: string) {
  const query = `
    query GetPost {
      post(id: "${slug}", idType: SLUG) {
        id
        title
        slug
        date
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
      }
    }
  `;

  const data = await fetchAPI(query);
  return data.post;
}

// Get post categories
export async function getPostCategories() {
  const query = `
    query GetCategories {
      categories(first: 100) {
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
  return data.categories.nodes;
}

// React Query hooks for blog posts
export function usePosts(options = {}) {
  return useQuery({
    queryKey: ['posts', options],
    queryFn: () => getPosts(options),
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug),
    enabled: !!slug,
  });
}

export function usePostCategories() {
  return useQuery({
    queryKey: ['postCategories'],
    queryFn: getPostCategories,
  });
}
