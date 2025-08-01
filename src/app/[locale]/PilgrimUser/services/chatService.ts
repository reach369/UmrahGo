import axios, { AxiosError } from 'axios';
import { API_BASE_CONFIG, USER_ENDPOINTS } from '@/config/api.config';
import { handleApiError } from '@/lib/utils';

// Chat message interfaces
export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  content_type: 'text' | 'image' | 'document' | 'voice' | 'location';
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
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
}

// Chat conversation interfaces
export interface ChatRoom {
  id: string;
  title: string;
  type: 'private' | 'group' | 'support';
  participants: ChatParticipant[];
  last_message?: ChatMessage;
  unread_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatParticipant {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'member' | 'moderator' | 'support' | 'office' | 'pilgrim';
  is_active: boolean;
  last_seen: string;
}

export interface CheckConversationResponse {
  success: boolean;
  exists: boolean;
  chat_id?: string;
}

export interface CreateConversationResponse {
  success: boolean;
  chat: ChatRoom;
  first_message?: ChatMessage;
}

export interface SendMessageResponse {
  success: boolean;
  message: ChatMessage;
}

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

// Create axios instance with retry functionality
const createApiInstance = () => {
  const instance = axios.create({
    timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
    headers: API_BASE_CONFIG.DEFAULT_HEADERS,
  });

  // Add request interceptor for retries
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      
      if (!config || config.retryCount >= 2) {
        throw error;
      }

      config.retryCount = (config.retryCount || 0) + 1;
      
      // Try fallback URLs if main URL fails
      if (config.retryCount === 1 && API_BASE_CONFIG.FALLBACK_URLS.length > 0) {
        const fallbackUrl = API_BASE_CONFIG.FALLBACK_URLS[0];
        config.baseURL = fallbackUrl;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
      
      return instance.request(config);
    }
  );

  return instance;
};

const apiInstance = createApiInstance();

/**
 * Get all conversations for the logged-in user
 * Similar to getConversations in the Dart implementation
 */
export const getConversations = async (token: string): Promise<ConversationResponse> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.get( API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.LIST, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    }
    
    throw new Error('Server error');
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw handleApiError(error);
  }
};

/**
 * Get total unread message count
 * Similar to getUnreadCount in the Dart implementation
 */
export const getUnreadCount = async (token: string): Promise<number> => {
  try {
    if (!token) {
      console.warn('No token provided for chat getUnreadCount, returning 0');
      return 0; // Return 0 instead of throwing an error
    }

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.UNREAD_COUNT, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.count;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    // Return 0 instead of throwing to prevent UI errors
    return 0;
  }
};

/**
 * Get messages for a specific chat
 * Similar to getMessages in the Dart implementation
 */
export const getMessages = async (token: string, chatId: string | number): Promise<ChatMessage[]> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.MESSAGES(chatId), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data && response.data.success) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching messages for chat ${chatId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Check if conversation exists with a user
 * Similar to checkConversation in the Dart implementation
 */
export const checkConversation = async (token: string, userId: string | number): Promise<CheckConversationResponse> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.CHECK_WITH_USER(userId), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    }
    
    return { success: false, exists: false };
  } catch (error) {
    console.error(`Error checking conversation with user ${userId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Create a new conversation
 * Similar to createConversation in the Dart implementation
 */
export const createConversation = async (
  token: string, 
  participantId: string | number, 
  firstMessage: string
): Promise<CreateConversationResponse> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.CREATE, 
      {
        title: 'محادثة مباشرة',
        type: 'private',
        participants: [participantId],
        first_message: firstMessage,
        priority: 'normal',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    if ((response.status === 200 || response.status === 201) && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to create conversation');
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw handleApiError(error);
  }
};

/**
 * Send a message
 * Similar to sendMessage in the Dart implementation
 */
export const sendMessage = async (
  token: string, 
  chatId: string | number, 
  message: string, 
  type: string = 'text', 
  priority: string = 'normal'
): Promise<SendMessageResponse> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.SEND_MESSAGE(chatId), 
      { message, type, priority },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    if ((response.status === 200 || response.status === 201) && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to send message');
  } catch (error) {
    console.error(`Error sending message to chat ${chatId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Archive a conversation
 * Similar to archiveConversation in the Dart implementation
 */
export const archiveConversation = async (
  token: string, 
  chatId: string | number, 
  isArchived: boolean
): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.ARCHIVE(chatId), 
      { is_archived: isArchived },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    return response.status === 200 && response.data?.success === true;
  } catch (error) {
    console.error(`Error ${isArchived ? 'archiving' : 'unarchiving'} chat ${chatId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Pin a conversation
 * Similar to pinConversation in the Dart implementation
 */
export const pinConversation = async (
  token: string, 
  chatId: string | number, 
  isPinned: boolean
): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.put(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.CHAT.UPDATE(chatId), 
      { is_pinned: isPinned },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    return response.status === 200 && response.data?.success === true;
  } catch (error) {
    console.error(`Error ${isPinned ? 'pinning' : 'unpinning'} chat ${chatId}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Mark messages as read
 * Similar to markMessagesAsRead in the Dart implementation
 */
export const markMessagesAsRead = async (
  token: string, 
  chatId: string | number, 
  lastReadMessageId: string | number
): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+ USER_ENDPOINTS.CHAT.MARK_READ(chatId), 
      { last_read_message_id: lastReadMessageId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    return response.status === 200 && (response.data?.success === true || response.data?.status === true);
  } catch (error) {
    console.error(`Error marking messages as read in chat ${chatId}:`, error);
    throw handleApiError(error);
  }
}; 