export interface TransportChatMessage {
  id: string;
  senderId: string;
  senderType: 'transport_operator' | 'office' | 'pilgrim';
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

export interface TransportChatRoom {
  id: string;
  type: 'direct' | 'group';
  name?: string; // For group chats
  participants: {
    id: string;
    type: 'transport_operator' | 'office' | 'pilgrim';
    name: string;
    avatar?: string;
  }[];
  lastMessage?: TransportChatMessage;
  createdAt: string;
  updatedAt: string;
}

export interface TransportChatNotification {
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

export interface TransportChatParticipant {
  id: string;
  type: 'transport_operator' | 'office' | 'pilgrim';
  name: string;
  avatar?: string;
  lastSeen?: string;
  isOnline: boolean;
} 