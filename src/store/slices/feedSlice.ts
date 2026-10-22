import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentType, ContentCategory } from '@/types/content';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../localStorage';

interface FeedState {
  items: ContentItem[];
  customOrder: string[]; // IDs in custom drag-and-drop order
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
  async (params: FetchFeedParams, { rejectWithValue }) => {
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

      const response = await fetch(`/api/feed?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        items: data.items as ContentItem[],
        hasMore: Boolean(data.hasMore),
        page,
        reset: params.reset || false,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      return rejectWithValue(message);
    }
  }
);

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    hydrateCustomOrder: (state) => {
      const persisted = loadFromLocalStorage<string[]>(STORAGE_KEYS.FEED_ORDER, []);
      if (Array.isArray(persisted) && persisted.length > 0) {
        state.customOrder = persisted;
      }
    },
    setFeedItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
    },
    reorderFeedItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
      state.customOrder = action.payload.map((item) => item.id);
      saveToLocalStorage(STORAGE_KEYS.FEED_ORDER, state.customOrder);
    },
    resetFeedOrder: (state) => {
      state.customOrder = [];
      saveToLocalStorage(STORAGE_KEYS.FEED_ORDER, []);
      // Re-sort current items by publishedAt descending
      state.items.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    },
    setActiveFilter: (state, action: PayloadAction<ContentType | 'all'>) => {
      state.activeFilter = action.payload;
    },
    likeItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        if (!item.metrics) {
          item.metrics = { likes: 0 };
        }
        if (item.socialMeta) {
          const wasLiked = Boolean(item.socialMeta.isLiked);
          item.socialMeta.isLiked = !wasLiked;
          item.socialMeta.likesCount = wasLiked
            ? Math.max(0, (item.socialMeta.likesCount || 1) - 1)
            : (item.socialMeta.likesCount || 0) + 1;
        } else {
          item.metrics.likes = (item.metrics.likes || 0) + 1;
        }
      }
    },
    prependLiveItem: (state, action: PayloadAction<ContentItem>) => {
      // Check if already in feed
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
    builder
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
          // If we have custom order persisted, arrange accordingly
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
          // Append unique items
          const existingIds = new Set(state.items.map((i) => i.id));
          const newItems = items.filter((i) => !existingIds.has(i.id));
          state.items.push(...newItems);
          state.page = page;
        }

        state.hasMore = hasMore;
      })
      .addCase(fetchUnifiedFeed.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to fetch unified feed';
      });
  },
});

export const {
  hydrateCustomOrder,
  setFeedItems,
  reorderFeedItems,
  resetFeedOrder,
  setActiveFilter,
  likeItem,
  prependLiveItem,
  clearLiveCount,
} = feedSlice.actions;

export default feedSlice.reducer;
