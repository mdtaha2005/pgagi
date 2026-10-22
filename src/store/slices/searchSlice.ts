import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentType, ContentCategory } from '@/types/content';

interface SearchState {
  query: string;
  debouncedQuery: string;
  results: ContentItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedFilter: ContentType | 'all';
  history: string[];
}

const initialState: SearchState = {
  query: '',
  debouncedQuery: '',
  results: [],
  status: 'idle',
  error: null,
  selectedFilter: 'all',
  history: ['Next.js 15', 'AI agents', 'Oscars 2026', 'Quantum computing'],
};

export interface SearchParams {
  query: string;
  type?: ContentType | 'all';
  category?: ContentCategory | 'all';
}

export const searchContent = createAsyncThunk(
  'search/searchContent',
  async (params: SearchParams, { rejectWithValue }) => {
    if (!params.query.trim()) {
      return [];
    }
    try {
      const urlParams = new URLSearchParams({ q: params.query });
      if (params.type && params.type !== 'all') urlParams.set('type', params.type);
      if (params.category && params.category !== 'all')
        urlParams.set('category', params.category);

      const res = await fetch(`/api/search?${urlParams.toString()}`);
      if (!res.ok) {
        throw new Error('Search request failed');
      }
      const data = await res.json();
      return (data.items || []) as ContentItem[];
    } catch (err: unknown) {
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
      state.history = [item, ...state.history.filter((h) => h.toLowerCase() !== item.toLowerCase())].slice(0, 8);
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchContent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.results = action.payload;
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Search failed';
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
