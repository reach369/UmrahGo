import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale, i18nConfig, isValidLocale } from './src/i18n/config';

// Define ONLY the routes that REQUIRE authentication (be very specific)
const protectedRoutes = [
  '/PilgrimUser',
  '/bus-operator',
  '/umrahoffices/dashboard',
  '/profile',
  '/dashboard', 
  '/settings'
];

// Define public routes that should NEVER require authentication
const publicRoutes = [
  '/',
  '/landing',
  '/auth',
  '/about-us',
  '/contact',
  '/how-it-works',
  '/packages',
  '/privacy',
  '/terms',
  '/umrah-offices',
  '/umrahoffices',
  '/test',
  '/servece'
];

// Create next-intl middleware with proper configuration
const intlMiddleware = createMiddleware(i18nConfig);

// Helper function to check if route requires authentication
function requiresAuth(pathname: string): boolean {
  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
  
  // First check if it's a public route - these should NEVER require auth
  for (const publicRoute of publicRoutes) {
    if (pathWithoutLocale === publicRoute || 
        pathWithoutLocale.startsWith(publicRoute + '/')) {
      // This is a public route, no auth required
      return false;
    }
  }
  
  // Then check if it's a protected route
  for (const protectedRoute of protectedRoutes) {
    if (pathWithoutLocale === protectedRoute || 
        pathWithoutLocale.startsWith(protectedRoute + '/')) {
      // This is a protected route, auth required
      return true;
    }
  }
  
  // Default to not requiring auth for any other routes
  return false;
}

// Function to fix double locale prefixes in URL
function fixDoubleLocalePrefixes(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  
  // Split path into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Check if we have multiple locale segments
  const localeSegments = segments.filter(segment => isValidLocale(segment));
  
  if (localeSegments.length > 1) {
    // Keep only the first locale segment
    const firstLocale = segments.find(segment => isValidLocale(segment)) || defaultLocale;
    
    // Create a new path with only one locale
    const newSegments: string[]  = [];
    let addedLocale = false;
    
    // First add the locale
    newSegments.push(firstLocale);
    addedLocale = true;
    
    // Then add all non-locale segments in their original order
    for (const segment of segments) {
      if (!isValidLocale(segment)) {
        newSegments.push(segment);
      }
    }
    
    // Construct the new path
    const newPath = `/${newSegments.join('/')}`;
    
    // Only redirect if the path has changed
    if (newPath !== pathname) {
      // Preserve query parameters and hash
      const url = request.nextUrl.clone();
      url.pathname = newPath;
      
      console.log(`Middleware fixed multiple locale URL: ${pathname} → ${newPath}`);
      return NextResponse.redirect(url);
    }
  }
  
  return null;
}

// Main middleware handler
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for static files and internal Next.js routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Fix double locale prefixes (like /ar/en/path or /en/ar/path)
  const redirectResponse = fixDoubleLocalePrefixes(request);
  if (redirectResponse) {
    return redirectResponse;
  }

  // Check if this specific route requires authentication
  const needsAuth = requiresAuth(pathname);
  
  // Only check authentication for protected routes
  if (needsAuth) {
    try {
      // Get the NextAuth JWT token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      // If no token, redirect to login
      if (!token) {
        // Extract current locale or use default
        let currentLocale: string = defaultLocale;
        for (const locale of locales) {
          if (pathname.startsWith(`/${locale}/`)) {
            currentLocale = locale;
            break;
          }
        }
        
        const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
        
        // Add callback URL for redirect after login
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.href);
        
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      
      // On error, redirect to login with proper locale
      let currentLocale: string = defaultLocale;
      for (const locale of locales) {
        if (pathname.startsWith(`/${locale}/`)) {
          currentLocale = locale;
          break;
        }
      }
      
      const loginUrl = new URL(`/${currentLocale}/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle internationalization for ALL routes (protected and public)
  return intlMiddleware(request);
}

// Configure middleware matching pattern
export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public files (e.g. robots.txt, manifest.json)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:jpg|jpeg|gif|png|svg|webp)).*)']
};