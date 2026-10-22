import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem, ContentType } from '@/types/content';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../localStorage';

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
    hydrateFavorites: (state) => {
      const persisted = loadFromLocalStorage<ContentItem[]>(
        STORAGE_KEYS.FAVORITES,
        []
      );
      if (Array.isArray(persisted)) {
        state.items = persisted;
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
      saveToLocalStorage(STORAGE_KEYS.FAVORITES, state.items);
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveToLocalStorage(STORAGE_KEYS.FAVORITES, state.items);
    },
    clearAllFavorites: (state) => {
      state.items = [];
      saveToLocalStorage(STORAGE_KEYS.FAVORITES, []);
    },
    setFavoritesFilter: (state, action: PayloadAction<ContentType | 'all'>) => {
      state.filter = action.payload;
    },
    setFavoritesSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
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
