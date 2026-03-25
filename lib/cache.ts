import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
const CACHE_KEYS = {
  LISTINGS: '@thriftdrop_listings_cache',
  LISTINGS_TIMESTAMP: '@thriftdrop_listings_timestamp',
  DROPS: '@thriftdrop_drops_cache',
  DROPS_TIMESTAMP: '@thriftdrop_drops_timestamp',
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class CacheManager {
  /**
   * Get cached data if it exists and is not expired
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const parsed: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - parsed.timestamp > CACHE_EXPIRY) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      __DEV__ && console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache with timestamp
   */
  static async set<T>(key: string, data: T): Promise<void> {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      __DEV__ && console.error('Cache set error:', error);
    }
  }

  /**
   * Remove specific cache entry
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      __DEV__ && console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      for (const key of keys) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      __DEV__ && console.error('Cache clear error:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   */
  static async isValid(key: string): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return false;

      const parsed: CacheEntry<any> = JSON.parse(cached);
      const now = Date.now();

      return now - parsed.timestamp <= CACHE_EXPIRY;
    } catch (error) {
      __DEV__ && console.error('Cache validation error:', error);
      return false;
    }
  }

  /**
   * Get cache timestamp
   */
  static async getTimestamp(key: string): Promise<number | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const parsed: CacheEntry<any> = JSON.parse(cached);
      return parsed.timestamp;
    } catch (error) {
      __DEV__ && console.error('Cache timestamp error:', error);
      return null;
    }
  }
}

// Specific cache helpers for listings
export const ListingsCache = {
  get: () => CacheManager.get<any[]>(CACHE_KEYS.LISTINGS),
  set: (data: any[]) => CacheManager.set(CACHE_KEYS.LISTINGS, data),
  remove: () => CacheManager.remove(CACHE_KEYS.LISTINGS),
  isValid: () => CacheManager.isValid(CACHE_KEYS.LISTINGS),
  getTimestamp: () => CacheManager.getTimestamp(CACHE_KEYS.LISTINGS),
};

// Specific cache helpers for drops
export const DropsCache = {
  get: () => CacheManager.get<any[]>(CACHE_KEYS.DROPS),
  set: (data: any[]) => CacheManager.set(CACHE_KEYS.DROPS, data),
  remove: () => CacheManager.remove(CACHE_KEYS.DROPS),
  isValid: () => CacheManager.isValid(CACHE_KEYS.DROPS),
  getTimestamp: () => CacheManager.getTimestamp(CACHE_KEYS.DROPS),
};
