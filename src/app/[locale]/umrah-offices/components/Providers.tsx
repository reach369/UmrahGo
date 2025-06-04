'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

// إنشاء عميل للاستعلامات
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // دقيقة واحدة
      retry: 1,
    },
  },
});

// نوع خصائص مكون Providers
interface ProvidersProps {
  children: ReactNode;
}

// مكون Providers الذي يغلف التطبيق بجميع الموفرين اللازمين
export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
} 