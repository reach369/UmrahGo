'use client';

/**
 * نظام الإشعارات الشامل
 * Comprehensive Notification System
 * 
 * Features:
 * - Real-time notifications
 * - Push notifications support
 * - Sound notifications
 * - Visual indicators
 * - Notification center
 * - Custom notification types
 * - Permission management
 * - RTL support
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { 
  Bell, 
  BellOff, 
  X, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  Users, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  Info,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  Filter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { realtimeService, RealtimeMessage as ChatNotification } from '@/services/realtime.service';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_CONFIG } from '@/config/api.config';

// Notification types
export type NotificationType = 
  | 'chat_message' 
  | 'chat_invite' 
  | 'booking_update' 
  | 'payment_confirmation' 
  | 'system_announcement' 
  | 'reminder'
  | 'warning'
  | 'error'
  | 'success';

export interface AppNotification {
  id: string | number;
  title: string;
  body: string;
  type: string;
  notification_type: NotificationType;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  icon?: string;
  image?: string;
  action_url?: string;
  actions?: NotificationAction[];
  is_persistent?: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'navigate' | 'api_call' | 'dismiss' | 'custom';
  url?: string;
  endpoint?: string;
  handler?: () => void;
}

// Notification settings
interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  chatMessages: boolean;
  bookingUpdates: boolean;
  paymentAlerts: boolean;
  systemAnnouncements: boolean;
  soundVolume: number;
}

// Get notification icon based on type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'chat_message':
    case 'chat_invite':
      return MessageSquare;
    case 'booking_update':
      return Calendar;
    case 'payment_confirmation':
      return CreditCard;
    case 'warning':
      return AlertTriangle;
    case 'error':
      return AlertTriangle;
    case 'success':
      return Check;
    case 'system_announcement':
    default:
      return Info;
  }
};

// Get notification color based on type
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'chat_message':
    case 'chat_invite':
      return 'text-blue-600 dark:text-blue-400';
    case 'booking_update':
      return 'text-green-600 dark:text-green-400';
    case 'payment_confirmation':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'system_announcement':
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

// Notification item component
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction
}: {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (action: NotificationAction) => void;
}) => {
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const isRTL = locale === 'ar';
  const t = useTranslations();
  
  const Icon = getNotificationIcon(notification.notification_type);
  const iconColor = getNotificationColor(notification.notification_type);
  
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: isRTL ? ar : enUS
    });
  };

  return (
    <div className={cn(
      'group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
      !notification.read_at && 'bg-blue-50/50 dark:bg-blue-900/10'
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          !notification.read_at ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
        )}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={cn(
                'text-sm font-medium text-gray-900 dark:text-gray-100',
                !notification.read_at && 'font-semibold'
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.body}
              </p>
              
              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {notification.actions.map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant="outline"
                      onClick={() => onAction(action)}
                      className="h-6 text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Time and actions */}
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(notification.created_at)}
              </span>
              
              {/* Unread indicator */}
              {!notification.read_at && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read_at && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id.toString())}>
                <Check className="h-4 w-4 mr-2" />
                {t('notifications.markAsRead')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete(notification.id.toString())}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('notifications.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Notification settings component
const NotificationSettingsPanel = ({
  settings,
  onUpdateSettings
}: {
  settings: NotificationSettings;
  onUpdateSettings: (settings: Partial<NotificationSettings>) => void;
}) => {
  const t = useTranslations();

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
        {t('notifications.settings')}
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications-enabled" className="text-sm">
            {t('notifications.enableNotifications')}
          </Label>
          <Switch
            id="notifications-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => onUpdateSettings({ enabled })}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled" className="text-sm">
            {t('notifications.soundNotifications')}
          </Label>
          <Switch
            id="sound-enabled"
            checked={settings.sound}
            onCheckedChange={(sound) => onUpdateSettings({ sound })}
            disabled={!settings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="desktop-enabled" className="text-sm">
            {t('notifications.desktopNotifications')}
          </Label>
          <Switch
            id="desktop-enabled"
            checked={settings.desktop}
            onCheckedChange={(desktop) => onUpdateSettings({ desktop })}
            disabled={!settings.enabled}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label htmlFor="chat-messages" className="text-sm">
            {t('notifications.chatMessages')}
          </Label>
          <Switch
            id="chat-messages"
            checked={settings.chatMessages}
            onCheckedChange={(chatMessages) => onUpdateSettings({ chatMessages })}
            disabled={!settings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="booking-updates" className="text-sm">
            {t('notifications.bookingUpdates')}
          </Label>
          <Switch
            id="booking-updates"
            checked={settings.bookingUpdates}
            onCheckedChange={(bookingUpdates) => onUpdateSettings({ bookingUpdates })}
            disabled={!settings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="payment-alerts" className="text-sm">
            {t('notifications.paymentAlerts')}
          </Label>
          <Switch
            id="payment-alerts"
            checked={settings.paymentAlerts}
            onCheckedChange={(paymentAlerts) => onUpdateSettings({ paymentAlerts })}
            disabled={!settings.enabled}
          />
        </div>
      </div>
    </div>
  );
};

// Main notification system component
interface NotificationSystemProps {
  className?: string;
}

export function NotificationSystem({ className }: NotificationSystemProps) {
  const { state: authState } = useAuth();
  const user = authState.user;
  const token = typeof window !== 'undefined' ? localStorage.getItem('nextauth_token') || localStorage.getItem('token') : null;
  const t = useTranslations();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const isRTL = locale === 'ar';
  
  // State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    desktop: true,
    email: true,
    chatMessages: true,
    bookingUpdates: true,
    paymentAlerts: true,
    systemAnnouncements: true,
    soundVolume: 0.5
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'chat' | 'system'>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id.toString() === id 
              ? { ...notif, read_at: new Date().toISOString() }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read_at: notif.read_at || new Date().toISOString() 
          }))
        );
        toast.success(t('notifications.allMarkedAsRead'));
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [t]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id.toString() !== id));
        toast.success(t('notifications.deleted'));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [t]);

  // Handle notification action
  const handleNotificationAction = useCallback(async (action: NotificationAction) => {
    switch (action.action) {
      case 'navigate':
        if (action.url) {
          window.location.href = action.url;
        }
        break;
      case 'api_call':
        if (action.endpoint) {
          try {
            await fetch(action.endpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                'Accept': 'application/json'
              }
            });
          } catch (error) {
            console.error('Failed to execute notification action:', error);
          }
        }
        break;
      case 'custom':
        if (action.handler) {
          action.handler();
        }
        break;
      case 'dismiss':
      default:
        break;
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.sound || !settings.enabled) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = settings.soundVolume;
    }
    
    audioRef.current.play().catch(console.error);
  }, [settings.sound, settings.enabled, settings.soundVolume]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings));
    
    // Update audio volume
    if (audioRef.current && newSettings.soundVolume !== undefined) {
      audioRef.current.volume = newSettings.soundVolume;
    }
    
    // Request desktop notification permission if enabled
    if (newSettings.desktop && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, [settings]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      switch (filter) {
        case 'unread':
          return !notification.read_at;
        case 'chat':
          return ['chat_message', 'chat_invite'].includes(notification.notification_type);
        case 'system':
          return !['chat_message', 'chat_invite'].includes(notification.notification_type);
        default:
          return true;
      }
    });
  }, [notifications, filter]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(notif => !notif.read_at).length;
  }, [notifications]);

  // Setup real-time notification handler
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = realtimeService().onNotification((notification: ChatNotification) => {
      const appNotification: AppNotification = {
        ...notification,
        title: notification.message,
        body: notification.message,
        read_at: null,
        type: notification.type || 'system_announcement',
        updated_at: notification.created_at,
        notification_type: notification.type as NotificationType || 'system_announcement',
        priority: 'normal'
      };

      setNotifications(prev => [appNotification, ...prev]);
      
      // Play sound
      playNotificationSound();
      
      // Show desktop notification
      if (settings.desktop && settings.enabled && Notification.permission === 'granted') {
        new Notification(appNotification.notification_type, {
          body: typeof notification.message === 'string' ? notification.message : 'New notification',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: notification.id.toString()
        });
      }
      
      // Show toast for high priority notifications
      if (appNotification.priority === 'high' || appNotification.priority === 'urgent') {
        toast.info(appNotification.title, {
          description: appNotification.body,
          duration: 8000
        });
      }
    });

    return unsubscribe;
  }, [user?.id, playNotificationSound, settings.desktop, settings.enabled]);

  // Load initial notifications and settings
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('notification_settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Failed to parse notification settings:', error);
        }
      }
    }
          }, [user?.id, loadNotifications]);

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
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
        
        <PopoverContent 
          className="w-80 p-0" 
          align={isRTL ? 'start' : 'end'}
          side="bottom"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('notifications.title')}
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-1">
                  {/* Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilter('all')}>
                        {t('notifications.filter.all')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter('unread')}>
                        {t('notifications.filter.unread')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter('chat')}>
                        {t('notifications.filter.chat')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter('system')}>
                        {t('notifications.filter.system')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Settings */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64">
                      <NotificationSettingsPanel
                        settings={settings}
                        onUpdateSettings={updateSettings}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Action buttons */}
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    {t('notifications.markAllAsRead')}
                  </Button>
                </div>
              )}
            </CardHeader>

            <div className="max-h-96 overflow-hidden">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="space-y-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('notifications.noNotifications')}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('notifications.noNotificationsDescription')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                        onAction={handleNotificationAction}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
} 