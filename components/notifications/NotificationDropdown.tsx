'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { BellIcon, CheckIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { realtimeService } from '@/services/realtime.service';
import notificationService from '@/services/notification.service';

interface NotificationItem {
  id: string | number;
  title: string;
  body: string;
  type: string;
  created_at: string;
  read_at: string | null;
  data?: {
    url?: string;
    chat_id?: number;
    [key: string]: any;
  };
}

interface NotificationDropdownProps {
  maxItems?: number;
  className?: string;
}

export function NotificationDropdown({ maxItems = 5, className }: NotificationDropdownProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const { state: authState  } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('nextauth_token') || localStorage.getItem('token') : null;
  const user = authState.user;    
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'ar' : 'ar';
  const dateLocale = locale === 'ar' ? ar : enUS;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token || !user) return;
    
    setIsLoading(true);
    try {
      const response = await notificationService.getNotifications(token, 1, maxItems);
      
      if (response.success) {
        setNotifications(response.data || []);
        
        // Get unread count
        const unreadResponse = await notificationService.getUnreadCount(token);
        setUnreadCount(unreadResponse);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId: string | number) => {
    if (!token) return;
    
    try {
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
      await notificationService.markAsRead(token, notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      // Send to server
      await notificationService.markAllAsRead(token);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">💬</div>;
      case 'payment':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">💰</div>;
      case 'booking':
        return <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">🗓️</div>;
      case 'system':
        return <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">⚙️</div>;
      case 'alert':
        return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">⚠️</div>;
      case 'wallet':
        return <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">💼</div>;
      case 'withdrawal':
        return <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">🏧</div>;
      case 'transaction':
        return <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">🔄</div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">📣</div>;
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read when clicked
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type and data
    if (notification.data?.url) {
      router.push(notification.data.url);
      setIsOpen(false);
    } else if (notification.type === 'chat' && notification.data?.chat_id) {
      // Handle chat notifications
      const chatId = notification.data.chat_id;
      const userRole = user?.roles?.[0] || 'pilgrim';
      const basePath = userRole === 'admin' 
        ? '/admin' 
        : userRole === 'office' 
          ? '/umrahoffices'
          : '/pilgrim';
          
      router.push(`${basePath}/chats?id=${chatId}`);
      setIsOpen(false);
    } else if (notification.type === 'wallet' || notification.type === 'transaction') {
      // Handle wallet notifications
      const userRole = user?.roles?.[0] || 'pilgrim';
      if (userRole === 'office') {
        router.push('/umrahoffices/dashboard/wallet');
        setIsOpen(false);
      }
    } else if (notification.type === 'withdrawal' && notification.data?.withdrawal_id) {
      // Handle withdrawal notifications
      const userRole = user?.roles?.[0] || 'pilgrim';
      if (userRole === 'office') {
        router.push(`/umrahoffices/dashboard/wallet/withdrawals?id=${notification.data.withdrawal_id}`);
        setIsOpen(false);
      }
    }
  };

  // Set up realtime notification listener
  useEffect(() => {
    if (!user || !token) return;
    
    const handleNewNotification = (notification: any) => {
      // Add new notification to the list
      setNotifications(prev => {
        const exists = prev.some(n => n.id === notification.id);
        if (exists) return prev;
        
        // Keep the array limited to maxItems
        return [notification, ...prev.slice(0, maxItems - 1)];
      });
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Play notification sound
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio started playing successfully
            })
            .catch((error) => {
              // Silent error - expected before user interaction
              console.log('Audio playback requires user interaction first');
            });
        }
      } catch (error) {
        console.log('Audio playback error:', error);
      }
    };
    
    // Register notification listener
    const service = realtimeService();
    service.onNotification(handleNewNotification);
    
    // Clean up
    return () => {
      service.offNotification(handleNewNotification);
    };
  }, [token, user, maxItems]);
  
  // Load initial notifications when dropdown opens or when token/user changes
  useEffect(() => {
    if (isOpen || unreadCount === 0) {
      fetchNotifications();
    }
  }, [isOpen, token, user]);

  if (!user) {
    return null;
  }

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
                    {getNotificationIcon(notification.type)}
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
                      {notification.body}
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
              const userRole = user?.roles?.[0] || 'pilgrim';
              const basePath = userRole === 'admin' 
                ? '/admin' 
                : userRole === 'office' 
                  ? '/umrahoffices'
                  : '/pilgrim';
                  
              router.push(`${basePath}/notifications`);
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