import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentType, ContentCategory } from '@/types/content';
import { FeedResponse } from '@/types/api';
import { likeItem } from '../sharedActions';

interface FeedState {
  items: ContentItem[];
  customOrder: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  page: number;
  hasMore: boolean;
  activeFilter: ContentType | 'all';
  liveNewCount: number;
}

const initialState: FeedState = {
  items: [],
  customOrder: [],
  status: 'idle',
  error: null,
  page: 1,
  hasMore: true,
  activeFilter: 'all',
  liveNewCount: 0,
};

export interface FetchFeedParams {
  page?: number;
  categories?: ContentCategory[];
  filter?: ContentType | 'all';
  search?: string;
  reset?: boolean;
}

export const fetchUnifiedFeed = createAsyncThunk(
  'feed/fetchUnifiedFeed',
  async (params: FetchFeedParams, { signal, rejectWithValue }) => {
    try {
      const page = params.page || 1;
      const categoriesParam = params.categories?.join(',') || '';
      const filterParam = params.filter && params.filter !== 'all' ? params.filter : '';
      const searchParam = params.search || '';

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (categoriesParam) searchParams.set('categories', categoriesParam);
      if (filterParam) searchParams.set('type', filterParam);
      if (searchParam) searchParams.set('q', searchParam);

      const response = await fetch(`/api/feed?${searchParams.toString()}`, { signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }
      const data: FeedResponse = await response.json();
      return {
        items: data.items,
        hasMore: data.hasMore,
        page,
        reset: params.reset || false,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return rejectWithValue('Request aborted');
      }
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return rejectWithValue(message);
    }
  }
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    hydrateCustomOrder: (state, action: PayloadAction<string[]>) => {
      if (Array.isArray(action.payload)) {
        state.customOrder = action.payload;
      }
    },
    setFeedItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
    },
    reorderFeedItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
      state.customOrder = action.payload.map((item) => item.id);
    },
    resetFeedOrder: (state) => {
      state.customOrder = [];
      // Re-sort current items by publishedAt descending
      state.items.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    },
    setActiveFilter: (state, action: PayloadAction<ContentType | 'all'>) => {
      state.activeFilter = action.payload;
    },
    prependLiveItem: (state, action: PayloadAction<ContentItem>) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.liveNewCount += 1;
      }
    },
    clearLiveCount: (state) => {
      state.liveNewCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Shared likeItem handling
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
      .addCase(fetchUnifiedFeed.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        if (action.meta.arg.reset) {
          state.page = 1;
        }
      })
      .addCase(fetchUnifiedFeed.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { items, hasMore, page, reset } = action.payload;

        if (reset || page === 1) {
          if (state.customOrder.length > 0) {
            const orderMap = new Map(state.customOrder.map((id, index) => [id, index]));
            const sorted = [...items].sort((a, b) => {
              const aIndex = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
              const bIndex = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
              return aIndex - bIndex;
            });
            state.items = sorted;
          } else {
            state.items = items;
          }
          state.page = 1;
        } else {
          // Append unique items without breaking custom order of existing items
          const existingIds = new Set(state.items.map((i) => i.id));
          const newItems = items.filter((i) => !existingIds.has(i.id));
          state.items.push(...newItems);
          state.page = page;
        }

        state.hasMore = hasMore;
      })
      .addCase(fetchUnifiedFeed.rejected, (state, action) => {
        if (action.payload === 'Request aborted') {
          return; // Ignore aborted requests
        }
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch unified feed';
      });
  },
});

export { likeItem } from '../sharedActions';

export const {
  hydrateCustomOrder,
  setFeedItems,
  reorderFeedItems,
  resetFeedOrder,
  setActiveFilter,
  prependLiveItem,
  clearLiveCount,
} = feedSlice.actions;

export default feedSlice.reducer;
