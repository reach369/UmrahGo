/**
 * Unified Chat Message Types
 * This file contains all message-related type definitions
 * to ensure consistency across all chat components
 */

// Base message interface compatible with ChatWindow
export interface Message {
  id: string;
  chatId?: string;
  content?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp?: string;
  type?: string;
  status?: string;
  readAt?: string;
  isOwn?: boolean;
  sender_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  message?: string;
  content_type?: string;
  sent_at?: string;
  created_at?: string;
  attachment?: any;
  sender?: {
    id?: string;
    name?: string;
    avatar?: string;
    profile_photo?: string;
    profile_photo_path?: string;
  };
}

// Extended message interface for advanced features
export interface ExtendedMessage extends Message {
  delivered_at?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  reply_to_id?: string | number | null;
  forwarded_from?: string | null;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  mentions?: string[];
  metadata?: Record<string, any>;
}

// Message reaction interface
export interface MessageReaction {
  id: string;
  user_id: string;
  message_id: string;
  emoji: string;
  created_at: string;
}

// Message attachment interface
export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  size: number;
  mime_type?: string;
  thumbnail_url?: string;
}

// Message status type
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// Message type
export type MessageType = 'text' | 'image' | 'document' | 'voice' | 'video' | 'location' | 'system' | 'notification';

// Typing indicator interface
export interface TypingIndicator {
  userId: string;
  userName?: string;
  isTyping: boolean;
  timestamp: string;
}

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Chat window props interface
export interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onRetry: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  typingUsers?: string[];
  showTypingIndicators?: boolean;
  className?: string;
}

// Chat input props interface
export interface ChatInputProps {
  onSendMessage: (message: string, type?: MessageType) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  showAttachments?: boolean;
  onAttachFile?: (file: File) => void;
  maxLength?: number;
  className?: string;
}

// Chat header props interface
export interface ChatHeaderProps {
  recipientName: string;
  recipientAvatar?: string;
  recipientStatus?: string;
  onBack?: () => void;
  showCallButtons?: boolean;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onToggleInfo?: () => void;
  isTyping?: boolean;
  className?: string;
}

// Notification interface
export interface ChatNotification {
  id: string;
  type: 'message' | 'mention' | 'reaction' | 'system';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  sound?: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
} 