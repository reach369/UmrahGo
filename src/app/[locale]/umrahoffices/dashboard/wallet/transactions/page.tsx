'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TransactionsTable } from '@/components/office/enhanced-wallet/TransactionsTable';

interface TransactionsPageProps {
  params: { locale: string };
}

export default function TransactionsPage({ params }: TransactionsPageProps) {
  const t = useTranslations();
  const locale = params.locale || 'ar';

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('wallet.transactions.title') || 'المعاملات المالية'}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('wallet.transactions.subtitle') || 'جميع المعاملات المالية للمحفظة'}
          </p>
        </div>
      </div>
      
      <TransactionsTable />
    </div>
  );
} 