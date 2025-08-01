'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Bell, Check, ChevronDown, Filter, Search, Trash2, X } from 'lucide-react';
import { Notification, useNotifications } from '@/providers/NotificationProvider';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  
  // Get locale for date formatting
  const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'ar' : 'ar';
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    period: 'all',
  });
  
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
    deleteAllNotifications,
    bulkAction
  } = useNotifications();
  
  // Format date based on locale
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPp', { locale: locale === 'ar' ? ar : enUS });
    } catch (error) {
      return dateString;
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
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Get message content (handles different field names)
  const getMessageContent = (notification: Notification): string => {
    return notification.message || notification.body || notification.content || '';
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
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
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      
      case 'system':
      case 'system_update':
        return (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
        );
      
      case 'booking':
        return (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M3 10h18"></path>
            </svg>
          </div>
        );
      
      case 'payment':
        return (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
        );
        
      case 'package':
      case 'hotel':
        return (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
        );
      
      default:
        return (
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass}`}>
            <Bell className={`h-5 w-5 ${iconColorClass}`} />
          </div>
        );
    }
  };
  
  // Get priority badge component
  const getPriorityBadge = (priority = 'normal') => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">{t('priorities.urgent')}</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-amber-500">{t('priorities.high')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('priorities.low')}</Badge>;
      default:
        return <Badge variant="outline">{t('priorities.normal')}</Badge>;
    }
  };
  
  // Get category badge component
  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'chat':
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">{t('categories.chat')}</Badge>;
      case 'payment':
        return <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">{t('categories.payment')}</Badge>;
      case 'system':
        return <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50">{t('categories.system')}</Badge>;
      case 'package':
        return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">{t('categories.package')}</Badge>;
      case 'hotel':
        return <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">{t('categories.hotel')}</Badge>;
      case 'booking':
        return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">{t('categories.booking')}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
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
    if (selectedIds.length === paginatedNotifications.length) {
      // If all are selected, unselect all
      setSelectedIds([]);
    } else {
      // Otherwise, select all visible
      setSelectedIds(paginatedNotifications.map(n => n.id));
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
  
  // Reset all filters
  const resetFilters = () => {
    setActiveTab('all');
    setSearchTerm('');
    setFilters({
      type: 'all',
      priority: 'all',
      period: 'all'
    });
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      
      {/* Filters row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        {/* Search */}
        <div className="relative md:col-span-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-9 pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Category filter */}
        <div className="md:col-span-2">
          <Select 
            value={filters.type} 
            onValueChange={(value) => {
              setFilters({...filters, type: value});
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('categories.title')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="payment">{t('categories.payment')}</SelectItem>
              <SelectItem value="system">{t('categories.system')}</SelectItem>
              <SelectItem value="chat">{t('categories.chat')}</SelectItem>
              <SelectItem value="package">{t('categories.package')}</SelectItem>
              <SelectItem value="hotel">{t('categories.hotel')}</SelectItem>
              <SelectItem value="booking">{t('categories.booking')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Priority filter */}
        <div className="md:col-span-2">
          <Select 
            value={filters.priority} 
            onValueChange={(value) => {
              setFilters({...filters, priority: value});
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('priorities.title')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="urgent">{t('priorities.urgent')}</SelectItem>
              <SelectItem value="high">{t('priorities.high')}</SelectItem>
              <SelectItem value="normal">{t('priorities.normal')}</SelectItem>
              <SelectItem value="low">{t('priorities.low')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Time period filter */}
        <div className="md:col-span-2">
          <Select 
            value={filters.period} 
            onValueChange={(value) => {
              setFilters({...filters, period: value});
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.all')}</SelectItem>
              <SelectItem value="today">{t('filters.today')}</SelectItem>
              <SelectItem value="thisWeek">{t('filters.thisWeek')}</SelectItem>
              <SelectItem value="thisMonth">{t('filters.thisMonth')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2 md:col-span-2 justify-end">
          <Button variant="outline" size="icon" onClick={fetchNotifications} title={t('refresh')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
          </Button>
          <Button variant="outline" size="icon" onClick={resetFilters} title={t('resetFilters')}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={markAllAsRead} title={t('markAllAsRead')}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setCurrentPage(1);
      }}>
        <TabsList className="mb-4 w-full">
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
          <TabsTrigger value="booking" className="flex-1">
            {t('types.bookings')}
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex-1">
            {t('types.payments')}
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1">
            {t('types.chat_messages')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <Card className="mb-4 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">
                {t('bulkActions.selectedCount', { count: selectedIds.length })}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('read')}>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {t('bulkActions.markSelectedAsRead')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  {t('bulkActions.deleteSelected')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Content */}
      <TabsContent value={activeTab} className="mt-0">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex items-center gap-2 pt-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="mx-auto rounded-full w-20 h-20 flex items-center justify-center bg-muted mb-4">
                <Bell className="h-10 w-10 text-muted-foreground opacity-40" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {searchTerm || filters.type !== 'all' || filters.priority !== 'all' || filters.period !== 'all'
                  ? t('empty.noFilteredResults')
                  : t('empty.description')}
              </p>
              {(searchTerm || filters.type !== 'all' || filters.priority !== 'all' || filters.period !== 'all') && (
                <Button variant="outline" onClick={resetFilters}>
                  {t('empty.clearFilters')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            {/* Selection header */}
            <div className="border-b p-3">
              <div className="flex items-center">
                <Checkbox 
                  checked={paginatedNotifications.length > 0 && selectedIds.length === paginatedNotifications.length}
                  onCheckedChange={toggleSelectAll}
                  className="mr-3"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length > 0 
                    ? `${selectedIds.length}/${paginatedNotifications.length}` 
                    : t('select_all')}
                </span>
              </div>
            </div>
            
            {/* Notification list */}
            <CardContent className="p-0">
              {paginatedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-5 border-b last:border-0 hover:bg-accent/10 transition-colors cursor-pointer
                            ${!notification.read_at ? 'bg-accent/5' : ''}
                            ${selectedIds.includes(notification.id) ? 'bg-accent/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Selection checkbox */}
                  <div 
                    className="flex-shrink-0 mr-3 rtl:ml-3 rtl:mr-0" 
                    onClick={(e) => toggleSelect(notification.id, e)}
                  >
                    <Checkbox 
                      checked={selectedIds.includes(notification.id)}
                      onCheckedChange={() => {}}
                    />
                  </div>
                  
                  {/* Notification icon */}
                  <div className="flex-shrink-0 mr-4 rtl:ml-4 rtl:mr-0">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  {/* Notification content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-base font-medium line-clamp-1">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {!notification.read_at && (
                          <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-70 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {getMessageContent(notification)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {getCategoryBadge(notification.type)}
                        {notification.priority && getPriorityBadge(notification.priority)}
                      </div>
                      <time className="text-muted-foreground text-xs">
                        {formatDate(notification.created_at)}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <CardFooter className="border-t p-3 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                >
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {/* Generate pagination items */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      
                      // Show first page, last page, and pages around current page
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Show ellipsis for skipped pages
                      if (page === 2 || page === totalPages - 1) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </CardFooter>
            )}
          </Card>
        )}
      </TabsContent>
    </div>
  );
} 