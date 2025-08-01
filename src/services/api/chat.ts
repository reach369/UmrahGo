/**
 * Chat API Service
 * Comprehensive chat service that matches the Laravel backend structure
 */

import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getProxyUrl,
  getImageUrl
} from '@/config/api.config';

// Interfaces matching backend structure
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  profile_photo_path?: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface ChatParticipant {
  id: number;
  chat_id: number;
  user_id: number;
  user: User;
  role?: string;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
  last_seen_at?: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  sender: User;
  message: string;
  type: 'text' | 'image' | 'file' | 'system' | 'alert';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  priority?: 'normal' | 'high' | 'urgent';
  attachment?: string;
  mentions?: number[];
  reply_to?: number;
  is_edited: boolean;
  edited_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  title: string;
  type: 'private' | 'group' | 'broadcast';
  is_group: boolean;
  created_by: number;
  booking_id?: number;
  bus_id?: number;
  is_archived: boolean;
  is_active: boolean;
  priority: 'normal' | 'high' | 'urgent';
  description?: string;
  status?: string;
  ticket_number?: string;
  ticket_type?: string;
  closed_at?: string;
  closed_by?: number;
  metadata?: any;
  chat_type?: string;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface CreateChatRequest {
  title: string;
  type: 'private' | 'group' | 'broadcast';
  participants: number[];
  priority?: 'normal' | 'high' | 'urgent';
  description?: string;
  auto_add_admins?: boolean;
  first_message?: string;
}

export interface SendMessageRequest {
  message?: string;
  type?: 'text' | 'image' | 'file' | 'system';
  priority?: 'normal' | 'high' | 'urgent';
  mentions?: number[];
  attachment?: File;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

class ChatAPIService {
  private baseUrl = API_BASE_CONFIG.BASE_URL +'/chat';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
        const token = localStorage.getItem('nextauth_token') || localStorage.getItem('token');
    
    const defaultHeaders: HeadersInit = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error(`Chat API Error (${endpoint}):`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all chats for the current user
   */
  async getChats(): Promise<ApiResponse<Chat[]>> {
    return this.makeRequest<Chat[]>('/');
  }

  /**
   * Get a specific chat with messages
   */
  async getChat(chatId: number): Promise<ApiResponse<Chat>> {
    return this.makeRequest<Chat>(`/${chatId}`);
  }

  /**
   * Create a new chat
   */
  async createChat(data: CreateChatRequest): Promise<ApiResponse<Chat>> {
    return this.makeRequest<Chat>('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Create a private chat with specific recipient
   */
  async createPrivateChat(data: {
    title: string;
    recipient_id: number;
    recipient_type: 'user' | 'office' | 'admin';
    booking_id?: number;
    first_message: string;
  }): Promise<ApiResponse<Chat>> {
    return this.makeRequest<Chat>('/private', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get messages for a specific chat
   */
  async getMessages(
    chatId: number, 
    page: number = 1, 
    limit: number = 50
  ): Promise<ApiResponse<{
    messages: ChatMessage[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>> {
    return this.makeRequest(`/messages?page=${page}&limit=${limit}`);
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: number, data: SendMessageRequest): Promise<ApiResponse<ChatMessage>> {
    let body: FormData | string;

    if (data.attachment) {
      // Use FormData for file uploads
      body = new FormData();
      if (data.message) body.append('message', data.message);
      if (data.type) body.append('type', data.type);
      if (data.priority) body.append('priority', data.priority);
      if (data.mentions) body.append('mentions', JSON.stringify(data.mentions));
      body.append('attachment', data.attachment);
    } else {
      // Use JSON for text messages
      body = JSON.stringify(data);
    }

    return this.makeRequest<ChatMessage>(`/${chatId}/messages`, {
      method: 'POST',
      body,
    });
  }

  /**
   * Update a message
   */
  async updateMessage(messageId: number, message: string): Promise<ApiResponse<ChatMessage>> {
    return this.makeRequest<ChatMessage>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${chatId}/read`, {
      method: 'POST',
    });
  }

  /**
   * Get chat participants
   */
  async getParticipants(chatId: number): Promise<ApiResponse<ChatParticipant[]>> {
    return this.makeRequest<ChatParticipant[]>(`/${chatId}/participants`);
  }

  /**
   * Add participant to chat
   */
  async addParticipant(chatId: number, userId: number): Promise<ApiResponse<ChatParticipant>> {
    return this.makeRequest<ChatParticipant>(`/${chatId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Remove participant from chat
   */
  async removeParticipant(chatId: number, userId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${chatId}/participants/${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update typing status
   */
  async updateTypingStatus(chatId: number, isTyping: boolean): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${chatId}/typing`, {
      method: 'POST',
      body: JSON.stringify({ is_typing: isTyping }),
    });
  }

  /**
   * Join a chat
   */
  async joinChat(chatId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${chatId}/join`, {
      method: 'POST',
    });
  }

  /**
   * Leave a chat
   */
  async leaveChat(chatId: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/${chatId}/leave`, {
      method: 'POST',
    });
  }

  /**
   * Archive/Unarchive a chat
   */
  async toggleArchive(chatId: number): Promise<ApiResponse<Chat>> {
    return this.makeRequest<Chat>(`/${chatId}/archive`, {
      method: 'POST',
    });
  }

  /**
   * Get unread chats count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.makeRequest<{ count: number }>('/unread-count');
  }

  /**
   * Search chats
   */
  async searchChats(query: string): Promise<ApiResponse<Chat[]>> {
    return this.makeRequest<Chat[]>(`/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Get online users (for starting new chats)
   */
  async getOnlineUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>('/users/online');
  }

  /**
   * Search users (for adding to chats)
   */
  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }
}

// Export singleton instance
export const chatAPI = new ChatAPIService();
export default chatAPI; 