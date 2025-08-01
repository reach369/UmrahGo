'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isValidLocale, removeExtraLocales } from '@/i18n/config';

interface LocaleManagerProps {
  locale: string;
}

export default function LocaleManager({ locale }: LocaleManagerProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Set document properties based on locale
    const html = document.documentElement;
    const body = document.body;
    
    if (locale === 'ar') {
      html.setAttribute('lang', 'ar');
      html.setAttribute('dir', 'rtl');
      body.classList.add('rtl');
      body.classList.remove('ltr');
    } else {
      html.setAttribute('lang', 'en');
      html.setAttribute('dir', 'ltr');
      body.classList.add('ltr');
      body.classList.remove('rtl');
    }
    
    // Fix double locale issues by checking the URL pattern
    if (pathname) {
      const segments = pathname.split('/').filter(Boolean);
      
      // Count locale segments
      const localeSegments = segments.filter(segment => 
        isValidLocale(segment)
      );
      
      // If we have multiple locale segments, fix the URL
      if (localeSegments.length > 1) {
        // Get the corrected path
        const correctPath = removeExtraLocales(pathname);
        
        // Only redirect if path has changed
        if (correctPath !== pathname) {
          console.log(`Fixed multiple locale URL: ${pathname} → ${correctPath}`);
          window.history.replaceState({}, '', correctPath);
        }
      }
    }
  }, [locale, pathname]);

  // This component doesn't render anything
  return null;
} 