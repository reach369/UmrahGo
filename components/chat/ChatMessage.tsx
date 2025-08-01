'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { Message } from '@/types/chat-messages';

interface ChatMessageProps {
  message: Message;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isGroupChat?: boolean;
}

export function ChatMessage({ 
  message, 
  showAvatar = true, 
  showTimestamp = true,
  isGroupChat = false 
}: ChatMessageProps) {
  const locale = useLocale();

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: locale === 'ar' ? ar : enUS
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'system':
        return (
          <div className="flex justify-center my-4">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              {message.content}
            </Badge>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden max-w-sm">
              <img 
                src={message.attachment?.url || '/placeholder-image.jpg'} 
                alt="صورة مرسلة"
                className="w-full h-auto max-h-64 object-cover"
              />
            </div>
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-sm">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  📎
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {message.attachment?.name || 'ملف مرسل'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {message.attachment?.size ? `${(message.attachment.size / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
            </div>
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );
    }
  };

  if (message.type === 'system') {
    return renderMessageContent();
  }

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      message.isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {showAvatar && !message.isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback className="text-xs">
            {message.senderName?.charAt(0)?.toUpperCase() || '؟'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col max-w-[70%]",
        message.isOwn ? "items-end" : "items-start"
      )}>
        {/* Sender name for group chats */}
        {isGroupChat && !message.isOwn && (
          <p className="text-xs text-muted-foreground mb-1 px-1">
            {message.senderName}
          </p>
        )}

        {/* Message bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-2 shadow-sm",
          message.isOwn 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted rounded-bl-md"
        )}>
          {renderMessageContent()}
        </div>

        {/* Timestamp and status */}
        {showTimestamp && (
          <div className={cn(
            "flex items-center gap-1 mt-1 px-1",
            message.isOwn ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp || '')}
            </span>
            {message.isOwn && getStatusIcon(message.status || 'sent')}
          </div>
        )}
      </div>
    </div>
  );
} 