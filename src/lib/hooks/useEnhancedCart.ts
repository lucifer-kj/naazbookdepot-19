import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/context/AuthContext';
import { cartPersistenceService, type CartState, type CartItem } from '@/lib/services/cartPersistenceService';
import { supabase } from '@/integrations/supabase/client';

export interface UseEnhancedCartReturn {
  cart: CartState;
  addItem: (item: Omit<CartItem, 'quantity' | 'lastModified'>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  syncStatus: {
    isOnline: boolean;
    hasOfflineOperations: boolean;
    lastSynced: number;
  };
  recoverCart: () => Promise<void>;
}

export const useEnhancedCart = (): UseEnhancedCartReturn => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [cart, setCart] = useState<CartState>(() => {
    const localCart = cartPersistenceService.loadCartFromLocal();
    return localCart || {
      items: [],
      totalItems: 0,
      subtotal: 0,
      lastSynced: 0,
      syncInProgress: false
    };
  });
  
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cart data from server for authenticated users
  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['enhanced-cart', user?.id],
    queryFn: async () => {
      if (!user || !navigator.onLine) return null;
      
      try {
        return await cartPersistenceService.syncWithServer(user.id);
      } catch (error) {
        console.error('Failed to sync cart with server:', error);
        return cartPersistenceService.loadCartFromLocal();
      }
    },
    enabled: !!user && isAuthenticated,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Update local cart when server data changes
  useEffect(() => {
    if (serverCart) {
      setCart(serverCart);
      cartPersistenceService.saveCartToLocal(serverCart);
    }
  }, [serverCart]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    cartPersistenceService.saveCartToLocal(cart);
  }, [cart]);

  // Listen for network reconnection events
  useEffect(() => {
    const handleReconnection = async (event: CustomEvent) => {
      if (user && event.detail?.hasOfflineOperations) {
        await syncWithServer();
      }
    };

    const handlePeriodicSync = async () => {
      if (user && navigator.onLine && !isSyncing) {
        try {
          await syncWithServer();
        } catch (error) {
          console.error('Periodic sync failed:', error);
        }
      }
    };

    window.addEventListener('cart-reconnection', handleReconnection as EventListener);
    window.addEventListener('cart-periodic-sync', handlePeriodicSync);

    return () => {
      window.removeEventListener('cart-reconnection', handleReconnection as EventListener);
      window.removeEventListener('cart-periodic-sync', handlePeriodicSync);
    };
  }, [user, isSyncing]);

  // Real-time cart updates for authenticated users
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const channel = supabase
      .channel('enhanced-cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        async () => {
          console.log('Cart updated in real-time, syncing...');
          await syncWithServer();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user]);

  const updateCartState = useCallback((updater: (prevCart: CartState) => CartState) => {
    setCart(prevCart => {
      const newCart = updater(prevCart);
      cartPersistenceService.saveCartToLocal(newCart);
      return newCart;
    });
  }, []);

  const calculateTotals = useCallback((items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    return { totalItems, subtotal };
  }, []);

  const addItem = useCallback(async (item: Omit<CartItem, 'quantity' | 'lastModified'>) => {
    const newItem: CartItem = {
      ...item,
      quantity: 1,
      lastModified: Date.now(),
      isLocal: true
    };

    // Update local state immediately (optimistic update)
    updateCartState(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.productId === item.productId
      );

      let updatedItems: CartItem[];
      if (existingItemIndex > -1) {
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
          lastModified: Date.now()
        };
      } else {
        updatedItems = [...prevCart.items, newItem];
      }

      const { totalItems, subtotal } = calculateTotals(updatedItems);
      
      return {
        ...prevCart,
        items: updatedItems,
        totalItems,
        subtotal
      };
    });

    // Sync with server
    try {
      await cartPersistenceService.addCartOperation(user?.id || null, 'add', {
        productId: item.productId,
        quantity: 1
      });
      
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['enhanced-cart', user.id] });
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // The operation is already queued for offline sync
    }
  }, [user, updateCartState, calculateTotals, queryClient]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    // Update local state immediately
    updateCartState(prevCart => {
      const updatedItems = prevCart.items.map(item =>
        item.productId === productId
          ? { ...item, quantity, lastModified: Date.now() }
          : item
      );

      const { totalItems, subtotal } = calculateTotals(updatedItems);
      
      return {
        ...prevCart,
        items: updatedItems,
        totalItems,
        subtotal
      };
    });

    // Sync with server
    try {
      const cartItem = cart.items.find(item => item.productId === productId);
      await cartPersistenceService.addCartOperation(user?.id || null, 'update', {
        cartItemId: cartItem?.id,
        quantity
      });
      
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['enhanced-cart', user.id] });
      }
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
    }
  }, [user, cart.items, updateCartState, calculateTotals, queryClient]);

  const removeItem = useCallback(async (productId: string) => {
    const itemToRemove = cart.items.find(item => item.productId === productId);
    
    // Update local state immediately
    updateCartState(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.productId !== productId);
      const { totalItems, subtotal } = calculateTotals(updatedItems);
      
      return {
        ...prevCart,
        items: updatedItems,
        totalItems,
        subtotal
      };
    });

    // Sync with server
    try {
      await cartPersistenceService.addCartOperation(user?.id || null, 'remove', {
        cartItemId: itemToRemove?.id,
        productId
      });
      
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['enhanced-cart', user.id] });
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  }, [user, cart.items, updateCartState, calculateTotals, queryClient]);

  const clearCart = useCallback(async () => {
    // Update local state immediately
    updateCartState(() => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      lastSynced: Date.now(),
      syncInProgress: false
    }));

    // Sync with server
    try {
      await cartPersistenceService.addCartOperation(user?.id || null, 'clear', {});
      
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['enhanced-cart', user.id] });
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  }, [user, updateCartState, queryClient]);

  const syncWithServer = useCallback(async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      const syncedCart = await cartPersistenceService.syncWithServer(user.id);
      setCart(syncedCart);
      queryClient.setQueryData(['enhanced-cart', user.id], syncedCart);
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing, queryClient]);

  const recoverCart = useCallback(async () => {
    try {
      const localCart = cartPersistenceService.loadCartFromLocal();
      if (localCart) {
        setCart(localCart);
        
        // If user is authenticated, try to sync
        if (user && navigator.onLine) {
          await syncWithServer();
        }
      }
    } catch (error) {
      console.error('Failed to recover cart:', error);
    }
  }, [user, syncWithServer]);

  const syncStatus = cartPersistenceService.getSyncStatus();

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    syncWithServer,
    isLoading,
    isSyncing,
    syncStatus,
    recoverCart
  };
};
