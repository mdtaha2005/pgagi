import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentType } from '@/types/content';
import { likeItem, toggleFavorite as sharedToggleFavorite } from '../sharedActions';

interface FavoritesState {
  items: ContentItem[];
  filter: ContentType | 'all';
  searchQuery: string;
}

const initialState: FavoritesState = {
  items: [],
  filter: 'all',
  searchQuery: '',
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    hydrateFavorites: (state, action: PayloadAction<ContentItem[]>) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      }
    },
    toggleFavorite: (state, action: PayloadAction<ContentItem>) => {
      const item = action.payload;
      const index = state.items.findIndex((fav) => fav.id === item.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.unshift(item);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearAllFavorites: (state) => {
      state.items = [];
    },
    setFavoritesFilter: (state, action: PayloadAction<ContentType | 'all'>) => {
      state.filter = action.payload;
    },
    setFavoritesSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle shared toggleFavorite
    builder.addCase(sharedToggleFavorite, (state, action) => {
      const item = action.payload;
      const index = state.items.findIndex((fav) => fav.id === item.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.unshift(item);
      }
    });

    // Synchronize likes on items stored in favorites
    builder.addCase(likeItem, (state, action) => {
      const targetId = action.payload;
      const item = state.items.find((i) => i.id === targetId);
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
    });
  },
});

export const {
  hydrateFavorites,
  toggleFavorite,
  removeFavorite,
  clearAllFavorites,
  setFavoritesFilter,
  setFavoritesSearchQuery,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
