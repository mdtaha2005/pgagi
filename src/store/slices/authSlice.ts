import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/types/user';
import { loadFromLocalStorage, saveToLocalStorage, STORAGE_KEYS } from '../localStorage';

interface AuthState {
  user: UserProfile;
  isAuthenticated: boolean;
}

const defaultUser: UserProfile = {
  id: 'usr_default_01',
  name: 'Alex Rivera',
  username: 'alexrivera',
  email: 'alex.rivera@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Full-stack explorer, tech enthusiast, and movie buff. Tracking cutting-edge tech and sci-fi recommendations.',
  joinedDate: 'October 2026',
};

const initialState: AuthState = {
  user: defaultUser,
  isAuthenticated: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateProfile: (state) => {
      const persisted = loadFromLocalStorage<Partial<UserProfile>>(STORAGE_KEYS.AUTH, {});
      if (persisted.name) {
        state.user = { ...state.user, ...persisted };
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.user = { ...state.user, ...action.payload };
      saveToLocalStorage(STORAGE_KEYS.AUTH, state.user);
    },
    resetProfile: (state) => {
      state.user = defaultUser;
      saveToLocalStorage(STORAGE_KEYS.AUTH, defaultUser);
    },
  },
});

export const { hydrateProfile, updateProfile, resetProfile } = authSlice.actions;

export default authSlice.reducer;
