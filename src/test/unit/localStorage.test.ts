import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validatePreferences,
  validateFavorites,
  validateTheme,
  validateFeedOrder,
  validateProfile,
  loadFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS,
  DEFAULT_PREFERENCES,
  DEFAULT_USER_PROFILE,
} from '@/store/localStorage';
import { ContentItem } from '@/types/content';

describe('localStorage schema validation and error recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('validatePreferences', () => {
    it('should return valid preferences when input is fully valid', () => {
      const valid = {
        selectedCategories: ['technology', 'science'],
        realTimeEnabled: false,
        realTimeIntervalSeconds: 30,
        density: 'compact' as const,
        language: 'es' as const,
      };
      const result = validatePreferences(valid);
      expect(result).toEqual(valid);
    });

    it('should fallback to defaults when input is null, undefined, or non-object', () => {
      expect(validatePreferences(null)).toEqual(DEFAULT_PREFERENCES);
      expect(validatePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
      expect(validatePreferences('corrupted string')).toEqual(DEFAULT_PREFERENCES);
      expect(validatePreferences(123)).toEqual(DEFAULT_PREFERENCES);
    });

    it('should fallback to default categories if selectedCategories is missing or empty', () => {
      const missingCats = { density: 'compact' };
      const result = validatePreferences(missingCats);
      expect(result.selectedCategories).toEqual(DEFAULT_PREFERENCES.selectedCategories);
      expect(result.density).toBe('compact');

      const emptyCats = { selectedCategories: [] };
      const emptyResult = validatePreferences(emptyCats);
      expect(emptyResult.selectedCategories).toEqual(DEFAULT_PREFERENCES.selectedCategories);
    });

    it('should filter out unknown category strings and fallback if none valid remain', () => {
      const corruptedCats = { selectedCategories: ['unknown-cat-1', 'invalid-cat-2'] };
      const result = validatePreferences(corruptedCats);
      expect(result.selectedCategories).toEqual(DEFAULT_PREFERENCES.selectedCategories);

      const mixedCats = { selectedCategories: ['technology', 'fake-category'] };
      const mixedResult = validatePreferences(mixedCats);
      expect(mixedResult.selectedCategories).toEqual(['technology']);
    });

    it('should fallback invalid density, language, or interval', () => {
      const invalidFields = {
        selectedCategories: ['sports'],
        density: 'ultra-wide', // invalid
        language: 'klingon', // invalid
        realTimeIntervalSeconds: -99, // invalid
      };
      const result = validatePreferences(invalidFields);
      expect(result.selectedCategories).toEqual(['sports']);
      expect(result.density).toBe('comfortable');
      expect(result.language).toBe('en');
      expect(result.realTimeIntervalSeconds).toBe(15);
    });
  });

  describe('validateFavorites', () => {
    const validItem: ContentItem = {
      id: 'news-1',
      type: 'news',
      category: 'technology',
      title: 'Valid Tech News',
      description: 'Desc',
      url: 'https://example.com/item1',
      publishedAt: '2026-10-22T00:00:00Z',
      source: { name: 'Tech Daily' },
    };

    it('should return valid items unchanged', () => {
      const result = validateFavorites([validItem]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('news-1');
    });

    it('should return empty array if input is not an array', () => {
      expect(validateFavorites(null)).toEqual([]);
      expect(validateFavorites(undefined)).toEqual([]);
      expect(validateFavorites({ id: 'bad' })).toEqual([]);
      expect(validateFavorites('bad string')).toEqual([]);
    });

    it('should filter out corrupted or incomplete items in the array', () => {
      const badItems = [
        null,
        undefined,
        {},
        { id: 'missing-title-and-type' },
        { id: '2', title: 'Missing Type', url: 'https://example.com' },
        validItem,
      ];
      const result = validateFavorites(badItems);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('news-1');
    });
  });

  describe('validateTheme', () => {
    it('should accept "light" and "dark"', () => {
      expect(validateTheme('light')).toBe('light');
      expect(validateTheme('dark')).toBe('dark');
    });

    it('should fallback to "dark" for invalid theme values', () => {
      expect(validateTheme('blue')).toBe('dark');
      expect(validateTheme(null)).toBe('dark');
      expect(validateTheme(undefined)).toBe('dark');
      expect(validateTheme({})).toBe('dark');
    });
  });

  describe('validateFeedOrder', () => {
    it('should return valid string ID array', () => {
      expect(validateFeedOrder(['id-1', 'id-2'])).toEqual(['id-1', 'id-2']);
    });

    it('should filter non-string items or return empty array for non-arrays', () => {
      expect(validateFeedOrder(null)).toEqual([]);
      expect(validateFeedOrder(['id-1', 123, null, 'id-2'])).toEqual(['id-1', 'id-2']);
    });
  });

  describe('validateProfile', () => {
    it('should return valid profile', () => {
      const custom = {
        ...DEFAULT_USER_PROFILE,
        name: 'Alex Customized',
        email: 'alex.custom@example.com',
      };
      expect(validateProfile(custom)).toEqual(custom);
    });

    it('should fallback to DEFAULT_USER_PROFILE on invalid data', () => {
      expect(validateProfile(null)).toEqual(DEFAULT_USER_PROFILE);
      expect(validateProfile({ name: 123 })).toEqual(DEFAULT_USER_PROFILE);
    });
  });

  describe('loadFromLocalStorage and saveToLocalStorage safety', () => {
    it('should load safely and return fallback if key does not exist', () => {
      const result = loadFromLocalStorage('nonexistent-key', validateTheme, 'dark');
      expect(result).toBe('dark');
    });

    it('should load safely and validate parsed JSON', () => {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify('light'));
      const result = loadFromLocalStorage(STORAGE_KEYS.THEME, validateTheme, 'dark');
      expect(result).toBe('light');
    });

    it('should handle JSON parse error gracefully and return fallback', () => {
      localStorage.setItem(STORAGE_KEYS.THEME, 'invalid-json{{{');
      const fallback = 'dark' as const;
      const result = loadFromLocalStorage(STORAGE_KEYS.THEME, validateTheme, fallback);
      expect(result).toBe('dark');
    });

    it('should save data to localStorage without throwing', () => {
      saveToLocalStorage(STORAGE_KEYS.THEME, 'light');
      expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('"light"');
    });

    it('should handle QuotaExceededError or security exception in saveToLocalStorage silently', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => {
        saveToLocalStorage(STORAGE_KEYS.THEME, 'dark');
      }).not.toThrow();
    });
  });
});
