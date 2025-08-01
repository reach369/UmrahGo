export interface PilgrimChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  contentType: 'text' | 'image' | 'document' | 'voice' | 'location';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'user' | 'system' | 'notification';
  attachment?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  };
  mentions?: string[];
  metadata?: any;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  isEdited: boolean;
  isPinned: boolean;
  isStarred: boolean;
  replyTo?: string;
  reactions?: {
    emoji: string;
    users: string[];
    count: number;
  }[];
}

export interface PilgrimChatRoom {
  id: string;
  type: 'private' | 'group' | 'support';
  chatType?: 'booking' | 'general' | 'support' | 'emergency';
  name?: string;
  description?: string;
  avatar?: string;
  participants: PilgrimChatParticipant[];
  lastMessage?: PilgrimChatMessage;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isGroup: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  bookingId?: string;
  officeId?: string;
  settings?: {
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowLocationSharing: boolean;
    messageRetention: number; // days
    encryption: boolean;
  };
}

export interface PilgrimChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: 'admin' | 'member' | 'moderator' | 'support' | 'office' | 'pilgrim';
  permissions: string[];
  isActive: boolean;
  isTyping: boolean;
  lastSeen: string;
  joinedAt: string;
  mutedUntil?: string;
  isBlocked: boolean;
  customTitle?: string;
}

export interface PilgrimChatNotification {
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

export interface PilgrimChatTypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface PilgrimChatReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: string;
}

export interface PilgrimChatSettings {
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

export interface PilgrimChatState {
  chats: PilgrimChatRoom[];
  activeChat: string | null;
  messages: { [chatId: string]: PilgrimChatMessage[] };
  notifications: PilgrimChatNotification[];
  typingIndicators: { [chatId: string]: PilgrimChatTypingIndicator[] };
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: PilgrimChatMessage[];
  selectedMessages: string[];
  settings: PilgrimChatSettings;
  drafts: { [chatId: string]: string };
  archivedChats: PilgrimChatRoom[];
  pinnedMessages: { [chatId: string]: PilgrimChatMessage[] };
  starredMessages: PilgrimChatMessage[];
}

export interface PilgrimWebSocketMessage {
  type: 'new_message' | 'message_status' | 'typing' | 'notification' | 'reaction' | 'presence';
  payload: any;
  timestamp: string;
  chatId?: string;
  userId?: string;
}

export interface PilgrimChatFilter {
  type?: 'all' | 'unread' | 'groups' | 'archived' | 'muted';
  searchQuery?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  participants?: string[];
  hasAttachments?: boolean;
  messageType?: 'text' | 'image' | 'document' | 'voice';
}

export interface PilgrimChatAnalytics {
  totalMessages: number;
  totalChats: number;
  activeChats: number;
  unreadMessages: number;
  averageResponseTime: number;
  mostActiveChat: string;
  messageFrequency: { [date: string]: number };
  participantActivity: { [userId: string]: number };
}

export interface PilgrimChatExport {
  format: 'json' | 'txt' | 'html' | 'pdf';
  chatId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMedia: boolean;
  includeSystemMessages: boolean;
} 