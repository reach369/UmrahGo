import { configureStore } from '@reduxjs/toolkit';
import { officesApi } from './officesApi';
import pilgrimChatReducer from './chatSlice';

export const store = configureStore({
  reducer: {
    [officesApi.reducerPath]: officesApi.reducer,
    pilgrimChat: pilgrimChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['pilgrimChat/addMessage', 'pilgrimChat/addNotification'],
        ignoredPaths: ['pilgrimChat.messages', 'pilgrimChat.notifications'],
      },
    }).concat(officesApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 