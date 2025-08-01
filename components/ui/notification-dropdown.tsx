'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, BellOff, Check, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Notification, useNotifications } from '@/providers/NotificationProvider';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface NotificationDropdownProps {
  className?: string;
  maxHeight?: string;
  maxItems?: number;
  showReadAll?: boolean;
  showViewAll?: boolean;
  notificationPath?: string;
}

export function NotificationDropdown({
  className = '',
  maxHeight = '350px',
  maxItems = 10,
  showReadAll = true,
  showViewAll = true,
  notificationPath = '/notifications'
}: NotificationDropdownProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  
  // Get locale for date formatting
  const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'ar' : 'ar';
  
  // State for popover control
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Get notifications from context
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  // Load notifications when dropdown is opened
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);
  
  // Format date based on locale
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPp', { locale: locale === 'ar' ? ar : enUS });
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate time elapsed (e.g. "2 hours ago")
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return t('just_now');
      
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} ${t('minutes_ago', { minutes })}`;
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} ${t('hours_ago', { hours })}`;
      
      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} ${t('days_ago', { days })}`;
      
      // If more than 30 days, return formatted date
      return formatDate(dateString);
    } catch (error) {
      return dateString;
    }
  };
  
  // Get message content (handles different field names)
  const getMessageContent = (notification: Notification): string => {
    return notification.message || notification.body || notification.content || '';
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Close dropdown
    setOpen(false);
    
    // Navigate to notification details page
    router.push(`/${locale}/notifications/${notification.id}`);
  };
  
  // Get URL based on notification type and data
  const getNotificationUrl = (notification: Notification) => {
    const { type, data } = notification;
    
    if (data?.url) return data.url;
    
    switch (type) {
      case 'chat':
        return data?.chat_id ? `/chats/${data.chat_id}` : '/chats';
      case 'booking':
        return data?.booking_id ? `/bookings/${data.booking_id}` : '/bookings';
      case 'payment':
        return data?.payment_id ? `/payments/${data.payment_id}` : '/payments';
      case 'package':
        return data?.package_id ? `/packages/${data.package_id}` : '/packages';
      case 'hotel':
        return data?.hotel_id ? `/hotels/${data.hotel_id}` : '/hotels';
      default:
        return null;
    }
  };
  
  // View all notifications
  const viewAllNotifications = () => {
    setOpen(false);
    router.push(`/${locale}/notifications`);
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications
    .filter(notification => 
      activeTab === 'all' || 
      (activeTab === 'unread' && !notification.read_at)
    )
    .slice(0, maxItems);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label="Notifications"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-sm font-medium">{t('title')}</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 rtl:mr-2 rtl:ml-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {/* Mark all as read button */}
          {showReadAll && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
            >
              <Check className="h-3 w-3 mr-1" />
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="all" className="flex-1 rounded-none">
              {t('all')}
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 rounded-none">
              {t('unread')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="p-0 m-0">
            <ScrollArea style={{ height: maxHeight }} className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <BellOff className="h-10 w-10 text-muted-foreground mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'unread' 
                      ? t('all_caught_up') 
                      : t('no_notifications')}
                  </p>
                </div>
              ) : (
                <>
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start p-3 border-b last:border-0 cursor-pointer hover:bg-accent/30
                                ${!notification.read_at ? 'bg-accent/10' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Type-based icon (simplified for dropdown) */}
                      <div className={`flex-shrink-0 w-8 h-8 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                                     flex items-center justify-center bg-primary-foreground
                                     ${notification.priority === 'urgent' ? 'bg-red-100' : 
                                      notification.priority === 'high' ? 'bg-amber-100' : 'bg-primary-foreground'}`}
                      >
                        {notification.type === 'chat' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={notification.priority === 'urgent' ? 'text-red-600' : notification.priority === 'high' ? 'text-amber-600' : 'text-primary'}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        ) : (
                          <Bell className={`h-4 w-4 ${notification.priority === 'urgent' ? 'text-red-600' : notification.priority === 'high' ? 'text-amber-600' : 'text-primary'}`} />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium line-clamp-1 mb-0.5">
                            {notification.title}
                          </h4>
                          {!notification.read_at && (
                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary ml-2 rtl:mr-2 rtl:ml-0"></div>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5">
                          {getMessageContent(notification)}
                        </p>
                        
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        {showViewAll && notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-center"
              onClick={viewAllNotifications}
            >
              {t('view_all')}
              <ChevronRight className="h-4 w-4 ml-1 rtl:mr-1 rtl:ml-0 rtl:rotate-180" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 