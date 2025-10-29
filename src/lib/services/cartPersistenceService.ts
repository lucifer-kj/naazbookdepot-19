import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface CartItem {
  id?: string;
  productId: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  lastModified: number;
  isLocal?: boolean;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  lastSynced: number;
  syncInProgress: boolean;
}

export interface OfflineOperation {
  id: string;
  type: 'add' | 'update' | 'remove' | 'clear';
  productId?: string;
  quantity?: number;
  cartItemId?: string;
  timestamp: number;
  retryCount: number;
}

class CartPersistenceService {
  private readonly CART_STORAGE_KEY = 'naaz-cart-v2';
  private readonly OFFLINE_QUEUE_KEY = 'naaz-cart-offline-queue';
  private readonly SYNC_METADATA_KEY = 'naaz-cart-sync-metadata';
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  
  private syncTimer: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }

  /**
   * Save cart state to localStorage with metadata
   */
  saveCartToLocal(cart: CartState): void {
    try {
      const cartData = {
        ...cart,
        lastSaved: Date.now()
      };
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  /**
   * Load cart state from localStorage
   */
  loadCartFromLocal(): CartState | null {
    try {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (!savedCart) return null;
      
      const cartData = JSON.parse(savedCart);
      return {
        items: cartData.items || [],
        totalItems: cartData.totalItems || 0,
        subtotal: cartData.subtotal || 0,
        lastSynced: cartData.lastSynced || 0,
        syncInProgress: false
      };
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      localStorage.removeItem(this.CART_STORAGE_KEY);
      return null;
    }
  }

  /**
   * Add operation to offline queue
   */
  private addToOfflineQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>): void {
    try {
      const queue = this.getOfflineQueue();
      const newOperation: OfflineOperation = {
        ...operation,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0
      };
      
      queue.push(newOperation);
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add operation to offline queue:', error);
    }
  }

  /**
   * Get offline operations queue
   */
  private getOfflineQueue(): OfflineOperation[] {
    try {
      const queue = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  }

  /**
   * Clear offline operations queue
   */
  private clearOfflineQueue(): void {
    localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
  }

  /**
   * Sync cart with server for authenticated users
   */
  async syncWithServer(userId: string): Promise<CartState> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      // First, process offline queue
      await this.processOfflineQueue(userId);

      // Fetch current server state
      const { data: serverCartItems, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(
            id,
            name,
            price,
            images
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Get local cart state
      const localCart = this.loadCartFromLocal();
      
      // Resolve conflicts and merge
      const mergedCart = await this.resolveConflicts(
        localCart,
        serverCartItems || [],
        userId
      );

      // Save merged state locally
      this.saveCartToLocal(mergedCart);

      return mergedCart;
    } catch (error) {
      console.error('Failed to sync with server:', error);
      throw error;
    }
  }

  /**
   * Resolve conflicts between local and server cart states
   */
  private async resolveConflicts(
    localCart: CartState | null,
    serverItems: unknown[],
    userId: string
  ): Promise<CartState> {
    const mergedItems: CartItem[] = [];
    const serverItemsMap = new Map(
      serverItems.map(item => [item.product_id, item])
    );

    // Process local items
    if (localCart?.items) {
      for (const localItem of localCart.items) {
        const serverItem = serverItemsMap.get(localItem.productId);
        
        if (serverItem) {
          // Item exists on both sides - use most recent
          const serverModified = new Date(serverItem.updated_at).getTime();
          const localModified = localItem.lastModified;
          
          if (localModified > serverModified) {
            // Local is newer - update server
            await this.updateServerItem(userId, serverItem.id, localItem.quantity);
            mergedItems.push(localItem);
          } else {
            // Server is newer - use server data
            mergedItems.push(this.convertServerItemToLocal(serverItem));
          }
          
          serverItemsMap.delete(localItem.productId);
        } else {
          // Item only exists locally - add to server
          await this.addServerItem(userId, localItem);
          mergedItems.push(localItem);
        }
      }
    }

    // Add remaining server items that don't exist locally
    for (const serverItem of serverItemsMap.values()) {
      mergedItems.push(this.convertServerItemToLocal(serverItem));
    }

    return this.calculateCartTotals(mergedItems);
  }

  /**
   * Convert server cart item to local format
   */
  private convertServerItemToLocal(serverItem: unknown): CartItem {
    return {
      id: serverItem.id,
      productId: serverItem.product_id,
      name: serverItem.products.name,
      price: serverItem.products.price.toString(),
      image: serverItem.products.images?.[0] || '/placeholder.svg',
      quantity: serverItem.quantity,
      lastModified: new Date(serverItem.updated_at).getTime(),
      isLocal: false
    };
  }

  /**
   * Update server cart item
   */
  private async updateServerItem(userId: string, cartItemId: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', cartItemId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Add new item to server cart
   */
  private async addServerItem(userId: string, item: CartItem): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: item.productId,
        quantity: item.quantity
      });

    if (error) throw error;
  }

  /**
   * Calculate cart totals
   */
  private calculateCartTotals(items: CartItem[]): CartState {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    return {
      items,
      totalItems,
      subtotal,
      lastSynced: Date.now(),
      syncInProgress: false
    };
  }

  /**
   * Process offline operations queue
   */
  private async processOfflineQueue(userId: string): Promise<void> {
    const queue = this.getOfflineQueue();
    const failedOperations: OfflineOperation[] = [];

    for (const operation of queue) {
      try {
        await this.executeOperation(userId, operation);
      } catch (error) {
        console.error('Failed to execute offline operation:', error);
        
        if (operation.retryCount < this.MAX_RETRY_ATTEMPTS) {
          failedOperations.push({
            ...operation,
            retryCount: operation.retryCount + 1
          });
        }
      }
    }

    // Update queue with failed operations
    if (failedOperations.length > 0) {
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(failedOperations));
    } else {
      this.clearOfflineQueue();
    }
  }

  /**
   * Execute a single offline operation
   */
  private async executeOperation(userId: string, operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case 'add':
        if (operation.productId && operation.quantity) {
          await this.addServerItem(userId, {
            productId: operation.productId,
            quantity: operation.quantity,
            name: '', // Will be populated by server
            price: '0',
            image: '',
            lastModified: operation.timestamp
          });
        }
        break;
        
      case 'update':
        if (operation.cartItemId && operation.quantity) {
          await this.updateServerItem(userId, operation.cartItemId, operation.quantity);
        }
        break;
        
      case 'remove':
        if (operation.cartItemId) {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', operation.cartItemId)
            .eq('user_id', userId);
          
          if (error) throw error;
        }
        break;
        
      case 'clear': {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);
        
        if (error) throw error;
        break;
      }
    }
  }

  /**
   * Add cart operation (with offline support)
   */
  async addCartOperation(
    userId: string | null,
    type: OfflineOperation['type'],
    data: Partial<OfflineOperation>
  ): Promise<void> {
    if (!userId || !this.isOnline) {
      // Add to offline queue
      this.addToOfflineQueue({
        type,
        productId: data.productId,
        quantity: data.quantity,
        cartItemId: data.cartItemId
      });
      return;
    }

    try {
      await this.executeOperation(userId, {
        id: '',
        type,
        productId: data.productId,
        quantity: data.quantity,
        cartItemId: data.cartItemId,
        timestamp: Date.now(),
        retryCount: 0
      });
    } catch (error) {
      // Add to offline queue on failure
      this.addToOfflineQueue({
        type,
        productId: data.productId,
        quantity: data.quantity,
        cartItemId: data.cartItemId
      });
      throw error;
    }
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleReconnection();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Handle reconnection - sync pending operations
   */
  private async handleReconnection(): Promise<void> {
    const queue = this.getOfflineQueue();
    if (queue.length > 0) {
      // Trigger sync for authenticated users
      const event = new CustomEvent('cart-reconnection', {
        detail: { hasOfflineOperations: true }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Start periodic sync for authenticated users
   */
  private startPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      const event = new CustomEvent('cart-periodic-sync');
      window.dispatchEvent(event);
    }, this.SYNC_INTERVAL);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    
    window.removeEventListener('online', this.handleReconnection);
    window.removeEventListener('offline', () => {});
  }

  /**
   * Get sync status information
   */
  getSyncStatus(): {
    isOnline: boolean;
    hasOfflineOperations: boolean;
    lastSynced: number;
  } {
    const cart = this.loadCartFromLocal();
    const queue = this.getOfflineQueue();
    
    return {
      isOnline: this.isOnline,
      hasOfflineOperations: queue.length > 0,
      lastSynced: cart?.lastSynced || 0
    };
  }
}

export const cartPersistenceService = new CartPersistenceService();
