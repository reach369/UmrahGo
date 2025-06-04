'use client';

import { LayoutProps } from '@/types/layout.types';
import Sidebar from '../components/Sidebar';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = use(params);
  const { data: session, status } = useSession();
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

        // Log authentication state
        console.log('Auth Status:', {
          status,
          session: session ? 'present' : 'absent',
          user: session?.user || user,
          roles: session?.user?.roles || user?.roles,
          tokens: {
            localStorage: localStorageToken ? 'present' : 'absent',
            cookie: cookieToken ? 'present' : 'absent'
          }
        });

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
            console.log('Syncing token from localStorage to cookie');
            document.cookie = `token=${encodeURIComponent(localStorageToken)}; path=/; max-age=2592000; SameSite=Lax`;
          } else if (!localStorageToken && cookieToken) {
            console.log('Syncing token from cookie to localStorage');
            localStorage.setItem('token', decodeURIComponent(cookieToken));
          }
          
          // Check if user is an office based on localStorage user data
          if (user) {
            const isOffice = user.roles?.some((role: any) => role.name === 'office');
            if (!isOffice) {
              console.log('User is not an office, redirecting to login...');
              localStorage.removeItem('token');
              document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
              router.push(`/${locale}/auth/login`);
              return;
            }
          }
        }

        // If we reach here, user is authenticated
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        // On error, redirect to login
        router.push(`/${locale}/auth/login`);
      }
    };

    checkAuth();
  }, [status, session, locale, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="p-4 sm:mr-64">
        <div className="p-4 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
} 