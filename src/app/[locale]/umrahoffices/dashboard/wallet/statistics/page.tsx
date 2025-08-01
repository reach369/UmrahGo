'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { WalletStatistics } from '@/components/office/enhanced-wallet/WalletStatistics';

interface StatisticsPageProps {
  params: { locale: string };
}

export default function StatisticsPage({ params }: StatisticsPageProps) {
  const t = useTranslations();
  const locale = params.locale || 'ar';

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('wallet.statistics.title') || 'الإحصائيات والتحليلات'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('wallet.statistics.subtitle') || 'تحليل مفصل لأداء المحافظ والمعاملات'}
          </p>
        </div>
      </div>
      
      <WalletStatistics />
    </div>
  );
} 