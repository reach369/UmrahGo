'use client';

/**
 * Unified Chat Container - Enhanced Professional Implementation
 * Handles all chat functionality with real-time messaging, message history, and error handling
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
  ChevronLeft,
  Image,
  File,
  Music,
  Video as VideoIcon,
  MapPin,
  Trash2,
  UserPlus,
  MessageCircle
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

// Services & Hooks
import { useAuth } from '@/contexts/AuthContext';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import chatService, { ChatMessage, Chat } from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';

// Utils
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Enhanced Types
interface MessageStatus {
  sending?: boolean;
  sent?: boolean;
  delivered?: boolean;
  read?: boolean;
  failed?: boolean;
}

interface EnhancedChatMessage extends Omit<ChatMessage, 'status'> {
  localId?: string;
  status?: MessageStatus;
  isOptimistic?: boolean;
  retryCount?: number;
}

interface UnifiedChatContainerProps {
  chatId: string;
  recipientName?: string;
  recipientAvatar?: string;
  userType?: 'pilgrim' | 'office' | 'bus_operator' | 'admin';
  onBack?: () => void;
  className?: string;
  showCallButtons?: boolean;
  showAttachments?: boolean;
  showTypingIndicators?: boolean;
  maxRetries?: number;
}

// Update the MessageBubble component with enhanced styling

const MessageBubble = React.memo(({ 
  message, 
  isOwn, 
  showAvatar, 
  showTimestamp,
  onRetry 
}: {
  message: EnhancedChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onRetry?: (messageId: string) => void;
}) => {
  const t = useTranslations('chat');
  
  const getStatusIcon = () => {
    if (message.isOptimistic || message.status?.sending) {
      return <Clock className="w-3 h-3 text-muted-foreground animate-pulse" />;
    }
    if (message.status?.failed) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 text-destructive hover:text-destructive"
          onClick={() => onRetry?.(message.id.toString())}
        >
          <AlertCircle className="w-3 h-3" />
        </Button>
      );
    }
    if (message.status?.read) {
      return <CheckCheck className="w-3 h-3 text-primary" />;
    }
    if (message.status?.delivered) {
      return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
    }
    if (message.status?.sent) {
      return <Check className="w-3 h-3 text-muted-foreground" />;
    }
    return null;
  };

  // Format the date for display
  const formatMessageTime = (date: string) => {
    try {
      // Simple time format for messages
      return format(new Date(date), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className={cn(
      "flex gap-2 mb-3",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          <AvatarImage src={message.sender?.profile_photo_path} alt={message.sender?.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.sender?.name?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        "max-w-[80%] flex flex-col",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {message.sender?.name || t('unknownUser')}
          </span>
        )}
        
        <div className={cn(
          "relative px-4 py-2.5 rounded-2xl shadow-sm",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-card border border-border/50 rounded-tl-sm",
          message.status?.failed && "border border-destructive/50"
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
          
          {message.type !== 'text' && (
            <div className="mt-2 flex items-center gap-1.5 text-xs opacity-75">
              {message.type === 'image' && <Image className="w-3 h-3" />}
              {message.type === 'file' && <File className="w-3 h-3" />}
              {message.type === 'audio' && <Music className="w-3 h-3" />}
              <span>{t(`${message.type}_message`, { default: message.type })}</span>
              <Button variant="ghost" size="sm" className="h-5 text-xs py-0 px-1.5 ml-1">
                {t('download')}
              </Button>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 mt-1 px-1",
          isOwn ? "justify-end" : "justify-start"
        )}>
          {showTimestamp && (
            <span className="text-[10px] text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
          )}
          {isOwn && (
            <span className="flex items-center">
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// Main Component
export function UnifiedChatContainer({
  chatId,
  recipientName = 'محادثة',
  recipientAvatar,
  userType = 'office',
  onBack,
  className = '',
  showCallButtons = false,
  showAttachments = true,
  showTypingIndicators = true,
  maxRetries = 3
}: UnifiedChatContainerProps) {
  const { state: authState } = useAuth();
  const t = useTranslations('chat');
  
  // State Management
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastMessageId = useRef<string | null>(null);
  
  // Auth and Token
  const getToken = useCallback(() => {
    return getAuthToken();
  }, []);

  // WebSocket Integration
  const { 
    connectionStatus,
    sendMessage: sendWebSocketMessage,
    sendTypingIndicator,
    markAsRead
  } = useChatWebSocket({
    chatId,
    userType,
    onNewMessage: (wsMessage) => {
      const enhancedMessage: EnhancedChatMessage = {
        id: typeof wsMessage.id === 'string' ? parseInt(wsMessage.id) : wsMessage.id,
        chat_id: typeof wsMessage.chat_id === 'string' ? parseInt(wsMessage.chat_id) : wsMessage.chat_id || 0,
        user_id: typeof wsMessage.user_id === 'string' ? parseInt(wsMessage.user_id) : wsMessage.user_id || 0,
        sender_id: typeof wsMessage.sender_id === 'string' ? parseInt(wsMessage.sender_id) : wsMessage.sender_id || 0,
        sender: {
          id: typeof wsMessage.user_id === 'string' ? parseInt(wsMessage.user_id) : wsMessage.user_id || 0,
          name: wsMessage.sender_name || 'Unknown',
          email: '',                
          profile_photo_path: wsMessage.sender_avatar
        },
        message: wsMessage.message || wsMessage.content || '',
        type: wsMessage.type as any || 'text',
        status: { sent: true, delivered: true },
        is_edited: false,
        is_deleted: false,
        created_at: wsMessage.created_at || wsMessage.sent_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(msg => 
          msg.id === enhancedMessage.id || 
          (msg.localId && msg.message === enhancedMessage.message && 
           Math.abs(new Date(msg.created_at).getTime() - new Date(enhancedMessage.created_at).getTime()) < 5000)
        );
        
        if (!exists) {
          const newMessages = [...prev, enhancedMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          // Auto-mark as read if it's not from current user
          if (enhancedMessage.sender_id !== authState.user?.id) {
            setTimeout(() => {
              markAsRead?.(enhancedMessage.id.toString());
            }, 1000);
          }
          
          return newMessages;
        }
        return prev;
      });
      
      // Auto-scroll and play sound for new messages
      setTimeout(() => {
        scrollToBottom();
        if (enhancedMessage.sender_id !== authState.user?.id) {
          playNotificationSound();
        }
      }, 100);
    },
    onTypingIndicator: ({ userId, isTyping: typing }) => {
      if (userId !== authState.user?.id) {
        setOtherUserTyping(typing);
      }
    },
    onMessageStatusUpdate: (messageId, status) => {
      setMessages(prev => prev.map(msg => 
        msg.id.toString() === messageId.toString() 
          ? { ...msg, status: { ...msg.status, ...status } }
          : msg
      ));
    },
    onConnectionStatusChange: (status) => {
      if (status === 'connected') {
        setError(null);
        // Reload messages when reconnected
        if (messages.length === 0) {
          loadMessages(true);
        }
      } else if (status === 'error') {
        setError(t('connection_error'));
      }
    }
  });

  // Load Messages Function
  const loadMessages = useCallback(async (isInitial = false, page = 1) => {
    const token = getToken();
    if (!token) {
      setError('لا يوجد رمز مصادقة');
      setIsLoading(false);
      return;
    }

    try {
      if (isInitial) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const fetchedMessages = await chatService.getMessages(token, chatId, userType, page);
      
      if (fetchedMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        const enhancedMessages: EnhancedChatMessage[] = fetchedMessages.map((msg: ChatMessage) => ({
          ...msg,
          status: {
            sent: true,
            delivered: msg.status === 'delivered' || msg.status === 'read',
            read: msg.status === 'read'
          }
        }));

        setMessages((prev: EnhancedChatMessage[]) => {
          if (isInitial || page === 1) {
            return enhancedMessages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          } else {
            // Merge with existing messages, avoiding duplicates
            const merged = [...enhancedMessages, ...prev];
            const unique = merged.filter((msg, index, self) => 
              index === self.findIndex(m => m.id === msg.id)
            );
            return unique.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          }
        });

        if (enhancedMessages.length > 0) {
          lastMessageId.current = enhancedMessages[enhancedMessages.length - 1].id.toString();
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('خطأ في تحميل الرسائل');
      if (isInitial) {
        setMessages([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [chatId, userType, getToken]);

  // Send Message Function
  const sendMessage = useCallback(async (content: string, type: string = 'text') => {
    if (!content.trim() || !authState.user) return;

    const token = getToken();
    if (!token) {
      toast.error('خطأ في المصادقة');
      return;
    }

    // Create optimistic message
      const optimisticMessage: EnhancedChatMessage = {
      id: Date.now(), // Temporary ID
      localId: `temp-${Date.now()}`,
      chat_id: parseInt(chatId),
      user_id: authState.user.id,
      sender_id: authState.user.id,
      sender: {
        id: authState.user.id,
        name: authState.user.name || 'أنت',
        email: authState.user.email || '',
        profile_photo_path: authState.user.profile_photo || ''
      },
      message: content,
      type: type as any,
      status: { sending: true },
        isOptimistic: true,
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      retryCount: 0
    };

    // Add optimistic message immediately
    setMessages((prev: EnhancedChatMessage[]) => [...prev, optimisticMessage]);
    setNewMessage('');
    
    setTimeout(scrollToBottom, 100);

    try {
      // Send via WebSocket first (faster)
      if (connectionStatus === 'connected' && sendWebSocketMessage) {
        const wsSuccess = await sendWebSocketMessage({
          chat_id: chatId,
          message: content,
          type,
          localId: optimisticMessage.localId
        });

        if (wsSuccess) {
          // Update optimistic message status
          setMessages((prev: EnhancedChatMessage[]) => prev.map((msg: EnhancedChatMessage) => 
            msg.localId === optimisticMessage.localId 
              ? { ...msg, status: { sent: true }, isOptimistic: false }
              : msg
          ));
          return;
        }
      }

      // Fallback to HTTP API
      const result = await chatService.sendMessage(chatId, content, token, userType) as unknown as { success: boolean, message: string };
      
      if (result.success && result.message) {
        // Replace optimistic message with real message
        setMessages((prev: EnhancedChatMessage[]) => prev.map((msg: EnhancedChatMessage) => 
          msg.localId === optimisticMessage.localId 
            ? { 
                ...(result.message as unknown as EnhancedChatMessage),
                status: { sent: true, delivered: true }
              } as EnhancedChatMessage
            : msg
        ));
      } else {
        throw new Error(result.message || 'فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark optimistic message as failed
      setMessages((prev: EnhancedChatMessage[]) => prev.map((msg: EnhancedChatMessage) => 
        msg.localId === optimisticMessage.localId 
          ? { 
              ...msg, 
              status: { failed: true }, 
              isOptimistic: false,
              retryCount: (msg.retryCount || 0) + 1
            }
          : msg
      ));
      
      toast.error('فشل في إرسال الرسالة');
    }
  }, [authState.user, chatId, userType, getToken, connectionStatus, sendWebSocketMessage]);

  // Retry Failed Message
  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id.toString() === messageId || msg.localId === messageId);
    if (!message || (message.retryCount || 0) >= maxRetries) return;

    // Clear any existing retry timeout
    const timeoutId = retryTimeouts.current.get(messageId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      retryTimeouts.current.delete(messageId);
    }

    // Update message status to sending
    setMessages((prev: EnhancedChatMessage[]) => prev.map((msg: EnhancedChatMessage)  => 
      (msg.id.toString() === messageId || msg.localId === messageId)
        ? { ...msg, status: { sending: true } }
        : msg
    ));

    // Retry sending
    await sendMessage(message.message, message.type);
  }, [messages, maxRetries, sendMessage]);

  // Scroll Functions
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    // Load more messages when scrolled to top
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMessages(false, nextPage);
    }
  }, [hasMoreMessages, isLoadingMore, currentPage, loadMessages]);

  // Typing Indicators
  const handleTyping = useCallback((value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator?.(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTypingIndicator?.(false);
    }
  }, [isTyping, sendTypingIndicator]);

  // Utility Functions
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio started playing successfully
          })
          .catch(() => {
            // Silent error - expected before user interaction
            console.log('Audio playback requires user interaction first');
          });
      }
    } catch (error) {
      console.log('Audio playback error:', error);
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
    }
  }, [newMessage, sendMessage]);

  // Effects
  useEffect(() => {
    if (chatId) {
      setMessages([]);
      setCurrentPage(1);
      setHasMoreMessages(true);
      loadMessages(true);
    }
  }, [chatId, loadMessages]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    // Stop typing indicator when component unmounts or chat changes
    return () => {
      if (isTyping) {
        sendTypingIndicator?.(false);
      }
      // Clear all retry timeouts
      retryTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      retryTimeouts.current.clear();
    };
  }, [chatId, isTyping, sendTypingIndicator]);

  // Memoized values
  const connectionIcon = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  }, [connectionStatus]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);

  // Render
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={recipientAvatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {recipientName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate text-foreground">{recipientName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {connectionIcon}
            <span>
              {connectionStatus === 'connected' ? t('online') : 
               connectionStatus === 'connecting' ? t('connecting') :
               connectionStatus === 'reconnecting' ? t('reconnecting') : 
               t('offline')}
            </span>
            {otherUserTyping && showTypingIndicators && (
              <>
                <span className="text-xs">•</span>
                <span className="text-primary text-xs animate-pulse">{t('typing')}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {showCallButtons && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Video className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Search className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Info className="w-4 h-4 mr-2" />
                {t('chat_info', { default: 'Chat Info' })}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('add_participant', { default: 'Add Participant' })}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                {t('clear_history', { default: 'Clear History' })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border-b border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">{error}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => loadMessages(true)}
            className="ml-auto"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 p-4" 
        onScrollCapture={handleScroll}
        ref={messagesContainerRef}
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t('loading', { default: 'جاري التحميل...' })}</p>
            </div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-xs p-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{t('no_messages_title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('no_messages_description')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Load More Indicator */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
            
            {/* Messages */}
            {sortedMessages.map((message, index) => {
              const previousMessage = index > 0 ? sortedMessages[index - 1] : null;
              const isOwn = message.sender_id === authState.user?.id;
              const showAvatar = !previousMessage || 
                               previousMessage.sender_id !== message.sender_id ||
                               (new Date(message.created_at).getTime() - 
                                new Date(previousMessage.created_at).getTime()) > 300000; // 5 minutes

              return (
                <MessageBubble
                  key={message.localId || message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  showTimestamp={true}
                  onRetry={retryMessage}
                />
              );
            })}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card/30 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {showAttachments && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9">
              <Paperclip className="w-4 h-4" />
            </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>{t('attachment')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Image className="mr-2 h-4 w-4" />
                  <span>{t('image')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <File className="mr-2 h-4 w-4" />
                  <span>{t('file')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Music className="mr-2 h-4 w-4" />
                  <span>{t('audio')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Video className="mr-2 h-4 w-4" />
                  <span>{t('video')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{t('location')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder={t('type_message')}
              className="pr-10 rounded-full px-4 border-primary/20 focus-visible:ring-primary/30"
              disabled={connectionStatus === 'disconnected'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <Smile className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          
          <Button 
            type="submit"
            disabled={!newMessage.trim() || connectionStatus === 'disconnected'}
            className="px-4 rounded-full h-9"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {connectionStatus !== 'connected' ? (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {connectionStatus === 'connecting' ? t('connecting') :
             connectionStatus === 'reconnecting' ? t('reconnecting') : 
             t('status.disconnected')}
          </p>
        ) : otherUserTyping && showTypingIndicators ? (
          <div className="flex items-center gap-2 mt-2 animate-pulse">
            <span className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
            <p className="text-xs text-primary">{t('typing')}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default UnifiedChatContainer; 