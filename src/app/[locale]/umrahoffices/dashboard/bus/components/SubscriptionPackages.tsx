'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionPackage } from '../types/subscription';
import { useTranslations } from 'next-intl';

// Default packages data
const defaultPackages: SubscriptionPackage[] = [
  {
    id: 1,
    office_id: 1,
    name: "الباقة الأساسية",
    description: "باقة مناسبة للمكاتب الصغيرة، تتضمن عرض خدماتك في 10 مكاتب عمرة",
    price: 299.99,
    duration_days: 30,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    office_id: 1,
    name: "الباقة المتقدمة",
    description: "باقة مثالية للمكاتب المتوسطة، تتضمن عرض خدماتك في 25 مكتب عمرة مع إمكانية إدارة الحجوزات",
    price: 599.99,
    duration_days: 30,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    office_id: 1,
    name: "الباقة المميزة",
    description: "باقة شاملة للمكاتب الكبيرة، تتضمن عرض خدماتك في جميع المكاتب مع مميزات إضافية مثل التقارير المتقدمة والدعم المباشر",
    price: 999.99,
    duration_days: 30,
    created_at: new Date().toISOString()
  }
];

const SubscriptionPackages: React.FC = () => {
  const t = useTranslations('BusDashboard');
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      // Simulate API call with default data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setPackages(defaultPackages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setLoading(false);
    }
  };

  const handleSubscribe = async (packageId: number) => {
    try {
      // TODO: Implement subscription logic
      console.log('Subscribing to package:', packageId);
    } catch (error) {
      console.error('Error subscribing to package:', error);
    }
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{pkg.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold">{pkg.price} SAR</p>
                <p className="text-sm text-gray-500">{pkg.duration_days} {t('days')}</p>
              </div>
              <Button onClick={() => handleSubscribe(pkg.id)}>
                {t('subscribe')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPackages; 