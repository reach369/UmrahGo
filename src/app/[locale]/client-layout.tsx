'use client';

import React, { useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { applyBrowserSupport } from '@/utils/browser-check';

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
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  );
} 