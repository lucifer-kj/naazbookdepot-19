
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchCartItems, addItemToCart } from "./cart-queries";
import { updateCartItemQuantity, removeFromCart, clearCart } from "./cart-mutations";

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCartItems
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addItemToCart,
    onSuccess: (data) => {
      if (data.updated) {
        toast.success(`Updated quantity in cart (${data.quantity})`);
      } else {
        toast.success('Item added to cart');
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast.error(`Error adding to cart: ${error.message}`);
    }
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => 
      updateCartItemQuantity(cartItemId, quantity),
    onSuccess: (data) => {
      if (data.removed) {
        toast.success('Item removed from cart');
      } else {
        toast.success('Cart updated');
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast.error(`Error updating cart: ${error.message}`);
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId }: { cartItemId: string }) => removeFromCart(cartItemId),
    onSuccess: () => {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast.error(`Error removing item: ${error.message}`);
    }
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      toast.success('Cart cleared');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: Error) => {
      toast.error(`Error clearing cart: ${error.message}`);
    }
  });
};
