import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentCategory } from '@/types/content';
import { UserPreferences } from '@/types/user';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../localStorage';

export const ALL_CATEGORIES: ContentCategory[] = [
  'technology',
  'business',
  'entertainment',
  'sports',
  'science',
  'health',
];

const defaultPreferences: UserPreferences = {
  selectedCategories: ['technology', 'business', 'entertainment'],
  realTimeEnabled: true,
  realTimeIntervalSeconds: 15,
  density: 'comfortable',
  language: 'en',
};

const initialState: UserPreferences = defaultPreferences;

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    hydratePreferences: (state) => {
      const persisted = loadFromLocalStorage<Partial<UserPreferences>>(
        STORAGE_KEYS.PREFERENCES,
        {}
      );
      if (persisted.selectedCategories && persisted.selectedCategories.length > 0) {
        state.selectedCategories = persisted.selectedCategories;
      }
      if (typeof persisted.realTimeEnabled === 'boolean') {
        state.realTimeEnabled = persisted.realTimeEnabled;
      }
      if (persisted.realTimeIntervalSeconds) {
        state.realTimeIntervalSeconds = persisted.realTimeIntervalSeconds;
      }
      if (persisted.density) {
        state.density = persisted.density;
      }
      if (persisted.language) {
        state.language = persisted.language;
      }
    },
    toggleCategory: (state, action: PayloadAction<ContentCategory>) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      if (index >= 0) {
        // Prevent deselecting all categories - at least 1 required
        if (state.selectedCategories.length > 1) {
          state.selectedCategories.splice(index, 1);
        }
      } else {
        state.selectedCategories.push(category);
      }
      saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
    },
    setSelectedCategories: (state, action: PayloadAction<ContentCategory[]>) => {
      if (action.payload.length > 0) {
        state.selectedCategories = action.payload;
        saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
      }
    },
    setDensity: (state, action: PayloadAction<'comfortable' | 'compact'>) => {
      state.density = action.payload;
      saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
    },
    setLanguage: (state, action: PayloadAction<'en' | 'es' | 'fr' | 'hi'>) => {
      state.language = action.payload;
      saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
    },
    toggleRealTime: (state) => {
      state.realTimeEnabled = !state.realTimeEnabled;
      saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
    },
    resetPreferences: (state) => {
      state.selectedCategories = defaultPreferences.selectedCategories;
      state.realTimeEnabled = defaultPreferences.realTimeEnabled;
      state.realTimeIntervalSeconds = defaultPreferences.realTimeIntervalSeconds;
      state.density = defaultPreferences.density;
      state.language = defaultPreferences.language;
      saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
    },
  },
});

export const {
  hydratePreferences,
  toggleCategory,
  setSelectedCategories,
  setDensity,
  setLanguage,
  toggleRealTime,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
