/**
 * Universal Chat Types
 * 
 * This file contains type definitions for the chat system that can be used
 * across all user types (Pilgrims, Offices, Bus Operators, etc.)
 */

/**
 * Message Type
 * Represents a single chat message
 */
export interface ChatMessage {
  id: string | number;
  chatId?: string | number;
  chat_id?: string | number;
  senderId?: string | number;
  sender_id?: string | number;
  user_id?: string | number;
  senderName?: string;
  sender_name?: string;
  senderAvatar?: string;
  sender_avatar?: string;
  content?: string;
  message?: string;
  contentType?: 'text' | 'image' | 'document' | 'voice' | 'location' | 'system' | string;
  content_type?: string;
  type?: 'user' | 'system' | 'notification' | string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | string;
  priority?: 'low' | 'normal' | 'high' | 'urgent' | string;
  attachment?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  } | null;
  mentions?: string[];
  metadata?: any;
  sentAt?: string;
  sent_at?: string;
  created_at?: string;
  deliveredAt?: string;
  delivered_at?: string | null;
  readAt?: string;
  read_at?: string | null;
  editedAt?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  replyTo?: string;
  is_read?: number;
  firebase_ref?: string | null;
  reactions?: {
    emoji: string;
    users: string[];
    count: number;
  }[];
  sender?: {
    id: string | number;
    name?: string;
    email?: string;
    profile_photo?: string | null;
    avatar?: string | null;
    profile_photo_path?: string | null;
  };
}

/**
 * Chat Room Type
 * Represents a conversation between users
 */
export interface ChatRoom {
  id: string | number;
  type?: 'private' | 'group' | 'support' | string;
  chatType?: string | null;
  chat_type?: string | null;
  title?: string;
  description?: string;
  avatar?: string;
  participants?: ChatParticipant[];
  lastMessage?: ChatMessage;
  last_message?: any;
  unreadCount?: number;
  unread_count?: number;
  isPinned?: boolean;
  is_pinned?: boolean;
  isMuted?: boolean;
  is_muted?: boolean;
  isArchived?: boolean;
  is_archived?: boolean;
  isGroup?: boolean;
  is_group?: boolean;
  createdBy?: string | number;
  created_by?: string | number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  bookingId?: string | number;
  booking_id?: string | number | null;
  officeId?: string | number;
  bus_id?: string | number | null;
  status?: string | null;
  settings?: {
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowLocationSharing: boolean;
    messageRetention: number; // days
    encryption: boolean;
  };
}

/**
 * Chat Participant Type
 * Represents a user participating in a chat
 */
export interface ChatParticipant {
  id: string | number;
  chatId?: string | number;
  chat_id?: string | number;
  userId?: string | number;
  user_id?: string | number;
  userName?: string;
  name?: string;
  userAvatar?: string;
  avatar?: string;
  userType?: 'pilgrim' | 'office' | 'bus_operator' | 'admin' | string;
  role?: 'admin' | 'member' | 'moderator' | 'support' | 'office' | 'pilgrim' | string;
  permissions?: string[];
  isActive?: boolean;
  is_active?: boolean;
  isTyping?: boolean;
  is_typing?: boolean;
  lastSeen?: string;
  last_seen?: string;
  last_seen_at?: string;
  joinedAt?: string;
  joined_at?: string;
  mutedUntil?: string;
  isBlocked?: boolean;
  customTitle?: string;
  last_read_at?: string | null;
  typing_at?: string | null;
  user?: {
    id: number | string;
    name?: string;
    email?: string;
    gender?: string | null;
    phone?: string | null;
    status?: string;
    profile_photo?: string | null;
    avatar?: string | null;
    profile_photo_path?: string | null;
    umrah_office?: {
      id: number;
      office_name?: string;
      logo?: string;
    } | null;
    bus_operator?: any | null;
  };
}

/**
 * Chat Notification Type
 * Represents a notification related to a chat
 */
export interface ChatNotification {
  id: string;
  chatId: string;
  messageId: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messagePreview: string;
  chatName?: string;
  chatType: 'private' | 'group' | 'support';
  notificationType: 'new_message' | 'mention' | 'reply' | 'reaction' | 'join' | 'leave';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  isMuted: boolean;
  timestamp: string;
  metadata?: any;
  actionRequired?: boolean;
  actionUrl?: string;
  expiresAt?: string;
}

/**
 * Chat Typing Indicator Type
 * Represents a user typing in a chat
 */
export interface ChatTypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

/**
 * Chat State Type
 * Represents the state of the chat system in the Redux store
 */
export interface ChatState {
  chats: ChatRoom[];
  activeChat: string | null;
  messages: { [chatId: string]: ChatMessage[] };
  notifications: ChatNotification[];
  typingIndicators: { [chatId: string]: ChatTypingIndicator[] };
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: ChatMessage[];
  selectedMessages: string[];
  settings: ChatSettings;
  drafts: { [chatId: string]: string };
  archivedChats: ChatRoom[];
  pinnedMessages: { [chatId: string]: ChatMessage[] };
  starredMessages: ChatMessage[];
}

/**
 * Chat Settings Type
 * Represents user settings for the chat system
 */
export interface ChatSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    preview: boolean;
    mutedChats: string[];
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    profilePhoto: boolean;
    blockList: string[];
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
    bubbleStyle: 'rounded' | 'square';
  };
  security: {
    autoLock: boolean;
    lockTimeout: number;
    fingerprintUnlock: boolean;
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
  };
}

/**
 * WebSocket Message Type
 * Represents a message sent or received via WebSocket
 */
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  chatId?: string;
  userId?: string;
}

/**
 * Check Conversation Response Type
 * Response from checking if a conversation exists
 */
export interface CheckConversationResponse {
  success: boolean;
  exists: boolean;
  chat_id?: string;
}

/**
 * Create Conversation Response Type
 * Response from creating a new conversation
 */
export interface CreateConversationResponse {
  success: boolean;
  chat: ChatRoom;
  first_message?: ChatMessage;
}

/**
 * Send Message Response Type
 * Response from sending a message
 */
export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
}

/**
 * Conversation Response Type
 * Response from getting conversations
 */
export interface ConversationResponse {
  success: boolean;
  data: ChatRoom[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
} 