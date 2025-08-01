/**
 * Chat Store - Real-time Chat State Management
 * Using Zustand for efficient state management with real-time updates
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { realtimeService, RealtimeMessage, TypingData } from '@/services/realtime.service';
import { API_BASE_CONFIG } from '@/config/api.config';

import { toast } from 'sonner';
import { ChatMessage } from '@/services/chat.service';
import { ConnectionStatus } from '@/types/chat-messages';

// Types
export interface Chat {
  id: string;
  title: string;
  type: 'private' | 'group' | 'support';
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface TypingUser {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface ChatState {
  // Data
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  currentChatId: string | null;
  typingUsers: TypingUser[];
  
  // UI State
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  connectionStatus: ConnectionStatus;
  
  // Pagination
  messagesPagination: Record<string, {
    hasMore: boolean;
    currentPage: number;
    isLoadingMore: boolean;
  }>;
  
  // Actions
  setCurrentChat: (chatId: string | null) => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string, page?: number) => Promise<void>;
  sendMessage: (chatId: string, content: string, type?: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  
  // Real-time
  addMessage: (message: ChatMessage, chatId: string) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setTyping: (chatId: string, userId: string, userName: string, isTyping: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  
  // Utilities
  getChatById: (chatId: string) => Chat | undefined;
  getUnreadChatsCount: () => number;
  reset: () => void;
}

const initialState = {
  chats: [],
  messages: {},
  currentChatId: null,
  typingUsers: [],
  isLoading: false,
  isLoadingMessages: false,
  isSending: false,
  connectionStatus: 'disconnected' as ConnectionStatus,
  messagesPagination: {}
};

export const useChatStore = create<ChatState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId });
        
        if (chatId) {
          // Load messages for the chat
          get().loadMessages(chatId);
          
          // Subscribe to real-time updates for this chat
          const service = realtimeService();
          if (service && service.subscribeToChatChannel) {
            service.subscribeToChatChannel(parseInt(chatId));
          }
          
          // Mark messages as read
          get().markAsRead(chatId);
        }
      },

      loadChats: async () => {
        set({ isLoading: true });
        
        try {
          // API call to fetch chats
          const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/chats`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) throw new Error('Failed to load chats');
          
          const data = await response.json();
          set({ 
            chats: data.chats || [],
            isLoading: false 
          });
          
        } catch (error) {
          console.error('Error loading chats:', error);
          toast.error('خطأ في تحميل المحادثات');
          set({ isLoading: false });
        }
      },

      loadMessages: async (chatId, page = 1) => {
        const state = get();
        const isLoadingMore = page > 1;
        
        if (isLoadingMore) {
          set({
            messagesPagination: {
              ...state.messagesPagination,
              [chatId]: {
                ...state.messagesPagination[chatId],
                isLoadingMore: true
              }
            }
          });
        } else {
          set({ isLoadingMessages: true });
        }
        
        try {
          const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/chats/${chatId}/messages?page=${page}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) throw new Error('Failed to load messages');
          
          const data = await response.json();
          const newMessages = data.messages?.data || [];
          
          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: isLoadingMore 
                ? [...(state.messages[chatId] || []), ...newMessages]
                : newMessages
            },
            messagesPagination: {
              ...state.messagesPagination,
              [chatId]: {
                hasMore: data.messages?.has_more_pages || false,
                currentPage: page,
                isLoadingMore: false
              }
            },
            isLoadingMessages: false
          }));
          
        } catch (error) {
          console.error('Error loading messages:', error);
          toast.error('خطأ في تحميل الرسائل');
          set({ 
            isLoadingMessages: false,
            messagesPagination: {
              ...state.messagesPagination,
              [chatId]: {
                ...state.messagesPagination[chatId],
                isLoadingMore: false
              }
            }
          });
        }
      },

      sendMessage: async (chatId, content, type = 'text') => {
        set({ isSending: true });
        
        // Optimistic update
        const tempMessage: ChatMessage = {
          id: Date.now(),
          chat_id: parseInt(chatId),
          sender_id: 'current-user' as unknown as number, // This should be the actual user ID
          message: content,
          type: type as any,
          status: 'sent',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_deleted: false,
          is_edited: false
        };
        
        get().addMessage(tempMessage, chatId);
        
        try {
          const response = await fetch(`${API_BASE_CONFIG.BASE_URL}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              message: content,
              type
            })
          });
          
          if (!response.ok) throw new Error('Failed to send message');
          
          const data = await response.json();
          
          // Replace temp message with real message
          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId]?.map(msg => 
                msg.id === tempMessage.id ? data.message : msg
              ) || []
            },
            isSending: false
          }));
          
        } catch (error) {
          console.error('Error sending message:', error);
          toast.error('خطأ في إرسال الرسالة');
          
          // Remove temp message on error
          set((state) => ({
            messages: {
              ...state.messages,
              [chatId]: state.messages[chatId]?.filter(msg => msg.id !== tempMessage.id) || []
            },
            isSending: false
          }));
        }
      },

      markAsRead: async (chatId) => {
        try {
          await fetch(`${API_BASE_CONFIG.BASE_URL}/chats/${chatId}/read`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('nextauth_token') || localStorage.getItem('token')}`,
              'Accept': 'application/json'
            }
          });
          
          // Update local state
          set((state) => ({
            chats: state.chats.map(chat => 
              chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
            )
          }));
          
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      },

      addMessage: (message, chatId) => {
        set((state) => {
          const existingMessages = state.messages[chatId] || [];
          
          // Check if message already exists (avoid duplicates)
          const messageExists = existingMessages.some(m => m.id === message.id);
          if (messageExists) return state;
          
          return {
            messages: {
              ...state.messages,
              [chatId]: [...existingMessages, message]
            },
            chats: state.chats.map(chat => 
              chat.id === chatId 
                ? { 
                    ...chat, 
                    lastMessage: message,
                    unreadCount: chat.id === state.currentChatId ? 0 : chat.unreadCount + 1,
                    updatedAt: message.created_at
                  }
                : chat
            )
          };
        });
      },

      updateMessage: (messageId, updates) => {
        set((state) => {
          const newMessages = { ...state.messages };
          
          Object.keys(newMessages).forEach(chatId => {
            newMessages[chatId] = newMessages[chatId].map(msg => 
              msg.id.toString() === messageId.toString() 
                ? { ...msg, ...updates }
                : msg
            );
          });
          
          return { messages: newMessages };
        });
      },

      setTyping: (chatId, userId, userName, isTyping) => {
        set((state) => {
          const now = Date.now();
          let newTypingUsers = state.typingUsers.filter(t => 
            !(t.chatId === chatId && t.userId === userId)
          );
          
          if (isTyping) {
            newTypingUsers.push({
              chatId,
              userId,
              userName,
              timestamp: now
            });
          }
          
          // Remove old typing indicators (older than 10 seconds)
          newTypingUsers = newTypingUsers.filter(t => now - t.timestamp < 10000);
          
          return { typingUsers: newTypingUsers };
        });
      },

      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      getChatById: (chatId) => {
        return get().chats.find(chat => chat.id === chatId);
      },

      getUnreadChatsCount: () => {
        return get().chats.reduce((count, chat) => count + chat.unreadCount, 0);
      },

      reset: () => {
        set(initialState);
      }
    })),
    {
      name: 'chat-store'
    }
  )
);

// Real-time event listeners
if (typeof window !== 'undefined') {
  try {
    const service = realtimeService();
    if (service) {
      if (service.onMessage) {
        service.onMessage("all", (message: RealtimeMessage) => {
          // Convert RealtimeMessage to ChatMessage format
          const chatMessage: ChatMessage = {
            id: typeof message.id === 'string' ? parseInt(message.id) : message.id,
            chat_id: message.chat_id,
            sender_id: message.sender.id,
            message: message.message,
            type: (message.type as "text" | "image" | "file" | "audio" | "system") || 'text',
            status: 'sent',
            created_at: message.created_at,
            updated_at: message.created_at,
            is_deleted: false,
            is_edited: false
          };
          useChatStore.getState().addMessage(chatMessage, message.chat_id.toString());
        });
      }
      if (service.onTyping) {
        service.onTyping("all", (data: TypingData) => {
          const chatId = data.chatId.toString();
          useChatStore.getState().setTyping(chatId, data.userId.toString(), data.userName || 'مستخدم', data.isTyping);
        });
      } 
      
    }
  } catch (error) {
    console.error('Failed to initialize realtime chat listeners:', error);
  }
} 