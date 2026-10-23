import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentCategory } from '@/types/content';
import { TrendingResponse } from '@/types/api';
import { likeItem } from '../sharedActions';

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
  async (category: ContentCategory | 'all', { signal, rejectWithValue }) => {
    try {
      const url =
        category === 'all'
          ? '/api/trending'
          : `/api/trending?category=${encodeURIComponent(category)}`;
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error('Failed to fetch trending items');
      }
      const data: TrendingResponse = await response.json();
      return (data.items || []) as ContentItem[];
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return rejectWithValue('Request aborted');
      }
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
      .addCase(likeItem, (state, action) => {
        const item = state.items.find((i) => i.id === action.payload);
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
      .addCase(fetchTrendingItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTrendingItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTrendingItems.rejected, (state, action) => {
        if (action.payload === 'Request aborted') return;
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to load trending items';
      });
  },
});

export const { setSelectedCategory } = trendingSlice.actions;

export default trendingSlice.reducer;
