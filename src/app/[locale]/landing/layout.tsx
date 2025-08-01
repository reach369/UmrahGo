'use client';

import React from 'react';
import UnifiedHeaderWrapper from '@/components/ui/UnifiedHeaderWrapper';
import { Footer } from '@/components/ui/footer';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className={cn(
        "min-h-screen bg-background",
        "flex flex-col",
        "text-foreground"
      )}>
        <UnifiedHeaderWrapper isDashboard={false} />
        <main className="flex-1 pt-16"> {/* Add padding for the fixed header */}
          {children}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 