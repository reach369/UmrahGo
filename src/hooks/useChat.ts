/**
 * خطاف المحادثات الشامل
 * Comprehensive Chat Hook
 * 
 * This hook provides:
 * - Real-time chat messaging
 * - Message management (send, edit, delete)
 * - Typing indicators
 * - Online presence
 * - Message status tracking
 * - File attachments
 * - Error handling and retry mechanisms
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import realtimeService, { ChatMessage, ConnectionStatus } from '@/services/realtime.service';
import { getAuthToken } from '@/lib/auth.service';

// Types
export interface ChatRoom {
  isMuted: any;
  pinned: any;
  typing: boolean;
  muted: any;
  id: string | number;
  title: string;
  type: 'private' | 'group' | 'support';
  participants: ChatParticipant[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface ChatParticipant {
  id: string | number;
  user_id: string | number;
  chat_id: string | number;
  role: 'admin' | 'member' | 'moderator';
  is_active: boolean;
  last_seen_at?: string;
  user?: {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface SendMessageOptions {
  type?: 'text' | 'image' | 'file' | 'audio' | 'video';
  attachment?: File;
  mentions?: string[];
  replyTo?: string | number;
}

export interface ChatState {
  chats: ChatRoom[];
  messages: { [chatId: string]: ChatMessage[] };
  activeChat: string | null;
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  typingUsers: { [chatId: string]: string[] };
  onlineUsers: string[];
}

export interface ChatActions {
  // Chat management
  loadChats: () => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  createChat: (participants: string[], title?: string, type?: string) => Promise<ChatRoom | null>;
  leaveChat: (chatId: string) => Promise<void>;
  archiveChat: (chatId: string) => Promise<void>;
  
  // Message management
  sendMessage: (chatId: string, message: string, options?: SendMessageOptions) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (chatId: string) => Promise<void>;
  loadOlderMessages: (chatId: string) => Promise<void>;
  
  // Real-time features
  sendTypingIndicator: (chatId: string, isTyping: boolean) => void;
  
  // Utilities
  retry: () => void;
  clearError: () => void;
}

interface UseChatOptions {
  autoConnect?: boolean;
  enableTypingIndicators?: boolean;
  enablePresence?: boolean;
  messageLimit?: number;
}

const DEFAULT_OPTIONS: UseChatOptions = {
  autoConnect: true,
  enableTypingIndicators: true,
  enablePresence: true,
  messageLimit: 50
};

export function useChat(options: UseChatOptions = {}): ChatState & ChatActions {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // State
  const [state, setState] = useState<ChatState>({
    chats: [],
    messages: {},
    activeChat: null,
    isLoading: false,
    isLoadingMessages: false,
    isSending: false,
    error: null,
    connectionStatus: { pusher: 'disconnected', firebase: 'not_supported' },
    typingUsers: {},
    onlineUsers: []
  });

  // Refs for cleanup
  const messageUnsubscribe = useRef<(() => void) | null>(null);
  const statusUnsubscribe = useRef<(() => void) | null>(null);
  const typingUnsubscribe = useRef<(() => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API utilities
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`/api/v1${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }, []);

  // Load chats from API
  const loadChats = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiCall('/chats');
      const chats = response.data || response.chats || [];
      
      setState(prev => ({
        ...prev,
        chats,
        isLoading: false
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
      toast.error('فشل في تحميل المحادثات', {
        description: error.message
      });
    }
  }, [apiCall]);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId: string) => {
    setState(prev => ({ ...prev, isLoadingMessages: true }));
    
    try {
      const response = await apiCall(`/chats/${chatId}/messages?limit=${finalOptions.messageLimit}`);
      const messages = response.data || response.messages || [];
      
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatId]: messages.reverse() // Ensure chronological order
        },
        isLoadingMessages: false
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoadingMessages: false }));
      toast.error('فشل في تحميل الرسائل', {
        description: error.message
      });
    }
  }, [apiCall, finalOptions.messageLimit]);

  // Select a chat
  const selectChat = useCallback(async (chatId: string) => {
    setState(prev => ({ ...prev, activeChat: chatId }));
    
    // Load messages if not already loaded
    if (!state.messages[chatId]) {
      await loadMessages(chatId);
    }
    
    // Subscribe to real-time updates
    realtimeService.subscribeToChatChannel(chatId);
    
    // Mark messages as read
    await markAsRead(chatId);
  }, [state.messages, loadMessages]);

  // Send message
  const sendMessage = useCallback(async (chatId: string, message: string, options: SendMessageOptions = {}) => {
    if (!message.trim() && !options.attachment) {
      return;
    }

    setState(prev => ({ ...prev, isSending: true }));

    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('type', options.type || 'text');
      
      if (options.attachment) {
        formData.append('attachment', options.attachment);
      }
      
      if (options.mentions) {
        formData.append('mentions', JSON.stringify(options.mentions));
      }
      
      if (options.replyTo) {
        formData.append('reply_to_id', options.replyTo.toString());
      }

      const response = await fetch(`/api/v1/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      const newMessage = result.data || result.message;

      // Add message to local state (will be confirmed by real-time update)
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatId]: [...(prev.messages[chatId] || []), newMessage]
        },
        isSending: false
      }));

      // Update chat's last message
      setState(prev => ({
        ...prev,
        chats: prev.chats.map(chat => 
          chat.id.toString() === chatId.toString()
            ? { ...chat, last_message: newMessage, updated_at: new Date().toISOString() }
            : chat
        )
      }));

    } catch (error: any) {
      setState(prev => ({ ...prev, isSending: false }));
      toast.error('فشل في إرسال الرسالة', {
        description: error.message
      });
      throw error;
    }
  }, []);

  // Create new chat
  const createChat = useCallback(async (participants: string[], title?: string, type: string = 'private'): Promise<ChatRoom | null> => {
    try {
      const response = await apiCall('/chats', {
        method: 'POST',
        body: JSON.stringify({
          participants,
          title,
          type
        })
      });

      const newChat = response.data || response.chat;
      
      setState(prev => ({
        ...prev,
        chats: [newChat, ...prev.chats]
      }));

      toast.success('تم إنشاء المحادثة بنجاح');
      return newChat;
    } catch (error: any) {
      toast.error('فشل في إنشاء المحادثة', {
        description: error.message
      });
      return null;
    }
  }, [apiCall]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await apiCall(`/chats/${chatId}/read`, { method: 'POST' });
      
      // Update local state
      setState(prev => ({
        ...prev,
        chats: prev.chats.map(chat =>
          chat.id.toString() === chatId.toString()
            ? { ...chat, unread_count: 0 }
            : chat
        )
      }));
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [apiCall]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatId: string, isTyping: boolean) => {
    if (!finalOptions.enableTypingIndicators) return;
    
    realtimeService.sendTypingIndicator(chatId, isTyping);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds of inactivity
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        realtimeService.sendTypingIndicator(chatId, false);
      }, 3000);
    }
  }, [finalOptions.enableTypingIndicators]);

  // Load older messages
  const loadOlderMessages = useCallback(async (chatId: string) => {
    const currentMessages = state.messages[chatId] || [];
    if (currentMessages.length === 0) return;
    
    try {
      const oldestMessageId = currentMessages[0]?.id;
      const response = await apiCall(`/chats/${chatId}/messages/older?before=${oldestMessageId}&limit=${finalOptions.messageLimit}`);
      const olderMessages = response.data || response.messages || [];
      
      if (olderMessages.length > 0) {
        setState(prev => ({
          ...prev,
          messages: {
            ...prev.messages,
            [chatId]: [...olderMessages.reverse(), ...currentMessages]
          }
        }));
      }
    } catch (error: any) {
      toast.error('فشل في تحميل الرسائل الأقدم');
    }
  }, [state.messages, apiCall, finalOptions.messageLimit]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await apiCall(`/messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ message: newContent })
      });
      
      toast.success('تم تعديل الرسالة');
    } catch (error: any) {
      toast.error('فشل في تعديل الرسالة');
    }
  }, [apiCall]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await apiCall(`/messages/${messageId}`, { method: 'DELETE' });
      
      toast.success('تم حذف الرسالة');
    } catch (error: any) {
      toast.error('فشل في حذف الرسالة');
    }
  }, [apiCall]);

  // Leave chat
  const leaveChat = useCallback(async (chatId: string) => {
    try {
      await apiCall(`/chats/${chatId}/leave`, { method: 'POST' });
      
      setState(prev => ({
        ...prev,
        chats: prev.chats.filter(chat => chat.id.toString() !== chatId.toString()),
        activeChat: prev.activeChat === chatId ? null : prev.activeChat
      }));
      
      realtimeService.unsubscribeFromChannel(`private-chat.${chatId}`);
      toast.success('تم مغادرة المحادثة');
    } catch (error: any) {
      toast.error('فشل في مغادرة المحادثة');
    }
  }, [apiCall]);

  // Archive chat
  const archiveChat = useCallback(async (chatId: string) => {
    try {
      await apiCall(`/chats/${chatId}/archive`, { method: 'POST' });
      
      setState(prev => ({
        ...prev,
        chats: prev.chats.filter(chat => chat.id.toString() !== chatId.toString()),
        activeChat: prev.activeChat === chatId ? null : prev.activeChat
      }));
      
      toast.success('تم أرشفة المحادثة');
    } catch (error: any) {
      toast.error('فشل في أرشفة المحادثة');
    }
  }, [apiCall]);

  // Retry functionality
  const retry = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    loadChats();
  }, [loadChats]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize real-time service and load data
  useEffect(() => {
    if (!userId || !finalOptions.autoConnect) return;

    const initializeChat = async () => {
      try {
        // Initialize real-time service
        const config = {
          pusher: {
            key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'a070cddb1e5b3a219393',
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            authEndpoint: '/api/broadcasting/auth',
            forceTLS: true
          },
          firebase: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''
          }
        };

        await realtimeService.initialize(config);
        
        // Subscribe to user notifications
        realtimeService.subscribeToNotificationsChannel(userId.toString());
        
        // Load initial chats
        await loadChats();
        
      } catch (error: any) {
        console.error('Failed to initialize chat:', error);
        setState(prev => ({ ...prev, error: error.message }));
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId, finalOptions.autoConnect, loadChats]);

  // Setup real-time event handlers
  useEffect(() => {
    // Message handler
    messageUnsubscribe.current = realtimeService.onMessage((message: ChatMessage) => {
      const chatId = message.chat_id.toString();
      
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [chatId]: [...(prev.messages[chatId] || []), message]
        },
        chats: prev.chats.map(chat =>
          chat.id.toString() === chatId
            ? { ...chat, last_message: message, updated_at: new Date().toISOString() }
            : chat
        )
      }));

      // Show notification if chat is not active
      if (state.activeChat !== chatId) {
        toast.info(`رسالة جديدة من ${message.sender?.name || 'مستخدم'}`, {
          description: message.message.substring(0, 100),
          duration: 4000
        });
      }
    });

    // Status handler
    statusUnsubscribe.current = realtimeService.onStatusChange((status: ConnectionStatus) => {
      setState(prev => ({ ...prev, connectionStatus: status }));
    });

    // Typing handler
    typingUnsubscribe.current = realtimeService.onTyping((data) => {
      setState(prev => ({
        ...prev,
        typingUsers: {
          ...prev.typingUsers,
          [data.chatId]: data.isTyping
            ? [...(prev.typingUsers[data.chatId] || []), data.userId]
            : (prev.typingUsers[data.chatId] || []).filter(id => id !== data.userId)
        }
      }));
    });

    // Cleanup
    return () => {
      messageUnsubscribe.current?.();
      statusUnsubscribe.current?.();
      typingUnsubscribe.current?.();
    };
  }, [state.activeChat]);

  return {
    // State
    ...state,
    
    // Actions
    loadChats,
    selectChat,
    createChat,
    leaveChat,
    archiveChat,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    loadOlderMessages,
    sendTypingIndicator,
    retry,
    clearError
  };
} 