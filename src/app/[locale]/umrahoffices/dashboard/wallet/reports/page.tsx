'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { WalletReports } from '@/components/office/enhanced-wallet/WalletReports';

interface ReportsPageProps {
  params: { locale: string };
}

export default function ReportsPage({ params }: ReportsPageProps) {
  const t = useTranslations();
  const locale = params.locale || 'ar';

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('wallet.reports.title') || 'التقارير المالية'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('wallet.reports.subtitle') || 'تقارير شاملة وقابلة للتصدير'}
          </p>
        </div>
      </div>
      
      <WalletReports />
    </div>
  );
} 