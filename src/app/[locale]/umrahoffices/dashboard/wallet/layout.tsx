'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function WalletLayout({ children, params }: WalletLayoutProps) {
  const t = useTranslations();
  const resolvedParams = React.use(params);
  const locale = resolvedParams.locale || 'ar';
  
  return (
    <div className={cn(
      "min-h-screen bg-background",
      locale === 'ar' ? 'rtl' : 'ltr'
    )} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto py-6 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              {t('wallet.title') || 'نظام المحافظ'}
            </h1>
            <p className="text-muted-foreground">
              {t('wallet.dashboard.subtitle') || 'إدارة شاملة للمحافظ والمعاملات المالية'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
} 