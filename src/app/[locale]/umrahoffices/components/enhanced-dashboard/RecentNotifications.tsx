'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Package, 
  CreditCard, 
  Star, 
  Settings,
  CheckCheck,
  ChevronRight,
  Calendar,
  User,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  data?: any;
}

interface RecentNotificationsProps {
  notifications?: Notification[];
  isLoading?: boolean;
}

export default function RecentNotifications({ 
  notifications = [], 
  isLoading = false 
}: RecentNotificationsProps) {
  const t = useTranslations('UmrahOfficesDashboard');
  const locale = useLocale();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);

  // Mock notifications if none provided
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'booking',
      title: t('notifications.newBooking'),
      message: 'حجز جديد من أحمد محمد لباقة العمرة الذهبية',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      actionUrl: '/umrahoffices/dashboard/bookings/123'
    },
    {
      id: '2',
      type: 'payment',
      title: t('notifications.paymentReceived'),
      message: 'تم استلام دفعة بقيمة 2,500 ر.س من العميل فاطمة أحمد',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      actionUrl: '/umrahoffices/dashboard/payments/456'
    },
    {
      id: '3',
      type: 'review',
      title: t('notifications.customerReview'),
      message: 'تقييم جديد 5 نجوم من العميل محمد علي',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: '/umrahoffices/dashboard/reviews'
    },
    {
      id: '4',
      type: 'system',
      title: t('notifications.systemUpdate'),
      message: 'تحديث جديد متاح للنظام - إصدار 2.1.0',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      actionUrl: '/umrahoffices/dashboard/settings'
    }
  ];

  const displayNotifications = localNotifications.length > 0 ? localNotifications : mockNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatRelativeTime = (date: Date): string => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: locale === 'ar' ? ar : undefined 
    });
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <Card className="h-[400px]">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">
            {t('notifications.title')}
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            {t('notifications.markAllRead')}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6">
          {displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Bell className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('notifications.noNotifications')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-blue-500' : ''
                  }`}
                    onClick={() => {
                    if (notification.actionUrl) {
                      window.location.href = `/${locale}${notification.actionUrl}`;
                    }
                  }}
                >
                  <div className={`p-2 rounded-full ${getNotificationBadgeColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium truncate ${
                        !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatRelativeTime(notification.timestamp)}
                      </span>
                      {notification.actionUrl && (
                        <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <div className="border-t p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/${locale}/umrahoffices/dashboard/notifications`}>
            {t('notifications.viewAll')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}