'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  MessageCircle, 
  Search, 
  Users, 
  ArrowLeft,
  UserRound,
  Bell,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Services and hooks
import chatService, { Chat } from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ChatListPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const { state: authState } = useAuth();
  const user = authState.user;
  const userType = authState.user?.roles[0] || 'pilgrim';
  const dateLocale = locale === 'ar' ? ar : enUS;
  
  // Get filter from URL
  const filterParam = searchParams?.get('filter');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(filterParam === 'unread' ? 'unread' : 'all');

  // Load chats
  useEffect(() => {
    async function loadChats() {
      if (typeof window === 'undefined' || !user) return;
    
      const token = getAuthToken();
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      } 

      setIsLoading(true);
      try {
        const response = await chatService.getChats(token, userType);
        if (response.success && response.data) {
          setChats(response.data);
        } else {
          toast.error(t('error_loading_chats'));
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        toast.error(t('error_loading_chats'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadChats();
  }, [user, userType, locale, router, t]);

  // Filter chats based on search and tab
  const filteredChats = chats.filter(chat => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.last_message?.message?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return matchesSearch && (chat.unread_count || 0) > 0;
    if (activeTab === 'groups') return matchesSearch && chat.is_group;
    
    return matchesSearch;
  });

  const handleChatSelect = (chat: Chat) => {
    router.push(`/${locale}/umrahoffices/dashboard/chats/${chat.id}`);
  };

  const goBack = () => {
    router.push(`/${locale}/umrahoffices/dashboard/chats`);
  };

  // Render loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getTotalUnreadCount = () => {
    return chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('chats')}</h1>
            <p className="text-sm text-muted-foreground">
              {getTotalUnreadCount() > 0 ? 
                t('unread_count', { count: getTotalUnreadCount() }) : 
                t('all_messages_read')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex items-center gap-2"
            onClick={() => router.push(`/${locale}/umrahoffices/dashboard/chats/new`)}
          >
            <MessageCircle className="h-4 w-4" />
            {t('new_chat')}
          </Button>
          <Button 
            variant="default" 
            size="icon"
            className="md:hidden"
            onClick={() => router.push(`/${locale}/umrahoffices/dashboard/chats/new`)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab('all')}>
                {t('all')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('unread')}>
                {t('unread')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('groups')}>
                {t('groups')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className=" dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('search_chats')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Tabs for desktop */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-2">
              <TabsList className="w-full bg-gray-100 dark:bg-gray-900 p-1">
                <TabsTrigger value="all" className="flex-1 data-[state=active]: dark:data-[state=active]:bg-gray-800">
                  {t('all')}
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 data-[state=active]: dark:data-[state=active]:bg-gray-800">
                  {t('unread')}
                  {getTotalUnreadCount() > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {getTotalUnreadCount()}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex-1 data-[state=active]: dark:data-[state=active]:bg-gray-800">
                  {t('groups')}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <ScrollArea className="h-[calc(100vh-240px)]">
              <TabsContent value={activeTab} className="m-0 p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-1">{t('no_chats_found')}</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {activeTab === 'unread' 
                        ? t('no_unread_messages') 
                        : activeTab === 'groups' 
                          ? t('no_group_chats') 
                          : t('no_chats_start_conversation')}
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => router.push(`/${locale}/umrahoffices/dashboard/chats/new`)}
                    >
                      {t('new_chat')}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredChats.map((chat) => (
                      <div 
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={cn(
                          "flex items-center gap-3 p-4 cursor-pointer transition-colors",
                          "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                          (chat.unread_count || 0) > 0 && "bg-blue-50/50 dark:bg-blue-900/10"
                        )}
                      >
                        {chat.is_group ? (
                          <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                            <AvatarFallback className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                              <Users className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                            <AvatarImage src={chat.recipient?.profile_photo_path} />
                            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {getInitials(chat.recipient?.name || chat.title)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={cn(
                              "font-medium truncate",
                              (chat.unread_count || 0) > 0 && "font-semibold"
                            )}>
                              {chat.title || chat.recipient?.name || t('unnamed_chat')}
                            </h3>
                            <div className="flex items-center">
                              {(chat.unread_count || 0) > 0 && (
                                <span className="flex items-center justify-center h-5 min-w-5 px-1.5 mr-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                  {chat.unread_count}
                                </span>
                              )}
                              {chat.last_message && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDistanceToNow(new Date(chat.last_message.created_at), {
                                    addSuffix: false,
                                    locale: dateLocale
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className={cn(
                              "text-sm text-muted-foreground truncate",
                              (chat.unread_count || 0) > 0 && "text-gray-900 dark:text-gray-100"
                            )}>
                              {chat.last_message ? (
                                <>
                                  {chat.is_group && chat.last_message.sender_id !== user.id && (
                                    <span className="font-medium">
                                      {chat.last_message.sender?.name?.split(' ')[0]}: 
                                    </span>
                                  )}{' '}
                                  {chat.last_message.message}
                                </>
                              ) : (
                                <span className="italic">{t('no_messages')}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Chat list for mobile (no tabs UI) */}
        <div className="md:hidden">
          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">{t('no_chats_found')}</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {activeTab === 'unread' 
                    ? t('no_unread_messages') 
                    : activeTab === 'groups' 
                      ? t('no_group_chats') 
                      : t('no_chats_start_conversation')}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push(`/${locale}/umrahoffices/dashboard/chats/new`)}
                >
                  {t('new_chat')}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredChats.map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className={cn(
                      "flex items-center gap-3 p-4 cursor-pointer transition-colors",
                      "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                      (chat.unread_count || 0) > 0 && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    {chat.is_group ? (
                      <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                        <AvatarFallback className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                          <Users className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700">
                        <AvatarImage src={chat.recipient?.profile_photo_path} />
                        <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {getInitials(chat.recipient?.name || chat.title)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={cn(
                          "font-medium truncate",
                          (chat.unread_count || 0) > 0 && "font-semibold"
                        )}>
                          {chat.title || chat.recipient?.name || t('unnamed_chat')}
                        </h3>
                        <div className="flex items-center">
                          {(chat.unread_count || 0) > 0 && (
                            <span className="flex items-center justify-center h-5 min-w-5 px-1.5 mr-2 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                              {chat.unread_count}
                            </span>
                          )}
                          {chat.last_message && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(chat.last_message.created_at), {
                                addSuffix: false,
                                locale: dateLocale
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className={cn(
                          "text-sm text-muted-foreground truncate",
                          (chat.unread_count || 0) > 0 && "text-gray-900 dark:text-gray-100"
                        )}>
                          {chat.last_message ? (
                            <>
                              {chat.is_group && chat.last_message.sender_id !== user.id && (
                                <span className="font-medium">
                                  {chat.last_message.sender?.name?.split(' ')[0]}: 
                                </span>
                              )}{' '}
                              {chat.last_message.message}
                            </>
                          ) : (
                            <span className="italic">{t('no_messages')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 