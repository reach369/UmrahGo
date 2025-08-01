'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export default function UmrahOfficeProviders({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 4000,
        }}
      />
    </Provider>
  );
}

export { UmrahOfficeProviders as Providers }; 