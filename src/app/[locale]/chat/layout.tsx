'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card shadow-md">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-1">Loading Chat</p>
              <p className="text-sm text-muted-foreground">Please wait while we connect to the chat server...</p>
            </div>
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
} 