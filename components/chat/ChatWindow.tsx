'use client';

import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { Message } from '@/types/chat-messages';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  isGroupChat?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ChatWindow({ 
  messages, 
  isLoading = false, 
  className = '',
  messagesEndRef,
  isGroupChat = false,
  onLoadMore,
  hasMore = false
}: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef?.current && !isLoadingMore.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, messagesEndRef]);

  // Handle scroll to load more messages
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    
    // If scrolled to top and there are more messages, load them
    if (scrollTop === 0 && hasMore && onLoadMore && !isLoadingMore.current) {
      isLoadingMore.current = true;
      onLoadMore();
      
      // Reset loading flag after a delay
      setTimeout(() => {
        isLoadingMore.current = false;
      }, 1000);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">جاري تحميل الرسائل...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={cn("flex-1 flex items-center justify-center", className)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            💬
          </div>
          <div>
            <h3 className="font-medium text-foreground">لا توجد رسائل بعد</h3>
            <p className="text-sm text-muted-foreground mt-1">
              ابدأ المحادثة بإرسال رسالة أولى
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea 
      className={cn("flex-1", className)}
      onScrollCapture={handleScroll}
      ref={scrollAreaRef}
    >
      <div className="p-4 space-y-2">
        {/* Load more indicator */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              انتقل للأعلى لتحميل المزيد
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !previousMessage || 
                           previousMessage.senderId !== message.senderId ||
                           message.type === 'system';

          return (
            <ChatMessage
              key={message.id}
              message={message}
              showAvatar={showAvatar}
              showTimestamp={true}
              isGroupChat={isGroupChat}
            />
          );
        })}

        {/* Loading indicator for new messages */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </ScrollArea>
  );
}