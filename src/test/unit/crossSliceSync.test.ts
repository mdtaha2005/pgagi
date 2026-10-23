import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import feedReducer from '@/store/slices/feedSlice';
import favoritesReducer from '@/store/slices/favoritesSlice';
import trendingReducer from '@/store/slices/trendingSlice';
import searchReducer from '@/store/slices/searchSlice';
import uiReducer from '@/store/slices/uiSlice';
import { likeItem, toggleFavorite } from '@/store/sharedActions';
import { ContentItem } from '@/types/content';

describe('Cross-Slice State Synchronization', () => {
  const commonItem: ContentItem = {
    id: 'shared-item-1',
    type: 'news',
    category: 'technology',
    title: 'Shared Breakthrough Headline',
    description: 'A shared item appearing across multiple slices.',
    url: 'https://example.com/shared',
    publishedAt: '2026-10-22T10:00:00Z',
    source: { name: 'Tech Wire', sourceType: 'curated', isMock: true },
    metrics: { likes: 10, views: 500 },
    isLiked: false,
  };

  function createTestStore() {
    return configureStore({
      reducer: {
        feed: feedReducer,
        favorites: favoritesReducer,
        trending: trendingReducer,
        search: searchReducer,
        ui: uiReducer,
      },
      preloadedState: {
        feed: {
          items: [commonItem],
          customOrder: [],
          status: 'succeeded' as const,
          error: null,
          page: 1,
          hasMore: true,
          activeFilter: 'all' as const,
          liveNewCount: 0,
        },
        favorites: {
          items: [commonItem],
          filter: 'all' as const,
          searchQuery: '',
        },
        trending: {
          items: [commonItem],
          status: 'succeeded' as const,
          error: null,
          activeCategory: 'all' as const,
        },
        search: {
          query: 'breakthrough',
          debouncedQuery: 'breakthrough',
          results: [commonItem],
          status: 'succeeded' as const,
          error: null,
          selectedFilter: 'all' as const,
          history: [],
          currentRequestId: null,
        },
      },
    });
  }

  it('should synchronize like status and increment likes across all slices when likeItem is dispatched', () => {
    const store = createTestStore();

    // Verify initial state
    expect(store.getState().feed.items[0].isLiked).toBe(false);
    expect(store.getState().feed.items[0].metrics?.likes).toBe(10);
    expect(store.getState().favorites.items[0].isLiked).toBe(false);
    expect(store.getState().favorites.items[0].metrics?.likes).toBe(10);
    expect(store.getState().trending.items[0].isLiked).toBe(false);
    expect(store.getState().search.results[0].isLiked).toBe(false);

    // Dispatch shared likeItem
    store.dispatch(likeItem('shared-item-1'));

    // Check Feed slice
    expect(store.getState().feed.items[0].isLiked).toBe(true);
    expect(store.getState().feed.items[0].metrics?.likes).toBe(11);

    // Check Favorites slice
    expect(store.getState().favorites.items[0].isLiked).toBe(true);
    expect(store.getState().favorites.items[0].metrics?.likes).toBe(11);

    // Check Trending slice
    expect(store.getState().trending.items[0].isLiked).toBe(true);
    expect(store.getState().trending.items[0].metrics?.likes).toBe(11);

    // Check Search slice
    expect(store.getState().search.results[0].isLiked).toBe(true);
    expect(store.getState().search.results[0].metrics?.likes).toBe(11);

    // Toggle like back off
    store.dispatch(likeItem('shared-item-1'));
    expect(store.getState().feed.items[0].isLiked).toBe(false);
    expect(store.getState().feed.items[0].metrics?.likes).toBe(10);
    expect(store.getState().favorites.items[0].isLiked).toBe(false);
  });

  it('should toggle favorite status and update favorites slice', () => {
    const store = createTestStore();

    expect(store.getState().favorites.items).toHaveLength(1);

    // Toggle remove
    store.dispatch(toggleFavorite(commonItem));
    expect(store.getState().favorites.items).toHaveLength(0);

    // Toggle add
    store.dispatch(toggleFavorite(commonItem));
    expect(store.getState().favorites.items).toHaveLength(1);
    expect(store.getState().favorites.items[0].id).toBe('shared-item-1');
  });
});
