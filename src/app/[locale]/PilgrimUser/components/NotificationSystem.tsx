'use client';

import { Bell, Check, Clock, CreditCard, X, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export interface Notification {
  id: string;
  type: 'booking' | 'payment';
  status: 'pending' | 'confirmed' | 'rejected';
  message: string;
  timestamp: Date;
}

interface NotificationSystemProps {
  userId: string;
}

export function NotificationSystem({ userId }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // محاكاة جلب الإشعارات من الخادم
  useEffect(() => {
    // هنا سيتم استبدال هذا بطلب API حقيقي
    const mockNotifications: Notification[] = [
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
      },
      {
        id: '6',
        type: 'booking',
        status: 'confirmed',
        message: 'تم تأكيد حجز الباص VIP رقم B-123 لرحلتك من المدينة إلى مكة',
        timestamp: new Date(Date.now() - 259200000),
      },
      {
        id: '7',
        type: 'payment',
        status: 'rejected',
        message: 'فشلت عملية الدفع، يرجى التحقق من بيانات البطاقة وإعادة المحاولة',
        timestamp: new Date(Date.now() - 345600000),
      },
      {
        id: '8',
        type: 'booking',
        status: 'confirmed',
        message: 'تم تعيين المرشد أحمد محمد لمجموعتك. رقم التواصل: 0555555555',
        timestamp: new Date(Date.now() - 432000000),
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(3); // تعيين عدد الإشعارات غير المقروءة
  }, [userId]);

  const getNotificationIcon = (type: string, status: string) => {
    switch (type) {
      case 'booking':
        return status === 'confirmed' ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : status === 'rejected' ? (
          <X className="w-5 h-5 text-red-500" />
        ) : (
          <Clock className="w-5 h-5 text-yellow-500" />
        );
      case 'payment':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.RelativeTimeFormat('ar', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60)),
      'hour'
    );
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    toast.success('تم تحديث جميع الإشعارات كمقروءة');
  };

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
        <Link href="/PilgrimUser/notifications">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            title="عرض كل الإشعارات"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <Card className="absolute left-0 mt-2 w-80 z-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">الإشعارات</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    تحديث الكل كمقروء
                  </Button>
                )}
                <Link href="/PilgrimUser/notifications">
                  <Button variant="outline" size="sm">
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type, notification.status)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  لا توجد إشعارات جديدة
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 