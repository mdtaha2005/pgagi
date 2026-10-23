import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ContentCard } from '@/components/feed/ContentCard';
import favoritesReducer from '@/store/slices/favoritesSlice';
import feedReducer from '@/store/slices/feedSlice';
import trendingReducer from '@/store/slices/trendingSlice';
import searchReducer from '@/store/slices/searchSlice';
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

const testNewsItem: ContentItem = {
  id: 'news-card-1',
  type: 'news',
  category: 'technology',
  title: 'Breakthrough Quantum Processing Unit Announced',
  description: 'A 10,000 qubit processor operating at room temperature has been revealed.',
  url: 'https://example.com/quantum',
  imageUrl: 'https://images.unsplash.com/photo-test.jpg',
  publishedAt: new Date(Date.now() - 3600000).toISOString(),
  source: { name: 'Quantum Wire', sourceType: 'live', isMock: false },
  metrics: { likes: 45 },
  tags: ['Quantum', 'Hardware'],
};

const testRecommendationItem: ContentItem = {
  id: 'rec-card-1',
  type: 'recommendation',
  category: 'entertainment',
  title: 'Inception 2026',
  description: 'A mind-bending sci-fi spectacle.',
  url: 'https://example.com/inception',
  imageUrl: 'https://images.unsplash.com/photo-movie.jpg',
  publishedAt: new Date().toISOString(),
  source: { name: 'TMDB', sourceType: 'live', isMock: false },
  metrics: { likes: 120, rating: 8.9 },
  recommendationMeta: { mediaType: 'movie', rating: 8.9, year: 2026 },
  tags: ['Sci-Fi', 'Movie'],
};

function renderWithStore(ui: React.ReactElement, preloadedFavorites: ContentItem[] = []) {
  const store = configureStore({
    reducer: {
      favorites: favoritesReducer,
      feed: feedReducer,
      trending: trendingReducer,
      search: searchReducer,
      preferences: preferencesReducer,
      ui: uiReducer,
    },
    preloadedState: {
      feed: {
        items: [testNewsItem, testRecommendationItem],
        customOrder: [],
        status: 'succeeded' as const,
        error: null,
        page: 1,
        hasMore: true,
        activeFilter: 'all' as const,
        liveNewCount: 0,
      },
      favorites: {
        items: preloadedFavorites,
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
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

describe('ContentCard Component Integration', () => {
  it('should render article title, source, category badge, and live provenance badge', () => {
    renderWithStore(<ContentCard item={testNewsItem} />);

    expect(
      screen.getByText('Breakthrough Quantum Processing Unit Announced')
    ).toBeInTheDocument();
    expect(screen.getByText('Quantum Wire')).toBeInTheDocument();
    expect(screen.getByText('technology')).toBeInTheDocument();
    expect(screen.getByText('● Live API')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('#Quantum')).toBeInTheDocument();
    expect(screen.getByText('#Hardware')).toBeInTheDocument();
  });

  it('should render recommendation CTA button ("View Media" or "Read Article")', () => {
    renderWithStore(<ContentCard item={testRecommendationItem} />);

    expect(screen.getByText('Inception 2026')).toBeInTheDocument();
    expect(screen.getByText(/View Media|Play Now/i)).toBeInTheDocument();
    expect(screen.getByText('8.9')).toBeInTheDocument();
  });

  it('should toggle favorite status and update button aria-label', () => {
    const { store } = renderWithStore(<ContentCard item={testNewsItem} />);

    expect(store.getState().favorites.items).toHaveLength(0);

    const bookmarkBtn = screen.getByLabelText('Add to favorites');
    fireEvent.click(bookmarkBtn);

    expect(store.getState().favorites.items).toHaveLength(1);
    expect(store.getState().favorites.items[0].id).toBe('news-card-1');
  });

  it('should dispatch likeItem when heart button is clicked', () => {
    const { store } = renderWithStore(<ContentCard item={testNewsItem} />);

    const likeBtn = screen.getByLabelText('Like content');
    fireEvent.click(likeBtn);

    // Likes incremented in feed slice
    expect(store.getState().feed.items.find((i) => i.id === 'news-card-1')?.metrics?.likes).toBe(46);
  });

  it('should open activeItemModal when card is clicked or Enter is pressed', () => {
    const { store } = renderWithStore(<ContentCard item={testNewsItem} />);

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(store.getState().ui.activeItemModal?.id).toBe('news-card-1');

    // Also verify keyboard interaction (Enter key)
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(store.getState().ui.activeItemModal?.id).toBe('news-card-1');
  });
});
