import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import userReducer from './slices/userSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
