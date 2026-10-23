import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import {
  toggleCategory,
  setSelectedCategories,
  setDensity,
  setLanguage,
  toggleRealTime,
  resetPreferences,
} from '../slices/preferencesSlice';
import {
  toggleFavorite,
  removeFavorite,
  clearAllFavorites,
} from '../slices/favoritesSlice';
import { setTheme, toggleTheme } from '../slices/uiSlice';
import { reorderFeedItems, resetFeedOrder } from '../slices/feedSlice';
import { updateProfile, resetProfile } from '../slices/authSlice';
import { saveToLocalStorage, STORAGE_KEYS } from '../localStorage';

export const persistenceMiddleware = createListenerMiddleware();

// 1. Preferences persistence
persistenceMiddleware.startListening({
  matcher: isAnyOf(
    toggleCategory,
    setSelectedCategories,
    setDensity,
    setLanguage,
    toggleRealTime,
    resetPreferences
  ),
  effect: (_action, listenerApi) => {
    const state = (listenerApi.getState() as RootState).preferences;
    saveToLocalStorage(STORAGE_KEYS.PREFERENCES, state);
  },
});

// 2. Favorites persistence
persistenceMiddleware.startListening({
  matcher: isAnyOf(toggleFavorite, removeFavorite, clearAllFavorites),
  effect: (_action, listenerApi) => {
    const state = (listenerApi.getState() as RootState).favorites;
    saveToLocalStorage(STORAGE_KEYS.FAVORITES, state.items);
  },
});

// 3. Theme persistence
persistenceMiddleware.startListening({
  matcher: isAnyOf(setTheme, toggleTheme),
  effect: (_action, listenerApi) => {
    const theme = (listenerApi.getState() as RootState).ui.theme;
    saveToLocalStorage(STORAGE_KEYS.THEME, theme);
  },
});

// 4. Feed custom order persistence
persistenceMiddleware.startListening({
  matcher: isAnyOf(reorderFeedItems, resetFeedOrder),
  effect: (_action, listenerApi) => {
    const customOrder = (listenerApi.getState() as RootState).feed.customOrder;
    saveToLocalStorage(STORAGE_KEYS.FEED_ORDER, customOrder);
  },
});

// 5. Auth profile persistence
persistenceMiddleware.startListening({
  matcher: isAnyOf(updateProfile, resetProfile),
  effect: (_action, listenerApi) => {
    const user = (listenerApi.getState() as RootState).auth.user;
    saveToLocalStorage(STORAGE_KEYS.AUTH, user);
  },
});
