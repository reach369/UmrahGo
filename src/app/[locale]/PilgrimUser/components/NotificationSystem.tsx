'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Bell, 
  Check, 
  Clock, 
  CreditCard, 
  X, 
  ArrowRight, 
  Filter,
  Search,
  MoreVertical,
  Archive,
  Trash2,
  Settings,
  ChevronDown,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Gift,
  Shield,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'reminder' | 'update' | 'promotion' | 'system' | 'security' | 'general';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed' | 'processing' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  metadata?: any;
  expiresAt?: Date;
  category?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
}

interface NotificationSystemProps {
  notifications?: Notification[];
  onNotificationRead?: (id: string) => void;
  onNotificationDelete?: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications = [],
  onNotificationRead,
  onNotificationDelete,
  onNotificationAction,
  className = ''
}) => {
  const t = useTranslations('notifications');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Sample notifications if none provided
  const defaultNotifications: Notification[] = [
    {
      id: '1',
      type: 'booking',
      status: 'confirmed',
      priority: 'high',
      title: 'تأكيد الحجز',
      message: 'تم تأكيد حجزك لرحلة العمرة مع مكتب النور للسفر والسياحة',
      timestamp: new Date(),
      isRead: false,
      actionRequired: true,
      actionUrl: '/booking/1',
      senderName: 'مكتب النور للسفر',
      senderAvatar: '/office-avatar.jpg'
    },
    {
      id: '2',
      type: 'payment',
      status: 'completed',
      priority: 'medium',
      title: 'تأكيد الدفع',
      message: 'تم استلام دفعة بقيمة 5000 ريال لحجز رحلة العمرة',
      timestamp: new Date(Date.now() - 3600000),
      isRead: false,
      actionRequired: false,
      senderName: 'نظام الدفع',
    },
    {
      id: '3',
      type: 'message',
      status: 'pending',
      priority: 'medium',
      title: 'رسالة جديدة',
      message: 'لديك رسالة جديدة من مكتب الحرمين للسفر والسياحة',
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      actionRequired: true,
      actionUrl: '/chat/office-123',
      senderName: 'مكتب الحرمين',
      senderAvatar: '/office-avatar-2.jpg'
    },
    {
      id: '4',
      type: 'reminder',
      status: 'pending',
      priority: 'high',
      title: 'تذكير مهم',
      message: 'موعد إجراءات السفر غداً في الساعة 10:00 صباحاً',
      timestamp: new Date(Date.now() - 86400000),
      isRead: false,
      actionRequired: true,
      expiresAt: new Date(Date.now() + 86400000),
      senderName: 'نظام التذكيرات'
    },
    {
      id: '5',
      type: 'promotion',
      status: 'pending',
      priority: 'low',
      title: 'عرض خاص',
      message: 'خصم 20% على باقات العمرة الفاخرة لفترة محدودة',
      timestamp: new Date(Date.now() - 172800000),
      isRead: true,
      actionRequired: false,
      expiresAt: new Date(Date.now() + 604800000),
      senderName: 'قسم التسويق'
    }
  ];

  const allNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  const getNotificationIcon = (type: string, status: string, priority: string) => {
    const iconClass = `w-5 h-5 ${priority === 'urgent' ? 'text-red-500' : 
                                   priority === 'high' ? 'text-orange-500' : 
                                   priority === 'medium' ? 'text-blue-500' : 
                                   'text-gray-500'}`;

    switch (type) {
      case 'booking':
        return status === 'confirmed' ? (
          <Check className={iconClass} />
        ) : status === 'cancelled' ? (
          <X className={iconClass} />
        ) : (
          <Clock className={iconClass} />
        );
      case 'payment':
        return <CreditCard className={iconClass} />;
      case 'message':
        return <MessageSquare className={iconClass} />;
      case 'reminder':
        return <Clock className={iconClass} />;
      case 'update':
        return <Info className={iconClass} />;
      case 'promotion':
        return <Gift className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      case 'security':
        return <Shield className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      completed: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      failed: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      processing: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={`text-xs ${config.color}`}>
        {t(`status.${status}`)}
      </Badge>
    );
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('timeAgo.now');
    if (diffInMinutes < 60) return t('timeAgo.minutes', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('timeAgo.hours', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('timeAgo.days', { count: diffInDays });
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return t('timeAgo.weeks', { count: diffInWeeks });
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return t('timeAgo.months', { count: diffInMonths });
    
    const diffInYears = Math.floor(diffInDays / 365);
    return t('timeAgo.years', { count: diffInYears });
  };

  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = allNotifications.filter(notification => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (
          !notification.title.toLowerCase().includes(searchLower) &&
          !notification.message.toLowerCase().includes(searchLower) &&
          !notification.senderName?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all') {
        if (filterType === 'unread' && notification.isRead) return false;
        if (filterType === 'read' && !notification.isRead) return false;
        if (filterType !== 'unread' && filterType !== 'read' && notification.type !== filterType) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'type':
          return a.type.localeCompare(b.type);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

    return filtered;
  }, [allNotifications, searchQuery, filterType, sortBy]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onNotificationRead) {
      onNotificationRead(notification.id);
    }

    if (notification.actionUrl && onNotificationAction) {
      onNotificationAction(notification.id, 'view');
    }
  };

  const handleBulkAction = (action: string) => {
    selectedNotifications.forEach(id => {
      switch (action) {
        case 'read':
          onNotificationRead?.(id);
          break;
        case 'delete':
          onNotificationDelete?.(id);
          break;
        case 'archive':
          onNotificationAction?.(id, 'archive');
          break;
      }
    });
    setSelectedNotifications([]);
  };

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredAndSortedNotifications.map(n => n.id);
    setSelectedNotifications(visibleIds);
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            {t('title')}
          </h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="min-w-[20px] h-5">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('filterBy')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                {t('actions.more')}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNotificationAction?.('all', 'markAllRead')}>
                <Check className="w-4 h-4 mr-2" />
                {t('markAllAsRead')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNotificationAction?.('all', 'clearAll')}>
                <Trash2 className="w-4 h-4 mr-2" />
                {t('clearAll')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('filterBy')}</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
                  <SelectItem value="unread">{t('filters.unread')}</SelectItem>
                  <SelectItem value="read">{t('filters.read')}</SelectItem>
                  <SelectItem value="booking">{t('types.booking')}</SelectItem>
                  <SelectItem value="payment">{t('types.payment')}</SelectItem>
                  <SelectItem value="message">{t('types.message')}</SelectItem>
                  <SelectItem value="reminder">{t('types.reminder')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('sortBy')}</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('sortOptions.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('sortOptions.oldest')}</SelectItem>
                  <SelectItem value="priority">{t('sortOptions.priority')}</SelectItem>
                  <SelectItem value="type">{t('sortOptions.type')}</SelectItem>
                  <SelectItem value="status">{t('sortOptions.status')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('selectedCount', { count: selectedNotifications.length })}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                <Check className="w-4 h-4 mr-1" />
                {t('markAsRead')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                <Archive className="w-4 h-4 mr-1" />
                {t('actions.archive')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="w-4 h-4 mr-1" />
                {t('actions.delete')}
              </Button>
              <Button size="sm" variant="ghost" onClick={deselectAll}>
                {t('deselectAll')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredAndSortedNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">{t('noNotifications')}</h3>
              <p className="text-gray-500">
                {searchQuery || filterType !== 'all' 
                  ? t('noResultsFound') 
                  : t('allCaughtUp')
                }
              </p>
            </Card>
          ) : (
            filteredAndSortedNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onCheckedChange={() => toggleNotificationSelection(notification.id)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="mt-1">
                    {getNotificationIcon(notification.type, notification.status, notification.priority)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate flex items-center gap-2">
                        {notification.title}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </h4>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(notification.status)}
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {notification.message}
                    </p>

                    {notification.senderName && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{notification.senderName}</span>
                      </div>
                    )}

                    {notification.expiresAt && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                        <Calendar className="w-3 h-3" />
                        <span>ينتهي في {formatTimestamp(notification.expiresAt)}</span>
                      </div>
                    )}

                    {notification.actionRequired && (
                      <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          {t('actions.view')}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="p-1">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onNotificationRead?.(notification.id)}>
                        <Check className="w-4 h-4 mr-2" />
                        {notification.isRead ? t('markAsUnread') : t('markAsRead')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onNotificationAction?.(notification.id, 'archive')}>
                        <Archive className="w-4 h-4 mr-2" />
                        {t('actions.archive')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onNotificationDelete?.(notification.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('deleteNotification')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}; 