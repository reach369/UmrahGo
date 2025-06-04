'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import UnifiedHeader from '@/components/ui/unified-header';
import { Footer } from '@/components/ui/footer';

interface ContactLayoutProps {
  children: React.ReactNode;
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      "flex flex-col",
      "text-foreground"
    )}>
      <UnifiedHeader isDashboard={false} />
      <div className="pt-16"> {/* Add padding to account for fixed header */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
} 