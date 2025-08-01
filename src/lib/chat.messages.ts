/**
 * Chat Message Utilities
 * 
 * This file provides utility functions for handling chat messages
 * across all user types.
 */
import { ChatMessage, ChatRoom, ChatParticipant, WebSocketMessage } from '@/types/chat.types';
import { CHAT_CONFIG } from './chat.config';

/**
 * Format an API message to the standard format
 * @param message Message from API
 * @returns Standardized message
 */
export const formatApiMessage = (message: any): ChatMessage => {
  return {
    id: message.id,
    chatId: message.chat_id,
    senderId: message.sender_id,
    senderName: message.sender_name,
    senderAvatar: message.sender_avatar,
    content: message.content,
    contentType: message.content_type || 'text',
    status: message.status || 'sent',
    priority: message.priority || 'normal',
    type: message.type || 'user',
    attachment: message.attachment ? {
      id: message.attachment.id,
      name: message.attachment.name,
      url: message.attachment.url,
      size: message.attachment.size,
      type: message.attachment.type
    } : undefined,
    mentions: message.mentions || [],
    metadata: message.metadata || {},
    sentAt: message.sent_at || new Date().toISOString(),
    deliveredAt: message.delivered_at,
    readAt: message.read_at,
    editedAt: message.edited_at,
    isEdited: !!message.edited_at,
    isPinned: message.is_pinned || false,
    isStarred: message.is_starred || false,
    replyTo: message.reply_to,
    reactions: message.reactions || []
  };
};

/**
 * Format an API chat to the standard format
 * @param chat Chat from API
 * @returns Standardized chat
 */
export const formatApiChat = (chat: any): ChatRoom => {
  return {
    id: chat.id,
    type: chat.type || 'private',
    chatType: chat.chat_type,
    title: chat.title || chat.name || '',
    description: chat.description,
    avatar: chat.avatar,
    participants: Array.isArray(chat.participants) ? 
      chat.participants.map((p: any) => formatApiParticipant(p)) : [],
    lastMessage: chat.last_message ? formatApiMessage(chat.last_message) : undefined,
    unreadCount: chat.unread_count || 0,
    isPinned: chat.is_pinned || false,
    isMuted: chat.is_muted || false,
    isArchived: chat.is_archived || false,
    isGroup: chat.type === 'group' || chat.is_group || false,
    createdBy: chat.created_by,
    createdAt: chat.created_at,
    updatedAt: chat.updated_at || chat.created_at,
    bookingId: chat.booking_id,
    officeId: chat.office_id,
    settings: chat.settings || {
      allowFileSharing: true,
      allowVoiceMessages: true,
      allowLocationSharing: true,
      messageRetention: 30,
      encryption: false
    }
  };
};

/**
 * Format an API participant to the standard format
 * @param participant Participant from API
 * @returns Standardized participant
 */
export const formatApiParticipant = (participant: any): ChatParticipant => {
  return {
    id: participant.id,
    chatId: participant.chat_id,
    userId: participant.user_id,
    userName: participant.user_name || participant.name || '',
    userAvatar: participant.user_avatar || participant.avatar,
    userType: participant.user_type || 'pilgrim',
    role: participant.role || 'member',
    permissions: participant.permissions || [],
    isActive: participant.is_active || participant.is_online || false,
    isTyping: participant.is_typing || false,
    lastSeen: participant.last_seen || new Date().toISOString(),
    joinedAt: participant.joined_at || participant.created_at || new Date().toISOString(),
    mutedUntil: participant.muted_until,
    isBlocked: participant.is_blocked || false,
    customTitle: participant.custom_title
  };
};

/**
 * Format a WebSocket message to the standard format
 * @param wsMessage WebSocket message
 * @returns Standardized WebSocket message
 */
export const formatWebSocketMessage = (wsMessage: any): WebSocketMessage => {
  return {
    type: wsMessage.type,
    payload: wsMessage.payload || wsMessage.message || wsMessage.data || {},
    timestamp: wsMessage.timestamp || new Date().toISOString(),
    chatId: wsMessage.chat_id,
    userId: wsMessage.user_id
  };
};

/**
 * Create a sending message object
 * @param chatId Chat ID
 * @param content Message content
 * @param contentType Content type
 * @param senderId Sender ID
 * @param senderName Sender name
 * @returns Message object with 'sending' status
 */
export const createSendingMessage = (
  chatId: string, 
  content: string,
  contentType: string = 'text',
  senderId: string,
  senderName: string,
  senderAvatar?: string
): ChatMessage => {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: tempId,
    chatId,
    senderId,
    senderName,
    senderAvatar,
    content,
    contentType: contentType as 'text' | 'image' | 'document' | 'voice' | 'location' | 'system',
    status: 'sending',
    sentAt: new Date().toISOString(),
    priority: 'normal',
    type: 'user'
  };
};

/**
 * Get the last message status text
 * @param message Message
 * @returns Status text
 */
export const getMessageStatusText = (message: ChatMessage): string => {
  switch (message.status) {
    case 'sending':
      return 'جاري الإرسال...';
    case 'sent':
      return 'تم الإرسال';
    case 'delivered':
      return 'تم التوصيل';
    case 'read':
      return 'تمت القراءة';
    case 'failed':
      return 'فشل الإرسال';
    default:
      return '';
  }
};

/**
 * Get the user display name based on role
 * @param participant Participant object
 * @returns Display name
 */
export const getDisplayName = (participant: ChatParticipant): string => {
  if (!participant.userName) {
    switch (participant.role) {
      case 'admin':
        return 'مدير النظام';
      case 'office':
        return 'مكتب العمرة';
      case 'pilgrim':
        return 'معتمر';
    //   case 'bus_operator':
    //     return 'مشغل الحافلات';
      case 'support':
        return 'الدعم الفني';
      default:
        return 'مستخدم مجهول';
    }
  }
  return participant.userName;
};

/**
 * Create a system message
 * @param chatId Chat ID
 * @param content Message content
 * @returns System message object
 */
export const createSystemMessage = (chatId: string, content: string): ChatMessage => {
  return {
    id: `system-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    chatId,
    senderId: 'system',
    senderName: 'System',
    content,
    contentType: 'text',
    status: 'sent',
    type: 'system',
    sentAt: new Date().toISOString(),
  };
};

/**
 * Get user role color
 * @param role User role
 * @returns CSS color class
 */
export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'text-red-500';
    case 'office':
      return 'text-blue-500';
    case 'pilgrim':
      return 'text-green-500';
    case 'bus_operator':
      return 'text-purple-500';
    case 'support':
      return 'text-yellow-500';
    case 'moderator':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
};

/**
 * Get the other participant in a private chat
 * @param chat Chat object
 * @param currentUserId Current user ID
 * @returns Other participant
 */
export const getOtherParticipant = (chat: ChatRoom, currentUserId: string): ChatParticipant | undefined => {
  return chat.participants?.find(p => p.userId !== currentUserId);
};

/**
 * Format date for chat timestamp
 * @param date Date string
 * @returns Formatted time or date
 */
export const formatChatTime = (date: string): string => {
  const messageDate = new Date(date);
  const now = new Date();
  
  // Same day, show time
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Within last 7 days, show day
  const diffTime = Math.abs(now.getTime() - messageDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return messageDate.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Older, show date
  return messageDate.toLocaleDateString();
};

export default {
  formatApiMessage,
  formatApiChat,
  formatApiParticipant,
  formatWebSocketMessage,
  createSendingMessage,
  getMessageStatusText,
  getDisplayName,
  createSystemMessage,
  getRoleColor,
  getOtherParticipant,
  formatChatTime
}; 