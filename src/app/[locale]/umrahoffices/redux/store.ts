import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './api/apiSlice';
import './api/hotelsApiSlice';
import './api/chatsApiSlice';
import './api/notificationsApiSlice';
import './api/packagesApiSlice';
import './api/paymentsApiSlice';
import officeReducer from './slices/officeSlice';
import authReducer from './slices/authSlice';
import campaignReducer from './slices/campaignSlice';
import bookingReducer from './slices/bookingSlice';
import paymentReducer from './slices/paymentSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Add the RTK Query API middleware
    [apiSlice.reducerPath]: apiSlice.reducer,
    office: officeReducer,
    auth: authReducer,
    campaign: campaignReducer,
    booking: bookingReducer,
    payment: paymentReducer,
  },
  // Adding the middleware for RTK Query caching
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 