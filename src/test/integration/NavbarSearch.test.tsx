import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Navbar } from '@/components/layout/Navbar';
import searchReducer from '@/store/slices/searchSlice';
import uiReducer from '@/store/slices/uiSlice';
import preferencesReducer from '@/store/slices/preferencesSlice';
import authReducer from '@/store/slices/authSlice';
import { ContentItem } from '@/types/content';

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || 'mocked image'} />;
  },
}));

function renderNavbar(initialSearchState: Record<string, unknown> = {}) {
  const store = configureStore({
    reducer: {
      search: searchReducer,
      ui: uiReducer,
      preferences: preferencesReducer,
      auth: authReducer,
    },
    preloadedState: {
      search: {
        query: '',
        debouncedQuery: '',
        results: [],
        status: 'idle' as const,
        error: null,
        selectedFilter: 'all' as const,
        history: [],
        currentRequestId: null,
        ...initialSearchState,
      },
      preferences: {
        selectedCategories: ['technology' as const],
        realTimeEnabled: true,
        realTimeIntervalSeconds: 15,
        density: 'comfortable' as const,
        language: 'en' as const,
      },
      ui: {
        theme: 'dark' as const,
        activeTab: 'feed' as const,
        mobileSidebarOpen: false,
        preferencesModalOpen: false,
        profileModalOpen: false,
        activeItemModal: null,
        toastMessage: null,
      },
      auth: {
        user: {
          id: 'u1',
          name: 'Alex Demo',
          username: 'alexdemo',
          email: 'alex@example.com',
          avatarUrl: '/avatar.jpg',
          bio: 'Bio',
          joinedDate: '2026',
        },
        isAuthenticated: true,
      },
    },
  });

  return {
    ...render(
      <Provider store={store}>
        <Navbar />
      </Provider>
    ),
    store,
  };
}

describe('Navbar Search Integration', () => {
  const sampleSearchItem: ContentItem = {
    id: 'search-hit-1',
    type: 'news',
    category: 'technology',
    title: 'Autonomous Multi-Agent Frameworks in 2026',
    description: 'Next-gen distributed agents cooperating in real-time.',
    url: 'https://example.com/agents-2026',
    publishedAt: new Date().toISOString(),
    source: { name: 'AI Daily', sourceType: 'curated', isMock: true },
    metrics: { likes: 77 },
  };

  it('should render search input and handle typing', () => {
    const { store } = renderNavbar();

    const input = screen.getByLabelText('Search content');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Autonomous' } });
    expect(store.getState().search.query).toBe('Autonomous');
  });

  it('should display results dropdown when results are available and handle item click', () => {
    const { store } = renderNavbar({
      query: 'Autonomous',
      results: [sampleSearchItem],
      status: 'succeeded',
    });

    const input = screen.getByLabelText('Search content');
    fireEvent.focus(input);

    expect(screen.getByText('Search Results (1)')).toBeInTheDocument();
    expect(screen.getByText('Autonomous Multi-Agent Frameworks in 2026')).toBeInTheDocument();

    // Click result item
    const itemButton = screen.getByText('Autonomous Multi-Agent Frameworks in 2026').closest('button');
    expect(itemButton).not.toBeNull();
    fireEvent.click(itemButton!);

    expect(store.getState().ui.activeItemModal?.id).toBe('search-hit-1');
  });

  it('should display empty message when query returns no matches', () => {
    renderNavbar({
      query: 'NonexistentQueryXYZ',
      results: [],
      status: 'succeeded',
    });

    const input = screen.getByLabelText('Search content');
    fireEvent.focus(input);

    expect(screen.getByText(/No matching results for/i)).toBeInTheDocument();
  });

  it('should clear query when clear button is clicked', () => {
    const { store } = renderNavbar({
      query: 'Temporary query',
      results: [],
      status: 'idle',
    });

    const clearBtn = screen.getByLabelText('Clear search');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(store.getState().search.query).toBe('');
  });
});
