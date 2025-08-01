'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import {
  Bell,
  CheckCheck,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Package,
  Info,
  AlertTriangle,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export function NotificationButton() {
  const t = useTranslations('notifications');
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const isRTL = locale === 'ar';
  const [open, setOpen] = useState(false);

  // Use the notifications hook with real-time enabled
  const { notifications, unreadCount, markAsRead } = useNotifications({
    enableRealtime: true,
  });

  // Handle mark as read
  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    // Implement mark all as read functionality
  };

  // Get notification icon based on category/type
  const getNotificationIcon = (notification: any) => {
    const category = notification.category || 'system';
    const priority = notification.priority || 'normal';

    switch (category) {
      case 'booking':
        return <CalendarCheck className="h-4 w-4 text-green-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-indigo-500" />;
      case 'package':
        return <Package className="h-4 w-4 text-amber-500" />;
      default:
        if (priority === 'urgent') {
          return <AlertTriangle className="h-4 w-4 text-red-500" />;
        }
        if (priority === 'high') {
          return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        }
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format time
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: isRTL ? ar : enUS,
    });
  };

  // Get recent notifications
  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] text-xs font-bold bg-red-500 hover:bg-red-600"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={isRTL ? 'start' : 'end'} className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">
            {t('recentNotifications')}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Bell className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 text-center">
                {t('noNotifications')}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    !notification.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                      !notification.is_read 
                        ? "bg-blue-100 dark:bg-blue-900/30" 
                        : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm",
                        !notification.is_read 
                          ? "font-semibold text-gray-900 dark:text-gray-100" 
                          : "text-gray-700 dark:text-gray-300"
                      )}>
                        {notification.title}
                      </p>
                      
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {notification.message || notification.content}
                      </p>
                      
                      <p className="text-xs text-gray-400">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    
                    {!notification.is_read && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t text-center">
          <Button 
            variant="ghost" 
            asChild 
            className="w-full"
            onClick={() => setOpen(false)}
          >
            <Link href={`/${locale}/umrahoffices/notifications`}>
              {t('viewAll')}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 