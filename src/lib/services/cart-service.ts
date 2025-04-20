
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    sale_price: number | null;
    image_url?: string;
    slug: string;
  };
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  coupon_code: string | null;
}

// Local storage key
const CART_STORAGE_KEY = 'naaz_cart';

// Get cart from Supabase or localStorage
export const useCart = () => {
  const queryClient = useQueryClient();

  // Sync cart on authentication changes
  useEffect(() => {
    const syncCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only sync for authenticated users
      if (user) {
        const localCart = getLocalCart();
        
        // If local cart exists, merge with server cart
        if (localCart && localCart.items.length > 0) {
          await mergeLocalCartWithServer(localCart.items);
          clearLocalCart();
          
          // Invalidate queries to refresh cart data
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
      }
    };

    syncCart();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        await syncCart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For authenticated users, get cart from Supabase
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            product_id,
            quantity,
            product:products(
              name,
              price,
              sale_price,
              slug,
              image:product_images(image_url)
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Format cart items
        const items = data.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: {
            name: item.product.name,
            price: item.product.price,
            sale_price: item.product.sale_price,
            slug: item.product.slug,
            image_url: item.product.image?.[0]?.image_url || null
          }
        }));

        // Calculate totals
        const subtotal = calculateSubtotal(items);
        const total_items = calculateTotalItems(items);
        const shipping_cost = 0; // Will be calculated based on shipping method
        const tax_amount = 0; // Will be calculated based on region
        const discount_amount = 0; // Will be calculated based on coupons

        return {
          items,
          total_items,
          subtotal,
          shipping_cost,
          tax_amount,
          discount_amount,
          total: subtotal + shipping_cost + tax_amount - discount_amount,
          coupon_code: null
        };
      } 
      
      // For guest users, get cart from localStorage
      const localCart = getLocalCart();
      return localCart || {
        items: [],
        total_items: 0,
        subtotal: 0,
        shipping_cost: 0,
        tax_amount: 0,
        discount_amount: 0,
        total: 0,
        coupon_code: null
      };
    }
  });
};

// Add item to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      productId, 
      quantity = 1
    }: { 
      productId: string; 
      quantity?: number 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For authenticated users, add to Supabase
      if (user) {
        // Check if product exists in cart
        const { data: existingItem, error: checkError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();

        if (checkError) throw checkError;

        // Get product data to display in toast
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('name, quantity_in_stock')
          .eq('id', productId)
          .single();

        if (productError) throw productError;

        // Check inventory
        if (product.quantity_in_stock < quantity) {
          throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
        }

        if (existingItem) {
          // Update quantity if already in cart
          const newQuantity = existingItem.quantity + quantity;
          
          // Check again for inventory with new total
          if (product.quantity_in_stock < newQuantity) {
            throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
          }
          
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);

          if (updateError) throw updateError;
        } else {
          // Add new item to cart
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity
            });

          if (insertError) throw insertError;
        }

        return { name: product.name, quantity };
      } 
      
      // For guest users, add to localStorage
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          name, 
          price, 
          sale_price, 
          quantity_in_stock, 
          slug,
          image:product_images(image_url)
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      // Check inventory
      if (product.quantity_in_stock < quantity) {
        throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
      }

      const localCart = getLocalCart() || {
        items: [],
        total_items: 0,
        subtotal: 0,
        shipping_cost: 0,
        tax_amount: 0,
        discount_amount: 0,
        total: 0,
        coupon_code: null
      };

      // Check if product already in cart
      const existingItemIndex = localCart.items.findIndex(item => item.product_id === productId);
      
      if (existingItemIndex !== -1) {
        // Update quantity
        const newQuantity = localCart.items[existingItemIndex].quantity + quantity;
        
        // Check again for inventory with new total
        if (product.quantity_in_stock < newQuantity) {
          throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
        }
        
        localCart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        localCart.items.push({
          id: `local-${Date.now()}`,
          product_id: productId,
          quantity,
          product: {
            name: product.name,
            price: product.price,
            sale_price: product.sale_price,
            slug: product.slug,
            image_url: product.image?.[0]?.image_url || null
          }
        });
      }

      // Update totals
      localCart.total_items = calculateTotalItems(localCart.items);
      localCart.subtotal = calculateSubtotal(localCart.items);
      localCart.total = localCart.subtotal + localCart.shipping_cost + localCart.tax_amount - localCart.discount_amount;
      
      // Save to localStorage
      saveLocalCart(localCart);

      return { name: product.name, quantity };
    },
    onSuccess: (data) => {
      toast.success(`Added ${data.quantity} ${data.quantity > 1 ? 'items' : 'item'} to cart: ${data.name}`);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error adding to cart: ${error.message}`);
    }
  });
};

// Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      itemId, 
      quantity,
      productId 
    }: { 
      itemId: string; 
      quantity: number;
      productId: string;
    }) => {
      // Validate quantity
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      // Check inventory
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('quantity_in_stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (product.quantity_in_stock < quantity) {
        throw new Error(`Only ${product.quantity_in_stock} items available in stock`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      // For authenticated users, update in Supabase
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // For guest users, update in localStorage
        const localCart = getLocalCart();
        if (!localCart) {
          throw new Error('Cart not found');
        }
        
        const itemIndex = localCart.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
          throw new Error('Item not found in cart');
        }
        
        localCart.items[itemIndex].quantity = quantity;
        
        // Update totals
        localCart.total_items = calculateTotalItems(localCart.items);
        localCart.subtotal = calculateSubtotal(localCart.items);
        localCart.total = localCart.subtotal + localCart.shipping_cost + localCart.tax_amount - localCart.discount_amount;
        
        // Save to localStorage
        saveLocalCart(localCart);
      }

      return { itemId, quantity };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error updating cart: ${error.message}`);
    }
  });
};

// Remove item from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      itemId,
      productName
    }: { 
      itemId: string;
      productName?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For authenticated users, remove from Supabase
      if (user) {
        // Get product name if not provided
        if (!productName) {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              product:products(name)
            `)
            .eq('id', itemId)
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            productName = data.product?.name;
          }
        }

        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // For guest users, remove from localStorage
        const localCart = getLocalCart();
        if (!localCart) {
          throw new Error('Cart not found');
        }
        
        const itemIndex = localCart.items.findIndex(item => item.id === itemId);
        if (itemIndex === -1) {
          throw new Error('Item not found in cart');
        }
        
        if (!productName) {
          productName = localCart.items[itemIndex].product.name;
        }
        
        localCart.items.splice(itemIndex, 1);
        
        // Update totals
        localCart.total_items = calculateTotalItems(localCart.items);
        localCart.subtotal = calculateSubtotal(localCart.items);
        localCart.total = localCart.subtotal + localCart.shipping_cost + localCart.tax_amount - localCart.discount_amount;
        
        // Save to localStorage
        saveLocalCart(localCart);
      }

      return { productName };
    },
    onSuccess: (data) => {
      toast.success(`Removed from cart: ${data.productName || 'Item'}`);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error removing from cart: ${error.message}`);
    }
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // For authenticated users, clear cart in Supabase
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // For guest users, clear localStorage
        clearLocalCart();
      }
    },
    onSuccess: () => {
      toast.success('Cart cleared');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error) => {
      toast.error(`Error clearing cart: ${error.message}`);
    }
  });
};

// Apply coupon code
export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      // Validate coupon code
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error('Invalid coupon code');
      }

      // Check if coupon is expired
      const now = new Date();
      if (new Date(coupon.end_date) < now) {
        throw new Error('This coupon has expired');
      }

      // Check if coupon is not yet valid
      if (new Date(coupon.start_date) > now) {
        throw new Error('This coupon is not valid yet');
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('This coupon has reached its usage limit');
      }

      // Get current cart
      const cart = await queryClient.fetchQuery({ queryKey: ['cart'] });

      // Check minimum purchase
      if (coupon.min_purchase > cart.subtotal) {
        throw new Error(`This coupon requires a minimum purchase of ${coupon.min_purchase}`);
      }

      // Calculate discount
      let discountAmount = 0;
      
      if (coupon.discount_type === 'percentage') {
        discountAmount = cart.subtotal * (coupon.discount_value / 100);
      } else {
        // Fixed amount
        discountAmount = Math.min(coupon.discount_value, cart.subtotal);
      }

      // For tracking we'd normally update coupon usage here, but we'll do that only on checkout

      return {
        coupon_code: code,
        discount_amount: discountAmount,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      };
    },
    onSuccess: (data) => {
      const discountText = data.discount_type === 'percentage' 
        ? `${data.discount_value}%` 
        : `₹${data.discount_amount}`;
        
      toast.success(`Coupon applied: ${discountText} discount`);
      
      // Update cart with coupon information
      queryClient.setQueryData(['cart'], (oldData: any) => {
        return {
          ...oldData,
          discount_amount: data.discount_amount,
          coupon_code: data.coupon_code,
          total: oldData.subtotal + oldData.shipping_cost + oldData.tax_amount - data.discount_amount
        };
      });
    },
    onError: (error) => {
      toast.error(`Error applying coupon: ${error.message}`);
    }
  });
};

// Remove coupon code
export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Simply remove the coupon from the cart state
      return true;
    },
    onSuccess: () => {
      toast.success('Coupon removed');
      
      // Update cart removing coupon information
      queryClient.setQueryData(['cart'], (oldData: any) => {
        return {
          ...oldData,
          discount_amount: 0,
          coupon_code: null,
          total: oldData.subtotal + oldData.shipping_cost + oldData.tax_amount
        };
      });
    }
  });
};

// Helper functions
const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((total, item) => {
    const price = item.product.sale_price || item.product.price;
    return total + (price * item.quantity);
  }, 0);
};

const calculateTotalItems = (items: CartItem[]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const getLocalCart = (): CartSummary | null => {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : null;
};

const saveLocalCart = (cart: CartSummary) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

const clearLocalCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

const mergeLocalCartWithServer = async (localItems: CartItem[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get current server cart
  const { data: serverItems, error: serverError } = await supabase
    .from('cart_items')
    .select('product_id, quantity')
    .eq('user_id', user.id);

  if (serverError) throw serverError;

  // Create map of existing server items
  const serverItemsMap = new Map();
  serverItems.forEach(item => {
    serverItemsMap.set(item.product_id, item.quantity);
  });

  // Prepare items to insert/update
  const itemsToUpsert = [];

  for (const item of localItems) {
    const serverQuantity = serverItemsMap.get(item.product_id) || 0;
    
    // Check inventory
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('quantity_in_stock')
      .eq('id', item.product_id)
      .single();

    if (productError) continue;

    const newQuantity = Math.min(
      serverQuantity + item.quantity,
      product.quantity_in_stock
    );

    itemsToUpsert.push({
      user_id: user.id,
      product_id: item.product_id,
      quantity: newQuantity
    });
  }

  // Update server cart
  if (itemsToUpsert.length > 0) {
    // Delete existing items that will be replaced
    const productIds = itemsToUpsert.map(item => item.product_id);
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .in('product_id', productIds);
    
    // Insert new items
    await supabase
      .from('cart_items')
      .insert(itemsToUpsert);
  }
};
