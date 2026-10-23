import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FavoritesView } from '@/components/favorites/FavoritesView';
import favoritesReducer from '@/store/slices/favoritesSlice';
import feedReducer from '@/store/slices/feedSlice';
import preferencesReducer from '@/store/slices/preferencesSlice';
import uiReducer from '@/store/slices/uiSlice';
import { ContentItem } from '@/types/content';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || 'mocked image'} />;
  },
}));

function renderFavorites(items: ContentItem[] = []) {
  const store = configureStore({
    reducer: {
      favorites: favoritesReducer,
      feed: feedReducer,
      preferences: preferencesReducer,
      ui: uiReducer,
    },
    preloadedState: {
      favorites: {
        items,
        filter: 'all' as const,
        searchQuery: '',
      },
      preferences: {
        selectedCategories: ['technology' as const],
        realTimeEnabled: true,
        realTimeIntervalSeconds: 15,
        density: 'comfortable' as const,
        language: 'en' as const,
      },
    },
  });

  return {
    ...render(
      <Provider store={store}>
        <FavoritesView />
      </Provider>
    ),
    store,
  };
}

describe('FavoritesView Integration', () => {
  const mockFavorite: ContentItem = {
    id: 'fav-1',
    type: 'news',
    category: 'technology',
    title: 'Saved Future Tech Article',
    description: 'A saved item for test.',
    url: 'https://example.com/saved',
    publishedAt: new Date().toISOString(),
    source: { name: 'Saved Source' },
  };

  it('should display empty state when there are no saved favorites', () => {
    renderFavorites([]);

    expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    expect(screen.getByText('Explore My Feed')).toBeInTheDocument();
  });

  it('should render saved cards when favorites exist', () => {
    renderFavorites([mockFavorite]);

    expect(screen.getByText('Saved Future Tech Article')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter saved items...')).toBeInTheDocument();
  });

  it('should filter items when typing in the search bar', () => {
    renderFavorites([mockFavorite]);

    const searchInput = screen.getByPlaceholderText('Filter saved items...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.queryByText('Saved Future Tech Article')).not.toBeInTheDocument();
    expect(screen.getByText('No matching favorites')).toBeInTheDocument();
  });
});
