'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { SendHorizontal, PaperclipIcon, ImageIcon, SmileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PilgrimChatHeader } from './PilgrimChatHeader';
import { PilgrimChatWindow } from './PilgrimChatWindow';
import { usePilgrimChatWebSocket } from '../../hooks/usePilgrimChatWebSocket';
import { getMessages, sendMessage } from '../../services/chatService';
import { getAuthToken } from '@/lib/auth.service';

interface PilgrimChatContainerProps {
  chatId: string;
  recipientName?: string;
  recipientAvatar?: string;
  initialMessages?: any[];
  onBack?: () => void;
  userId?: string | number;
  className?: string;
}

export function PilgrimChatContainer({
  chatId,
  recipientName,
  recipientAvatar,
  initialMessages = [],
  onBack,
  userId,
  className = ''
}: PilgrimChatContainerProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const { data: session } = useSession();

  // Get token from centralized auth service
  const getToken = () => {
    return getAuthToken();
  };

  const { 
    connectionStatus, 
    sendMessage: sendWebSocketMessage,
    markAsRead,
    unreadCount
  } = usePilgrimChatWebSocket({
    chatId,
    onNewMessage: (message) => {
      setMessages(prev => [...prev, message]);
      // Mark as read when we receive a new message (if it's not from us)
      if (message.sender_id !== session?.user?.id) {
        markAsRead(message.id);
      }
    },
    onMessageStatusUpdate: (messageId, status) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        )
      );
    },
    onConnectionStatusChange: (status) => {
      if (status === 'error') {
        setError(t('pilgrim.chat.connection_error'));
      } else {
        setError(null);
      }
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError(t('pilgrim.chat.auth_error'));
          return;
        }

        const messagesData = await getMessages(token, chatId);
        
        if (Array.isArray(messagesData) && messagesData.length > 0) {
          console.log(`Loaded ${messagesData.length} messages for chat ${chatId}`);
          setMessages(messagesData);
          
          // Mark latest message as read
          const latestMessage = messagesData[messagesData.length - 1];
          if (latestMessage && latestMessage.sender_id !== session?.user?.id) {
            markAsRead(latestMessage.id);
          }
        } else {
          console.warn('No messages returned or invalid data format', messagesData);
          setMessages([]);
        }
      } catch (err: any) {
        console.error('Error loading messages:', err);
        setError(t('pilgrim.chat.load_error'));
        toast.error(`${t('pilgrim.chat.load_error')}: ${err.message || 'Unknown error'}`);
        
        // Implement retry logic (max 3 retries)
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000); // Retry after 3 seconds
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatId, t, session?.user?.id, markAsRead, retryCount]);

  const handleSendMessage = async () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isSending) return;

    try {
      setIsSending(true);
      
      // Try to send via WebSocket first
      if (connectionStatus === 'connected') {
        const sent = sendWebSocketMessage(trimmedMessage);
        if (sent) {
          setInputValue('');
          return;
        }
      }
      
      // Fallback to REST API if WebSocket fails
      const token = getToken();
      if (!token) {
        toast.error(t('pilgrim.chat.auth_error'));
        return;
      }

      const response = await sendMessage(token, chatId, trimmedMessage);
      
      if (response && response.success && response.message) {
        setMessages(prev => [...prev, response.message]);
        setInputValue('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(`${t('pilgrim.chat.send_error')}: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden  dark:bg-gray-800 rounded-md border border-border shadow-sm ${className}`}>
      <PilgrimChatHeader 
        name={recipientName || 'Chat'} 
        avatar={recipientAvatar} 
        status={connectionStatus === 'connected' ? 'online' : 'offline'} 
        onBack={onBack}
      />
      
      <PilgrimChatWindow 
        messages={messages} 
        isLoading={isLoading} 
        error={error} 
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        onRetry={() => setRetryCount(prev => prev + 1)}
      />
      
      <div className="p-3 border-t border-border">
        {connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? (
          <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t('pilgrim.chat.connecting')}
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex-none flex gap-1">
              <Button type="button" size="icon" variant="ghost" className="rounded-full h-8 w-8">
                <PaperclipIcon className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="rounded-full h-8 w-8">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="rounded-full h-8 w-8">
                <SmileIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('pilgrim.chat.type_message')}
              className="flex-1 min-h-[40px] h-10 max-h-32 py-2 px-3 resize-none"
              disabled={isLoading || isSending || connectionStatus === 'error'}
            />
            
            <Button 
              type="button" 
              size="icon" 
              className="rounded-full h-10 w-10 flex-none"
              disabled={!inputValue.trim() || isSending || connectionStatus === 'error'}
              onClick={handleSendMessage}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 