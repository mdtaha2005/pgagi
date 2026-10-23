import { describe, it, expect } from 'vitest';
import preferencesReducer, {
  toggleCategory,
  setSelectedCategories,
  setDensity,
  setLanguage,
  toggleRealTime,
  resetPreferences,
} from '@/store/slices/preferencesSlice';
import { UserPreferences } from '@/types/user';

describe('preferencesSlice Reducer', () => {
  const initialPrefs: UserPreferences = {
    selectedCategories: ['technology', 'business'],
    realTimeEnabled: true,
    realTimeIntervalSeconds: 15,
    density: 'comfortable',
    language: 'en',
  };

  it('should toggle adding a new category', () => {
    const state = preferencesReducer(initialPrefs, toggleCategory('science'));
    expect(state.selectedCategories).toContain('science');
    expect(state.selectedCategories).toHaveLength(3);
  });

  it('should set multiple selected categories', () => {
    const state = preferencesReducer(initialPrefs, setSelectedCategories(['sports', 'health']));
    expect(state.selectedCategories).toEqual(['sports', 'health']);
  });

  it('should toggle removing an existing category', () => {
    const state = preferencesReducer(initialPrefs, toggleCategory('business'));
    expect(state.selectedCategories).not.toContain('business');
    expect(state.selectedCategories).toEqual(['technology']);
  });

  it('should prevent removing the last category (at least 1 required)', () => {
    const singleCatState: UserPreferences = {
      ...initialPrefs,
      selectedCategories: ['technology'],
    };
    const state = preferencesReducer(singleCatState, toggleCategory('technology'));
    expect(state.selectedCategories).toEqual(['technology']);
  });

  it('should update density between comfortable and compact', () => {
    const state = preferencesReducer(initialPrefs, setDensity('compact'));
    expect(state.density).toBe('compact');
  });

  it('should toggle real-time updates flag', () => {
    const state = preferencesReducer(initialPrefs, toggleRealTime());
    expect(state.realTimeEnabled).toBe(false);
  });

  it('should update language preference', () => {
    const state = preferencesReducer(initialPrefs, setLanguage('es'));
    expect(state.language).toBe('es');
  });

  it('should reset preferences to default values', () => {
    const modified: UserPreferences = {
      selectedCategories: ['health'],
      realTimeEnabled: false,
      realTimeIntervalSeconds: 30,
      density: 'compact',
      language: 'fr',
    };
    const state = preferencesReducer(modified, resetPreferences());
    expect(state.selectedCategories).toEqual(['technology', 'business', 'entertainment']);
    expect(state.realTimeEnabled).toBe(true);
    expect(state.density).toBe('comfortable');
    expect(state.language).toBe('en');
  });
});
