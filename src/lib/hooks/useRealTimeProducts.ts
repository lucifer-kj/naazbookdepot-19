
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/lib/services/product-service';

interface UseRealTimeProductsOptions {
  enabled?: boolean;
  productId?: string;
  onProductUpdate?: (product: Product) => void;
  onProductDelete?: (id: string) => void;
  onProductCreate?: (product: Product) => void;
}

export function useRealTimeProducts(options: UseRealTimeProductsOptions = {}) {
  const { 
    enabled = true, 
    productId,
    onProductUpdate,
    onProductDelete,
    onProductCreate
  } = options;
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isListening, setIsListening] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    // Configure the channel with optional product ID filter
    let channelFilter = {};
    if (productId) {
      channelFilter = { filter: `id=eq.${productId}` };
    }

    // Set up the real-time subscription
    const channel = supabase
      .channel('products-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'products',
      }, (payload) => {
        console.log('Product created:', payload);
        setLastUpdated(new Date());
        toast.success(`New product added: ${payload.new.name}`);
        
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        // Call custom handler if provided
        if (onProductCreate) {
          onProductCreate(payload.new as Product);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
        ...channelFilter
      }, (payload) => {
        console.log('Product updated:', payload);
        setLastUpdated(new Date());
        toast.info(`Product updated: ${payload.new.name}`);
        
        // Invalidate queries to refetch data
        if (productId) {
          queryClient.invalidateQueries({ queryKey: ['product', productId] });
        }
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        // Call custom handler if provided
        if (onProductUpdate) {
          onProductUpdate(payload.new as Product);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'products',
        ...channelFilter
      }, (payload) => {
        console.log('Product deleted:', payload);
        setLastUpdated(new Date());
        toast.info(`Product deleted`);
        
        // Invalidate queries to refetch data
        queryClient.invalidateQueries({ queryKey: ['products'] });
        
        // Call custom handler if provided
        if (onProductDelete && payload.old?.id) {
          onProductDelete(payload.old.id as string);
        }
      })
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsListening(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, productId, queryClient, onProductUpdate, onProductDelete, onProductCreate]);

  return { 
    lastUpdated, 
    isListening
  };
}
