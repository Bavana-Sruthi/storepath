import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { OfflineCache } from '@/types';

const CACHE_KEY = 'storepath-offline-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(true);
  const {
    userLocation,
    nearbyStores,
    favoriteStores,
    favoriteProducts,
    shoppingLists,
    setLastSync,
  } = useStore();

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveCache = () => {
    const cache: OfflineCache = {
      lastLocation: userLocation || undefined,
      stores: nearbyStores,
      favorites: [
        ...favoriteStores.map(id => ({ id: `fav-store-${id}`, userId: '', type: 'store' as const, itemId: id, addedAt: Date.now() })),
        ...favoriteProducts.map(id => ({ id: `fav-product-${id}`, userId: '', type: 'product' as const, itemId: id, addedAt: Date.now() })),
      ],
      shoppingLists,
      lastUpdated: Date.now(),
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      setLastSync(Date.now());
    } catch (error) {
      console.error('Failed to save offline cache:', error);
    }
  };

  const loadCache = (): OfflineCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cache: OfflineCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - cache.lastUpdated > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return cache;
    } catch (error) {
      console.error('Failed to load offline cache:', error);
      return null;
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear offline cache:', error);
    }
  };

  return {
    isOnline,
    saveCache,
    loadCache,
    clearCache,
  };
}
