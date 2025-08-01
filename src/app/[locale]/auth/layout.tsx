'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import UnifiedHeaderWrapper from '@/components/ui/UnifiedHeaderWrapper';
import { Footer } from '@/components/ui/footer';
import ProtectedAuthRoute from '@/components/auth/ProtectedAuthRoute';
import { useParams } from 'next/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const params = useParams();
  const locale = params?.locale as string || 'ar';

  return (
    <ProtectedAuthRoute locale={locale}>
      <div className={cn(
        "min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
        "flex flex-col",
        "text-foreground",
        "relative"
      )}>
        {/* Decorative elements for theme consistency */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-gold opacity-10 dark:opacity-5 blur-3xl rounded-full -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-primary opacity-10 dark:opacity-5 blur-3xl rounded-full translate-y-1/3"></div>
        
        <UnifiedHeaderWrapper isDashboard={false} />
        <div className="pt-16 flex-grow">
          <main className="flex-1 relative z-10">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedAuthRoute>
  );
} 