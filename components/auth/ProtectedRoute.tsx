'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

// قائمة بالمسارات العامة التي لا تتطلب مصادقة
const PUBLIC_PATHS = [
  '/',
  '/landing',
  '/landing/home',
  '/landing/about-us',
  '/landing/contact',
  '/landing/how-it-works',
  '/landing/packages',
  '/landing/umrah-offices',
  '/landing/terms',
  '/landing/privacy',
  '/landing/license-agreement',
  '/landing/cookie-policy',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/test',
  '/servece',
  '/about-us',
  '/contact',
  '/how-it-works',
  '/packages',
  '/privacy',
  '/terms',
  '/umrah-offices',
  '/umrahoffices'
];

// التحقق مما إذا كان المسار عاماً
function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return false;
  
  // استخراج المسار بدون اللغة
  const pathParts = pathname.split('/');
  const pathWithoutLocale = '/' + pathParts.slice(2).join('/');
  
  // Always consider landing pages as public
  if (pathname.includes('/landing') || pathWithoutLocale.includes('/landing')) {
    console.log(`Landing page detected: ${pathname} => public: true`);
    return true;
  }
  
  // Always consider auth pages as public
  if (pathname.includes('/auth') || pathWithoutLocale.includes('/auth')) {
    console.log(`Auth page detected: ${pathname} => public: true`);
    return true;
  }

  // Always consider the root path as public
  if (pathname === '/' || pathWithoutLocale === '/' || pathname === '' || pathWithoutLocale === '') {
    console.log(`Root page detected: ${pathname} => public: true`);
    return true;
  }
  
  // التحقق من المسار المباشر أو المسار بدون اللغة
  const isPublic = PUBLIC_PATHS.some(path => 
    pathname === path || 
    pathWithoutLocale === path ||
    pathname.startsWith(path + '/') ||
    pathWithoutLocale.startsWith(path + '/')
  );
  
  return isPublic;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectTo,
  allowedRoles = []
}: ProtectedRouteProps) {
  const { data: session, status } = useSessionPersistence();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get locale from pathname
  const locale = pathname?.split('/')[1] || 'ar';
  
  // التحقق مما إذا كان المسار الحالي عاماً
  const isCurrentPathPublic = isPublicPath(pathname);
  
  // إذا كان المسار عاماً، لا نتطلب المصادقة أبداً - Override requireAuth if path is public
  const shouldRequireAuth = requireAuth && !isCurrentPathPublic;
  
  useEffect(() => {
    // Only redirect if authentication is required and user is not authenticated
    if (shouldRequireAuth && status === 'unauthenticated') {
      const redirectPath = redirectTo || `/${locale}/auth/login`;
      console.log('User not authenticated, redirecting to:', redirectPath);
      router.push(redirectPath);
      return;
    }
  }, [status, shouldRequireAuth, router, locale, redirectTo]);

  // Show loading while checking authentication
  if (shouldRequireAuth && status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-4 w-36 mx-auto" />
        </div>
      </div>
    );
  }

  // Don't render if authentication is required but user is not authenticated
  if (shouldRequireAuth && status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
} 