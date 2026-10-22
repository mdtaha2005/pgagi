import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem } from '@/types/content';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../localStorage';

export type DashboardSection = 'feed' | 'trending' | 'favorites' | 'settings';
export type AppTheme = 'light' | 'dark' | 'system';

interface UIState {
  theme: AppTheme;
  activeSection: DashboardSection;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  preferencesModalOpen: boolean;
  profileModalOpen: boolean;
  activeItemModal: ContentItem | null;
  toastMessage: string | null;
}

const initialState: UIState = {
  theme: 'dark',
  activeSection: 'feed',
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  preferencesModalOpen: false,
  profileModalOpen: false,
  activeItemModal: null,
  toastMessage: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    hydrateTheme: (state) => {
      const persisted = loadFromLocalStorage<AppTheme>(STORAGE_KEYS.THEME, 'dark');
      state.theme = persisted;
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (persisted === 'dark') {
          root.classList.add('dark');
        } else if (persisted === 'light') {
          root.classList.remove('dark');
        } else {
          // system
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      }
    },
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
      saveToLocalStorage(STORAGE_KEYS.THEME, action.payload);
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (action.payload === 'dark') {
          root.classList.add('dark');
        } else if (action.payload === 'light') {
          root.classList.remove('dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      }
    },
    toggleTheme: (state) => {
      const nextTheme: AppTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      saveToLocalStorage(STORAGE_KEYS.THEME, nextTheme);
      if (typeof document !== 'undefined') {
        if (nextTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setActiveSection: (state, action: PayloadAction<DashboardSection>) => {
      state.activeSection = action.payload;
      state.mobileSidebarOpen = false;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    openPreferencesModal: (state) => {
      state.preferencesModalOpen = true;
    },
    closePreferencesModal: (state) => {
      state.preferencesModalOpen = false;
    },
    openProfileModal: (state) => {
      state.profileModalOpen = true;
    },
    closeProfileModal: (state) => {
      state.profileModalOpen = false;
    },
    setActiveItemModal: (state, action: PayloadAction<ContentItem | null>) => {
      state.activeItemModal = action.payload;
    },
    showToast: (state, action: PayloadAction<string>) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
  },
});

export const {
  hydrateTheme,
  setTheme,
  toggleTheme,
  setActiveSection,
  toggleSidebar,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  openPreferencesModal,
  closePreferencesModal,
  openProfileModal,
  closeProfileModal,
  setActiveItemModal,
  showToast,
  clearToast,
} = uiSlice.actions;

export default uiSlice.reducer;
