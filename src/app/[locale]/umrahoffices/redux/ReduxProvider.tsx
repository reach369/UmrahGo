'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { apiSlice } from './api/apiSlice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Setup API on component mount
  useEffect(() => {
    // This ensures we have the latest token when the app starts
    // We could potentially refresh the token here if needed
    const token = localStorage.getItem('token');
    if (token) {
      // You could dispatch initialization actions here if needed
      console.log('Token found in ReduxProvider initialization');
    }
    
    return () => {
      // Cleanup - reset API state when provider unmounts
      store.dispatch(apiSlice.util.resetApiState());
    };
  }, []);
  
  return <Provider store={store}>{children}</Provider>;
} 