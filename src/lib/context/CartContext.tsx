import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../hooks/useCart';

export interface CartItem {
  productId: number;
  variationId?: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  animationTrigger: number; // Add animation trigger
}

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (productId: number, variationId: string | undefined, quantity: number) => void;
  removeItem: (productId: number, variationId?: string) => void;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction = 
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
  | { type: 'UPDATE_QUANTITY'; productId: number; variationId?: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: number; variationId?: string }
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
        item => item.productId === action.item.productId && item.variationId === action.item.variationId
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
        animationTrigger: Date.now() // Trigger animation
      };

    case 'UPDATE_QUANTITY':
      const itemIndex = state.items.findIndex(
        item => item.productId === action.productId && item.variationId === action.variationId
      );
      
      if (itemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[itemIndex].quantity = action.quantity;
        
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
        item => !(item.productId === action.productId && item.variationId === action.variationId)
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

  // Supabase cart hooks
  const { data: supabaseCartItems = [], isLoading } = useCart();
  const addToCartMutation = useAddToCart();
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  // Load cart from localStorage on mount
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

  // Sync Supabase cart to local state
  useEffect(() => {
    if (isAuthenticated && supabaseCartItems) {
      const cartItems: CartItem[] = supabaseCartItems.map(item => ({
        productId: parseInt(item.product_id),
        variationId: (item.variation_id as string | undefined) || undefined,
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
    if (!isAuthenticated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
    }
  }, [cart.items, isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'quantity'>) => {
    if (isAuthenticated) {
      try {
        await addToCartMutation.mutateAsync({
          productId: item.productId.toString(),
          quantity: 1
        });
      } catch (error) {
        console.error('Failed to add item to cart:', error);
      }
    } else {
      dispatch({ type: 'ADD_ITEM', item });
    }
  };

  const updateQuantity = async (productId: number, variationId: string | undefined, quantity: number) => {
    if (isAuthenticated) {
      const cartItem = supabaseCartItems?.find(
        item => parseInt(item.product_id) === productId && ((item.variation_id as string | undefined) || undefined) === variationId
      );
      
      if (cartItem) {
        try {
          await updateCartItemMutation.mutateAsync({
            cartItemId: cartItem.id,
            quantity
          });
        } catch (error) {
          console.error('Failed to update cart item:', error);
        }
      }
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', productId, variationId, quantity });
    }
  };

  const removeItem = async (productId: number, variationId?: string) => {
    if (isAuthenticated) {
      const cartItem = supabaseCartItems?.find(
        item => parseInt(item.product_id) === productId && ((item.variation_id as string | undefined) || undefined) === variationId
      );
      
      if (cartItem) {
        try {
          await removeFromCartMutation.mutateAsync(cartItem.id);
        } catch (error) {
          console.error('Failed to remove cart item:', error);
        }
      }
    } else {
      dispatch({ type: 'REMOVE_ITEM', productId, variationId });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCartMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  };

  // GST Calculation for Indian pricing norms (assume all prices are GST-inclusive, but show 0 if not set)
  const getCartSummary = () => {
    const subtotal = cart.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const gstRate = 0.12; // example GST
    const gstAmount = Math.round((subtotal * gstRate * 100)/100); // round to 2 decimals
    const shipping = cart.items.length > 0 ? 100 : 0;
    const total = subtotal + shipping;
    return { subtotal, gstAmount, shipping, total };
  };

  // (Optional) export GST and totals for components to consume if needed
  // You could also add this to context value

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
