export const STORAGE_KEYS = {
  PREFERENCES: 'pgagi_user_preferences',
  FAVORITES: 'pgagi_user_favorites',
  THEME: 'pgagi_user_theme',
  AUTH: 'pgagi_user_profile',
  FEED_ORDER: 'pgagi_feed_custom_order',
} as const;

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (error) {
    console.warn(`Failed to read key "${key}" from localStorage:`, error);
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write key "${key}" to localStorage:`, error);
  }
}
