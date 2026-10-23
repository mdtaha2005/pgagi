import { combineReducers, configureStore } from '@reduxjs/toolkit';
import preferencesReducer from './slices/preferencesSlice';
import feedReducer from './slices/feedSlice';
import favoritesReducer from './slices/favoritesSlice';
import trendingReducer from './slices/trendingSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';

const rootReducer = combineReducers({
  preferences: preferencesReducer,
  feed: feedReducer,
  favorites: favoritesReducer,
  trending: trendingReducer,
  search: searchReducer,
  ui: uiReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).prepend(persistenceMiddleware.middleware),
  });
};

export const store = makeStore();
export type AppDispatch = typeof store.dispatch;
