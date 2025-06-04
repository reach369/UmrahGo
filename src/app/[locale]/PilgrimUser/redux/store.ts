import { configureStore } from '@reduxjs/toolkit';
import { officesApi } from './officesApi';

export const store = configureStore({
  reducer: {
    [officesApi.reducerPath]: officesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(officesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 