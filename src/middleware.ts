import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Debug flag - set to true to bypass auth checks during development
const BYPASS_AUTH = true;

// Helper function to get token from request
function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from cookies
  const tokenFromCookie = request.cookies.get('token')?.value;
  const decodedToken = tokenFromCookie ? decodeURIComponent(tokenFromCookie) : null;
  
  // Try to get token from authorization header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const tokenFromHeader = authHeader ? authHeader.split(' ')[1] : null;
  
  // Debug log showing the actual token (do not log in production!)
  const finalToken = decodedToken || tokenFromHeader || null;
  console.log('Token extraction result:', {
    hasToken: !!finalToken,
    tokenPrefix: finalToken ? finalToken.substring(0, 10) + '...' : 'NULL',
    fromCookie: !!tokenFromCookie,
    fromHeader: !!tokenFromHeader,
    allCookies: Array.from(request.cookies.getAll()).map(c => c.name)
  });
  
  // Return first available token
  return finalToken;
}

// Create a combined middleware function
function middleware(request: NextRequest) {
  // Debug logging
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  // Check if this is a protected route (umrah-offices dashboard)
  const isProtectedRoute = request.nextUrl.pathname.includes('/umrah-offices/dashboard');
  
  if (isProtectedRoute && !BYPASS_AUTH) {
    console.log('Protected route detected:', request.nextUrl.pathname);
    
    // Get token using helper function
    const token = getTokenFromRequest(request);
    
    // Log detailed token information for debugging
    console.log('Authentication check for path:', {
      path: request.nextUrl.pathname,
      hasCookieToken: !!request.cookies.get('token')?.value,
      hasAuthHeader: !!request.headers.get('authorization') || !!request.headers.get('Authorization'),
      hasToken: !!token
    });

    if (!token) {
      console.log('No token found, redirecting to login');
      // Get the current locale from the URL
      const locale = request.nextUrl.pathname.split('/')[1] || 'ar';
      
      // Create a response with redirect
      const response = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
      
      // Add a header for debugging
      response.headers.set('X-Auth-Redirect-Reason', 'Missing authentication token');
      
      return response;
    }
    
    console.log('Token found, continuing to protected route');
  }

  // Continue with the intl middleware
  return createMiddleware(routing)(request);
}

export default middleware;

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/api`, except for
    // - … if they start with `/api/auth`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/api/((?!auth|.*\\..*).*)',
  ],
};