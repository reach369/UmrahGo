'use client';

import { useParams } from 'next/navigation';

/**
 * Hook to safely access the locale parameter in client components.
 * Uses type checking to handle Next.js future behavior change with params being a Promise.
 * 
 * @returns The current locale string or default 'ar'
 */
export const useLocale = (): string => {
  const params = useParams();
  return typeof params?.locale === 'string' ? params.locale : 'ar';
};

export default useLocale;

export function getDirection(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function useDirection(): 'rtl' | 'ltr' {
  const locale = useLocale();
  return getDirection(locale);
} 