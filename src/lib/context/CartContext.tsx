
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  productId: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  animationTrigger: number;
}

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction = 
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; items: CartItem[] }
  | { type: 'TRIGGER_ANIMATION' };

const cartReducer = (state: Cart, action: CartAction): Cart => {
  const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    return { totalItems, subtotal };
  };

  switch (action.type) {
    case 'SET_CART':
      const { totalItems: setTotalItems, subtotal: setSubtotal } = calculateTotals(action.items);
      return {
        ...state,
        items: action.items,
        totalItems: setTotalItems,
        subtotal: setSubtotal
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.item.productId
      );
      
      let updatedItems: CartItem[];
      if (existingItemIndex > -1) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        updatedItems = [...state.items, { ...action.item, quantity: 1 }];
      }

      const { totalItems: addTotalItems, subtotal: addSubtotal } = calculateTotals(updatedItems);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: addTotalItems,
        subtotal: addSubtotal,
        animationTrigger: Date.now()
      };

    case 'UPDATE_QUANTITY':
      const itemIndex = state.items.findIndex(
        item => item.productId === action.productId
      );
      
      if (itemIndex > -1) {
        const updatedItems = [...state.items];
        if (action.quantity <= 0) {
          updatedItems.splice(itemIndex, 1);
        } else {
          updatedItems[itemIndex].quantity = action.quantity;
        }
        
        const { totalItems: updateTotalItems, subtotal: updateSubtotal } = calculateTotals(updatedItems);
        
        return {
          ...state,
          items: updatedItems,
          totalItems: updateTotalItems,
          subtotal: updateSubtotal,
          animationTrigger: Date.now()
        };
      }
      return state;

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(
        item => item.productId !== action.productId
      );
      
      const { totalItems: removeTotalItems, subtotal: removeSubtotal } = calculateTotals(filteredItems);
      
      return {
        ...state,
        items: filteredItems,
        totalItems: removeTotalItems,
        subtotal: removeSubtotal,
        animationTrigger: Date.now()
      };

    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        subtotal: 0,
        animationTrigger: Date.now()
      };

    case 'TRIGGER_ANIMATION':
      return {
        ...state,
        animationTrigger: Date.now()
      };

    default:
      return state;
  }
};

const CART_STORAGE_KEY = 'naaz-cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    subtotal: 0,
    animationTrigger: 0
  });

  const { data: supabaseCartItems = [], isLoading } = useCart();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Load cart from localStorage on mount for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'SET_CART', items: parsedCart });
        } catch (error) {
          console.error('Failed to parse saved cart:', error);
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    }
  }, [isAuthenticated]);

  // Sync Supabase cart to local state for authenticated users
  useEffect(() => {
    if (isAuthenticated && supabaseCartItems) {
      const cartItems: CartItem[] = supabaseCartItems.map(item => ({
        productId: item.product_id,
        name: item.products.name,
        price: item.products.price.toString(),
        image: item.products.images?.[0] || '/placeholder.svg',
        quantity: item.quantity
      }));
      dispatch({ type: 'SET_CART', items: cartItems });
    }
  }, [isAuthenticated, supabaseCartItems]);

  // Save to localStorage when cart changes (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated && cart.items.length >= 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
    }
  }, [cart.items, isAuthenticated]);

  // Real-time cart updates for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Cart updated in real-time');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user]);

  const addItem = async (item: Omit<CartItem, 'quantity'>) => {
    if (isAuthenticated) {
      try {
        await addToCartMutation.mutateAsync({
          productId: item.productId,
          quantity: 1
        });
        dispatch({ type: 'TRIGGER_ANIMATION' });
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        // Fallback to local storage if Supabase fails
        dispatch({ type: 'ADD_ITEM', item });
      }
    } else {
      dispatch({ type: 'ADD_ITEM', item });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    if (isAuthenticated) {
      const cartItem = supabaseCartItems?.find(
        item => item.product_id === productId
      );
      
      if (cartItem) {
        try {
          await updateCartItemMutation.mutateAsync({
            cartItemId: cartItem.id,
            quantity
          });
        } catch (error) {
          console.error('Failed to update cart item:', error);
          // Fallback to local state
          dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
        }
      }
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    }
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      const cartItem = supabaseCartItems?.find(
        item => item.product_id === productId
      );
      
      if (cartItem) {
        try {
          await removeFromCartMutation.mutateAsync(cartItem.id);
        } catch (error) {
          console.error('Failed to remove cart item:', error);
          // Fallback to local state
          dispatch({ type: 'REMOVE_ITEM', productId });
        }
      }
    } else {
      dispatch({ type: 'REMOVE_ITEM', productId });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCartMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to clear cart:', error);
        // Fallback to local state
        dispatch({ type: 'CLEAR_CART' });
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addItem, 
      updateQuantity, 
      removeItem, 
      clearCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
