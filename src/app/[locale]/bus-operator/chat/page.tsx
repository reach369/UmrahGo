'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MessageSquare, Search, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Components
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// Services & Hooks
import { useAuth } from '@/contexts/AuthContext';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import chatService, { Chat, ChatMessage } from '@/services/chat.service';
import { getAuthToken, getUserFromAuthContext } from '@/lib/auth.service';

// Types
interface PilgrimChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  unreadCount?: number;
}

function PilgrimChatListItem({ chat, isSelected, onClick, unreadCount = 0 }: PilgrimChatListItemProps) {
  const locale = useLocale();

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS
    });
  };

  const getLastMessageText = () => {
    if (!chat.last_message) return 'لا توجد رسائل';
    
    switch (chat.last_message.type) {
      case 'image':
        return '📷 صورة';
      case 'file':
        return '📎 ملف';
      case 'audio':
        return '🎤 رسالة صوتية';
      default:
        return chat.last_message.message || 'رسالة';
    }
  };

  const getChatTypeIcon = () => {
    if (chat.type === 'group' || chat.is_group) {
      return '👥';
    }
    return '💬';
  };

  const getParticipantInfo = () => {
    if (chat.type === 'group' || chat.is_group) {
      return `${chat.participants?.length || 0} مشاركين`;
    }
    
    // For private chats, show the other participant's name
    const otherParticipant = chat.participants?.find(p => 
      p.user && p.user.id?.toString() !== getUserFromAuthContext()?.id?.toString()
    );
    
    return otherParticipant?.user?.name || chat.title || 'محادثة خاصة';
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 cursor-pointer transition-colors border-b hover:bg-muted/50",
        isSelected ? "bg-primary/10 border-r-4 border-r-primary" : ""
      )}
      onClick={onClick}
    >
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage 
          src={chat.participants?.[0]?.user ? chatService.getAvatarUrl(chat.participants[0].user) : undefined} 
        />
        <AvatarFallback>
          {getChatTypeIcon()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-sm truncate">
            {getParticipantInfo()}
          </h3>
          {chat.last_message?.created_at && (
            <span className="text-xs text-muted-foreground">
              {formatTime(chat.last_message.created_at)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {getLastMessageText()}
          </p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PilgrimChatPage() {
  const { state: authState } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // Get auth info from AuthContext
  const { user, isLoading: authLoading } = authState;
  const isAuthenticated = !!user && !authLoading;
  const userType = 'pilgrim';

  // Initialize WebSocket connection
  const { 
    connectionStatus,
    sendMessage: sendWebSocketMessage,
    sendTypingIndicator,
    markAsRead,
    unreadCount: wsUnreadCount
  } = useChatWebSocket({
    chatId: selectedChatId || undefined,
    userType: 'pilgrim',
    onNewMessage: (message) => {
      // Update chat list when new message arrives
      setChats(prev => prev.map(chat => {
        if (chat.id.toString() === message.chat_id?.toString()) {
          // Create a properly typed last_message
          const lastMessage: ChatMessage = {
            id: typeof message.id === 'string' ? parseInt(message.id) : message.id,
            chat_id: typeof message.chat_id === 'string' ? parseInt(message.chat_id) : message.chat_id || 0,
            user_id: typeof message.user_id === 'string' ? parseInt(message.user_id) : message.user_id || 0,
            sender_id: typeof message.sender_id === 'string' ? parseInt(message.sender_id) : message.sender_id || 0,
            sender: {
              id: typeof message.user_id === 'string' ? parseInt(message.user_id) : message.user_id || 0,
              name: message.sender_name || 'Unknown',
              email: '',
              avatar: message.sender_avatar,
              profile_photo: message.sender_avatar,
              profile_photo_path: message.sender_avatar
            },
            message: message.message || message.content || '',
            type: message.type as 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system' || 'text',
            status: message.status || 'sent',
            attachments: [],
            attachment: undefined,
            mentions: [],
            metadata: {},
            is_edited: false,
            edited_at: undefined,
            is_deleted: false,
            read_at: undefined,
            reply_to_id: undefined,
            created_at: message.created_at || message.sent_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          return {
            ...chat,
            last_message: lastMessage,
            unread_count: chat.id.toString() === selectedChatId ? 0 : (chat.unread_count || 0) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return chat;
      }));
    }
  });

  // Get token from AuthContext compatible source
  const getToken = useCallback(() => {
    return getAuthToken();
  }, []);

  // Load chats
  const loadChats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingChats(true);
      const token = getToken();
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const userChats = await chatService.getChats(token, userType);
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error(t('pilgrim.chat_load_error'));
    } finally {
      setIsLoadingChats(false);
    }
  }, [isAuthenticated, getToken, userType, t]);

  // Handle chat selection
  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobileView) {
      setShowChatList(false);
    }
  }, [isMobileView]);

  // Filter chats based on search
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    const title = chat.title?.toLowerCase() || '';
    const lastMessage = chat.last_message?.message?.toLowerCase() || '';
    
    return title.includes(searchTerm) || lastMessage.includes(searchTerm);
  });

  // Handle mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Load chats on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated, loadChats]);

  // Handle URL parameters
  useEffect(() => {
    const chatId = searchParams?.get('id');
    if (chatId) {
      setSelectedChatId(chatId);
      if (isMobileView) {
        setShowChatList(false);
      }
    }
  }, [searchParams, isMobileView]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Chat List Sidebar */}
      <div className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        isMobileView && !showChatList ? "w-0 overflow-hidden" : "w-full md:w-96"
      )}>
        {/* Header */}
        <div className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">{t('pilgrim.chat_title')}</h1>
              {wsUnreadCount > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {wsUnreadCount > 99 ? '99+' : wsUnreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter userType="pilgrim" />
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsNewChatOpen(true)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('pilgrim.search_chats')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Connection Status */}
          {connectionStatus !== 'connected' && (
            <div className={cn(
              "mt-2 px-3 py-1 rounded text-xs font-medium text-center",
              connectionStatus === 'connecting' 
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                : connectionStatus === 'error'
                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
            )}>
              {connectionStatus === 'connecting' && (
                <>
                  <Loader2 className="inline-block w-3 h-3 mr-1 animate-spin" />
                  {t('chat.connecting')}
                </>
              )}
              {connectionStatus === 'error' && t('chat.connection_error')}
              {connectionStatus === 'reconnecting' && (
                <>
                  <Loader2 className="inline-block w-3 h-3 mr-1 animate-spin" />
                  {t('chat.reconnecting')}
                </>
              )}
            </div>
          )}
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {isLoadingChats ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? t('pilgrim.no_chats_found') : t('pilgrim.no_chats')}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredChats.map((chat) => (
                <PilgrimChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={chat.id.toString() === selectedChatId}
                  onClick={() => handleChatSelect(chat.id.toString())}
                  unreadCount={chat.unread_count}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <UnifiedChatContainer
            chatId={selectedChatId}
            userType="pilgrim"
            onBack={isMobileView ? () => {
              setSelectedChatId(null);
              setShowChatList(true);
            } : undefined}
            className="h-full"
            showCallButtons={false}
            showAttachments={true}
            showTypingIndicators={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium text-muted-foreground">
                {t('pilgrim.select_chat')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('pilgrim.select_chat_description')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        isOpen={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onChatCreated={(chat) => {
          setIsNewChatOpen(false);
          setSelectedChatId(chat.id.toString());
          loadChats();
        }}
      />
    </div>
  );
} 