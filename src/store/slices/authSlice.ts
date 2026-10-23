import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '@/types/user';

interface AuthState {
  user: UserProfile;
  isAuthenticated: boolean;
}

export const DEFAULT_USER: UserProfile = {
  id: 'usr_default_01',
  name: 'Alex Rivera',
  username: 'alexrivera',
  email: 'alex.rivera@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Full-stack explorer, tech enthusiast, and movie buff. Tracking cutting-edge tech and sci-fi recommendations.',
  joinedDate: 'October 2026',
};

const initialState: AuthState = {
  user: { ...DEFAULT_USER },
  isAuthenticated: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateProfile: (state, action: PayloadAction<UserProfile>) => {
      if (action.payload && action.payload.name) {
        state.user = action.payload;
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.user = { ...state.user, ...action.payload };
    },
    resetProfile: (state) => {
      state.user = { ...DEFAULT_USER };
    },
  },
});

export const { hydrateProfile, updateProfile, resetProfile } = authSlice.actions;

export default authSlice.reducer;
