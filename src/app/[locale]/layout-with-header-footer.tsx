'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import UnifiedHeaderWrapper from '@/components/ui/UnifiedHeaderWrapper';
import { Footer } from '@/components/ui/footer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface LayoutWithHeaderFooterProps {
  children: React.ReactNode;
}

export default function LayoutWithHeaderFooter({ children }: LayoutWithHeaderFooterProps) {
  return (
    // تعيين requireAuth إلى false لضمان أن الصفحات العامة لا تتطلب المصادقة
    <ProtectedRoute requireAuth={false}>
      <div className={cn(
        "min-h-screen bg-background",
        "flex flex-col",
        "text-foreground"
      )}>
        <UnifiedHeaderWrapper isDashboard={false} />
        <div className="pt-16"> {/* Add padding to account for fixed header */}
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 