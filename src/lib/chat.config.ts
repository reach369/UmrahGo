/**
 * Chat System Configuration
 * 
 * This file contains configuration settings for the real-time chat system
 * that can be used across all user types (Pilgrims, Offices, Bus Operators, etc.)
 */

export const CHAT_CONFIG = {
  // WebSocket configuration
  WS: {
    // Reconnection settings
    RECONNECT_INTERVAL: 5000, // 5 seconds between reconnection attempts
    MAX_RECONNECT_ATTEMPTS: 10,
    
    // Connection keep-alive
    PING_INTERVAL: 30000, // 30 seconds ping interval
    PING_TIMEOUT: 5000,   // 5 seconds timeout for ping response
    
    // Get WebSocket URL based on environment
    getWSUrl: (): string => {
      const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 
        (process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1')
          .replace('https://', wsProtocol + '//')
          .replace('http://', wsProtocol + '//')
          .replace('/api/v1', '');
      
      return wsBaseUrl;
    },
    
    // Build WebSocket endpoint for specific user type and chat
    getWSEndpoint: (userType: 'pilgrim' | 'office' | 'bus_operator' | 'admin', token: string, chatId?: string): string => {
      const wsUrl = CHAT_CONFIG.WS.getWSUrl();
      const baseEndpoint = `/ws/chat/${userType}?token=${encodeURIComponent(token)}`;
      return `${wsUrl}${baseEndpoint}${chatId ? `&chat_id=${chatId}` : ''}`;
    }
  },
  
  // Message Types
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    DOCUMENT: 'document',
    VOICE: 'voice',
    LOCATION: 'location',
    SYSTEM: 'system'
  },
  
  // Message Statuses
  MESSAGE_STATUS: {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
  },
  
  // WebSocket Message Types
  WS_MESSAGE_TYPES: {
    NEW_MESSAGE: 'message',
    MESSAGE_STATUS: 'message_status',
    TYPING: 'typing',
    PRESENCE: 'presence',
    PING: 'ping',
    PONG: 'pong'
  },
  
  // Chat Types
  CHAT_TYPES: {
    PRIVATE: 'private',
    GROUP: 'group',
    SUPPORT: 'support'
  },
  
  // Pagination
  PAGINATION: {
    MESSAGES_PER_PAGE: 20,
    CHATS_PER_PAGE: 10
  },
  
  // API Endpoints (from API_CONFIG but specific to chat)
  API_ENDPOINTS: {
    LIST_CHATS: '/chats',
    GET_CHAT: (chatId: string) => `/chats/${chatId}`,
    CREATE_CHAT: '/chats',
    MESSAGES: (chatId: string) => `/chats/${chatId}/messages`,
    SEND_MESSAGE: (chatId: string) => `/chats/${chatId}/messages`,
    MARK_READ: (chatId: string) => `/chats/${chatId}/read`,
    ARCHIVE: (chatId: string) => `/chats/${chatId}/archive`,
    CHECK_WITH_USER: (userId: string) => `/chats/with/${userId}`,
    UNREAD_COUNT: '/chats/unread-count'
  }
};

/**
 * WebSocket Message Interface
 * Standard format for all WebSocket messages
 */
export interface WSMessage {
  type: string;
  chat_id?: string;
  message_id?: string;
  content?: string;
  content_type?: string;
  status?: string;
  timestamp?: string;
  sender_id?: string;
  [key: string]: any;
}

export default CHAT_CONFIG; 