/**
 * Advanced Caching Service
 * Implements multiple caching strategies for optimal performance
 */

import { memoryCache, CACHE_TIMES } from '@/lib/config/cacheConfig';

interface CacheOptions {
  ttl?: number;
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  compress?: boolean;
  encrypt?: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  version: string;
  compressed?: boolean;
  encrypted?: boolean;
}

class CacheService {
  private version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  private compressionThreshold = 1024; // Compress data larger than 1KB

  /**
   * Set data in cache with specified options
   */
  async set(key: string, data: any, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = CACHE_TIMES.SHORT,
      storage = 'memory',
      compress = false,
      encrypt = false
    } = options;

    let processedData = data;

    // Compress data if requested and above threshold
    if (compress && this.getDataSize(data) > this.compressionThreshold) {
      processedData = await this.compressData(data);
    }

    // Encrypt data if requested
    if (encrypt) {
      processedData = await this.encryptData(processedData);
    }

    const entry: CacheEntry = {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      version: this.version,
      compressed: compress,
      encrypted: encrypt
    };

    switch (storage) {
      case 'memory':
        memoryCache.set(key, entry, ttl);
        break;
      case 'localStorage':
        this.setLocalStorage(key, entry);
        break;
      case 'sessionStorage':
        this.setSessionStorage(key, entry);
        break;
      case 'indexedDB':
        await this.setIndexedDB(key, entry);
        break;
    }
  }

  /**
   * Get data from cache
   */
  async get(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' = 'memory'): Promise<any | null> {
    let entry: CacheEntry | null = null;

    switch (storage) {
      case 'memory':
        entry = memoryCache.get(key);
        break;
      case 'localStorage':
        entry = this.getLocalStorage(key);
        break;
      case 'sessionStorage':
        entry = this.getSessionStorage(key);
        break;
      case 'indexedDB':
        entry = await this.getIndexedDB(key);
        break;
    }

    if (!entry) return null;

    // Check version compatibility
    if (entry.version !== this.version) {
      await this.delete(key, storage);
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      await this.delete(key, storage);
      return null;
    }

    let data = entry.data;

    // Decrypt data if encrypted
    if (entry.encrypted) {
      data = await this.decryptData(data);
    }

    // Decompress data if compressed
    if (entry.compressed) {
      data = await this.decompressData(data);
    }

    return data;
  }

  /**
   * Delete data from cache
   */
  async delete(key: string, storage: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' = 'memory'): Promise<void> {
    switch (storage) {
      case 'memory':
        memoryCache.delete(key);
        break;
      case 'localStorage':
        localStorage.removeItem(this.getStorageKey(key));
        break;
      case 'sessionStorage':
        sessionStorage.removeItem(this.getStorageKey(key));
        break;
      case 'indexedDB':
        await this.deleteIndexedDB(key);
        break;
    }
  }

  /**
   * Clear all cache data
   */
  async clear(storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'): Promise<void> {
    if (!storage) {
      // Clear all storages
      memoryCache.clear();
      this.clearLocalStorage();
      this.clearSessionStorage();
      await this.clearIndexedDB();
      return;
    }

    switch (storage) {
      case 'memory':
        memoryCache.clear();
        break;
      case 'localStorage':
        this.clearLocalStorage();
        break;
      case 'sessionStorage':
        this.clearSessionStorage();
        break;
      case 'indexedDB':
        await this.clearIndexedDB();
        break;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memory: { size: number; entries: number };
    localStorage: { size: number; entries: number };
    sessionStorage: { size: number; entries: number };
  } {
    return {
      memory: {
        size: memoryCache.size(),
        entries: memoryCache.size()
      },
      localStorage: {
        size: this.getStorageSize(localStorage),
        entries: this.getStorageEntries(localStorage)
      },
      sessionStorage: {
        size: this.getStorageSize(sessionStorage),
        entries: this.getStorageEntries(sessionStorage)
      }
    };
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<void> {
    // Cleanup localStorage
    this.cleanupStorage(localStorage);
    
    // Cleanup sessionStorage
    this.cleanupStorage(sessionStorage);
    
    // Cleanup IndexedDB
    await this.cleanupIndexedDB();
  }

  // Private helper methods

  private getStorageKey(key: string): string {
    return `naaz-cache-${key}`;
  }

  private setLocalStorage(key: string, entry: CacheEntry): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded error
      this.handleStorageQuotaExceeded('localStorage');
    }
  }

  private getLocalStorage(key: string): CacheEntry | null {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  private setSessionStorage(key: string, entry: CacheEntry): void {
    try {
      sessionStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
    } catch (error) {
      this.handleStorageQuotaExceeded('sessionStorage');
    }
  }

  private getSessionStorage(key: string): CacheEntry | null {
    try {
      const item = sessionStorage.getItem(this.getStorageKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  }

  private async setIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('naaz-cache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.put({ key, ...entry });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private async getIndexedDB(key: string): Promise<CacheEntry | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('naaz-cache', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? { ...result, key: undefined } : null);
        };
        
        getRequest.onerror = () => resolve(null);
      };
    });
  }

  private async deleteIndexedDB(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('naaz-cache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('naaz-cache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  private async cleanupIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('naaz-cache', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const entries = getAllRequest.result;
          const now = Date.now();
          
          entries.forEach(entry => {
            if (now - entry.timestamp > entry.ttl) {
              store.delete(entry.key);
            }
          });
          
          transaction.oncomplete = () => resolve();
        };
      };
    });
  }

  private clearLocalStorage(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('naaz-cache-')) {
        localStorage.removeItem(key);
      }
    });
  }

  private clearSessionStorage(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('naaz-cache-')) {
        sessionStorage.removeItem(key);
      }
    });
  }

  private cleanupStorage(storage: Storage): void {
    const keys = Object.keys(storage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('naaz-cache-')) {
        try {
          const entry: CacheEntry = JSON.parse(storage.getItem(key) || '');
          if (now - entry.timestamp > entry.ttl) {
            storage.removeItem(key);
          }
        } catch (error) {
          // Remove invalid entries
          storage.removeItem(key);
        }
      }
    });
  }

  private getStorageSize(storage: Storage): number {
    let size = 0;
    const keys = Object.keys(storage);
    
    keys.forEach(key => {
      if (key.startsWith('naaz-cache-')) {
        size += (storage.getItem(key) || '').length;
      }
    });
    
    return size;
  }

  private getStorageEntries(storage: Storage): number {
    return Object.keys(storage).filter(key => key.startsWith('naaz-cache-')).length;
  }

  private handleStorageQuotaExceeded(storageType: string): void {
    import('../utils/consoleMigration').then(({ logWarning }) => {
      logWarning(`${storageType} quota exceeded, clearing old cache entries`);
    });
    
    // Clear old entries to make space
    if (storageType === 'localStorage') {
      this.cleanupStorage(localStorage);
    } else if (storageType === 'sessionStorage') {
      this.cleanupStorage(sessionStorage);
    }
  }

  private getDataSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private async compressData(data: any): Promise<string> {
    // Simple compression using built-in compression
    const jsonString = JSON.stringify(data);
    
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(jsonString));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      return btoa(String.fromCharCode(...compressed));
    }
    
    // Fallback: return original data
    return jsonString;
  }

  private async decompressData(compressedData: string): Promise<any> {
    if ('DecompressionStream' in window) {
      try {
        const compressed = Uint8Array.from(atob(compressedData), c => c.charCodeAt(0));
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(compressed);
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          decompressed.set(chunk, offset);
          offset += chunk.length;
        }
        
        const jsonString = new TextDecoder().decode(decompressed);
        return JSON.parse(jsonString);
      } catch (error) {
        // Fallback: try to parse as regular JSON
        return JSON.parse(compressedData);
      }
    }
    
    // Fallback: parse as regular JSON
    return JSON.parse(compressedData);
  }

  private async encryptData(data: any): Promise<string> {
    // Simple encryption for demo purposes
    // In production, use proper encryption libraries
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  }

  private async decryptData(encryptedData: string): Promise<any> {
    // Simple decryption for demo purposes
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Initialize cleanup interval
if (typeof window !== 'undefined') {
  // Cleanup expired entries every 5 minutes
  setInterval(() => {
    cacheService.cleanup();
  }, 5 * 60 * 1000);
}

export default cacheService;