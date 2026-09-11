/**
 * localStorage utility for persisting user data
 * Handles serialization, error handling, and fallback gracefully
 */

export const STORAGE_KEYS = {
  LIKED_SONGS: 'senja_liked_songs',
  PLAYLISTS: 'senja_playlists',
  DOWNLOADED_SONGS: 'senja_downloaded_songs',
  PLAY_HISTORY: 'senja_play_history',
  SONG_PLAY_COUNTS: 'senja_song_play_counts',
  ARTIST_PLAY_COUNTS: 'senja_artist_play_counts',
  RECENTLY_PLAYED: 'senja_recently_played',
  VOLUME: 'senja_volume',
  IS_SHUFFLE: 'senja_is_shuffle',
  IS_REPEAT: 'senja_is_repeat',
} as const;

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get item from localStorage with type safety
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get ${key} from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with error handling
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to set ${key} in localStorage:`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error);
    return false;
  }
}

/**
 * Clear all Senja Musik data from localStorage
 */
export function clearAllStorage(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
    return false;
  }
}

/**
 * Get total storage size used (approximate)
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  try {
    let total = 0;
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length + key.length;
      }
    });
    return total;
  } catch (error) {
    console.warn('Failed to calculate storage size:', error);
    return 0;
  }
}
