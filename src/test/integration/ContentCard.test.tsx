import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ContentCard } from '@/components/feed/ContentCard';
import favoritesReducer from '@/store/slices/favoritesSlice';
import feedReducer from '@/store/slices/feedSlice';
import preferencesReducer from '@/store/slices/preferencesSlice';
import uiReducer from '@/store/slices/uiSlice';
import { ContentItem } from '@/types/content';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || 'mocked image'} />;
  },
}));

function renderWithStore(ui: React.ReactElement, preloadedFavorites: ContentItem[] = []) {
  const store = configureStore({
    reducer: {
      favorites: favoritesReducer,
      feed: feedReducer,
      preferences: preferencesReducer,
      ui: uiReducer,
    },
    preloadedState: {
      favorites: {
        items: preloadedFavorites,
        filter: 'all',
        searchQuery: '',
      },
      preferences: {
        selectedCategories: ['technology'],
        realTimeEnabled: true,
        realTimeIntervalSeconds: 15,
        density: 'comfortable',
        language: 'en',
      },
    },
  });

  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

describe('ContentCard Component Integration', () => {
  const newsItem: ContentItem = {
    id: 'news-card-1',
    type: 'news',
    category: 'technology',
    title: 'Breakthrough Quantum Processing Unit Announced',
    description: 'A 10,000 qubit processor operating at room temperature has been revealed.',
    url: 'https://example.com/quantum',
    publishedAt: new Date().toISOString(),
    source: { name: 'Quantum Wire' },
    metrics: { likes: 45 },
  };

  it('should render article title, source, and category badge', () => {
    renderWithStore(<ContentCard item={newsItem} />);

    expect(
      screen.getByText('Breakthrough Quantum Processing Unit Announced')
    ).toBeInTheDocument();
    expect(screen.getByText('Quantum Wire')).toBeInTheDocument();
    expect(screen.getByText('technology')).toBeInTheDocument();
  });

  it('should toggle favorite status when bookmark button is clicked', () => {
    const { store } = renderWithStore(<ContentCard item={newsItem} />);

    expect(store.getState().favorites.items).toHaveLength(0);

    const bookmarkBtn = screen.getByLabelText('Add to favorites');
    fireEvent.click(bookmarkBtn);

    expect(store.getState().favorites.items).toHaveLength(1);
    expect(store.getState().favorites.items[0].id).toBe('news-card-1');
  });

  it('should dispatch likeItem when heart button is clicked', () => {
    const { store } = renderWithStore(<ContentCard item={newsItem} />);

    const likeBtn = screen.getByLabelText('Like content');
    fireEvent.click(likeBtn);

    // Toast message is triggered
    expect(store.getState().ui.toastMessage).toBeNull();
  });

  it('should open activeItemModal when card is clicked', () => {
    const { store } = renderWithStore(<ContentCard item={newsItem} />);

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(store.getState().ui.activeItemModal?.id).toBe('news-card-1');
  });
});
