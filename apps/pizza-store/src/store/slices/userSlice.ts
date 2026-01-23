import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreateResponse, UserProfile } from '@francesco-lucania-pizza-models';

export interface User extends CreateResponse {
  name?: string;
  phone?: string;
  profile?: UserProfile;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload);
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { setUser, setToken, logout, clearUser } = userSlice.actions;
export default userSlice.reducer;
