/**
 * Chat Service
 * API service for chat functionality
 */

import axios, { AxiosError } from 'axios';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getProxyUrl,
  getImageUrl
} from '@/config/api.config';
// Types

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
export interface ChatMessage {
  id: number;
  chat_id: number;
  user_id?: number;
  sender_id: number;
  sender?: {
    id: number;
    name: string;
    email: string;
    profile_photo_path?: string;
  };
  message: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  read_at?: string;
  delivered_at?: string;
}

export interface ChatParticipant {
  id: number;
  user_id: number;
  chat_id: number;
  name?: string;
  email?: string;
  profile_photo_path?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  is_online?: boolean;
  last_seen_at?: string;
}

export interface Chat {
  id: number;
  title?: string;
  created_by: number;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
  participants?: ChatParticipant[];
  recipient?: ChatParticipant;
  unread_count?: number;
}

// API Base URL
const API_BASE_URL = API_BASE_CONFIG.BASE_URL || '/api';

/**
 * Get all chats for the current user
 */
async function getChats(token: string, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chats`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chats'
    };
  }
}

/**
 * Get messages for a chat
 */
async function getMessages(chatId: string, token: string, userType: string = 'pilgrim', page: number = 1, perPage: number = 50) {
  try {
    const endpoint = `${API_BASE_URL}/chats/${chatId}/messages`;

    const response = await axios.get(endpoint, {
      params: {
        page,
        per_page: perPage
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Extract messages from the response
    let messages: any[] = [];
    
    if (response.data.success && response.data.data) {
      // Handle standardized API response format
      messages = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Handle direct array response
      messages = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Handle nested data array
      messages = response.data.data;
    }
    
    // Sort messages by date
    messages.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateA.getTime() - dateB.getTime();
    });
    
    return messages;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch messages');
  }
}

/**
 * Send a message
 */
async function sendMessage(chatId: string, token: string, message: string, userType: string = 'pilgrim', priority: string = 'normal') {
  try {
    const endpoint = `${API_BASE_URL}/chats/${chatId}/messages`;

    const response = await axios.post(endpoint, 
      {
        message,
        type: 'text',
        priority
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'Message sent successfully'
    };
  } catch (error: any) {
    console.error('Error sending message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send message'
    };
  }
}

/**
 * Create a new chat
 */
async function createChat(token: string, recipientId: number, title?: string, isGroup: boolean = false, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chats`;

    const response = await axios.post(endpoint, 
      {
        recipient_id: recipientId,
        is_group: isGroup,
        title: title || null,
        type: isGroup ? 'group' : 'private',
        priority: 'normal'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'Chat created successfully'
    };
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create chat'
    };
  }
}

/**
 * Mark messages as read
 */
async function markAsRead(chatId: string, token: string, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chats/${chatId}/read`;

    const response = await axios.post(endpoint, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: response.data.message || 'Messages marked as read'
    };
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark messages as read'
    };
  }
}

/**
 * Get chat participants
 */
async function getChatParticipants(chatId: string, token: string, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chats/${chatId}/participants`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Participants fetched successfully'
    };
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch participants'
    };
  }
}

/**
 * Upload a file to a chat
 */
async function uploadFile(chatId: string, token: string, file: File, message?: string, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chats/${chatId}/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (message) {
      formData.append('message', message);
    }

    const response = await axios.post(endpoint, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: true,
      data: response.data.data || null,
      message: response.data.message || 'File uploaded successfully'
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to upload file'
    };
  }
}

/**
 * Send typing status
 */
async function sendTypingStatus(chatId: string, token: string, isTyping: boolean, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chats/${chatId}/typing`;

    const response = await axios.post(endpoint, 
      { is_typing: isTyping },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      message: response.data.message || 'Typing status updated'
    };
  } catch (error: any) {
    console.error('Error sending typing status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update typing status'
    };
  }
}

/**
 * Search messages in a chat
 */
async function searchMessages(chatId: string | null, token: string, query: string, userType: string = 'pilgrim') {
  try {
    const endpoint = `${API_BASE_URL}/chat/search/messages`;
    
    const params: any = { query };
    if (chatId) {
      params.chat_id = chatId;
    }

    const response = await axios.get(endpoint, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message || 'Messages found'
    };
  } catch (error: any) {
    console.error('Error searching messages:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search messages'
    };
  }
}

/**
 * Get unread messages count
 */
async function getUnreadCount(token: string, userType: string = 'pilgrim') {
  try {
      const endpoint = `${API_BASE_URL}/chat/unread-count`;

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      success: true,
      count: response.data.count || 0,
      byType: response.data.by_type || {},
      message: response.data.message || 'Unread count retrieved'
    };
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return {
      success: false,
      count: 0,
      byType: {},
      message: error.response?.data?.message || 'Failed to get unread count'
    };
  }
}

/**
 * Check server connection status (can be used to test API connectivity)
 */
async function checkConnectionStatus(token: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/status`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 5000 // 5 second timeout
    });
    
    return {
      success: true,
      online: true,
      message: response.data.message || 'Server is online'
    };
  } catch (error) {
    return {
      success: false,
      online: false,
      message: 'Server connection failed'
    };
  }
}

/**
 * Get the last message for a chat
 */
async function getLastMessage(chatId: string, token: string, userType: string = 'pilgrim') {
  try {
    const messages = await getMessages(chatId, token, userType, 1, 1);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  } catch (error) {
    console.error('Error getting last message:', error);
    return null;
  }
}

// Export service
const chatService = {
  getChats,
  getMessages,
  sendMessage,
  createChat,
  markAsRead,
  getChatParticipants,
  checkConnectionStatus,
  uploadFile,
  sendTypingStatus,
  searchMessages,
  getUnreadCount,
  getLastMessage
};

export default chatService; 