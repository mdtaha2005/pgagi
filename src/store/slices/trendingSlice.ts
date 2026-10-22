import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentCategory } from '@/types/content';

interface TrendingState {
  items: ContentItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedCategory: ContentCategory | 'all';
}

const initialState: TrendingState = {
  items: [],
  status: 'idle',
  error: null,
  selectedCategory: 'all',
};

export const fetchTrendingItems = createAsyncThunk(
  'trending/fetchTrendingItems',
  async (category: ContentCategory | 'all', { rejectWithValue }) => {
    try {
      const url =
        category === 'all'
          ? '/api/trending'
          : `/api/trending?category=${encodeURIComponent(category)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch trending items');
      }
      const data = await response.json();
      return (data.items || []) as ContentItem[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trending';
      return rejectWithValue(message);
    }
  }
);

export const trendingSlice = createSlice({
  name: 'trending',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<ContentCategory | 'all'>) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTrendingItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTrendingItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to load trending items';
      });
  },
});

export const { setSelectedCategory } = trendingSlice.actions;

export default trendingSlice.reducer;
