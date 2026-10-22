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
import { ContentItem } from '@/types/content';

function HydrationAndLiveSync({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { realTimeEnabled, realTimeIntervalSeconds, selectedCategories } = useAppSelector(
    (state) => state.preferences
  );
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(hydratePreferences());
    dispatch(hydrateFavorites());
    dispatch(hydrateCustomOrder());
    dispatch(hydrateTheme());
    dispatch(hydrateProfile());
  }, [dispatch]);

  // Real-time live feed polling simulation
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
          dispatch(showToast(`⚡ Breaking: ${item.title.slice(0, 48)}...`));
        }
      } catch (e) {
        // quiet fallback
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
