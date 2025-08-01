'use client';

/**
 * Unified Chat Container - Professional Real-time Implementation
 * 
 * This component provides a complete chat interface that works across
 * all user types (Pilgrims, Offices, Bus Operators, Admins) with
 * real-time messaging, typing indicators, and professional UI.
 */

import React, { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  Loader2, 
  AlertCircle,
  Phone,
  Video,
  Settings,
  Users,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  X,
  WifiOff,
  RefreshCcw
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ChatHeader } from './ChatHeader';
import { ChatWindow } from './ChatWindow';
import { useChatWithFallback } from '@/hooks/useChatWithFallback';
import chatService, { ChatMessage } from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';
import { cn } from '@/lib/utils'; 
import { Message } from '@/types/chat-messages';
import { Toaster } from '@/components/ui/toaster';
import { ChatInput } from './ChatInput';

interface UnifiedChatContainerProps {
  chatId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  initialMessages?: ChatMessage[];
  userType?: 'pilgrim' | 'office' | 'bus_operator' | 'admin';
  onBack?: () => void;
  userId?: string | number;
  className?: string;
  showHeader?: boolean;
  showTypingIndicators?: boolean;
  showCallButtons?: boolean;
  showAttachments?: boolean;
  maxHeight?: string;
}

interface MessageStatus {
  id: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export function UnifiedChatContainer({
  chatId,
  recipientName,
  recipientAvatar,
  initialMessages = [],
  userType = 'office',
  onBack,
  userId,
  className = '',
  showHeader = true,
  showTypingIndicators = true,
  showCallButtons = false,
  showAttachments = true,
  maxHeight = 'h-full'
}: UnifiedChatContainerProps) {
  // Hooks
  const { data: session } = useSession();
  const t = useTranslations();
  const locale = useLocale();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastTypingTime = useRef<number>(0);
  
  // Get current user info
  const currentUser = session?.user;
  const currentUserId = currentUser?.id?.toString() || userId?.toString() || '';
  
  // Get auth token
  const getToken = useCallback(() => {
    return getAuthToken();
  }, []);

  // Use the enhanced chat hook with fallback
  const { 
    sendMessage: sendEnhancedMessage,
    markAsRead,
    sendTypingIndicator,
    connectionStatus,
    isUsingFallback,
    reconnect
  } = useChatWithFallback({
    chatId,
    userType,
    onNewMessage: (message: ChatMessage) => {
      const normalizedMessage = message;
      setMessages((prev: ChatMessage[]) => {
        const messageExists = prev.some(m => m.id === normalizedMessage.id);
        if (messageExists) return prev;
        return [...prev, normalizedMessage];
      });
      
      // Mark as read if it's not from current user
      if (normalizedMessage.user_id?.toString() !== currentUserId) {
        markAsRead(normalizedMessage.id.toString());
      }
      
      // Auto scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onMessageStatusUpdate: (messageId: string, status: string) => {
      setMessageStatuses((prev: MessageStatus[]) => {  
        const existing = prev.find(s => s.id === messageId);
        if (existing) {
          return prev.map(s => s.id === messageId ? { ...s, status: status as any } : s);
        }
        return [...prev, { id: messageId, status: status as any, timestamp: new Date().toISOString() }];
      });
      
      // Update message in the list
      setMessages((prev: ChatMessage[]) => prev.map(msg => 
        msg.id.toString() === messageId 
          ? { ...msg, status: status as any }
          : msg
      ));
    },
    onTypingStatusChange: (userId: string, isTyping: boolean) => {
      if (userId !== currentUserId) {
          setTypingUsers(prev => {
          if (isTyping && !prev.includes(userId)) {
            return [...prev, userId];
          } else if (!isTyping) {
            return prev.filter(id => id !== userId);
          }
          return prev;
        });
      }
    },
    onConnectionStatusChange: (status: string) => {
      if (status === 'error' || status === 'disconnected') {
        setError(t('chat.connection_error'));
      } else if (status === 'connected') {
        setError(null);
      }
    },
  });

  // Message normalization
  const normalizeMessage = useCallback((msg: any): ChatMessage => {
    return {
      id: msg.id || `temp-${Date.now()}`,
      chat_id: msg.chat_id || msg.chatId || parseInt(chatId || '0'),
      user_id: msg.user_id || msg.sender_id || msg.senderId || 0,
      sender_id: msg.sender_id || msg.user_id || 0,
      sender: msg.sender || {
        id: msg.user_id || msg.sender_id || 0,
        name: msg.sender_name || msg.senderName || 'Unknown',
        email: '',
        profile_photo_path: msg.sender_avatar || msg.senderAvatar
      },
      message: msg.message || msg.content || '',
      type: msg.type || msg.content_type || msg.contentType || 'text',
      status: msg.status || 'sent',
      created_at: msg.created_at || msg.sent_at || msg.sentAt || new Date().toISOString(),
      updated_at: msg.updated_at || new Date().toISOString(),
      is_edited: msg.is_edited || false,
      is_deleted: msg.is_deleted || false
    };
  }, [chatId]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!chatId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setError(t('chat.auth_error'));
        return;
      }

      const messagesData = await chatService.getMessages(token, chatId, userType);
      
      if (Array.isArray(messagesData)) {
        const normalizedMessages = messagesData.map(normalizeMessage);
        setMessages(normalizedMessages);
        
        // Mark latest message as read if it's not from current user
        const latestMessage = normalizedMessages[normalizedMessages.length - 1];
        if (latestMessage && latestMessage.user_id?.toString() !== currentUserId) {
          await markAsRead(latestMessage.id.toString());
        }
        
        // Auto scroll to bottom after loading messages
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      setError(t('chat.load_error'));
      toast.error(`${t('chat.load_error')}: ${err.message || 'Unknown error'}`);
      
      // Retry logic
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [chatId, t, currentUserId, markAsRead, retryCount, userType, getToken, normalizeMessage]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !chatId || !currentUser?.id) {
      console.warn('Cannot send message: missing required data');
      return;
    }

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      id: parseInt(tempId),
      chat_id: parseInt(chatId),
      sender_id: currentUser.id,
      message: messageText.trim(),
      type: 'text',
      status: 'sending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: currentUser.id,
      is_edited: false,
      is_deleted: false,
      sender: {
        id: currentUser.id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        profile_photo_path: currentUser.profile_photo_path
      }
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, tempMessage]);
    setMessageStatuses(prev => [
      ...prev,
      { id: tempId, status: 'sending', timestamp: new Date().toISOString() }
    ]);

    try {
      // Send message through enhanced hook
      const response = await sendEnhancedMessage({
        message: messageText.trim(),
        chat_id: chatId,
        user_id: currentUser.id,
        sender_id: currentUser.id,
        type: 'text'
      });
      
      if (response && (response.success || response.id)) {
        const sentMessage = response.data || response.message || response;
        
        // Replace temp message with actual message
        if (sentMessage) {
          const normalizedMessage = normalizeMessage(sentMessage);
          
          setMessages(prev => prev.map(msg => 
            msg.id === parseInt(tempId) ? normalizedMessage : msg
          ));

          setMessageStatuses(prev => [
            ...prev.filter(s => s.id !== tempId),
            { 
              id: normalizedMessage.id.toString(), 
              status: 'sent', 
              timestamp: normalizedMessage.created_at 
            }
          ]);
        } else {
          // Update temp message status to sent if no response message
          setMessages(prev => prev.map(msg => 
            msg.id === parseInt(tempId) ? { ...msg, status: 'sent' } : msg
          ));
          
          setMessageStatuses(prev => [
            ...prev.filter(s => s.id !== tempId),
            { id: tempId, status: 'sent', timestamp: new Date().toISOString() }
          ]);
        }

        // Clear input field
        setInputValue('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Update temp message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === parseInt(tempId) ? { ...msg, status: 'failed' as any } : msg
      ));
      
      setMessageStatuses(prev => [
        ...prev.filter(s => s.id !== tempId),
        { id: tempId, status: 'failed', timestamp: new Date().toISOString() }
      ]);

      toast.error(t('chat.send_error'), {
        action: {
          label: t('chat.retry'),
          onClick: () => handleRetryMessage(tempId, messageText.trim())
        }
      });
    } finally {
      setIsSending(false);
    }
  }, [chatId, currentUser, sendEnhancedMessage, normalizeMessage, t]);

  // Retry failed message
  const handleRetryMessage = useCallback(async (tempId: string, content: string) => {
    try {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === parseInt(tempId) ? { ...msg, status: 'sending' as any } : msg
        )
      );
      
      // Use the enhanced sendMessage function
      const response = await sendEnhancedMessage({
        message: content,
        chat_id: chatId,
        user_id: currentUser?.id,
        sender_id: currentUser?.id,
        type: 'text'
      });
      
      if (response && (response.success || response.id)) {
        const sentMessage = response.data || response.message || response;
        
        if (sentMessage) {
          const normalizedMessage = normalizeMessage(sentMessage);
          
          setMessages(prev => 
            prev.map(msg =>   
              msg.id === parseInt(tempId) ? normalizedMessage : msg
            )
          );
          
          setMessageStatuses(prev => [
            ...prev.filter(s => s.id !== tempId),
            { 
              id: normalizedMessage.id.toString(), 
              status: 'sent', 
              timestamp: normalizedMessage.created_at 
            }
          ]);
        } else {
          // Update message status if no response message
          setMessages(prev => 
            prev.map(msg =>   
              msg.id === parseInt(tempId) ? { ...msg, status: 'sent' as any } : msg
            )
          );
          
          setMessageStatuses(prev => [
            ...prev.filter(s => s.id !== tempId),
            { id: tempId, status: 'sent', timestamp: new Date().toISOString() }
          ]);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err: any) {
      toast.error(`${t('chat.send_error')}: ${err.message || 'Unknown error'}`);

      setMessages(prev => 
        prev.map(msg =>   
          msg.id === parseInt(tempId) ? { ...msg, status: 'failed' as any } : msg
        ) 
      );
      
      setMessageStatuses(prev => [
        ...prev.filter(s => s.id !== tempId),
        { id: tempId, status: 'failed', timestamp: new Date().toISOString() }
      ]);
    }
  }, [sendEnhancedMessage, chatId, currentUser, normalizeMessage, t]);

  // Handle typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Send typing indicator
    const now = Date.now();
    lastTypingTime.current = now;
    
    if (newValue && newValue.length > 0 && !typingUsers.includes(currentUserId)) {
      sendTypingIndicator(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (Date.now() - lastTypingTime.current >= 3000) {
        sendTypingIndicator(false);
      }
    }, 3000);
  }, [currentUserId, sendTypingIndicator, typingUsers]);

  // Load messages on mount and chatId change
  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
  }, [chatId, loadMessages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isSending) {
        handleSendMessage(inputValue);
      }
    }
  }, [handleSendMessage, inputValue, isSending]);

  // Format message for ChatWindow compatibility
  const formatMessage = (msg: ChatMessage): Message => {
    const currentUserId = currentUser?.id?.toString();
    const senderId = msg.sender_id?.toString() || msg.sender?.id?.toString() || '';
    const senderName = msg.sender?.name || 'مجهول';
    
    return {
      id: typeof msg.id === 'string' ? msg.id : msg.id.toString(),
      chatId: msg.chat_id ? msg.chat_id.toString() : '',
      content: msg.message || '',
      senderId: senderId,
      senderName: senderName,
      senderAvatar: msg.sender?.profile_photo_path || undefined,
      timestamp: msg.created_at || new Date().toISOString(),
      type: msg.type || 'text',
      status: msg.status || 'sent',
      isOwn: senderId === currentUserId,
      // Add backward compatibility fields
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: msg.sender?.profile_photo_path,
      message: msg.message,
      content_type: msg.type,
      sent_at: msg.created_at,
      created_at: msg.created_at,
      sender: {
        id: senderId,
        name: senderName,
        avatar: msg.sender?.profile_photo_path,
        profile_photo_path: msg.sender?.profile_photo_path
      }
    };
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'sent':
        return <Clock className="h-3 w-3" />;
      case 'delivered':
        return <Check className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster />
      <div className={`flex flex-col bg-background ${maxHeight} ${className}`}>
        {showHeader && (
          <ChatHeader 
            name={recipientName || 'Chat'}
            avatar={recipientAvatar}
            status={connectionStatus === 'connected' ? 'online' : 'offline'}
            onBack={onBack}
            showCallButtons={showCallButtons}
            onVideoCall={() => {}}
            className={className}
          />
        )}
        
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Fallback mode indicator */}
          {isUsingFallback && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs px-3 py-1 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                <span>{t('chat.offline_mode')}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full p-0"
                onClick={reconnect}
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <ChatWindow
            messages={messages.map(formatMessage)}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef as unknown as RefObject<HTMLDivElement>}
            className={className} 
          />
            
          {error && (
            <div className="p-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded m-2">
              {error}
            </div>
          )}
            
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isSending}
            disabled={false}
            value={inputValue as string }
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            connectionStatus={connectionStatus}
            onRetryConnection={reconnect}
            showAttachments={showAttachments}
          />
        </div>
      </div>
    </>
  );
} 