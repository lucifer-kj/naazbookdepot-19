import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts } from '../useProducts';
import { supabase } from '../../supabase';
import { mockProduct } from '../../../test/utils';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn()
    }))
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProducts Integration Tests', () => {
  let mockSupabaseFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      then: vi.fn()
    };
    (supabase.from as any).mockReturnValue(mockSupabaseFrom);
  });

  describe('Product Fetching', () => {
    it('should fetch products successfully', async () => {
      const products = [mockProduct];
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockSupabaseFrom.select).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockSupabaseFrom.then.mockResolvedValue({
        data: null,
        error,
        count: null
      });

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should apply search filters correctly', async () => {
      const searchQuery = 'fiction';
      const products = [{ ...mockProduct, category: 'fiction' }];
      
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { result } = renderHook(() => useProducts({ search: searchQuery }), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
      });

      expect(mockSupabaseFrom.ilike).toHaveBeenCalledWith('title', `%${searchQuery}%`);
    });

    it('should apply category filters correctly', async () => {
      const category = 'fiction';
      const products = [{ ...mockProduct, category }];
      
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { result } = renderHook(() => useProducts({ category }), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
      });

      expect(mockSupabaseFrom.eq).toHaveBeenCalledWith('category', category);
    });

    it('should apply price range filters correctly', async () => {
      const minPrice = 10;
      const maxPrice = 50;
      const products = [{ ...mockProduct, price: 25 }];
      
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { result } = renderHook(() => useProducts({ minPrice, maxPrice }), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
      });

      expect(mockSupabaseFrom.gte).toHaveBeenCalledWith('price', minPrice);
      expect(mockSupabaseFrom.lte).toHaveBeenCalledWith('price', maxPrice);
    });

    it('should apply sorting correctly', async () => {
      const sortBy = 'price_asc';
      const products = [mockProduct];
      
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { result } = renderHook(() => useProducts({ sortBy }), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
      });

      expect(mockSupabaseFrom.order).toHaveBeenCalledWith('price', { ascending: true });
    });

    it('should handle pagination correctly', async () => {
      const page = 2;
      const limit = 10;
      const products = [mockProduct];
      
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 25
      });

      const { result } = renderHook(() => useProducts({ page, limit }), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
        expect(result.current.totalCount).toBe(25);
        expect(result.current.totalPages).toBe(3);
      });

      const expectedStart = (page - 1) * limit;
      const expectedEnd = expectedStart + limit - 1;
      expect(mockSupabaseFrom.range).toHaveBeenCalledWith(expectedStart, expectedEnd);
    });
  });

  describe('Product Caching', () => {
    it('should cache products and return cached data on subsequent calls', async () => {
      const products = [mockProduct];
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { result, rerender } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
      });

      // Clear the mock to ensure it's not called again
      vi.clearAllMocks();
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      // Rerender should use cached data
      rerender();

      expect(result.current.data).toEqual(products);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should invalidate cache when filters change', async () => {
      const products1 = [mockProduct];
      const products2 = [{ ...mockProduct, id: 'product2', category: 'non-fiction' }];
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({
          data: products1,
          error: null,
          count: 1
        })
        .mockResolvedValueOnce({
          data: products2,
          error: null,
          count: 1
        });

      const { result, rerender } = renderHook(
        ({ category }) => useProducts({ category }),
        {
          wrapper: createWrapper(),
          initialProps: { category: 'fiction' }
        }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(products1);
      });

      // Change category filter
      rerender({ category: 'non-fiction' });

      await waitFor(() => {
        expect(result.current.data).toEqual(products2);
      });

      expect(supabase.from).toHaveBeenCalledTimes(2);
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time product updates', async () => {
      const initialProducts = [mockProduct];
      const updatedProduct = { ...mockProduct, title: 'Updated Title' };
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({
          data: initialProducts,
          error: null,
          count: 1
        })
        .mockResolvedValueOnce({
          data: [updatedProduct],
          error: null,
          count: 1
        });

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(initialProducts);
      });

      // Simulate real-time update by refetching
      await waitFor(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual([updatedProduct]);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed requests', async () => {
      const error = new Error('Network error');
      const products = [mockProduct];
      
      mockSupabaseFrom.then
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          data: products,
          error: null,
          count: 1
        });

      const { result } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });

      // Initial request should fail
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Retry should succeed
      await waitFor(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(products);
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should debounce search queries', async () => {
      const products = [mockProduct];
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      const { rerender } = renderHook(
        ({ search }) => useProducts({ search }),
        {
          wrapper: createWrapper(),
          initialProps: { search: '' }
        }
      );

      // Rapidly change search query
      rerender({ search: 'f' });
      rerender({ search: 'fi' });
      rerender({ search: 'fic' });
      rerender({ search: 'fiction' });

      // Should only make one API call after debounce
      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle concurrent requests correctly', async () => {
      const products = [mockProduct];
      mockSupabaseFrom.then.mockResolvedValue({
        data: products,
        error: null,
        count: 1
      });

      // Render multiple hooks simultaneously
      const { result: result1 } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });
      
      const { result: result2 } = renderHook(() => useProducts(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result1.current.data).toEqual(products);
        expect(result2.current.data).toEqual(products);
      });

      // Should share cached data, not make duplicate requests
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });
  });
});