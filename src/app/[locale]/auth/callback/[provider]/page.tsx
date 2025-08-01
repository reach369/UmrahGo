"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession, SessionProvider } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Loader2 } from 'lucide-react';

// Auth callback content component
function AuthCallbackContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    const processCallback = async () => {
      try {
        if (status === 'authenticated') {
          // Redirect to appropriate dashboard based on user type
          const userType = session?.user?.userType || 'pilgrim';
          
          switch (userType) {
            case 'umrah_office':
              router.push(`/${locale}/umrahoffices/dashboard`);
              break;
            case 'admin':
              router.push(`/${locale}/admin/dashboard`);
              break;
            case 'bus_operator':
              router.push(`/${locale}/bus-operator/dashboard`);
              break;
            default:
              router.push(`/${locale}/PilgrimUser`);
          }
        } else {
          // Authentication failed, redirect to login
          router.push(`/${locale}/auth/login?error=callback_failed`);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push(`/${locale}/auth/login?error=callback_error`);
      } finally {
        setIsProcessing(false);
    }
    };

    processCallback();
  }, [status, session, router, locale]);

  if (isProcessing || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري معالجة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return null;
}

// Main auth callback page wrapped with SessionProvider
export default function AuthCallbackPage() {
  return (
    <SessionProvider>
      <AuthCallbackContent />
    </SessionProvider>
  );
} 