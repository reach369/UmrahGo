import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale,

  // Always use the locale prefix in URLs
  localePrefix: 'always',
  
  // Disable linking to alternate URLs
  alternateLinks: false,
});