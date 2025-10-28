import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { delay } from 'framer-motion';
import { resolve } from 'dns';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'customer' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockProduct = {
  id: 'test-product-id',
  title: 'Test Product',
  description: 'Test product description',
  price: 29.99,
  compare_at_price: 39.99,
  category: 'fiction',
  author: 'Test Author',
  publisher: 'Test Publisher',
  isbn: '1234567890',
  language: 'English',
  pages: 200,
  weight: 0.5,
  in_stock: true,
  stock_quantity: 10,
  featured: false,
  status: 'published' as const,
  images: ['test-image.jpg'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockCartItem = {
  id: 'test-cart-item-id',
  product_id: mockProduct.id,
  quantity: 2,
  price: mockProduct.price,
  product: mockProduct
};

export const mockAddress = {
  id: 'test-address-id',
  full_name: 'Test User',
  phone: '+919876543210',
  address_line1: '123 Test Street',
  address_line2: 'Apt 4B',
  city: 'Test City',
  state: 'Test State',
  pincode: '123456',
  country: 'India',
  is_default: true,
  address_type: 'home' as const
};

export const mockOrder = {
  id: 'test-order-id',
  user_id: mockUser.id,
  status: 'pending' as const,
  total_amount: 59.98,
  shipping_address: mockAddress,
  billing_address: mockAddress,
  payment_method: 'paypal' as const,
  payment_status: 'pending' as const,
  items: [mockCartItem],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Test helpers
export const createMockApiResponse = <T>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const createMockApiError = (status = 500, message = 'Server Error') => {
  const error = new Error(message) as any;
  error.status = status;
  error.response = { status, statusText: message };
  return Promise.reject(error);
};

// Form test helpers
export const fillForm = async (
  getByLabelText: any,
  formData: Record<string, string>
) => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();
  
  for (const [label, value] of Object.entries(formData)) {
    const field = getByLabelText(new RegExp(label, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async (getByRole: any, buttonText = 'submit') => {
  const userEvent = (await import('@testing-library/user-event')).default;
  const user = userEvent.setup();
  
  const submitButton = getByRole('button', { name: new RegExp(buttonText, 'i') });
  await user.click(submitButton);
};