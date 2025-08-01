'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  Loader2, 
  AlertCircle,
  WifiOff,
  RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  showAttachments?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  onRetryConnection?: () => void;
  maxLength?: number;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  value,
  onChange,
  onKeyDown,
  isLoading = false,
  disabled = false,
  placeholder,
  showAttachments = true,
  connectionStatus = 'connected',
  onRetryConnection,
  maxLength = 1000,
  className = ''
}: ChatInputProps) {
  const t = useTranslations();
  const [inputValue, setInputValue] = useState(value || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update internal state when prop value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Check if offline or error state
  const isOfflineOrError = connectionStatus === 'error' || connectionStatus === 'disconnected';
  
  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [inputValue]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(e);
    }
  };
  
  // Handle send message
  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading || disabled) return;
    
    onSendMessage(inputValue);
    if (value === undefined) { // Only clear if not controlled component
      setInputValue('');
    }
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  // Handle key press if not provided by parent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn(
      "border-t bg-background p-3 relative",
      className
    )}>
      {/* Connection status indicator */}
      {isOfflineOrError && (
        <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
          <div className="bg-destructive/80 text-destructive-foreground text-xs px-3 py-1 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              <span>
                {connectionStatus === 'error' 
                  ? t('chat.connection_error') 
                  : t('chat.offline_mode')}
              </span>
            </div>
            {onRetryConnection && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 rounded-full p-0 hover:bg-destructive-foreground/10"
                onClick={onRetryConnection}
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Fall back message when offline */}
      {isOfflineOrError && (
        <div className="bg-muted/50 rounded-md p-2 mb-2 text-xs text-center text-muted-foreground">
          {connectionStatus === 'error' 
            ? t('chat.using_fallback_mode') 
            : t('chat.messages_will_send_when_online')}
        </div>
      )}
      
      <div className={cn(
        "flex items-end gap-2 rounded-md border bg-background",
        isLoading && "opacity-70"
      )}>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('chat.type_message')}
          className="flex-1 max-h-32 min-h-10 py-3 px-3 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          disabled={isLoading || disabled}
          maxLength={maxLength}
        />
        
        <div className="flex items-center p-3 gap-1">
          {showAttachments && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
                disabled={isLoading || disabled}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
                disabled={isLoading || disabled}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
                disabled={isLoading || disabled}
              >
                <Smile className="h-5 w-5" />
              </Button>
            </>
          )}
          
          <Button
            type="button"
            size="icon"
            className={cn(
              "rounded-full h-9 w-9 ml-1",
              !inputValue.trim() && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || disabled}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Character counter */}
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right mt-1">
          {inputValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
} 