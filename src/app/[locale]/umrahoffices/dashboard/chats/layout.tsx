'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <div className="w-full">
        {children}
      </div>
    </AuthProvider>
  );
} 