import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import { transportChatApi } from './chatApiSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    transportChat: chatReducer,
    [transportChatApi.reducerPath]: transportChatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(transportChatApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 