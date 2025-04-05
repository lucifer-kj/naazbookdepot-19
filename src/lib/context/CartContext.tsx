
import React, { createContext, useContext } from 'react';
import { useCart, CartItem, CartState } from '../hooks/useCart';

interface CartContextType {
  cart: CartState;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  removeItem: (productId: number, variationId?: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cartMethods = useCart();

  return (
    <CartContext.Provider value={cartMethods}>
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
