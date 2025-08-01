'use client';

import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { useTranslations } from 'next-intl';
import { store } from './redux/store';
import BusOperatorSidebar from './components/BusOperatorSidebar';
import BusOperatorHeader from './components/BusOperatorHeader';
import BusOperatorProtectedRoute from './components/BusOperatorProtectedRoute';

export default function BusOperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('BusOperatorDashboard');

  return (
    <Provider store={store}>
      <BusOperatorProtectedRoute>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar */}
          <BusOperatorSidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <BusOperatorHeader />
            
            {/* Page Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
              <div className="container mx-auto px-6 py-8">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                  </div>
                }>
                  {children}
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </BusOperatorProtectedRoute>
    </Provider>
  );
} 