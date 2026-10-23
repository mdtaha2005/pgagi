'use client';

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { hydratePreferences } from './slices/preferencesSlice';
import { hydrateFavorites } from './slices/favoritesSlice';
import { hydrateCustomOrder, prependLiveItem } from './slices/feedSlice';
import { hydrateTheme, showToast } from './slices/uiSlice';
import { hydrateProfile } from './slices/authSlice';
import { useAppDispatch, useAppSelector } from './hooks';
import {
  STORAGE_KEYS,
  loadFromLocalStorage,
  validatePreferences,
  validateFavorites,
  validateTheme,
  validateFeedOrder,
  validateProfile,
  DEFAULT_PREFERENCES,
} from './localStorage';
import { DEFAULT_USER } from './slices/authSlice';
import { ContentItem } from '@/types/content';

function HydrationAndLiveSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const { realTimeEnabled, realTimeIntervalSeconds, selectedCategories } = useAppSelector(
    (state) => state.preferences
  );
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Client-side Hydration with safe schema validation
  useEffect(() => {
    // Preferences
    const validPrefs = loadFromLocalStorage(
      STORAGE_KEYS.PREFERENCES,
      validatePreferences,
      DEFAULT_PREFERENCES
    );
    dispatch(hydratePreferences(validPrefs));

    // Favorites
    const validFavs = loadFromLocalStorage(
      STORAGE_KEYS.FAVORITES,
      validateFavorites,
      []
    );
    dispatch(hydrateFavorites(validFavs));

    // Theme
    const validTheme = loadFromLocalStorage(
      STORAGE_KEYS.THEME,
      validateTheme,
      'dark'
    );
    dispatch(hydrateTheme(validTheme));

    // Feed order
    const validOrder = loadFromLocalStorage(
      STORAGE_KEYS.FEED_ORDER,
      validateFeedOrder,
      []
    );
    dispatch(hydrateCustomOrder(validOrder));

    // Profile
    const validProfile = loadFromLocalStorage(
      STORAGE_KEYS.AUTH,
      (raw) => validateProfile(raw, DEFAULT_USER),
      DEFAULT_USER
    );
    dispatch(hydrateProfile(validProfile));
  }, [dispatch]);

  // 2. Client-side Theme DOM effect (completely pure separation from reducers)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // 3. Real-time live feed polling simulation
  useEffect(() => {
    if (!realTimeEnabled) {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      return;
    }

    const fetchLiveDrop = async () => {
      try {
        const cat =
          selectedCategories[Math.floor(Math.random() * selectedCategories.length)] ||
          'technology';
        const res = await fetch(`/api/realtime?category=${encodeURIComponent(cat)}`);
        if (res.ok) {
          const item: ContentItem = await res.json();
          dispatch(prependLiveItem(item));
          dispatch(showToast(`⚡ Live update: ${item.title.slice(0, 48)}...`));
        }
      } catch {
        // Quiet fallback
      }
    };

    const intervalMs = Math.max(8, realTimeIntervalSeconds) * 1000;
    liveTimerRef.current = setInterval(fetchLiveDrop, intervalMs);

    return () => {
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    };
  }, [realTimeEnabled, realTimeIntervalSeconds, selectedCategories, dispatch]);

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HydrationAndLiveSync>{children}</HydrationAndLiveSync>
    </Provider>
  );
}
