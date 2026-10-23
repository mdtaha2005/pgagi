import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ContentItem } from '@/types/content';
import { likeItem } from '../sharedActions';

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
    hydrateTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
    },
    setTheme: (state, action: PayloadAction<AppTheme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
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
  extraReducers: (builder) => {
    // If modal is currently open and item is liked, update its like state
    builder.addCase(likeItem, (state, action) => {
      if (state.activeItemModal && state.activeItemModal.id === action.payload) {
        const item = state.activeItemModal;
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
