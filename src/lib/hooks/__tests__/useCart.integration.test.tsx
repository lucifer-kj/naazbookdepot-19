import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart } from '../useCart';
import { supabase } from '../../supabase';
import { mockProduct, mockUser, mockCartItem } from '../../../test/utils';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn()
    }))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
vi.stubGlobal('localStorage', localStorageMock);

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

describe('useCart Integration Tests', () => {
  let mockSupabaseFrom: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn()
    };
    (supabase.from as any).mockReturnValue(mockSupabaseFrom);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Cart Operations for Authenticated Users', () => {
    beforeEach(() => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });
    });

    it('should load cart items from database for authenticated users', async () => {
      const cartItems = [mockCartItem];
      mockSupabaseFrom.then.mockResolvedValue({
        data: cartItems,
        error: null
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(cartItems);
        expect(result.current.totalItems).toBe(2); // mockCartItem has quantity 2
      });

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
    });

    it('should add item to cart and sync with database', async () => {
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: [], error: null }) // Initial load
        .mockResolvedValueOnce({ data: [mockCartItem], error: null }); // After add

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.addToCart(mockProduct.id, 1);
      });

      expect(supabase.from).toHaveBeenCalledWith('cart_items');
      expect(mockSupabaseFrom.insert).toHaveBeenCalled();
    });

    it('should update item quantity and sync with database', async () => {
      const initialItems = [mockCartItem];
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: initialItems, error: null })
        .mockResolvedValueOnce({ data: [{ ...mockCartItem, quantity: 3 }], error: null });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(initialItems);
      });

      await act(async () => {
        await result.current.updateQuantity(mockCartItem.id, 3);
      });

      expect(mockSupabaseFrom.update).toHaveBeenCalledWith({ quantity: 3 });
    });

    it('should remove item from cart and sync with database', async () => {
      const initialItems = [mockCartItem];
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: initialItems, error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(initialItems);
      });

      await act(async () => {
        await result.current.removeFromCart(mockCartItem.id);
      });

      expect(mockSupabaseFrom.delete).toHaveBeenCalled();
    });

    it('should clear entire cart and sync with database', async () => {
      const initialItems = [mockCartItem];
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: initialItems, error: null })
        .mockResolvedValueOnce({ data: [], error: null });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(initialItems);
      });

      await act(async () => {
        await result.current.clearCart();
      });

      expect(mockSupabaseFrom.delete).toHaveBeenCalled();
    });
  });

  describe('Cart Operations for Guest Users', () => {
    beforeEach(() => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null
      });
      localStorageMock.getItem.mockReturnValue(null);
    });

    it('should load cart items from localStorage for guest users', async () => {
      const cartItems = [mockCartItem];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cartItems));

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(cartItems);
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith('cart_items');
    });

    it('should add item to localStorage for guest users', async () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.addToCart(mockProduct.id, 1);
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should migrate cart from localStorage to database on login', async () => {
      const guestCartItems = [mockCartItem];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(guestCartItems));

      // Start as guest
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null
      });

      const { result, rerender } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual(guestCartItems);
      });

      // Simulate login
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabaseFrom.then.mockResolvedValue({ data: [], error: null });

      rerender();

      await waitFor(() => {
        expect(mockSupabaseFrom.insert).toHaveBeenCalled();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart_items');
      });
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate correct totals', async () => {
      const cartItems = [
        { ...mockCartItem, quantity: 2, price: 10.00 },
        { ...mockCartItem, id: 'item2', quantity: 1, price: 15.00 }
      ];

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabaseFrom.then.mockResolvedValue({
        data: cartItems,
        error: null
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.totalItems).toBe(3); // 2 + 1
        expect(result.current.subtotal).toBe(35.00); // (2 * 10) + (1 * 15)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabaseFrom.then.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual([]);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle localStorage errors gracefully', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
        error: null
      });

      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual([]);
      });
    });
  });

  describe('Optimistic Updates', () => {
    it('should show optimistic updates while syncing', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: [], error: null })
        .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [mockCartItem], error: null }), 100)));

      const { result } = renderHook(() => useCart(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.items).toEqual([]);
      });

      act(() => {
        result.current.addToCart(mockProduct.id, 1);
      });

      // Should show optimistic update immediately
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 200 });
    });
  });
});