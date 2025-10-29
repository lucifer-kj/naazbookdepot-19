// Test helper functions (non-components)

export const createMockApiResponse = <T,>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const createMockApiError = (status = 500, message = 'Server Error') => {
  const error = new Error(message) as Error & { status?: number; response?: { status: number; statusText: string } };
  error.status = status;
  error.response = { status, statusText: message };
  return error;
};

// Mock data
export const mockUser = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockProduct = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  price: 19.99,
  description: 'A test book for testing purposes',
  image_url: 'https://example.com/test-book.jpg',
  category_id: '1',
  stock_quantity: 10,
  isbn: '1234567890',
  status: 'published' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockCategory = {
  id: '1',
  name: 'Fiction',
  description: 'Fictional books',
  slug: 'fiction',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};