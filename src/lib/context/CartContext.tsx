
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    subtotal: 0
  });

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
