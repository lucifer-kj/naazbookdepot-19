
import { fetchStrapi } from '../strapi-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface StrapiCartItem {
  id: string;
  product: {
    data: {
      id: string;
      attributes: {
        name: string;
        slug: string;
        price: number;
        sale_price?: number;
        stock_quantity: number;
        images?: {
          data: Array<{
            id: string;
            attributes: {
              url: string;
              alternativeText?: string;
            };
          }>;
        };
      };
    };
  };
  quantity: number;
}

export interface StrapiCart {
  id: string;
  items: StrapiCartItem[];
  user?: {
    data: {
      id: string;
    };
  };
}

// Get the current user's cart
export async function fetchCart() {
  try {
    return fetchStrapi<StrapiCart>('/carts/me?populate=items,items.product,items.product.images');
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

// Add an item to the cart
export async function addToCart(productId: string, quantity: number) {
  try {
    return fetchStrapi<StrapiCart>('/carts/add-item', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItem(itemId: string, quantity: number) {
  try {
    return fetchStrapi<StrapiCart>('/carts/update-item', {
      method: 'PUT',
      body: JSON.stringify({
        itemId,
        quantity,
      }),
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

// Remove an item from the cart
export async function removeCartItem(itemId: string) {
  try {
    return fetchStrapi<StrapiCart>('/carts/remove-item', {
      method: 'DELETE',
      body: JSON.stringify({
        itemId,
      }),
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
}

// Clear the cart
export async function clearCart() {
  try {
    return fetchStrapi<StrapiCart>('/carts/clear', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// React Query hooks for cart
export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
  });
}

// Mutation hooks for cart operations
export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      addToCart(productId, quantity),
    onSuccess: () => {
      toast.success('Item added to cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(`Error adding to cart: ${error.message}`);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: (data) => {
      if (data) {
        toast.success('Cart updated');
      } else {
        toast.success('Item removed from cart');
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating cart: ${error.message}`);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ itemId }: { itemId: string }) => removeCartItem(itemId),
    onSuccess: () => {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(`Error removing item: ${error.message}`);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      toast.success('Cart cleared');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(`Error clearing cart: ${error.message}`);
    },
  });
}
