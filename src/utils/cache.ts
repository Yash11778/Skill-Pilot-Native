import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = {
  /** Store data with an optional TTL (milliseconds) */
  set: async <T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> => {
    try {
      const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(entry));
    } catch (_) {}
  },

  /** Get cached data; returns null if missing or expired */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(`cache:${key}`);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        await AsyncStorage.removeItem(`cache:${key}`);
        return null;
      }
      return entry.data;
    } catch (_) {
      return null;
    }
  },

  /** Get cached data (even if stale) — use while fetching fresh data */
  getStale: async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(`cache:${key}`);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      return entry.data;
    } catch (_) {
      return null;
    }
  },

  /** Remove a specific cache key */
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`cache:${key}`);
    } catch (_) {}
  },

  /** Clear all cached data */
  clear: async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(k => k.startsWith('cache:'));
      if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
    } catch (_) {}
  },
};

export default cache;
