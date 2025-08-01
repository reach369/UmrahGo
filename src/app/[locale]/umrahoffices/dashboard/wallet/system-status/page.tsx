'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SystemStatus } from '@/components/office/enhanced-wallet/SystemStatus';

interface SystemStatusPageProps {
  params: { locale: string };
}

export default function SystemStatusPage({ params }: SystemStatusPageProps) {
  const t = useTranslations();
  const locale = params.locale || 'ar';

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('wallet.system_status.title') || 'حالة النظام'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('wallet.system_status.subtitle') || 'التحقق من صحة وسلامة المحفظة المالية'}
          </p>
        </div>
      </div>
      
      <SystemStatus />
    </div>
  );
} 