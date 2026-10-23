import { UserPreferences, UserProfile } from '@/types/user';
import { ContentItem, ContentCategory } from '@/types/content';

export const STORAGE_KEYS = {
  PREFERENCES: 'pgagi_user_preferences',
  FAVORITES: 'pgagi_user_favorites',
  THEME: 'pgagi_user_theme',
  AUTH: 'pgagi_user_profile',
  FEED_ORDER: 'pgagi_feed_custom_order',
} as const;

export const VALID_CATEGORIES: ContentCategory[] = [
  'technology',
  'business',
  'entertainment',
  'sports',
  'science',
  'health',
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  selectedCategories: ['technology', 'business', 'entertainment'],
  realTimeEnabled: true,
  realTimeIntervalSeconds: 15,
  density: 'comfortable',
  language: 'en',
};

/**
 * Safely reads a raw string from localStorage.
 */
export function safeGetStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Storage] Failed to read key "${key}":`, err);
    return null;
  }
}

/**
 * Safely writes a raw string to localStorage.
 */
export function safeSetStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] Failed to write key "${key}":`, err);
  }
}

/**
 * Validates and sanitizes persisted preferences.
 * Replaces corrupted or missing fields with safe defaults.
 */
export function validatePreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PREFERENCES;
  }

  const obj = raw as Record<string, unknown>;

  // Validate categories: must be non-empty array of valid category strings
  let selectedCategories: ContentCategory[] = DEFAULT_PREFERENCES.selectedCategories;
  if (Array.isArray(obj.selectedCategories)) {
    const valid = obj.selectedCategories.filter(
      (c): c is ContentCategory => typeof c === 'string' && VALID_CATEGORIES.includes(c as ContentCategory)
    );
    if (valid.length > 0) {
      selectedCategories = valid;
    }
  }

  const realTimeEnabled =
    typeof obj.realTimeEnabled === 'boolean'
      ? obj.realTimeEnabled
      : DEFAULT_PREFERENCES.realTimeEnabled;

  const realTimeIntervalSeconds =
    typeof obj.realTimeIntervalSeconds === 'number' && obj.realTimeIntervalSeconds >= 5
      ? obj.realTimeIntervalSeconds
      : DEFAULT_PREFERENCES.realTimeIntervalSeconds;

  const density =
    obj.density === 'compact' || obj.density === 'comfortable'
      ? obj.density
      : DEFAULT_PREFERENCES.density;

  const language =
    obj.language === 'en' || obj.language === 'es' || obj.language === 'fr' || obj.language === 'hi'
      ? obj.language
      : DEFAULT_PREFERENCES.language;

  return {
    selectedCategories,
    realTimeEnabled,
    realTimeIntervalSeconds,
    density,
    language,
  };
}

/**
 * Validates and sanitizes persisted favorites.
 * Discards malformed or incomplete entries.
 */
export function validateFavorites(raw: unknown): ContentItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter((item): item is ContentItem => {
    if (!item || typeof item !== 'object') return false;
    const i = item as Record<string, unknown>;
    return (
      typeof i.id === 'string' &&
      i.id.length > 0 &&
      typeof i.title === 'string' &&
      typeof i.type === 'string' &&
      typeof i.category === 'string' &&
      typeof i.url === 'string' &&
      typeof i.publishedAt === 'string' &&
      i.source !== null &&
      typeof i.source === 'object'
    );
  });
}

/**
 * Validates persisted theme string.
 */
export function validateTheme(raw: unknown): 'light' | 'dark' | 'system' {
  if (raw === 'light' || raw === 'dark' || raw === 'system') {
    return raw;
  }
  return 'dark';
}

/**
 * Validates persisted custom feed order (array of string IDs).
 */
export function validateFeedOrder(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_default_01',
  name: 'Alex Rivera',
  username: 'alexrivera',
  email: 'alex.rivera@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Full-stack explorer, tech enthusiast, and movie buff. Tracking cutting-edge tech and sci-fi recommendations.',
  joinedDate: 'October 2026',
};

/**
 * Validates persisted user profile.
 */
export function validateProfile(raw: unknown, defaultUser: UserProfile = DEFAULT_USER_PROFILE): UserProfile {
  if (!raw || typeof raw !== 'object') return { ...defaultUser };
  const obj = raw as Partial<UserProfile>;
  return {
    id: typeof obj.id === 'string' && obj.id.trim() ? obj.id : defaultUser.id,
    name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : defaultUser.name,
    username: typeof obj.username === 'string' && obj.username.trim() ? obj.username : defaultUser.username,
    email: typeof obj.email === 'string' && obj.email.trim() ? obj.email : defaultUser.email,
    avatarUrl: typeof obj.avatarUrl === 'string' && obj.avatarUrl.trim() ? obj.avatarUrl : defaultUser.avatarUrl,
    bio: typeof obj.bio === 'string' ? obj.bio : defaultUser.bio,
    joinedDate: typeof obj.joinedDate === 'string' ? obj.joinedDate : defaultUser.joinedDate,
  };
}

/**
 * Generic load and save helpers with error handling.
 */
export function loadFromLocalStorage<T>(
  key: string,
  validator: (raw: unknown) => T,
  fallback: T
): T {
  const raw = safeGetStorage(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return validator(parsed);
  } catch (err) {
    console.warn(`[Storage] Failed to parse JSON for key "${key}":`, err);
    return fallback;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    safeSetStorage(key, serialized);
  } catch (err) {
    console.warn(`[Storage] Failed to stringify value for key "${key}":`, err);
  }
}
