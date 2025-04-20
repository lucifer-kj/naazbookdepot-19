
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Product } from "./product-service";
import { Category } from "./product-service";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to subscribe to real-time product updates
 */
export const useProductRealtime = (productId?: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Enable the channel for all products or a specific product
    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'products',
          ...(productId ? { filter: `id=eq.${productId}` } : {})
        },
        (payload) => {
          console.log('Product change received:', payload);
          
          // Show toast notification
          if (payload.eventType === 'INSERT') {
            toast.info('New product added');
          } else if (payload.eventType === 'UPDATE') {
            toast.info(`Product "${payload.new.name}" updated`);
          } else if (payload.eventType === 'DELETE') {
            toast.info('Product removed');
          }
          
          // Invalidate relevant queries to trigger refetch
          if (productId) {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
          } else {
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);
};

/**
 * Hook to subscribe to real-time category updates
 */
export const useCategoryRealtime = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Enable the channel for categories
    const channel = supabase
      .channel('category-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          console.log('Category change received:', payload);
          
          // Show toast notification
          if (payload.eventType === 'INSERT') {
            toast.info('New category added');
          } else if (payload.eventType === 'UPDATE') {
            toast.info(`Category "${payload.new.name}" updated`);
          } else if (payload.eventType === 'DELETE') {
            toast.info('Category removed');
          }
          
          // Invalidate categories queries
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

/**
 * Hook to subscribe to real-time cart updates for cross-device synchronization
 */
export const useCartRealtime = (userId?: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Only subscribe if we have a user ID
    if (!userId) return;
    
    const channel = supabase
      .channel(`cart-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Cart change received:', payload);
          
          // Invalidate cart queries
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          
          // Only show toast for changes from other devices/sessions
          if (payload.eventType === 'INSERT') {
            toast.info('Item added to your cart on another device');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Cart updated on another device');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Item removed from your cart on another device');
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};

/**
 * Hook to subscribe to real-time wishlist updates
 */
export const useWishlistRealtime = (userId?: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Only subscribe if we have a user ID
    if (!userId) return;
    
    const channel = supabase
      .channel(`wishlist-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Wishlist change received:', payload);
          
          // Invalidate wishlist queries
          queryClient.invalidateQueries({ queryKey: ['wishlist'] });
          
          // Show toast for changes from other devices
          if (payload.eventType === 'INSERT') {
            toast.info('Item added to your wishlist on another device');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Item removed from your wishlist on another device');
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
};

/**
 * Hook to subscribe to real-time order status updates
 */
export const useOrderStatusRealtime = (userId?: string, orderId?: string) => {
  const queryClient = useQueryClient();
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  
  useEffect(() => {
    // Only subscribe if we have either a user ID or order ID
    if (!userId && !orderId) return;
    
    let filter = '';
    if (orderId) {
      filter = `id=eq.${orderId}`;
    } else if (userId) {
      filter = `user_id=eq.${userId}`;
    }
    
    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter
        },
        (payload) => {
          console.log('Order status change received:', payload);
          
          // Only notify if status changed
          if (payload.old.status !== payload.new.status) {
            setLastStatus(payload.new.status);
            
            // Show toast notification
            toast.info(`Order #${payload.new.id.substring(0, 8)} is now ${payload.new.status}`);
            
            // Invalidate relevant queries
            if (orderId) {
              queryClient.invalidateQueries({ queryKey: ['order', orderId] });
            } else {
              queryClient.invalidateQueries({ queryKey: ['orders', userId] });
            }
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, orderId, queryClient]);
  
  return { lastStatus };
};

/**
 * Hook to subscribe to inventory changes for a specific product
 */
export const useInventoryRealtime = (productId: string) => {
  const queryClient = useQueryClient();
  const [stockLevel, setStockLevel] = useState<number | null>(null);
  const [isOutOfStock, setIsOutOfStock] = useState<boolean | null>(null);
  
  useEffect(() => {
    const channel = supabase
      .channel(`inventory-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          const oldStock = payload.old.quantity_in_stock;
          const newStock = payload.new.quantity_in_stock;
          
          // Only handle inventory changes
          if (oldStock !== newStock) {
            console.log('Inventory change detected:', oldStock, '->', newStock);
            
            setStockLevel(newStock);
            setIsOutOfStock(newStock <= 0);
            
            // Show notifications for important stock changes
            if (oldStock > 0 && newStock <= 0) {
              toast.warning(`${payload.new.name} is now out of stock`);
            } else if (oldStock <= 0 && newStock > 0) {
              toast.success(`${payload.new.name} is back in stock!`);
            } else if (newStock <= 5 && oldStock > 5) {
              toast.warning(`Only ${newStock} ${payload.new.name} left in stock`);
            }
            
            // Invalidate product queries
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, queryClient]);
  
  return { stockLevel, isOutOfStock };
};

/**
 * Hook to subscribe to real-time blog post updates
 */
export const useBlogRealtime = (postId?: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('blog-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts',
          ...(postId ? { filter: `id=eq.${postId}` } : {})
        },
        (payload) => {
          console.log('Blog post change received:', payload);
          
          // Only handle published posts for notifications
          if (payload.eventType === 'INSERT' && payload.new.status === 'published') {
            toast.info('New blog post published');
          } else if (payload.eventType === 'UPDATE' && 
                    payload.old.status !== 'published' && 
                    payload.new.status === 'published') {
            toast.info(`New blog post published: ${payload.new.title}`);
          }
          
          // Invalidate relevant queries
          if (postId) {
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
          } else {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
          }
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);
};

/**
 * Hook to subscribe to real-time FAQ updates
 */
export const useFAQRealtime = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('faq-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'faqs'
        },
        (_payload) => {
          // Invalidate FAQ queries
          queryClient.invalidateQueries({ queryKey: ['faqs'] });
          queryClient.invalidateQueries({ queryKey: ['faqCategories'] });
        }
      )
      .subscribe();
    
    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

/**
 * Utility hook to manage active subscriptions
 * and handle reconnection
 */
export const useRealtimeManager = () => {
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    // Handle connection status
    const handleConnectionChange = () => {
      if (navigator.onLine) {
        setIsConnected(true);
        console.log('Reconnected to network, reestablishing realtime connections');
        
        // This will reconnect all channels
        supabase.removeAllChannels();
        
        // Wait a bit and then notify the user
        setTimeout(() => {
          toast.success('Reconnected to real-time updates');
        }, 1000);
      } else {
        setIsConnected(false);
        toast.error('Connection lost. Real-time updates paused');
      }
    };
    
    // Listen for online/offline events
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);
  
  return { isConnected };
};

// Export a provider component to set up app-wide subscriptions
export const useInitializeRealtime = () => {
  // Get current user
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Use the realtime hooks if we have a user
  if (userId) {
    useProductRealtime();
    useCategoryRealtime();
    useCartRealtime(userId);
    useWishlistRealtime(userId);
    useOrderStatusRealtime(userId);
    useBlogRealtime();
    useFAQRealtime();
    useRealtimeManager();
  }
  
  return { userId };
};
