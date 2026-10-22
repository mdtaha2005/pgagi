import { describe, it, expect } from 'vitest';
import favoritesReducer, {
  toggleFavorite,
  removeFavorite,
  clearAllFavorites,
  setFavoritesFilter,
  setFavoritesSearchQuery,
} from '@/store/slices/favoritesSlice';
import { ContentItem } from '@/types/content';

describe('favoritesSlice Reducer', () => {
  const sampleItem1: ContentItem = {
    id: 'item-1',
    type: 'news',
    category: 'technology',
    title: 'Test Article 1',
    description: 'Test description 1',
    url: 'https://example.com/1',
    publishedAt: new Date().toISOString(),
    source: { name: 'Test Source' },
  };

  const sampleItem2: ContentItem = {
    id: 'item-2',
    type: 'recommendation',
    category: 'entertainment',
    title: 'Test Movie 2',
    description: 'Test description 2',
    url: 'https://example.com/2',
    publishedAt: new Date().toISOString(),
    source: { name: 'Test Source 2' },
  };

  const initialState = {
    items: [],
    filter: 'all' as const,
    searchQuery: '',
  };

  it('should add item when toggled and not present', () => {
    const state = favoritesReducer(initialState, toggleFavorite(sampleItem1));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('item-1');
  });

  it('should remove item when toggled and already present', () => {
    const stateWithItem = { ...initialState, items: [sampleItem1] };
    const state = favoritesReducer(stateWithItem, toggleFavorite(sampleItem1));
    expect(state.items).toHaveLength(0);
  });

  it('should remove item by id', () => {
    const stateWithItems = { ...initialState, items: [sampleItem1, sampleItem2] };
    const state = favoritesReducer(stateWithItems, removeFavorite('item-1'));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('item-2');
  });

  it('should clear all favorites', () => {
    const stateWithItems = { ...initialState, items: [sampleItem1, sampleItem2] };
    const state = favoritesReducer(stateWithItems, clearAllFavorites());
    expect(state.items).toHaveLength(0);
  });

  it('should set category filter and search query', () => {
    let state = favoritesReducer(initialState, setFavoritesFilter('recommendation'));
    expect(state.filter).toBe('recommendation');

    state = favoritesReducer(state, setFavoritesSearchQuery('Sci-Fi'));
    expect(state.searchQuery).toBe('Sci-Fi');
  });
});
