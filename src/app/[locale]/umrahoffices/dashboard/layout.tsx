'use client';

import { LayoutProps } from '@/types/layout.types';
import Sidebar from '../components/Sidebar';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useRouter } from 'next/navigation';
import { ReduxProvider } from '../redux/ReduxProvider';
import React from 'react';
import { getLocaleFromParams, type NextParams } from '@/utils/params';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  // Get locale directly from params since it's not a Promise
  const locale = getLocaleFromParams(params);

  //const locale = params.locale || 'ar';
  const { data: session, status, getUserRole } = useSessionPersistence();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (status === 'loading') {
          setIsLoading(true);
          return;
        }

        // Get token from both localStorage and cookies
        const localStorageToken = localStorage.getItem('token');
        const cookieToken = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        // If no authentication is present at all, redirect to login
        if (!localStorageToken && !cookieToken && status === 'unauthenticated') {
          console.log('No authentication found, redirecting to login...');
          router.push(`/${locale}/auth/login`);
          return;
        }

        // If we have tokens, verify the user role
        if (localStorageToken || cookieToken) {
          // Sync tokens between localStorage and cookies if needed
          if (localStorageToken && !cookieToken) {
            document.cookie = `token=${encodeURIComponent(localStorageToken)}; path=/; max-age=2592000; SameSite=Lax`;
          } else if (!localStorageToken && cookieToken) {
            localStorage.setItem('token', decodeURIComponent(cookieToken));
          }
          
          // Check if user is an office based on user data
          if (user) {
            const userRole = getUserRole();
            
            // Check if user has umrah_office property
            const hasUmrahOffice = !!user.umrah_office;
            
            // Check if user has office role from roles array
            const hasOfficeRole = user.roles && Array.isArray(user.roles) && user.roles.some((role: any) => {
              if (typeof role === 'string') return role === 'office';
              return role && typeof role === 'object' && role.name === 'office';
            });
            
            // User must be office type or have umrah_office property to access this dashboard
            const isOffice = userRole === 'office' || hasOfficeRole || hasUmrahOffice;
            
            if (!isOffice) {
              router.push(`/${locale}/auth/login`);
              return;
            }
          } else {
            // No user data found, redirect to login
            router.push(`/${locale}/auth/login`);
            return;
          }
        }

        // If we reach here, user is authenticated and is an office
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, redirect to login
        router.push(`/${locale}/auth/login`);
      }
    };

    checkAuth();
  }, [status, session, locale, router, getUserRole]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
    <ReduxProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="p-4 sm:mr-64">
          <div className="p-4 rounded-lg">
            {children}
          </div>
        </div>
      </div>
    </ReduxProvider>
    </ProtectedRoute>
  );
} 