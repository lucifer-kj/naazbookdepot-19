
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

const NAAZ_CART_KEY = 'naazExquisiteCart';

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
}

interface CartContextType {
  cart: Cart;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (productId: number, variationId: string | undefined, quantity: number) => void;
  removeItem: (productId: number, variationId?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction = 
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'quantity'> }
  | { type: 'UPDATE_QUANTITY'; productId: number; variationId?: string; quantity: number }
  | { type: 'REMOVE_ITEM'; productId: number; variationId?: string }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.item.productId && item.variationId === action.item.variationId
      );
      
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          subtotal: state.subtotal + parseFloat(action.item.price)
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.item, quantity: 1 }],
        totalItems: state.totalItems + 1,
        subtotal: state.subtotal + parseFloat(action.item.price)
      };

    case 'UPDATE_QUANTITY':
      const itemIndex = state.items.findIndex(
        item => item.productId === action.productId && item.variationId === action.variationId
      );
      
      if (itemIndex > -1) {
        const updatedItems = [...state.items];
        const oldQuantity = updatedItems[itemIndex].quantity;
        updatedItems[itemIndex].quantity = action.quantity;
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems - oldQuantity + action.quantity,
          subtotal: state.subtotal - (parseFloat(updatedItems[itemIndex].price) * oldQuantity) + (parseFloat(updatedItems[itemIndex].price) * action.quantity)
        };
      }
      return state;

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(
        item => !(item.productId === action.productId && item.variationId === action.variationId)
      );
      const removedItem = state.items.find(
        item => item.productId === action.productId && item.variationId === action.variationId
      );
      
      if (removedItem) {
        return {
          ...state,
          items: filteredItems,
          totalItems: state.totalItems - removedItem.quantity,
          subtotal: state.subtotal - (parseFloat(removedItem.price) * removedItem.quantity)
        };
      }
      return state;

    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        subtotal: 0
      };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialStateFunc = (): Cart => {
    try {
      const storedCart = typeof window !== 'undefined' ? localStorage.getItem(NAAZ_CART_KEY) : null;
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as Cart;
        // Basic validation to ensure essential fields exist
        if (parsedCart && Array.isArray(parsedCart.items) &&
            typeof parsedCart.totalItems === 'number' &&
            typeof parsedCart.subtotal === 'number') {
          // Further validation for each item can be added here if necessary
          const validItems = parsedCart.items.filter(item =>
            typeof item.productId === 'number' &&
            typeof item.name === 'string' &&
            typeof item.price === 'string' && // price is stored as string
            typeof item.image === 'string' &&
            typeof item.quantity === 'number' && item.quantity > 0
          );
          // If some items were invalid, recalculate totals, or return default
          // For simplicity, if any item is invalid, we could return default, or filter them out.
          // Here, we'll use the filtered valid items.
          if (validItems.length !== parsedCart.items.length) {
            // If items were filtered, this cart is potentially inconsistent.
            // For robustness, one might recalculate totals here or log a warning.
            // Or, decide to return the default state if critical fields are missing/invalid.
            console.warn("Some items in stored cart were invalid and have been filtered.");
            // For now, let's proceed with valid items but acknowledge totals might be off if not recalculated.
            // A more robust solution would re-calculate totalItems and subtotal based on validItems.
          }
          return { ...parsedCart, items: validItems }; // Return potentially modified cart
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    // Default initial state if nothing in localStorage or if data is invalid
    return { items: [], totalItems: 0, subtotal: 0 };
  };

  const [cart, dispatch] = useReducer(cartReducer, undefined, initialStateFunc);

  useEffect(() => {
    try {
      // Ensure cart is not the initial undefined state from reducer when initialStateFunc runs
      // and also ensure it's not the default empty state if we only want to save meaningful carts
      if (cart !== undefined ) { // Check if cart has been initialized
         localStorage.setItem(NAAZ_CART_KEY, JSON.stringify(cart));
      }
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', item });
  };

  const updateQuantity = (productId: number, variationId: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', productId, variationId, quantity });
  };

  const removeItem = (productId: number, variationId?: string) => {
    dispatch({ type: 'REMOVE_ITEM', productId, variationId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ cart, addItem, updateQuantity, removeItem, clearCart }}>
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
