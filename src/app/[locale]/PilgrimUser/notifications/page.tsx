'use client';

import { useState } from 'react';
import { Bell, Check, Clock, CreditCard, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// استيراد نوع الإشعار من مكون النظام
import { Notification } from '../components/NotificationSystem';

export default function NotificationsPage() {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      status: 'pending',
      message: 'تم استلام طلب حجزك لرحلة العمرة مع مكتب النور للسفر والسياحة وجاري مراجعته',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'payment',
      status: 'confirmed',
      message: 'تم تأكيد دفع مبلغ 5000 ريال لباقة العائلة المميزة',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      type: 'booking',
      status: 'confirmed',
      message: 'تم تأكيد حجزك في فندق دار التوحيد - مكة المكرمة من 15-20 رمضان',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '4',
      type: 'booking',
      status: 'rejected',
      message: 'عذراً، تم رفض طلب تغيير موعد الرحلة لعدم توفر أماكن في التاريخ المطلوب',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: '5',
      type: 'payment',
      status: 'pending',
      message: 'في انتظار تأكيد الدفعة الثانية بقيمة 3000 ريال',
      timestamp: new Date(Date.now() - 172800000),
    }
  ]);

  const getNotificationIcon = (type: string, status: string) => {
    switch (type) {
      case 'booking':
        return status === 'confirmed' ? (
          <Check className="w-6 h-6 text-green-500" />
        ) : status === 'rejected' ? (
          <X className="w-6 h-6 text-red-500" />
        ) : (
          <Clock className="w-6 h-6 text-yellow-500" />
        );
      case 'payment':
        return <CreditCard className="w-6 h-6 text-blue-500" />;
      default:
        return <Bell className="w-6 h-6" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60)),
      'hour'
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">الإشعارات</h1>
        <Link href="/ar/PilgrimUser">
          <Button variant="ghost" size="sm">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getNotificationIcon(notification.type, notification.status)}
              </div>
              <div className="flex-1">
                <p className="text-base mb-1">{notification.message}</p>
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm">
                  عرض التفاصيل
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 