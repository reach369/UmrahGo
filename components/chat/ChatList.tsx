'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import { Chat as ChatType } from '@/services/chat.service';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// UI Components
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  MessageSquare, 
  Search, 
  Users, 
  User,
  Bell, 
  Filter, 
  PlusCircle, 
  RefreshCw, 
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';

// Types
type ChatListProps = {
  chats: ChatType[];
  activeChatId?: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateNewChat: () => void;
  isLoading?: boolean;
  showSearch?: boolean;
  showNewChatButton?: boolean;
  className?: string;
  showError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

/**
 * ChatList component
 * Displays a list of chats with search, filtering and error handling
 */
export function ChatList({
  chats = [],
  activeChatId,
  onSelectChat,
  onCreateNewChat,
  isLoading = false,
  showSearch = true,
  showNewChatButton = true,
  className = '',
  showError = false,
  errorMessage = '',
  onRetry
}: ChatListProps) {
  const t = useTranslations('chat');
  const { state: authState } = useAuth();
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  
  const dateLocale = locale === 'ar' ? ar : enUS;
  
  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups' | 'direct'>('all');
  
  // Get current user ID
  const currentUserId = authState.user?.id;
  
  // Filter and search chats
  const filteredChats = chats.filter(chat => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      
      // Search in chat title
      if (chat.title?.toLowerCase().includes(query)) return true;
      
      // Search in participants
      const hasMatchingParticipant = chat.participants?.some(participant => 
        participant.name?.toLowerCase().includes(query)
      );
      if (hasMatchingParticipant) return true;
      
      // Search in last message
      if (chat.last_message?.message?.toLowerCase().includes(query)) return true;
      
      return false;
    }
    
    // Apply type filters
    if (filterType === 'unread') {
      return (chat.unread_count || 0) > 0;
    }
    
    if (filterType === 'groups') {
      return chat.is_group;
    }
    
    if (filterType === 'direct') {
        return !(chat.is_group);
    }
    
    return true;
  });

  // Format chat time
  const formatChatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: dateLocale });
      }
      
      if (isYesterday(date)) {
        return t('yesterday', { default: 'Yesterday' });
      }
      
      if (date.getFullYear() === new Date().getFullYear()) {
        return format(date, 'dd MMM', { locale: dateLocale });
      }
      
      return format(date, 'dd/MM/yyyy', { locale: dateLocale });
    } catch (error) {
      return '';
    }
  };
  
  // Get chat title and avatar
  const getChatInfo = (chat: ChatType) => {
    if (chat.is_group) {
      return {
        title: chat.title || t('group_chat'),
        subtitle: chat.last_message?.message || '',
        avatar: null,
        isGroup: true
      };
    }
    
    // Find the other participant (not current user)
    const otherParticipant = chat.participants?.find(participant => 
      participant.user_id?.toString() !== currentUserId?.toString()
    );
    
    if (otherParticipant) {
      return {
        title: otherParticipant.name || chat.title || t('conversation'),
        subtitle: chat.last_message?.message || '',
        avatar: otherParticipant.profile_photo_path || 
               null,
        isGroup: false
      };
    }
    
    return {
      title: chat.title || t('conversation'),
      subtitle: chat.last_message?.message || '',
      avatar: null,
      isGroup: false
    };
  };
  
  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={cn("flex flex-col h-full bg-card/50 border-border", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              {t('title')}
            </h1>
            <Badge variant="secondary" className="text-xs">
              {chats.reduce((count, chat) => count + (chat.unread_count || 0), 0)}
            </Badge>
          </div>
          
          {showNewChatButton && (
            <Button 
              variant="secondary"
              size="sm"
              onClick={onCreateNewChat}
              className="gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('newChat')}</span>
            </Button>
          )}
        </div>
      
        {/* Search Input */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchChats')}
              className="pl-9 pr-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full p-0"
                onClick={handleClearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        
        {/* Filter Tabs */}
        <Tabs 
          defaultValue="all"
          value={filterType}
          onValueChange={(value) => setFilterType(value as any)}
          className="mt-2"
        >
          <TabsList className="w-full grid grid-cols-4 h-8">
            <TabsTrigger value="all" className="text-xs">
              {t('filter.all')}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              {t('filter.unread')}
            </TabsTrigger>
            <TabsTrigger value="groups" className="text-xs">
              {t('filter.groups')}
            </TabsTrigger>
            <TabsTrigger value="direct" className="text-xs">
              {t('filter.private')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Error Message */}
      {showError && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/20 text-destructive flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{errorMessage || t('load_error')}</span>
          </div>
          {onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRetry}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('loading')}
            </p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-medium text-foreground">
              {searchQuery ? 
                t('noSearchResults') : 
                t('noChats')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {searchQuery ? 
                t('tryDifferentSearch') : 
                t('startNewConversation')}
            </p>
            {!searchQuery && showNewChatButton && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onCreateNewChat}
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                {t('newChat')}
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => {
              const { title, subtitle, avatar, isGroup } = getChatInfo(chat);
              const lastMessageTime = chat.last_message?.created_at || chat.updated_at || chat.created_at;
              const formattedTime = lastMessageTime ? formatChatTime(lastMessageTime) : '';
              const isActive = chat.id.toString() === activeChatId;
              const hasUnread = (chat.unread_count || 0) > 0;
              
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-md cursor-pointer",
                    isActive ? "bg-primary/10" : "hover:bg-muted",
                    hasUnread && !isActive && "bg-muted"
                  )}
                  onClick={() => onSelectChat(chat.id.toString())}
                >
                  <Avatar className={cn(
                    "flex-shrink-0",
                    hasUnread && "ring-2 ring-primary"
                  )}>
                    <AvatarImage src={avatar || undefined} />
                    <AvatarFallback className={cn(
                      "text-xs bg-primary/10 text-primary",
                      isGroup ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
                    )}>
                      {isGroup ? <Users className="h-4 w-4" /> : title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "font-medium truncate",
                          hasUnread && "font-semibold"
                        )}>
                          {title}
                        </span>
                        {isGroup && (
                          <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            {t('group_chat', { default: 'Group' })}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap pl-1">
                        {formattedTime}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "text-xs truncate text-muted-foreground",
                        hasUnread && "text-foreground"
                      )}>
                        {subtitle || t('no_messages', { default: 'No messages yet' })}
                      </p>
                      {hasUnread && (
                        <Badge 
                          variant="default" 
                          className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                        >
                          {chat.unread_count || 0}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 