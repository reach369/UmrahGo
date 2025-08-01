'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchProfile, setAuthenticated } from '../redux/busOperatorSlice';
import BusOperatorService from '../services/busOperatorService';

interface BusOperatorProtectedRouteProps {
  children: React.ReactNode;
}

export default function BusOperatorProtectedRoute({ children }: BusOperatorProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = BusOperatorService.getAuthToken();
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        // Verify token by fetching profile
        await dispatch(fetchProfile()).unwrap();
        dispatch(setAuthenticated(true));
      } catch (error) {
        console.error('Authentication failed:', error);
        BusOperatorService.removeAuthToken();
        router.push('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    if (!isAuthenticated) {
      checkAuthentication();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, dispatch, router]);

  if (isChecking || loading.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 