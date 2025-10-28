import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../lib/context/CartContext';
import { AuthProvider } from '../../lib/context/AuthContext';
import { supabase } from '../../lib/supabase';
import { mockProduct, mockUser, mockCartItem } from '../../test/utils';

// Mock components for testing
const MockProductCard = ({ product }: { product: any }) => {
  const { addToCart } = useCart();
  
  return (
    <div data-testid={`product-${product.id}`}>
      <h3>{product.title}</h3>
      <p>${product.price}</p>
      <button 
        onClick={() => addToCart(product.id, 1)}
        data-testid={`add-to-cart-${product.id}`}
      >
        Add to Cart
      </button>
    </div>
  );
};

const MockCartSummary = () => {
  const { items, totalItems, subtotal, removeFromCart, updateQuantity } = useCart();
  
  return (
    <div data-testid="cart-summary">
      <p data-testid="total-items">Items: {totalItems}</p>
      <p data-testid="subtotal">Subtotal: ${subtotal.toFixed(2)}</p>
      {items.map(item => (
        <div key={item.id} data-testid={`cart-item-${item.id}`}>
          <span>{item.product?.title}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
            data-testid={`quantity-${item.id}`}
          />
          <button
            onClick={() => removeFromCart(item.id)}
            data-testid={`remove-${item.id}`}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

const MockCheckoutFlow = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const handleCheckout = () => {
    // Simulate checkout process
    clearCart();
  };
  
  return (
    <div data-testid="checkout-flow">
      <h2>Checkout</h2>
      {user ? (
        <p data-testid="user-email">{user.email}</p>
      ) : (
        <p data-testid="guest-checkout">Guest Checkout</p>
      )}
      <p data-testid="checkout-total">Total: ${subtotal.toFixed(2)}</p>
      <button onClick={handleCheckout} data-testid="complete-checkout">
        Complete Order
      </button>
    </div>
  );
};

// Import hooks after mocking
import { useCart } from '../../lib/hooks/useCart';
import { useAuth } from '../../lib/hooks/useAuth';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn()
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Cart Integration Tests', () => {
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
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Product to Cart Flow', () => {
    it('should add product to cart and update cart summary', async () => {
      const user = userEvent.setup();
      
      // Mock authenticated user
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: { ...mockUser, role: 'customer' }, error: null }) // Auth user fetch
        .mockResolvedValueOnce({ data: [], error: null }) // Initial cart load
        .mockResolvedValueOnce({ data: [mockCartItem], error: null }); // After add to cart

      render(
        <TestWrapper>
          <MockProductCard product={mockProduct} />
          <MockCartSummary />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
      });

      // Add product to cart
      const addButton = screen.getByTestId(`add-to-cart-${mockProduct.id}`);
      await user.click(addButton);

      // Verify cart is updated
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 2');
        expect(screen.getByTestId('subtotal')).toHaveTextContent(`Subtotal: $${(mockCartItem.quantity * mockCartItem.price).toFixed(2)}`);
      });

      expect(mockSupabaseFrom.insert).toHaveBeenCalled();
    });

    it('should handle guest user cart operations', async () => {
      const user = userEvent.setup();
      
      // Mock guest user
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      localStorageMock.getItem.mockReturnValue('[]');

      render(
        <TestWrapper>
          <MockProductCard product={mockProduct} />
          <MockCartSummary />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
      });

      // Add product to cart
      const addButton = screen.getByTestId(`add-to-cart-${mockProduct.id}`);
      await user.click(addButton);

      // Verify localStorage is used for guest users
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Cart Management Flow', () => {
    it('should update quantity and remove items from cart', async () => {
      const user = userEvent.setup();
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: { ...mockUser, role: 'customer' }, error: null })
        .mockResolvedValueOnce({ data: [mockCartItem], error: null }) // Initial cart load
        .mockResolvedValueOnce({ data: [{ ...mockCartItem, quantity: 3 }], error: null }) // After quantity update
        .mockResolvedValueOnce({ data: [], error: null }); // After remove

      render(
        <TestWrapper>
          <MockCartSummary />
        </TestWrapper>
      );

      // Wait for cart to load
      await waitFor(() => {
        expect(screen.getByTestId(`cart-item-${mockCartItem.id}`)).toBeInTheDocument();
      });

      // Update quantity
      const quantityInput = screen.getByTestId(`quantity-${mockCartItem.id}`);
      await user.clear(quantityInput);
      await user.type(quantityInput, '3');

      await waitFor(() => {
        expect(mockSupabaseFrom.update).toHaveBeenCalledWith({ quantity: 3 });
      });

      // Remove item
      const removeButton = screen.getByTestId(`remove-${mockCartItem.id}`);
      await user.click(removeButton);

      await waitFor(() => {
        expect(mockSupabaseFrom.delete).toHaveBeenCalled();
      });
    });
  });

  describe('Authentication Integration', () => {
    it('should migrate cart from localStorage to database on login', async () => {
      const user = userEvent.setup();
      
      // Start as guest with items in localStorage
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockCartItem]));

      const { rerender } = render(
        <TestWrapper>
          <MockCartSummary />
        </TestWrapper>
      );

      // Verify guest cart loads from localStorage
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 2');
      });

      // Simulate login
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: { ...mockUser, role: 'customer' }, error: null })
        .mockResolvedValueOnce({ data: [], error: null }) // Empty database cart
        .mockResolvedValueOnce({ data: [mockCartItem], error: null }); // After migration

      rerender(
        <TestWrapper>
          <MockCartSummary />
        </TestWrapper>
      );

      // Verify cart is migrated to database
      await waitFor(() => {
        expect(mockSupabaseFrom.insert).toHaveBeenCalled();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('cart_items');
      });
    });
  });

  describe('Checkout Integration', () => {
    it('should complete checkout flow for authenticated user', async () => {
      const user = userEvent.setup();
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: { ...mockUser, role: 'customer' }, error: null })
        .mockResolvedValueOnce({ data: [mockCartItem], error: null }) // Initial cart
        .mockResolvedValueOnce({ data: [], error: null }); // After checkout clear

      render(
        <TestWrapper>
          <MockCartSummary />
          <MockCheckoutFlow />
        </TestWrapper>
      );

      // Wait for cart and user to load
      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent(mockUser.email);
        expect(screen.getByTestId('checkout-total')).toHaveTextContent(`Total: $${(mockCartItem.quantity * mockCartItem.price).toFixed(2)}`);
      });

      // Complete checkout
      const checkoutButton = screen.getByTestId('complete-checkout');
      await user.click(checkoutButton);

      // Verify cart is cleared
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
      });
    });

    it('should handle guest checkout flow', async () => {
      const user = userEvent.setup();
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([mockCartItem]));

      render(
        <TestWrapper>
          <MockCartSummary />
          <MockCheckoutFlow />
        </TestWrapper>
      );

      // Wait for guest cart to load
      await waitFor(() => {
        expect(screen.getByTestId('guest-checkout')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-total')).toHaveTextContent(`Total: $${(mockCartItem.quantity * mockCartItem.price).toFixed(2)}`);
      });

      // Complete checkout
      const checkoutButton = screen.getByTestId('complete-checkout');
      await user.click(checkoutButton);

      // Verify cart is cleared
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully', async () => {
      const user = userEvent.setup();
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: { ...mockUser, role: 'customer' }, error: null })
        .mockResolvedValueOnce({ data: null, error: new Error('Database error') });

      render(
        <TestWrapper>
          <MockProductCard product={mockProduct} />
          <MockCartSummary />
        </TestWrapper>
      );

      // Wait for error handling
      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
      });

      // Try to add product - should handle error gracefully
      const addButton = screen.getByTestId(`add-to-cart-${mockProduct.id}`);
      await user.click(addButton);

      // Cart should remain empty due to error
      expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
    });

    it('should handle network errors with retry', async () => {
      const user = userEvent.setup();
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });
      
      mockSupabaseFrom.then
        .mockResolvedValueOnce({ data: { ...mockUser, role: 'customer' }, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: [mockCartItem], error: null });

      render(
        <TestWrapper>
          <MockProductCard product={mockProduct} />
          <MockCartSummary />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 0');
      });

      // First attempt should fail
      const addButton = screen.getByTestId(`add-to-cart-${mockProduct.id}`);
      await user.click(addButton);

      // Retry should succeed
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('total-items')).toHaveTextContent('Items: 2');
      });
    });
  });
});