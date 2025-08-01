'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import UnifiedHeaderWrapper from '@/components/ui/UnifiedHeaderWrapper';
import { Footer } from '@/components/ui/footer';
import UmrahOfficeProviders from './providers';
import { ThemeProvider } from 'next-themes';

interface OfficesLayoutProps {
  children: React.ReactNode;
}

export default function OfficesLayout({ children }: OfficesLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>

    <UmrahOfficeProviders>
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
    </UmrahOfficeProviders>
    </ThemeProvider>
  );
} 