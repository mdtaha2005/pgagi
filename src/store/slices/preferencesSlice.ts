import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentCategory } from '@/types/content';
import { UserPreferences } from '@/types/user';
import { DEFAULT_PREFERENCES, VALID_CATEGORIES } from '../localStorage';

export const ALL_CATEGORIES: ContentCategory[] = VALID_CATEGORIES;

const initialState: UserPreferences = { ...DEFAULT_PREFERENCES };

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    hydratePreferences: (state, action: PayloadAction<UserPreferences>) => {
      if (action.payload && action.payload.selectedCategories?.length > 0) {
        state.selectedCategories = action.payload.selectedCategories;
        state.realTimeEnabled = action.payload.realTimeEnabled;
        state.realTimeIntervalSeconds = action.payload.realTimeIntervalSeconds;
        state.density = action.payload.density;
        state.language = action.payload.language;
      }
    },
    toggleCategory: (state, action: PayloadAction<ContentCategory>) => {
      const category = action.payload;
      const index = state.selectedCategories.indexOf(category);
      if (index >= 0) {
        // Enforce at least 1 category selected
        if (state.selectedCategories.length > 1) {
          state.selectedCategories.splice(index, 1);
        }
      } else {
        state.selectedCategories.push(category);
      }
    },
    setSelectedCategories: (state, action: PayloadAction<ContentCategory[]>) => {
      if (action.payload && action.payload.length > 0) {
        state.selectedCategories = action.payload;
      }
    },
    setDensity: (state, action: PayloadAction<'comfortable' | 'compact'>) => {
      state.density = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'es' | 'fr' | 'hi'>) => {
      state.language = action.payload;
    },
    toggleRealTime: (state) => {
      state.realTimeEnabled = !state.realTimeEnabled;
    },
    resetPreferences: (state) => {
      state.selectedCategories = [...DEFAULT_PREFERENCES.selectedCategories];
      state.realTimeEnabled = DEFAULT_PREFERENCES.realTimeEnabled;
      state.realTimeIntervalSeconds = DEFAULT_PREFERENCES.realTimeIntervalSeconds;
      state.density = DEFAULT_PREFERENCES.density;
      state.language = DEFAULT_PREFERENCES.language;
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
