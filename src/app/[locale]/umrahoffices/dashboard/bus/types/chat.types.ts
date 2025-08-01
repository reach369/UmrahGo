export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'bus_operator' | 'office' | 'pilgrim';
  senderName: string;
  content: string;
  contentType: 'text' | 'image' | 'document';
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  chatId: string;
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group chats
  participants: {
    id: string;
    type: 'bus_operator' | 'office' | 'pilgrim';
    name: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ChatNotification {
  id: string;
  chatId: string;
  messageId: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  messagePreview: string;
  isRead: boolean;
  timestamp: string;
}

export interface ChatParticipant {
  id: string;
  type: 'bus_operator' | 'office' | 'pilgrim';
  name: string;
  avatar?: string;
  lastSeen?: string;
  isOnline: boolean;
} 