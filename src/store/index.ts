import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from './slices/preferencesSlice';
import feedReducer from './slices/feedSlice';
import favoritesReducer from './slices/favoritesSlice';
import trendingReducer from './slices/trendingSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      preferences: preferencesReducer,
      feed: feedReducer,
      favorites: favoritesReducer,
      trending: trendingReducer,
      search: searchReducer,
      ui: uiReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
