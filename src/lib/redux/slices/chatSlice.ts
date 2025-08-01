/**
 * Universal Chat Redux Slice
 * 
 * This slice handles chat state management for all user types
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  ChatState, 
  ChatRoom, 
  ChatMessage, 
  ChatNotification, 
  ChatTypingIndicator,
  ChatSettings
} from '@/types/chat.types';
import chatService from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';

// Initial settings for the chat system
const initialSettings: ChatSettings = {
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    preview: true,
    mutedChats: [],
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  },
  privacy: {
    readReceipts: true,
    lastSeen: true,
    profilePhoto: true,
    blockList: []
  },
  appearance: {
    theme: 'auto',
    fontSize: 'medium',
    language: 'ar',
    bubbleStyle: 'rounded'
  },
  security: {
    autoLock: false,
    lockTimeout: 300,
    fingerprintUnlock: false,
    backupEnabled: true,
    backupFrequency: 'weekly'
  }
};

// Initial state for the chat slice
const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  notifications: [],
  typingIndicators: {},
  connectionStatus: 'disconnected',
  isLoading: false,
  error: null,
  searchQuery: '',
  searchResults: [],
  selectedMessages: [],
  settings: initialSettings,
  drafts: {},
  archivedChats: [],
  pinnedMessages: {},
  starredMessages: []
};

// Async thunk to fetch all conversations
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async ({ userType = 'pilgrim' }: { userType?: string }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('Unauthorized: No token provided');
      }

      const response = await chatService.getConversations(token, userType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

// Async thunk to fetch messages for a specific chat
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ chatId, userType = 'pilgrim' }: { chatId: string; userType?: string }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('Unauthorized: No token provided');
      }

      const messages = await chatService.getMessages(token, chatId, userType);
      return { chatId, messages };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

// Async thunk to send a message
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { 
      chatId, 
      message, 
      contentType = 'text',
      priority = 'normal',
      userType = 'pilgrim'
    }: { 
      chatId: string; 
      message: string; 
      contentType?: string;
      priority?: string;
      userType?: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('Unauthorized: No token provided');
      }

      const response = await chatService.sendMessage(
        token, 
        chatId, 
        message, 
        contentType, 
        priority,
        userType
      );
      
      return response.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

// Async thunk to mark messages as read
export const markMessagesAsReadAction = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (
    { 
      chatId, 
      lastMessageId,
      userType = 'pilgrim'
    }: { 
      chatId: string; 
      lastMessageId: string;
      userType?: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('Unauthorized: No token provided');
      }

      const success = await chatService.markMessagesAsRead(
        token, 
        chatId, 
        lastMessageId,
        userType
      );
      
      if (success) {
        return { chatId, lastMessageId };
      } else {
        return rejectWithValue('Failed to mark messages as read');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read');
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Connection Management
    setConnectionStatus: (state, action: PayloadAction<ChatState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },

    // Chat Management
    setChats: (state, action: PayloadAction<ChatRoom[]>) => {
      state.chats = action.payload;
    },

    addChat: (state, action: PayloadAction<ChatRoom>) => {
      const existingIndex = state.chats.findIndex(chat => chat.id === action.payload.id);
      if (existingIndex >= 0) {
        state.chats[existingIndex] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }
      
      if (!state.messages[action.payload.id]) {
        state.messages[action.payload.id] = [];
      }
    },

    updateChat: (state, action: PayloadAction<Partial<ChatRoom> & { id: string }>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.id);
      if (chatIndex >= 0) {
        state.chats[chatIndex] = { ...state.chats[chatIndex], ...action.payload };
      }
    },

    removeChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(chat => chat.id !== action.payload);
      delete state.messages[action.payload];
      delete state.typingIndicators[action.payload];
      delete state.pinnedMessages[action.payload];
      delete state.drafts[action.payload];
    },

    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChat = action.payload;
      
      // Mark messages as read when opening chat
      if (action.payload && state.messages[action.payload]) {
        // Clear unread count
        const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
        if (chatIndex >= 0) {
          state.chats[chatIndex].unreadCount = 0;
        }
      }
    },

    pinChat: (state, action: PayloadAction<string>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
      if (chatIndex >= 0) {
        state.chats[chatIndex].isPinned = true;
        // Move pinned chat to top
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      }
    },

    unpinChat: (state, action: PayloadAction<string>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
      if (chatIndex >= 0) {
        state.chats[chatIndex].isPinned = false;
      }
    },

    archiveChat: (state, action: PayloadAction<string>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
      if (chatIndex >= 0) {
        const chat = state.chats.splice(chatIndex, 1)[0];
        chat.isArchived = true;
        state.archivedChats.push(chat);
      }
    },

    unarchiveChat: (state, action: PayloadAction<string>) => {
      const chatIndex = state.archivedChats.findIndex(chat => chat.id === action.payload);
      if (chatIndex >= 0) {
        const chat = state.archivedChats.splice(chatIndex, 1)[0];
        chat.isArchived = false;
        state.chats.unshift(chat);
      }
    },

    muteChat: (state, action: PayloadAction<string>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
      if (chatIndex >= 0) {
        state.chats[chatIndex].isMuted = true;
        if (!state.settings.notifications.mutedChats.includes(action.payload)) {
          state.settings.notifications.mutedChats.push(action.payload);
        }
      }
    },

    unmuteChat: (state, action: PayloadAction<string>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload);
      if (chatIndex >= 0) {
        state.chats[chatIndex].isMuted = false;
        state.settings.notifications.mutedChats = state.settings.notifications.mutedChats.filter(
          id => id !== action.payload
        );
      }
    },

    // Message Management
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const chatId = action.payload.chatId;
      
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      
      // Check if message already exists
      const existingIndex = state.messages[chatId].findIndex(msg => msg.id === action.payload.id);
      if (existingIndex >= 0) {
        state.messages[chatId][existingIndex] = action.payload;
      } else {
        state.messages[chatId].push(action.payload);
        state.messages[chatId].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      }

      // Update chat's last message and unread count
      const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
      if (chatIndex >= 0) {
        state.chats[chatIndex].lastMessage = action.payload;
        state.chats[chatIndex].updatedAt = action.payload.sentAt;
        
        // Increase unread count if not from current user and chat is not active
        if (state.activeChat !== chatId) {
          state.chats[chatIndex].unreadCount += 1;
        }
        
        // Move chat to top of list
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      }
    },

    updateMessageStatus: (state, action: PayloadAction<{ chatId: string; messageId: string; status: string }>) => {
      const { chatId, messageId, status } = action.payload;
      const messages = state.messages[chatId];
      
      if (messages) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[chatId][messageIndex].status = status as any;
          
          if (status === 'delivered') {
            state.messages[chatId][messageIndex].deliveredAt = new Date().toISOString();
          } else if (status === 'read') {
            state.messages[chatId][messageIndex].readAt = new Date().toISOString();
          }
        }
      }
    },

    updateTypingIndicator: (state, action: PayloadAction<ChatTypingIndicator>) => {
      const { chatId, userId, isTyping } = action.payload;
      
      if (!state.typingIndicators[chatId]) {
        state.typingIndicators[chatId] = [];
      }
      
      const userIndex = state.typingIndicators[chatId].findIndex(
        indicator => indicator.userId === userId
      );
      
      if (isTyping && userIndex === -1) {
        // Add typing indicator
        state.typingIndicators[chatId].push(action.payload);
      } else if (!isTyping && userIndex !== -1) {
        // Remove typing indicator
        state.typingIndicators[chatId].splice(userIndex, 1);
      } else if (isTyping && userIndex !== -1) {
        // Update existing typing indicator
        state.typingIndicators[chatId][userIndex] = action.payload;
      }
    },

    addNotification: (state, action: PayloadAction<ChatNotification>) => {
      // Check if notification already exists
      const existingIndex = state.notifications.findIndex(n => n.id === action.payload.id);
      if (existingIndex === -1) {
        state.notifications.push(action.payload);
      }
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        state.notifications[index].isRead = true;
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Chat settings
    updateSettings: (state, action: PayloadAction<Partial<ChatSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Save draft
    saveDraft: (state, action: PayloadAction<{ chatId: string; draft: string }>) => {
      state.drafts[action.payload.chatId] = action.payload.draft;
    },

    clearDraft: (state, action: PayloadAction<string>) => {
      delete state.drafts[action.payload];
    },

    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSearchResults: (state, action: PayloadAction<ChatMessage[]>) => {
      state.searchResults = action.payload;
    },

    clearSearchResults: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },

    // Message selection
    toggleMessageSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedMessages.indexOf(action.payload);
      if (index === -1) {
        state.selectedMessages.push(action.payload);
      } else {
        state.selectedMessages.splice(index, 1);
      }
    },

    clearSelectedMessages: (state) => {
      state.selectedMessages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload as unknown as ChatRoom[];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages as unknown as ChatMessage[];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle sendChatMessage
      .addCase(sendChatMessage.pending, (state) => {
        // No loading state needed here as it's handled in the UI component
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const chatId = message.chat_id;
        
        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        
        // Replace any temporary message with the same id or add new one
        const existingIndex = state.messages[chatId].findIndex(msg => msg.id === message.id);
        if (existingIndex >= 0) {
          state.messages[chatId][existingIndex] = message as unknown as ChatMessage;
        } else {
          state.messages[chatId].push(message as unknown as ChatMessage);
          state.messages[chatId].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        }
        
        // Update chat's last message
        const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
        if (chatIndex >= 0) {
          state.chats[chatIndex].lastMessage = message as unknown as ChatMessage;
          state.chats[chatIndex].updatedAt = message.sent_at as string;

          // Move chat to top of list
          const chat = state.chats.splice(chatIndex, 1)[0];
          state.chats.unshift(chat);
        }
        
        // Clear draft
        delete state.drafts[chatId];
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Handle markMessagesAsReadAction
      .addCase(markMessagesAsReadAction.fulfilled, (state, action) => {
        const { chatId } = action.payload;
        
        // Update unread count for the chat
        const chatIndex = state.chats.findIndex(chat => chat.id === chatId);
        if (chatIndex >= 0) {
          state.chats[chatIndex].unreadCount = 0;
        }
      });
  }
});

// Export actions
export const {
  setConnectionStatus,
  setChats,
  addChat,
  updateChat,
  removeChat,
  setActiveChat,
  pinChat,
  unpinChat,
  archiveChat,
  unarchiveChat,
  muteChat,
  unmuteChat,
  setMessages,
  addMessage,
  updateMessageStatus,
  updateTypingIndicator,
  addNotification,
  markNotificationAsRead,
  clearNotifications,
  updateSettings,
  saveDraft,
  clearDraft,
  setSearchQuery,
  setSearchResults,
  clearSearchResults,
  toggleMessageSelection,
  clearSelectedMessages
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer; 