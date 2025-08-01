'use client';

import React, { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { applyBrowserSupport } from '@/utils/browser-check';
import { SessionProvider } from 'next-auth/react';

interface ClientLayoutProps {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, any>;
}

export default function ClientLayout({ children, locale, messages }: ClientLayoutProps) {
  // تطبيق فحص توافق المتصفح عند تحميل التطبيق
  useEffect(() => {
    applyBrowserSupport();
  }, []);

  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
} 