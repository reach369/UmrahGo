import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);

export const locales = ['en', 'ar'] as const;
export const defaultLocale = 'ar' as const;

// The `pathnames` object maps routes to their corresponding translations.
export const pathnames = {
  // If all locales use the same pathname, a simple string can be used.
  '/': '/',
  '/auth/login': '/auth/login',
  '/auth/register': '/auth/register',
  
  // Or you can use a object to map different paths for each locale.
  '/PilgrimUser/packages': {
    en: '/PilgrimUser/packages',
    ar: '/PilgrimUser/packages',
  },
  '/PilgrimUser/packages/[id]': {
    en: '/PilgrimUser/packages/[id]',
    ar: '/PilgrimUser/packages/[id]',
  },
  '/PilgrimUser/booking/[id]': {
    en: '/PilgrimUser/booking/[id]',
    ar: '/PilgrimUser/booking/[id]',
  },
  '/PilgrimUser/offices/[id]': {
    en: '/PilgrimUser/offices/[id]',
    ar: '/PilgrimUser/offices/[id]',
  },
} as const;