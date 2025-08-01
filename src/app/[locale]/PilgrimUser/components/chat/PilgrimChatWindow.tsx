'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PilgrimChatWindowProps {
  messages: any[];
  isLoading: boolean;
  error: string | null;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  onRetry?: () => void;
}

export function PilgrimChatWindow({ 
  messages, 
  isLoading, 
  error,
  messagesEndRef,
  onRetry
}: PilgrimChatWindowProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const loadingRef = useRef<HTMLDivElement>(null);

  // Function to format the message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const locale = document.documentElement.lang === 'ar' ? ar : enUS;
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto" ref={loadingRef}>
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm text-center text-muted-foreground">
          {t('pilgrim.chat.loading_messages')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('pilgrim.chat.retry')}
          </Button>
        )}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-center text-muted-foreground">
          {t('pilgrim.chat.no_messages')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.sender_id === currentUserId;
        const showAvatar = !isCurrentUser;
        
        return (
          <div 
            key={message.id || index} 
            className={cn(
              "flex items-end gap-2 max-w-[85%]",
              isCurrentUser ? "ml-auto" : "mr-auto"
            )}
          >
            {showAvatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender_avatar} alt={message.sender_name} />
                <AvatarFallback>{message.sender_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
            ) : null}
            
            <div className={cn(
              "rounded-2xl p-3 max-w-full break-words",
              isCurrentUser 
                ? "bg-primary text-primary-foreground rounded-br-none" 
                : "bg-muted rounded-bl-none"
            )}>
              {message.content}
              <div className={cn(
                "text-[0.65rem] mt-1 select-none",
                isCurrentUser 
                  ? "text-primary-foreground/70 text-right" 
                  : "text-muted-foreground"
              )}>
                {formatMessageTime(message.sent_at)}
                {isCurrentUser && (
                  <span className="ml-1">
                    {message.status === 'read' && '✓✓'}
                    {message.status === 'delivered' && '✓✓'}
                    {message.status === 'sent' && '✓'}
                    {message.status === 'sending' && '⋯'}
                    {message.status === 'failed' && '!'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
} 