import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define locales
const locales = ['ar', 'en'];
const defaultLocale = 'ar';

// Exclude specific paths from locale redirects
export const config = {
  // Skip locale routing for API routes and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

// Main middleware handler
export function middleware(request: NextRequest) {
  // Skip processing API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Apply next-intl middleware for non-API routes
  return intlMiddleware(request);
}

// ... rest of file ...