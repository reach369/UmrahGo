'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Bell, Check, Trash2, RefreshCw, Filter, X } from 'lucide-react';
import { Notification, useNotifications } from '@/providers/NotificationProvider';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface NotificationCenterProps {
  maxHeight?: string;
  showHeader?: boolean;
  maxItems?: number;
  onClose?: () => void;
  allowFiltering?: boolean;
  allowSelection?: boolean;
  showEmpty?: boolean;
  compact?: boolean;
}

export function NotificationCenter({
  maxHeight = '400px',
  showHeader = true,
  maxItems = 50,
  onClose,
  allowFiltering = true,
  allowSelection = true,
  showEmpty = true,
  compact = false,
}: NotificationCenterProps) {
  // Translations
  const t = useTranslations('notifications');
  const router = useRouter();
  
  // Locale detection for date formatting
  const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'ar' : 'ar';
  
  // Get notifications from context
  const { 
    notifications,
    unreadCount,
    loading, 
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkAction
  } = useNotifications();
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    period: 'all',
  });
  
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
  
  // Get notification icon based on type and priority
  const getNotificationIcon = (notification: Notification) => {
    const { type, priority = 'normal' } = notification;
    
    let bgColorClass = 'bg-primary-foreground';
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
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      
      case 'system':
      case 'system_update':
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
        );
      
      case 'booking':
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M3 10h18"></path>
            </svg>
          </div>
        );
      
      case 'payment':
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
        );
        
      case 'package':
      case 'hotel':
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
        );
      
      default:
        return (
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColorClass}`}>
            <Bell className={`h-4 w-4 ${iconColorClass}`} />
          </div>
        );
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification data
    const url = notification.action_url || notification.link || getNotificationUrl(notification);
    if (url) {
      router.push(url);
      if (onClose) onClose();
    }
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
  
  // Handle bulk actions
  const handleBulkAction = (action: 'read' | 'unread' | 'delete') => {
    if (selectedIds.length === 0) return;
    
    bulkAction(selectedIds, action);
    setSelectedIds([]);
  };
  
  // Toggle selection of all visible notifications
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      // If all are selected, unselect all
      setSelectedIds([]);
    } else {
      // Otherwise, select all visible
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };
  
  // Toggle selection of a single notification
  const toggleSelect = (id: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  // Filter notifications based on active tab, search term, and filters
  const filteredNotifications = notifications.filter(notification => {
    // Tab filter
    if (activeTab === 'unread' && notification.read_at) return false;
    if (activeTab !== 'all' && activeTab !== 'unread' && notification.type !== activeTab) return false;
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const title = notification.title?.toLowerCase() || '';
      const message = (notification.message || notification.body || notification.content || '')?.toLowerCase();
      
      if (!title.includes(searchLower) && !message.includes(searchLower)) {
        return false;
      }
    }
    
    // Type filter
    if (filters.type !== 'all' && notification.type !== filters.type) return false;
    
    // Priority filter
    if (filters.priority !== 'all' && notification.priority !== filters.priority) return false;
    
    // Time period filter
    if (filters.period !== 'all') {
      const date = new Date(notification.created_at);
      const now = new Date();
      
      if (filters.period === 'today') {
        // Today filter
        if (date.getDate() !== now.getDate() || 
            date.getMonth() !== now.getMonth() || 
            date.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (filters.period === 'thisWeek') {
        // This week filter (last 7 days)
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        
        if (date < weekAgo) return false;
      } else if (filters.period === 'thisMonth') {
        // This month filter
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        
        if (date < monthAgo) return false;
      }
    }
    
    return true;
  });
  
  // Message extraction helper (handles different field names)
  const getMessageContent = (notification: Notification): string => {
    return notification.message || notification.body || notification.content || '';
  };
  
  // Render notification content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">{error.message}</p>
          <Button variant="outline" size="sm" onClick={fetchNotifications} className="mt-2">
            {t('retry')}
          </Button>
        </div>
      );
    }
    
    if (filteredNotifications.length === 0) {
      // No notifications message
      if (!showEmpty) return null;
      
      const isFiltered = searchTerm || 
        activeTab !== 'all' || 
        filters.type !== 'all' || 
        filters.priority !== 'all' || 
        filters.period !== 'all';
      
      return (
        <div className="p-8 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          {isFiltered ? (
            <>
              <p className="text-muted-foreground">{t('empty.noFilteredResults')}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setActiveTab('all');
                  setSearchTerm('');
                  setFilters({ type: 'all', priority: 'all', period: 'all' });
                }}
              >
                {t('empty.clearFilters')}
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">{t('empty.description')}</p>
          )}
        </div>
      );
    }
    
    // Render notification list
    return (
      <div>
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start p-4 hover:bg-accent cursor-pointer border-b last:border-b-0 
                      ${!notification.read_at ? 'bg-accent/20' : ''} 
                      ${selectedIds.includes(notification.id) ? 'bg-accent/40' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            {/* Selection checkbox */}
            {allowSelection && (
              <div 
                className="flex-shrink-0 mr-2 rtl:ml-2 rtl:mr-0" 
                onClick={(e) => toggleSelect(notification.id, e)}
              >
                <Checkbox 
                  checked={selectedIds.includes(notification.id)}
                  onCheckedChange={() => {}}
                />
              </div>
            )}
            
            {/* Notification icon */}
            <div className="flex-shrink-0 mr-3 rtl:ml-3 rtl:mr-0">
              {getNotificationIcon(notification)}
            </div>
            
            {/* Notification content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-sm font-semibold line-clamp-1 flex-1">
                  {notification.title}
                </h4>
                
                {/* Actions and status */}
                <div className="flex items-center gap-1">
                  {!notification.read_at && (
                    <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Message body (if not compact) */}
              {!compact && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                  {getMessageContent(notification)}
                </p>
              )}
              
              {/* Time and metadata */}
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{timeAgo(notification.created_at)}</span>
                
                {/* Type badge (if not compact) */}
                {!compact && notification.type && (
                  <Badge variant="outline" className="text-xs">
                    {notification.type}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="border shadow-md overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            <h3 className="text-lg font-medium">{t('title')}</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="mr-2 rtl:ml-2 rtl:mr-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {/* Header actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={fetchNotifications} 
              title={t('refresh')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={markAllAsRead} 
              title={t('markAllAsRead')}
            >
              <Check className="h-4 w-4" />
            </Button>
            
            {/* Filter dropdown */}
            {allowFiltering && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" title={t('filters.title')}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Filter options */}
                  <div className="p-2">
                    <h4 className="font-medium mb-1">{t('filters.type')}</h4>
                    <Select 
                      value={filters.type} 
                      onValueChange={(value) => setFilters({...filters, type: value})}
                    >
                      <SelectTrigger className="mb-2">
                        <SelectValue placeholder={t('filters.all')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('filters.all')}</SelectItem>
                        <SelectItem value="chat">{t('categories.chat')}</SelectItem>
                        <SelectItem value="booking">{t('categories.booking')}</SelectItem>
                        <SelectItem value="payment">{t('categories.payment')}</SelectItem>
                        <SelectItem value="system">{t('categories.system')}</SelectItem>
                        <SelectItem value="package">{t('categories.package')}</SelectItem>
                        <SelectItem value="hotel">{t('categories.hotel')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <h4 className="font-medium mb-1">{t('priorities.title')}</h4>
                    <Select 
                      value={filters.priority} 
                      onValueChange={(value) => setFilters({...filters, priority: value})}
                    >
                      <SelectTrigger className="mb-2">
                        <SelectValue placeholder={t('filters.all')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('filters.all')}</SelectItem>
                        <SelectItem value="urgent">{t('priorities.urgent')}</SelectItem>
                        <SelectItem value="high">{t('priorities.high')}</SelectItem>
                        <SelectItem value="normal">{t('priorities.normal')}</SelectItem>
                        <SelectItem value="low">{t('priorities.low')}</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <h4 className="font-medium mb-1">{t('filters.period')}</h4>
                    <Select 
                      value={filters.period} 
                      onValueChange={(value) => setFilters({...filters, period: value})}
                    >
                      <SelectTrigger className="mb-2">
                        <SelectValue placeholder={t('filters.all')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('filters.all')}</SelectItem>
                        <SelectItem value="today">{t('filters.today')}</SelectItem>
                        <SelectItem value="thisWeek">{t('filters.thisWeek')}</SelectItem>
                        <SelectItem value="thisMonth">{t('filters.thisMonth')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}
      
      {/* Search input (if filtering is allowed) */}
      {allowFiltering && (
        <div className="p-2 border-b">
          <div className="relative">
            <Input
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-8"
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Bulk actions (if selection is allowed) */}
      {allowSelection && selectedIds.length > 0 && (
        <div className="p-2 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {t('bulkActions.selectedCount', { count: selectedIds.length })}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('read')}>
                <Check className="h-3 w-3 mr-1" /> {t('markAsRead')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="h-3 w-3 mr-1" /> {t('delete')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab selector */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="p-1 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              {t('filters.all')}
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              {t('filters.unread')}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">
              {t('categories.chat')}
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Selection header (if selection is allowed) */}
        {allowSelection && filteredNotifications.length > 0 && (
          <div className="p-2 border-b flex items-center">
            <Checkbox 
              checked={selectedIds.length > 0 && selectedIds.length === filteredNotifications.length}
              onCheckedChange={toggleSelectAll}
              className="mr-2"
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.length > 0 
                ? `${selectedIds.length}/${filteredNotifications.length}` 
                : t('select_all')}
            </span>
          </div>
        )}
        
        {/* Notification content */}
        <TabsContent value={activeTab} className="m-0">
          <ScrollArea style={{ height: maxHeight }} className="p-0">
            {renderContent()}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 