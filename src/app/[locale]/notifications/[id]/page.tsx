'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Bell, Check, Clock, Calendar, Tag } from 'lucide-react';

import { Notification, useNotifications } from '@/providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationDetailsPage() {
  const t = useTranslations('notifications');
  const params = useParams();
  const router = useRouter();
  const notificationId = params?.id || '';
  
  // Get locale for date formatting
  const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'ar' : 'ar';
  
  // State
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get notification functions from context
  const { markAsRead, notifications } = useNotifications();
  
  useEffect(() => {
    // Find notification in context
    const fetchNotification = async () => {
      setLoading(true);
      
      try {
        // Look for the notification in the context
        // Try to find by id as string first, then as number
        const foundNotification = notifications.find(n => 
          String(n.id) === notificationId || n.id === parseInt(notificationId as string, 10)
        );
        
        if (foundNotification) {
          setNotification(foundNotification);
          
          // Mark as read if not already read
          if (!foundNotification.read_at) {
            await markAsRead(foundNotification.id);
          }
        } else {
          setError(t('notification_not_found'));
        }
      } catch (err) {
        console.error('Error fetching notification:', err);
        setError(t('error_loading'));
      } finally {
        setLoading(false);
      }
    };
    
    if (notificationId) {
      fetchNotification();
    }
  }, [notificationId, notifications, markAsRead, t]);
  
  // Format date based on locale
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp', { locale: locale === 'ar' ? ar : enUS });
    } catch (error) {
      return dateString;
    }
  };
  
  // Get priority badge color
  const getPriorityBadgeVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
            return 'default';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };
  
  // Get message content (handles different field names)
  const getMessageContent = (notification: Notification): string => {
    return notification.message || notification.body || notification.content || '';
  };
  
  // Get notification icon based on type and priority
  const getNotificationIcon = () => {
    if (!notification) return null;
    
    const { type, priority = 'normal' } = notification;
    
    let bgColorClass = 'bg-primary/10';
    let iconColorClass = 'text-primary';
    
    // Adjust colors based on priority
    if (priority === 'high') {
      bgColorClass = 'bg-amber-100';
      iconColorClass = 'text-amber-600';
    } else if (priority === 'urgent') {
      bgColorClass = 'bg-red-100';
      iconColorClass = 'text-red-600';
    }
    
    // Icons based on notification type
    switch (type) {
      case 'chat':
        return (
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      
      case 'system':
      case 'system_update':
        return (
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
        );
      
      case 'booking':
        return (
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M3 10h18"></path>
            </svg>
          </div>
        );
      
      case 'payment':
        return (
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
        );
      
      case 'package':
      case 'hotel':
        return (
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
        );
      
      default:
        return (
          <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClass}`}>
            <Bell className={`h-8 w-8 ${iconColorClass}`} />
          </div>
        );
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-2" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('notification_details')}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">{t('error')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => router.back()}>
              {t('back')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render notification not found
  if (!notification) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('notification_details')}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('notification_not_found')}</CardTitle>
            <CardDescription>{t('notification_not_found_description')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/notifications')}>
              {t('back_to_notifications')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render notification details
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('notification_details')}</h1>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start space-x-4 rtl:space-x-reverse">
            {getNotificationIcon()}
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <CardTitle>{notification.title}</CardTitle>
                <Badge variant={getPriorityBadgeVariant(notification.priority) as any}>
                  {notification.priority || 'normal'}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {notification.type && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Tag className="h-3 w-3 mr-1" />
                    <span>{notification.type}</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-base">
            {getMessageContent(notification)}
          </div>
          
          {/* Additional data if available */}
          {notification.data && Object.keys(notification.data).length > 0 && (
            <div className="mt-6 border rounded-md p-4 bg-muted/20">
              <h3 className="text-sm font-medium mb-2">{t('additional_data')}</h3>
              <dl className="space-y-2">
                {Object.entries(notification.data).map(([key, value]) => (
                  <div key={key} className="flex flex-wrap text-sm">
                    <dt className="w-1/3 font-medium">{key}:</dt>
                    <dd className="w-2/3">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          
          {/* Timestamps */}
          <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center mb-2 sm:mb-0">
              <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
              <span>{t('created_at')}: {formatDate(notification.created_at)}</span>
            </div>
            
            {notification.read_at && (
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                <span>{t('read_at')}: {formatDate(notification.read_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => router.back()}>
            {t('back')}
          </Button>
          
          {/* Action buttons based on notification type */}
          {notification.action_url || notification.link ? (
            <Button onClick={() => router.push(notification.action_url || notification.link || '')}>
              {t('view_details')}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => router.push('/notifications')}>
              {t('view_all_notifications')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 