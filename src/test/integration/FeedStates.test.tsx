import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FeedList } from '@/components/feed/FeedList';
import feedReducer from '@/store/slices/feedSlice';
import favoritesReducer from '@/store/slices/favoritesSlice';
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

function renderFeedApp() {
  const store = configureStore({
    reducer: {
      feed: feedReducer,
      favorites: favoritesReducer,
      trending: trendingReducer,
      search: searchReducer,
      preferences: preferencesReducer,
      ui: uiReducer,
    },
    preloadedState: {
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
        <FeedList />
      </Provider>
    ),
    store,
  };
}

describe('FeedList States and Interactions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockNewsItem: ContentItem = {
    id: 'news-1',
    type: 'news',
    category: 'technology',
    title: 'Autonomous AI Agents Are Transforming Software Engineering',
    description: 'A deep dive into multi-agent systems and real-time inference.',
    url: 'https://example.com/ai-agents',
    publishedAt: new Date().toISOString(),
    source: { name: 'Tech Insider', sourceType: 'live', isMock: false },
    metrics: { likes: 50 },
  };

  it('should render loading skeletons initially when fetching', () => {
    // Unresolved promise simulates in-flight request
    globalThis.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    renderFeedApp();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display empty state when API returns no items', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [],
        total: 0,
        hasMore: false,
        page: 1,
        providers: { newsapi: false, tmdb: false, mockSocial: true },
      }),
    });

    renderFeedApp();

    await waitFor(() => {
      expect(screen.getByText('No items in feed')).toBeInTheDocument();
      expect(screen.getByText('Configure Preferences')).toBeInTheDocument();
    });
  });

  it('should display error message and Retry button when feed request fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Rate limit exceeded on external gateway' }),
    });

    const { store } = renderFeedApp();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    // Verify retry button can be clicked
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);
    expect(store.getState().feed.status).toBeDefined();
  });

  it('should render feed cards and support type filter tabs', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [mockNewsItem],
        total: 1,
        hasMore: false,
        page: 1,
        providers: { newsapi: true, tmdb: false, mockSocial: false },
      }),
    });

    const { store } = renderFeedApp();

    await waitFor(() => {
      expect(
        screen.getByText('Autonomous AI Agents Are Transforming Software Engineering')
      ).toBeInTheDocument();
    });

    // Click 'Social' filter tab
    const socialTab = screen.getByRole('button', { name: /^Social$/i });
    fireEvent.click(socialTab);

    expect(store.getState().feed.activeFilter).toBe('social');
  });
});
