'use client';

/**
 * Real-time Chat Container
 * Enhanced chat UI with Pusher integration, typing indicators, and read receipts
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Search,
  Info,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  CheckCheck,
  Check,
  Clock,
  Users,
  Image as ImageIcon,
  FileText,
  Mic
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Services & Hooks
import { useAuth } from '@/contexts/AuthContext';
import { usePusherChat } from '@/hooks/usePusherChat';
import chatService, { ChatMessage, Chat } from '@/services/chat.service';
import { RealtimeMessage } from '@/services/realtime.service';
import { getAuthToken } from '@/lib/auth.service';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';

interface RealtimeChatContainerProps {
  chatId: string;
  chatInfo?: Chat;
  recipientName?: string;
  recipientAvatar?: string;
  userType?: 'pilgrim' | 'office' | 'bus_operator' | 'admin';
  onBack?: () => void;
  className?: string;
}

interface MessageGroup {
  date: string;
  messages: RealtimeMessage[];
}

const RealtimeChatContainer: React.FC<RealtimeChatContainerProps> = ({
  chatId,
  chatInfo,
  recipientName,
  recipientAvatar,
  userType = 'pilgrim',
  onBack,
  className
}) => {
  const t = useTranslations('chat');
  const { state: authState   } = useAuth();
  const user = authState.user;  
  
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const dateLocale = locale === 'ar' ? ar : enUS;
  
  // State
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionErrors, setConnectionErrors] = useState(0);
  
  // Refs
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAtBottomRef = useRef(true);
  const lastMessageCountRef = useRef(0);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pusher integration
  const {
    connectionStatus,
    sendTypingIndicator,
    isConnected,
    typingUsers,
    retryConnection
  } = usePusherChat({
    chatId,
    userType,
    onNewMessage: (message: RealtimeMessage) => {
      console.log('New message received:', message);
      
      // Add new message to state
      setMessages((prev: RealtimeMessage[]) => {
        // Check if message already exists
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;

        // Format the message to match our interface
        const formattedMessage: RealtimeMessage = {
          id: message.id as number,
          chat_id: message.chat_id,
          sender: message.sender,
          message: message.message,
          type: message.type as ChatMessage['type'],
          created_at: message.created_at,
        
        };
        
        return [...prev, formattedMessage];
      });
      
      // Scroll to bottom if user was already at bottom
      if (isAtBottomRef.current) {
        setTimeout(() => scrollToBottom(), 100);
      }
      
      // Play notification sound if message is from other user
      if (message.sender?.id !== user?.id) {
        playNotificationSound();
        
        // Mark the message as read (if we're currently viewing this chat)
        markMessageAsRead(message.id);
      }
    },
    onTypingIndicator: (data) => {
      // Handle typing indicators
      console.log('Typing indicator received:', data);
    },
    onConnectionStatusChange: (status: string) => {
      console.log('Connection status:', status);
      
      if (status === 'connected') {
        // Clear any error messages when connected
        if (errorMessage) {
          setErrorMessage(null);
          setConnectionErrors(0);
        }
      } else if (status === 'disconnected' || status === 'error') {
        // Track connection errors
        setConnectionErrors(prev => prev + 1);
        
        if (connectionErrors > 3) {
          setErrorMessage(t('connection_lost_reconnecting'));
          
          // Clear error message after 5 seconds
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
          }
          
          errorTimeoutRef.current = setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
          
          // Try to reconnect
          retryConnection();
        }
      }
    }
  });

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, []);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    
    messages.forEach((message: RealtimeMessage) => {
      const messageDate = new Date(message.created_at);
      const dateKey = format(messageDate, 'yyyy-MM-dd');
      
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = {
          date: dateKey,
          messages: []
        };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  }, [messages]);

  // Format date separator
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return t('today');
    } else if (isYesterday(date)) {
      return t('yesterday');
    } else {
      return format(date, 'EEEE, d MMMM yyyy', { locale: dateLocale });
    }
  };

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (typeof window === 'undefined') return;
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Check if scrolled to bottom
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    isAtBottomRef.current = isAtBottom;
    
    // Load more messages when scrolled to top
    if (element.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMore, isLoadingMore]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = getAuthToken();
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await chatService.getMessages(chatId, token, userType, 1, 20);
      
      // Check if response is valid
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response format');
      }
      
      setMessages(response as unknown as RealtimeMessage[]);
      setHasMore(response.length >= 20); // If we get a full page, assume there are more
      lastMessageCountRef.current = response.length;
      
      // Scroll to bottom after loading
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setErrorMessage(t('error_loading_messages'));
      
      toast.error(t('error_loading_messages'), {
        action: {
          label: t('retry'),
          onClick: () => loadMessages(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [chatId, userType, t, scrollToBottom]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = getAuthToken();
    if (!token || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const response = await chatService.getMessages(chatId, token, userType, nextPage, 20);
      
      // Check if response is valid
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response format');
      }
      
      if (response && response.length > 0) {
        // Keep track of the scroll position before adding new messages
        const scrollArea = scrollAreaRef.current;
        const scrollHeight = scrollArea?.scrollHeight || 0;
        const scrollTop = scrollArea?.scrollTop || 0;
        
        setMessages(prev => [...response as unknown as RealtimeMessage[], ...prev]);
        setPage(nextPage);
        setHasMore(response.length >= 20);
        
        // Restore scroll position after adding new messages
        setTimeout(() => {
          if (scrollArea) {
            const newScrollHeight = scrollArea.scrollHeight;
            scrollArea.scrollTop = scrollTop + (newScrollHeight - scrollHeight);
          }
        }, 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error(t('error_loading_more_messages'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, userType, page, hasMore, isLoadingMore, t]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = getAuthToken();
    if (!token || !newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: RealtimeMessage = {
      id: tempId as any,
      chat_id: parseInt(chatId),
      sender: {
        id: user?.id || 0,
        name: user?.name || '',
        email: user?.email || ''
      },
      message: messageText,
      type: 'text',
      created_at: new Date().toISOString(),
    
    };
    
    setMessages(prev => [...prev, optimisticMessage as unknown as RealtimeMessage]);
    scrollToBottom();

    try {
      const response = await chatService.sendMessage(chatId, token, messageText, userType);
      
      if (response.success && response.data) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map((msg: RealtimeMessage) => 
          msg.id === tempId ? {
            ...response.data as unknown as RealtimeMessage,
            status: 'sent'
          } : msg
        ));
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages((prev: RealtimeMessage[]) => prev.filter((msg: RealtimeMessage) => msg.id !== tempId));
      setNewMessage(messageText); // Restore message
      
      toast.error(t('error_sending_message'), {
        action: {
          label: t('retry'),
          onClick: () => {
            setNewMessage(messageText);
            setTimeout(() => sendMessage(), 500);
          },
        },
      });
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [chatId, newMessage, isSending, user, userType, t, scrollToBottom]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = getAuthToken();
    if (!token || !chatId) return;

    try {
      // Find messages that need to be marked as read
      const unreadMessages = messages.filter(
        msg => msg.sender?.id !== user?.id 
            
      );
      
      if (unreadMessages.length === 0) return;
      
      // Mark messages as read in UI optimistically
      setMessages(prev => prev.map(msg => {
        if (msg.sender?.id !== user?.id ) {
          return {
            ...msg,
            read_at: new Date().toISOString(),
            status: 'read'
          };
        }
        return msg;
      }));
      
      // Send to server
      await chatService.markAsRead(chatId, token, userType);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatId, userType, messages, user]);

  // Mark a specific message as read
  const markMessageAsRead = async (messageId: string | number) => {
    if (typeof window === 'undefined') return;
    
    const token = getAuthToken();
    if (!token || !chatId) return;

    try {
      // Update message in UI
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            read_at: new Date().toISOString(),
            status: 'read'
          };
        }
        return msg;
      }));
      
      // Send to server
      // Note: The API for marking individual messages doesn't exist yet,
      // so we're using the chat-wide mark as read endpoint
      await chatService.markAsRead(chatId, token, userType);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 1000);
  }, [isTyping, sendTypingIndicator]);

  // Handle enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Load messages on mount and when chatId changes
  useEffect(() => {
    if (typeof window !== 'undefined' && chatId) {
      loadMessages();
    }
    
    // Reset state when changing chats
    return () => {
      setMessages([]);
      setPage(1);
      setHasMore(true);
      setIsLoading(true);
      setErrorMessage(null);
    };
  }, [loadMessages, chatId]);
  
  // Mark messages as read when they're visible
  useEffect(() => {
    if (typeof window !== 'undefined' && chatId && messages.length > 0 && !isLoading) {
      const hasUnreadMessages = messages.some(
        msg => msg.sender?.id !== user?.id  
      );
      
      if (hasUnreadMessages) {
        markMessagesAsRead();
      }
    }
  }, [messages, isLoading, markMessagesAsRead, chatId, user]);

  // Focus input on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      inputRef.current?.focus();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (isTyping) {
        sendTypingIndicator(false);
      }
    };
  }, [isTyping, sendTypingIndicator]);

  // Get message status
  const getMessageStatus = (message: RealtimeMessage) => {
    const isOwnMessage = message.sender?.id === user?.id;
    
    if (!isOwnMessage) return null;
    

    
   
    
   
    

    
      return null;
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback>
            {(recipientName || chatInfo?.title || '?')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {recipientName || chatInfo?.title || t('chat')}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />
                <span>{t('online')}</span>
                {typingUsers.size > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-primary animate-pulse">
                      {Array.from(typingUsers.values()).map(u => u.name).join(', ')} {t('typing')}...
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-destructive" />
                <span>{t('offline')}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('voice_call')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('video_call')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Search className="h-4 w-4 mr-2" />
                {t('search_messages')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Info className="h-4 w-4 mr-2" />
                {t('chat_info')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                {t('clear_chat')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4" 
        onScroll={handleScroll}
      >
        {errorMessage && (
          <div className="flex items-center justify-center p-2 mb-4">
            <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errorMessage}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('no_messages')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('start_conversation')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoadingMore && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {formatDateSeparator(group.date)}
                  </div>
                </div>
                
                {group.messages.map((message, index) => {
                    const isOwn = message.sender?.id === user?.id;
                    const showAvatar = index === 0 || group.messages[index - 1]?.sender?.id !== message.sender?.id;
                    const showTimestamp = index === group.messages.length - 1 || 
                      group.messages[index + 1]?.sender?.id !== message.sender?.id;
                    const status = getMessageStatus(message);
                  
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end gap-2 mb-1",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwn && (
                          <Avatar className={cn("h-8 w-8", !showAvatar && "invisible")}>
                            <AvatarImage src={message.sender?.profile_photo_path} />
                            <AvatarFallback>
                              {(message.sender?.name || '?')[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={cn(
                            "max-w-[70%] px-4 py-2 rounded-2xl",
                            isOwn 
                              ? "bg-primary text-primary-foreground rounded-br-sm" 
                              : "bg-muted rounded-bl-sm",
                            !showAvatar && !isOwn && "ml-10",
                            message.id.toString().startsWith('temp-') && "opacity-70"
                          )}
                        >
                          {!isOwn && showAvatar && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.sender?.name}
                            </p>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.message}
                          </p>
                          
                          {showTimestamp && (
                            <div className={cn(
                              "flex items-center gap-1 mt-1",
                              isOwn ? "justify-end" : "justify-start"
                            )}>
                              <span className="text-xs opacity-50">
                                {format(new Date(message.created_at), 'HH:mm', { locale: dateLocale })}
                              </span>
                              
                              {isOwn && status && (
                                <span className="text-xs opacity-70 ml-1">
                                  {status}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
            
            <div ref={messageEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('type_message')}
              className="min-h-[40px] max-h-[120px] pr-10 resize-none"
              disabled={!isConnected || isSending}
              rows={1}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      disabled={!isConnected}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('attach_file')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('send_message')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            {t('connection_lost')}
            <Button 
              variant="link" 
              size="sm" 
              onClick={retryConnection} 
              className="p-0 h-auto text-xs"
            >
              {t('reconnect')}
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default RealtimeChatContainer; 