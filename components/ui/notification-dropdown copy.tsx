'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { BellIcon, CheckIcon, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getAuthToken } from '@/lib/auth.service';
import { realtimeService } from '@/services/realtime.service';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read_at: string | null;
  action_url?: string;
  image_url?: string;
}

interface NotificationDropdownProps {
  maxItems?: number;
  className?: string;
}

export function NotificationDropdown({ maxItems = 5, className }: NotificationDropdownProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const locale = typeof window !== 'undefined' ? (document.documentElement.lang || 'en') : 'en';
  const dateLocale = locale === 'ar' ? ar : enUS;

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch('/api/v1/notifications/latest', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications.slice(0, maxItems));
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read_at: new Date().toISOString() } 
            : notif
        )
      );
      
      if (unreadCount > 0) {
        setUnreadCount(prev => prev - 1);
      }

      // Send to server
      await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      // Send to server
      await fetch('/api/v1/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read when clicked
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Navigate if action URL is provided
    if (notification.action_url) {
      router.push(notification.action_url);
      setIsOpen(false);
    }
  };

  // Set up realtime notification listener
  useEffect(() => {
    const handleNewNotification = (notification: any) => {
      // Add new notification to the list
      setNotifications(prev => {
        const exists = prev.some(n => n.id === notification.id);
        if (exists) return prev;
        
        const newNotification = {
          id: notification.id,
          title: notification.title || notification.data?.title || 'New Notification',
          message: notification.message || notification.data?.message || notification.data?.content || '',
          type: notification.type || notification.data?.type || 'system',
          created_at: notification.created_at || new Date().toISOString(),
          read_at: null,
          action_url: notification.action_url || notification.data?.action_url,
          image_url: notification.image_url || notification.data?.image_url
        };
        
        // Keep the array limited to maxItems
        return [newNotification, ...prev.slice(0, maxItems - 1)];
      });
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    };
    
    // Register notification listener
    realtimeService().onNotification(handleNewNotification);
    
    // Load initial notifications
    fetchNotifications();
    
    // Clean up
    return () => {
      realtimeService().offNotification(handleNewNotification);
    };
  }, [maxItems]);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">💬</div>;
      case 'payment':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">💰</div>;
      case 'booking':
        return <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">🗓️</div>;
      case 'system':
        return <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">⚙️</div>;
      case 'alert':
        return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">⚠️</div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">📣</div>;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("relative", className)}
          onClick={() => setIsOpen(true)}
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center px-1 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">{t('title')}</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              {t('mark_all_read')}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BellIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">{t('no_notifications')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('empty_state_message')}</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={notification.id} className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  notification.read_at ? "bg-background" : "bg-primary/5",
                  index !== notifications.length - 1 && "border-b"
                )}>
                  <div onClick={() => handleNotificationClick(notification)}>
                    {notification.image_url ? (
                      <img 
                        src={notification.image_url} 
                        alt={notification.title}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      getNotificationIcon(notification.type)
                    )}
                  </div>
                  
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className={cn(
                      "text-sm font-medium",
                      !notification.read_at && "font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: dateLocale
                      })}
                    </p>
                  </div>
                  
                  {!notification.read_at && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => {
              router.push('/notifications');
              setIsOpen(false);
            }}
          >
            {t('view_all')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationDropdown; 