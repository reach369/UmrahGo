'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { WithdrawalRequests } from '@/components/office/enhanced-wallet/WithdrawalRequests';

interface WithdrawalsPageProps {
  params: { locale: string };
}

export default function WithdrawalsPage({ params }: WithdrawalsPageProps) {
  const t = useTranslations();
  const locale = params.locale || 'ar';

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('wallet.withdrawals.title') || 'طلبات السحب'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('wallet.withdrawals.subtitle') || 'إدارة طلبات سحب الأموال'}
          </p>
        </div>
      </div>
      
      <WithdrawalRequests />
    </div>
  );
} 