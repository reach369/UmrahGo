'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import SubscriptionPackages from '../components/SubscriptionPackages';

const PackagesPage: React.FC = () => {
  const t = useTranslations('BusDashboard');

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('subscriptionPackages')}</h1>
        <p className="text-gray-500">{t('subscriptionPackagesDescription')}</p>
      </div>
      <SubscriptionPackages />
    </div>
  );
};

export default PackagesPage; 