'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Loader2, 
  MessageCircle, 
  Send, 
  Users, 
  MoreVertical, 
  Paperclip, 
  Clock,
  Image,
  FileText,
  Smile
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Services and hooks
import chatService, { Chat, ChatMessage } from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Pusher for real-time updates
import Pusher from 'pusher-js';

export default function ChatDetailPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const chatId = params?.chatId as string;
  const { state: authState } = useAuth();
  const user = authState.user;
  const userType = authState.user?.roles[0] || 'pilgrim';
  const dateLocale = locale === 'ar' ? ar : enUS;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);
  
  // Load chat data
  useEffect(() => {
    async function loadChat() {
      if (!user || !chatId) return;
      
      const token = getAuthToken();
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }

      setIsLoading(true);
      try {
        // First get chat info
        const chatResponse = await chatService.getChats(token, userType);
        if (chatResponse.success && chatResponse.data) {
          const chatData = chatResponse.data.find(c => c.id.toString() === chatId);
          if (chatData) {
            setChat(chatData);
          } else {
            toast.error(t('chat_not_found'));
            router.push(`/${locale}/umrahoffices/dashboard/chats`);
            return;
          }
        } else {
          toast.error(t('error_loading_chat'));
          return;
        }
        
        // Then get messages
        const messagesResponse = await chatService.getMessages(chatId, token, userType);
        if (Array.isArray(messagesResponse)) {
          setMessages(messagesResponse as ChatMessage[]);
          
          // Mark as read
          await chatService.markAsRead(chatId, token, userType);
        } else {
          toast.error(t('error_loading_messages'));
        }
      } catch (error) {
        console.error('Error loading chat:', error);
        toast.error(t('error_loading_chat'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadChat();
  }, [user, chatId, locale, router, userType, t]);

  // Setup Pusher for real-time updates
  useEffect(() => {
    if (!chatId || !user) return;
    
    // Clean up previous connection
    if (pusherRef.current) {
      pusherRef.current.disconnect();
    }
    
    // Initialize Pusher
    pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      forceTLS: true
    });
    
    // Subscribe to chat channel
    const channel = pusherRef.current.subscribe(`chat.${chatId}`);
    
    // Listen for new messages
    channel.bind('message.sent', (data: { message: ChatMessage }) => {
      const newMessage = data.message;
      
      // Add message to the list
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Mark as read if we're in this chat and the message is not from the current user
      if (newMessage.sender_id !== user.id) {
        const token = getAuthToken();
        if (token) {
          chatService.markAsRead(chatId, token, userType);
        }
      }
    });
    
    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(`chat.${chatId}`);
        pusherRef.current.disconnect();
      }
    };
  }, [chatId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);

  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !chatId || !user) return;
    
    const token = getAuthToken();
    if (!token) return;
    
    setIsSending(true);
    try {
      const response = await chatService.sendMessage(chatId, token, messageText, userType);
      
      if (response.success) {
        setMessageText('');
      } else {
        toast.error(t('error_sending_message'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('error_sending_message'));
    } finally {
      setIsSending(false);
    }
  };

  const goBack = () => {
    router.push(`/${locale}/umrahoffices/dashboard/chats`);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return formatDistanceToNow(date, {
        addSuffix: false,
        locale: dateLocale
      });
    }
  };

  // Group messages by date for better visualization
  const groupMessagesByDate = () => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.created_at).toDateString();
      const existingGroup = groups.find((group) => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
    
    return groups;
  };

  // Format date for message groups
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday');
    } else {
      return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  // Render loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderSkeleton = () => (
    <>
      <div className="flex justify-start mb-4">
        <div className="flex gap-2 max-w-[80%]">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-16 w-64 rounded-lg" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <div className="flex flex-row-reverse gap-2 max-w-[80%]">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col items-end">
            <Skeleton className="h-12 w-48 rounded-lg" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </div>
      <div className="flex justify-start mb-4">
        <div className="flex gap-2 max-w-[80%]">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-20 w-80 rounded-lg" />
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </div>
    </>
  );

  const messageGroups = groupMessagesByDate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className=" dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0  dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            {chat?.is_group ? (
              <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                <AvatarFallback className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                <AvatarImage src={chat?.recipient?.profile_photo_path} />
                <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {getInitials(chat?.recipient?.name || chat?.title)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="overflow-hidden">
              <h2 className="font-medium text-gray-900 dark:text-white text-lg truncate">
                {chat?.title || chat?.recipient?.name || t('unnamed_chat')}
              </h2>
              {chat?.recipient?.last_seen_at && (
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {t('last_seen')}: {formatDistanceToNow(new Date(chat.recipient.last_seen_at || ''), {
                      addSuffix: true,
                      locale: dateLocale
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t('search_in_conversation')}</DropdownMenuItem>
              <DropdownMenuItem>{t('mute_notifications')}</DropdownMenuItem>
              {chat?.is_group && <DropdownMenuItem>{t('view_participants')}</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">{t('delete_chat')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900" ref={scrollAreaRef}>
          {isLoading ? (
            renderSkeleton()
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <MessageCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-3 text-gray-900 dark:text-gray-100">{t('no_messages_yet')}</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                {t('start_conversation')}
              </p>
              <div className="max-w-xs w-full  dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-sm font-medium mb-2">{t('conversation_tips')}</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary">1</span>
                    </div>
                    {t('tip_be_clear')}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary">2</span>
                    </div>
                    {t('tip_be_polite')}
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messageGroups.map((group, groupIndex) => (
                <div key={group.date} className="space-y-4">
                  {/* Date separator */}
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                      {formatGroupDate(group.date)}
                    </div>
                  </div>
                  
                  {/* Messages in this date group */}
                  {group.messages.map((message, index) => {
                    const isOwn = message.sender_id === user.id;
                    const showSenderInfo = chat?.is_group && !isOwn && (
                      index === 0 || 
                      group.messages[index - 1]?.sender_id !== message.sender_id
                    );
                    
                    // Determine if we should show avatar (only for first message in a sequence from same sender)
                    const showAvatar = !isOwn && (
                      index === 0 || 
                      group.messages[index - 1]?.sender_id !== message.sender_id
                    );
                    
                    // Determine if this is part of a sequence of messages from same sender
                    const isSequential = index > 0 && group.messages[index - 1]?.sender_id === message.sender_id;
                    
                    return (
                      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar - only show for first message in a sequence from non-owner */}
                          {showAvatar ? (
                            <Avatar className="h-8 w-8 mt-1 border border-gray-200 dark:border-gray-700">
                              <AvatarImage src={message.sender?.profile_photo_path} />
                              <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {getInitials(message.sender?.name)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            !isOwn && <div className="w-8" /> // Placeholder to maintain alignment
                          )}
                          
                          <div className={isOwn ? 'items-end flex flex-col' : 'items-start flex flex-col'}>
                            {/* Sender name - only show for first message in a group chat */}
                            {showSenderInfo && (
                              <p className="text-xs font-medium mb-1 px-1">
                                {message.sender?.name || t('unknown_user')}
                              </p>
                            )}
                            
                            {/* Message bubble with different styling based on sequence */}
                            <div className={cn(
                              "px-4 py-2 break-words shadow-sm",
                              isOwn 
                                ? "bg-primary text-primary-foreground" 
                                : " dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700",
                              
                              // Rounded corners based on position in sequence
                              isOwn
                                ? isSequential 
                                  ? "rounded-l-xl rounded-tr-xl rounded-br-sm" // Middle or end of sequence
                                  : "rounded-l-xl rounded-t-xl rounded-br-sm" // Start of sequence
                                : isSequential
                                  ? "rounded-r-xl rounded-tl-sm rounded-bl-xl" // Middle or end of sequence
                                  : "rounded-r-xl rounded-t-xl rounded-bl-sm" // Start of sequence
                            )}>
                              <p className="whitespace-pre-wrap text-[15px]">{message.message}</p>
                            </div>
                            
                            {/* Message info (time and read status) */}
                            <div className="flex items-center gap-1 mt-1 px-1">
                              <p className="text-xs text-muted-foreground">
                                {formatMessageTime(message.created_at)}
                              </p>
                              {isOwn && message.read_at && (
                                <Badge variant="outline" className="h-4 px-1 text-[10px] bg-primary/10 text-primary border-primary/20">
                                  {t('read')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700  dark:bg-gray-800 sticky bottom-0">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Image className="h-4 w-4" />
                  <span>{t('send_image')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  <span>{t('send_document')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Input
              placeholder={t('type_message')}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isSending}
              className="flex-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            />
            
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <Smile className="h-5 w-5" />
            </Button>
            
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full" 
              disabled={isSending || !messageText.trim()}
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 