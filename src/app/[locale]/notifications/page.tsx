'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  ChevronLeft, 
  Filter, 
  Search, 
  Trash2, 
  X 
} from 'lucide-react';
import { Notification, useNotifications } from '@/providers/NotificationProvider';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Link from 'next/link';
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
import { toast } from "sonner";

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const router = useRouter();
  
  // Get locale for date formatting
  const locale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'ar' : 'ar';
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
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
    bulkAction,
  } = useNotifications();
  
  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Reset selected notifications when tab changes
  useEffect(() => {
    setSelectedNotifications([]);
    setSelectAll(false);
  }, [activeTab]);
  
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
  
  // Filter notifications based on active tab, selected type, and search term
  const filteredNotifications = notifications
    .filter(notification => {
      // Tab filter
      if (activeTab === 'unread' && notification.read_at) return false;
      if (activeTab !== 'all' && activeTab !== 'unread' && notification.type !== activeTab) return false;
      
      // Type filter
      if (selectedType !== 'all' && notification.type !== selectedType) return false;
      
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = notification.title?.toLowerCase() || '';
        const message = getMessageContent(notification).toLowerCase();
        
        if (!title.includes(searchLower) && !message.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  
  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    switch (selectedSort) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'priority':
        const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return bPriority - aPriority;
      case 'type':
        return (a.type || '').localeCompare(b.type || '');
      case 'status':
        const aRead = a.read_at ? 1 : 0;
        const bRead = b.read_at ? 1 : 0;
        return aRead - bRead;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedNotifications.length / itemsPerPage);
  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    router.push(`/notifications/${notification.id}`);
  };
  
  // Toggle notification selection
  const toggleNotificationSelection = (id: number) => {
    setSelectedNotifications(prev => {
      const isSelected = prev.includes(id);
      
      if (isSelected) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Toggle select all
  const handleToggleSelectAll = () => {
    setSelectAll(!selectAll);
    
    if (!selectAll) {
      // Select all visible notifications
      const allIds = paginatedNotifications.map(notification => notification.id);
      setSelectedNotifications(allIds);
    } else {
      // Deselect all
      setSelectedNotifications([]);
    }
  };
  
  // Handle bulk mark as read
  const handleBulkMarkAsRead = async () => {
    try {
      await bulkAction(selectedNotifications, 'read');
      toast.success(t('success.all_marked_read'));
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      toast.error(t('errors.mark_all_read'));
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await bulkAction(selectedNotifications, 'delete');
      toast.success(t('success.deleted'));
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (error) {
      toast.error(t('errors.delete'));
    }
  };
  
  // Get notification icon based on type and priority
  const getNotificationIcon = (notification: Notification) => {
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
          <div className={`flex-shrink-0 w-10 h-10 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                         flex items-center justify-center ${bgColorClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        );
      
      case 'system':
      case 'system_update':
        return (
          <div className={`flex-shrink-0 w-10 h-10 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                         flex items-center justify-center ${bgColorClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          </div>
        );
      
      case 'booking':
        return (
          <div className={`flex-shrink-0 w-10 h-10 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                         flex items-center justify-center ${bgColorClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <path d="M16 2v4"></path>
              <path d="M8 2v4"></path>
              <path d="M3 10h18"></path>
            </svg>
          </div>
        );
      
      case 'payment':
        return (
          <div className={`flex-shrink-0 w-10 h-10 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                         flex items-center justify-center ${bgColorClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </div>
        );
      
      case 'package':
      case 'hotel':
        return (
          <div className={`flex-shrink-0 w-10 h-10 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                         flex items-center justify-center ${bgColorClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconColorClass}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </div>
        );
      
      default:
        return (
          <div className={`flex-shrink-0 w-10 h-10 mr-2 rtl:ml-2 rtl:mr-0 rounded-full 
                         flex items-center justify-center ${bgColorClass}`}
          >
            <Bell className={`h-5 w-5 ${iconColorClass}`} />
          </div>
        );
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    // Reset selection
    setSelectedNotifications([]);
    setSelectAll(false);
    
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Get available notification types
  const notificationTypes = Array.from(new Set(notifications.map(notification => notification.type)))
    .filter(Boolean)
    .sort();
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('search')}
            className="pl-10 pr-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="md:w-10"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Advanced filters */}
      {showFilters && (
        <div className="mb-4 p-4 border rounded-md bg-card">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">{t('filters.type_label')}</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('filters.type_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all_types')}</SelectItem>
                  {notificationTypes.map(type => (
                    <SelectItem key={type} value={type || ''}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">{t('sortOptions.title')}</label>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger>
                  <SelectValue placeholder={t('sortOptions.title')} />
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
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedType('all');
                setSelectedSort('newest');
                setSearchTerm('');
              }}
            >
              {t('reset_filters')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Selected actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex items-center justify-between bg-primary-foreground p-2 rounded-md mb-4">
          <div className="text-sm font-medium">
            {selectedNotifications.length} {t('selected')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
              <Check className="h-4 w-4 mr-1" /> {t('mark_as_read')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> {t('delete')}
            </Button>
          </div>
        </div>
      )}
      
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
        </TabsList>
      
        {/* Content */}
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeTab === 'all' && t('all_notifications')}
                  {activeTab === 'unread' && t('unreadNotifications')}
                  {activeTab === 'booking' && t('types.bookings')}
                  {activeTab === 'payment' && t('types.payments')}
                  
                  {activeTab === 'unread' && unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount}</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={markAllAsRead}
                    >
                      <CheckCheck className="h-3.5 w-3.5 mr-1" />
                      {t('markAllAsRead')}
                    </Button>
                  )}
                </div>
              </CardTitle>
              <Separator />
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : paginatedNotifications.length === 0 ? (
                <div className="text-center py-16">
                  <BellOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                  <h3 className="text-lg font-medium mb-2">{t('empty.title')}</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    {searchTerm || selectedType !== 'all'
                      ? t('empty.noFilteredResults')
                      : t('empty.description')}
                  </p>
                  {(searchTerm || selectedType !== 'all') && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('all');
                      }}
                    >
                      {t('empty.clearFilters')}
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center px-4 py-2 border-b text-sm text-muted-foreground">
                    <div className="w-6 flex-shrink-0">
                      <Checkbox 
                        checked={selectAll}
                        onCheckedChange={handleToggleSelectAll}
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="pl-2">{t('select_all')}</div>
                      <div>{paginatedNotifications.length} {t('of')} {filteredNotifications.length} {t('showing')}</div>
                    </div>
                  </div>
                  
                  {paginatedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start p-4 border-b last:border-0 hover:bg-accent/10 transition-colors
                                ${!notification.read_at ? 'bg-accent/5' : ''}`}
                    >
                      <div className="w-6 flex-shrink-0 mr-1">
                        <Checkbox 
                          checked={selectedNotifications.includes(notification.id)}
                          onCheckedChange={() => toggleNotificationSelection(notification.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div 
                        className="flex flex-1 items-start cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Notification icon */}
                        {getNotificationIcon(notification)}
                        
                        {/* Notification content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`text-sm font-medium line-clamp-1 ${!notification.read_at ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            
                            {!notification.read_at && (
                              <Badge variant="secondary" className="text-xs ml-2">
                                {t('badges.new')}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                            {getMessageContent(notification)}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs font-normal">
                                {notification.type}
                              </Badge>
                              
                              {notification.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">
                                  {notification.priority}
                                </Badge>
                              )}
                              
                              {notification.priority === 'high' && (
                                    <Badge variant="default" className="text-xs">
                                  {notification.priority}
                                </Badge>
                              )}
                            </div>
                            
                            <time className="text-xs">
                              {timeAgo(notification.created_at)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 flex justify-center border-t">
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
                          
                          {Array.from({ length: totalPages }).map((_, i) => {
                            const page = i + 1;
                            
                            // Show only a limited number of pages
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
                            
                            // Add ellipsis
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <PaginationItem key={page}>
                                  <span className="px-2">...</span>
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
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 