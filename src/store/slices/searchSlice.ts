import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentType, ContentCategory } from '@/types/content';
import { SearchResponse } from '@/types/api';
import { likeItem } from '../sharedActions';

interface SearchState {
  query: string;
  debouncedQuery: string;
  results: ContentItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedFilter: ContentType | 'all';
  history: string[];
  currentRequestId: string | null;
}

const initialState: SearchState = {
  query: '',
  debouncedQuery: '',
  results: [],
  status: 'idle',
  error: null,
  selectedFilter: 'all',
  history: ['Next.js 16', 'AI agents', 'Quantum computing'],
  currentRequestId: null,
};

export interface SearchParams {
  query: string;
  type?: ContentType | 'all';
  category?: ContentCategory | 'all';
}

export const searchContent = createAsyncThunk(
  'search/searchContent',
  async (params: SearchParams, { signal, rejectWithValue }) => {
    const trimmed = params.query.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const urlParams = new URLSearchParams({ q: trimmed });
      if (params.type && params.type !== 'all') urlParams.set('type', params.type);
      if (params.category && params.category !== 'all')
        urlParams.set('category', params.category);

      const res = await fetch(`/api/search?${urlParams.toString()}`, { signal });
      if (!res.ok) {
        throw new Error(`Search failed with status ${res.status}`);
      }
      const data: SearchResponse = await res.json();
      return (data.items || []) as ContentItem[];
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return rejectWithValue('ABORTED');
      }
      const message = err instanceof Error ? err.message : 'Search failed';
      return rejectWithValue(message);
    }
  }
);

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      if (!action.payload.trim()) {
        state.debouncedQuery = '';
        state.results = [];
        state.status = 'idle';
        state.error = null;
        state.currentRequestId = null;
      }
    },
    setDebouncedQuery: (state, action: PayloadAction<string>) => {
      state.debouncedQuery = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<ContentType | 'all'>) => {
      state.selectedFilter = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      const item = action.payload.trim();
      if (!item) return;
      state.history = [
        item,
        ...state.history.filter((h) => h.toLowerCase() !== item.toLowerCase()),
      ].slice(0, 8);
    },
    clearHistory: (state) => {
      state.history = [];
    },
    clearSearch: (state) => {
      state.query = '';
      state.debouncedQuery = '';
      state.results = [];
      state.status = 'idle';
      state.error = null;
      state.currentRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(likeItem, (state, action) => {
        const item = state.results.find((i) => i.id === action.payload);
        if (item) {
          const wasLiked = Boolean(item.isLiked || item.socialMeta?.isLiked);
          const nextLiked = !wasLiked;
          item.isLiked = nextLiked;

          if (item.socialMeta) {
            item.socialMeta.isLiked = nextLiked;
            item.socialMeta.likesCount = nextLiked
              ? (item.socialMeta.likesCount || 0) + 1
              : Math.max(0, (item.socialMeta.likesCount || 1) - 1);
          } else {
            if (!item.metrics) item.metrics = { likes: 0 };
            item.metrics.likes = nextLiked
              ? (item.metrics.likes || 0) + 1
              : Math.max(0, (item.metrics.likes || 1) - 1);
          }
        }
      })
      .addCase(searchContent.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        // Prevent stale race conditions: only accept results from the latest request
        if (state.currentRequestId === action.meta.requestId) {
          state.status = 'succeeded';
          state.results = action.payload;
          state.currentRequestId = null;
        }
      })
      .addCase(searchContent.rejected, (state, action) => {
        if (action.payload === 'ABORTED') {
          return; // Ignore aborted requests
        }
        if (state.currentRequestId === action.meta.requestId) {
          state.status = 'failed';
          state.error = (action.payload as string) || 'Search failed';
          state.currentRequestId = null;
        }
      });
  },
});

export const {
  setQuery,
  setDebouncedQuery,
  setSearchFilter,
  addToHistory,
  clearHistory,
  clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;
