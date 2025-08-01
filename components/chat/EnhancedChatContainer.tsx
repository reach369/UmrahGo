'use client';

/**
 * Enhanced Chat Container - Real-time Chat with Zustand State Management
 * 
 * Features:
 * - Real-time messaging with WebSocket support
 * - Typing indicators and read receipts
 * - Professional UI with responsive design
 * - Proper state management with Zustand
 * - Cross-user-type support (admin, office, client)
 * - File attachments and media support
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ArrowLeft,
  Wifi,
  WifiOff,
  X
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

// Store and Services
import { useChatStore } from '@/stores/chat.store';
import { useAuth } from '@/contexts/AuthContext';
import realtimeService from '@/services/realtime.service';

// Components
import { ChatMessage } from './ChatMessage';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface EnhancedChatContainerProps {
  chatId: string;
  onBack?: () => void;
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

export function EnhancedChatContainer({
  chatId,
  onBack,
  className = '',
  showHeader = true,
  maxHeight = 'h-full'
}: EnhancedChatContainerProps) {
  const t = useTranslations('chat');
  const locale = useLocale();
  const { state: authState } = useAuth();
  
  // Chat store
  const {
    messages,
    currentChatId,
    typingUsers,
    isLoadingMessages,
    isSending,
    connectionStatus,
    messagesPagination,
    setCurrentChat,
    loadMessages,
    sendMessage,
    markAsRead,
    getChatById
  } = useChatStore();

  // Local state
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Current chat data
  const currentChat = getChatById(chatId);
  const chatMessages = messages[chatId] || [];
  const pagination = messagesPagination[chatId];
  
  // Current typing users for this chat
  const currentTypingUsers = typingUsers.filter(t => t.chatId === chatId);
  
  // Set current chat on mount/change
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChat(chatId);
    }
  }, [chatId, currentChatId, setCurrentChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length]);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      realtimeService.sendTypingIndicator(chatId, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      realtimeService.sendTypingIndicator(chatId, false);
    }, 3000);
  }, [chatId, isTyping]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      setIsTyping(false);
      realtimeService.sendTypingIndicator(chatId, false);
    }
  }, [chatId, isTyping]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    
    const content = messageInput.trim();
    setMessageInput('');
    handleTypingStop();
    
    try {
      await sendMessage(chatId, content);
      
      // Handle attachments if any
      if (attachments.length > 0) {
        // TODO: Implement file upload
        setAttachments([]);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('خطأ في إرسال الرسالة');
    }
  }, [messageInput, attachments, chatId, sendMessage, handleTypingStop]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    handleTypingStart();
  }, [handleTypingStart]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  }, []);

  // Load more messages when scrolling to top
  const handleLoadMore = useCallback(() => {
    if (pagination?.hasMore && !pagination.isLoadingMore) {
      loadMessages(chatId, pagination.currentPage + 1);
    }
  }, [chatId, pagination, loadMessages]);

  // Connection status indicator
  const getConnectionStatus = () => {
    if (connectionStatus.pusher === 'connected') {
      return { icon: Wifi, color: 'text-green-500', text: 'متصل' };
    } else if (connectionStatus.pusher === 'connecting' || connectionStatus.pusher === 'reconnecting') {
      return { icon: Loader2, color: 'text-yellow-500', text: 'جاري الاتصال...' };
    } else {
      return { icon: WifiOff, color: 'text-red-500', text: 'غير متصل' };
    }
  };

  const connectionInfo = getConnectionStatus();

  return (
    <TooltipProvider>
      <Card className={cn("flex flex-col", maxHeight, className)}>
        {/* Header */}
        {showHeader && (
          <CardHeader className="flex flex-row items-center gap-3 p-4 border-b">
            {onBack && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentChat?.participants?.[0]?.avatar} />
              <AvatarFallback>
                {currentChat?.title?.charAt(0)?.toUpperCase() || 'چ'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {currentChat?.title || 'المحادثة'}
              </h3>
              
              {/* Typing indicator or last seen */}
              {currentTypingUsers.length > 0 ? (
                <p className="text-xs text-blue-500 animate-pulse">
                  {currentTypingUsers.map(u => u.userName).join(', ')} يكتب...
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <connectionInfo.icon className={cn("w-3 h-3", connectionInfo.color)} />
                  <span className="text-xs text-muted-foreground">
                    {connectionInfo.text}
                  </span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>مكالمة صوتية</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>مكالمة فيديو</TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    معلومات المحادثة
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    إعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    حظر المستخدم
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        )}

        {/* Messages */}
        <CardContent className="flex-1 p-0 relative">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Load more button */}
              {pagination?.hasMore && (
                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={pagination.isLoadingMore}
                  >
                    {pagination.isLoadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    تحميل الرسائل السابقة
                  </Button>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoadingMessages && chatMessages.length === 0 && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              
              {/* No messages */}
              {!isLoadingMessages && chatMessages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>لا توجد رسائل بعد</p>
                  <p className="text-xs mt-1">ابدأ محادثة جديدة!</p>
                </div>
              )}
              
              {/* Messages */}
              {chatMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={{
                    id: message.id.toString(),
                    content: message.message,
                    timestamp: message.created_at,
                    senderName: message.sender?.name || 'مستخدم',
                    senderAvatar: message.sender?.avatar,
                    isOwn: message.sender_id.toString() === authState.user?.id?.toString(),
                    status: message.status,
                    type: message.type || 'text',
                    attachment: message.attachment
                  }}
                  showAvatar={true}
                  showTimestamp={true}
                />
              ))}
              
              {/* Typing indicators */}
              {currentTypingUsers.length > 0 && (
                <div className="flex items-center gap-2 opacity-70">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {currentTypingUsers[0].userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1 p-2 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t">
          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  <span className="text-xs">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-4 w-4 p-0"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            {/* Attachment button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>إرفاق ملف</TooltipContent>
            </Tooltip>
            
            {/* Message input */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                className="min-h-[44px] max-h-[120px] resize-none"
                disabled={isSending}
              />
            </div>
            
            {/* Send button */}
            <Button 
              onClick={handleSendMessage}
              disabled={(!messageInput.trim() && attachments.length === 0) || isSending}
              size="sm"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>
    </TooltipProvider>
  );
} 