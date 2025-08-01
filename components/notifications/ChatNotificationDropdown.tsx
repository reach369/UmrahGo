'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Check, CheckCheck, MessageSquare, Trash, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// UI Components
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hooks
import useChatNotifications, { ChatNotification } from '@/hooks/useChatNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';

interface ChatNotificationDropdownProps {
  className?: string;
}

const ChatNotificationDropdown: React.FC<ChatNotificationDropdownProps> = ({
  className,
}) => {
  const t = useTranslations('notifications');
  const { state: authState } = useAuth();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const dateLocale = locale === 'ar' ? ar : enUS;   
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications,
    viewChat
  } = useChatNotifications();

  const handleMarkAsRead = (e: React.MouseEvent, notification: ChatNotification) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleClearNotification = (e: React.MouseEvent, notification: ChatNotification) => {
    e.stopPropagation();
    clearNotification(notification.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="p-0">
            {t('notifications')}
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                {t('mark_all_read')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearAllNotifications}
              >
                <Trash className="h-3.5 w-3.5 mr-1" />
                {t('clear_all')}
              </Button>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{t('no_notifications')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('no_notifications_desc')}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start p-4 cursor-pointer hover:bg-accent",
                  notification.isRead ? "opacity-70" : "bg-accent/40"
                )}
                onClick={() => viewChat(notification.chatId)}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{notification.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: dateLocale
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleMarkAsRead(e, notification)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => handleClearNotification(e, notification)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm mt-2 line-clamp-2">{notification.message}</p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatNotificationDropdown; 