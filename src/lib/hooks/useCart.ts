
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  productId: number;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  variationId?: number;
  attributes?: {
    name: string;
    value: string;
  }[];
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

const CART_STORAGE_KEY = 'naaz_cart';

export function useCart() {
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalItems: 0,
    subtotal: 0
  });

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart data:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Calculate cart totals
  const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => {
      const price = parseFloat(item.price);
      return total + (price * item.quantity);
    }, 0);

    return { totalItems, subtotal };
  };

  // Add item to cart
  const addItem = (item: CartItem) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        i => i.productId === item.productId && 
        ((!i.variationId && !item.variationId) || (i.variationId === item.variationId))
      );

      let newItems;

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        newItems = prevCart.items.map((i, index) => {
          if (index === existingItemIndex) {
            return { ...i, quantity: i.quantity + item.quantity };
          }
          return i;
        });
        toast.success(`Updated quantity in cart: ${item.name}`);
      } else {
        // Add new item
        newItems = [...prevCart.items, item];
        toast.success(`Added to cart: ${item.name}`);
      }

      const { totalItems, subtotal } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        subtotal
      };
    });
  };

  // Update item quantity
  const updateQuantity = (productId: number, quantity: number, variationId?: number) => {
    if (quantity < 1) {
      return removeItem(productId, variationId);
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item => {
        if (item.productId === productId && 
            ((!variationId && !item.variationId) || (item.variationId === variationId))) {
          return { ...item, quantity };
        }
        return item;
      });

      const { totalItems, subtotal } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        subtotal
      };
    });
  };

  // Remove item from cart
  const removeItem = (productId: number, variationId?: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => 
        !(item.productId === productId && 
        ((!variationId && !item.variationId) || (item.variationId === variationId)))
      );

      const { totalItems, subtotal } = calculateTotals(newItems);

      toast.info("Item removed from cart");

      return {
        items: newItems,
        totalItems,
        subtotal
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      subtotal: 0
    });
    toast.info("Cart cleared");
  };

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  };
}
