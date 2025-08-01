import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PilgrimChatState,
  PilgrimChatRoom,
  PilgrimChatMessage,
  PilgrimChatNotification,
  PilgrimChatTypingIndicator,
  PilgrimChatSettings,
  PilgrimChatFilter
} from '../types/chat.types';

const initialSettings: PilgrimChatSettings = {
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

const initialState: PilgrimChatState = {
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

const pilgrimChatSlice = createSlice({
  name: 'pilgrimChat',
  initialState,
  reducers: {
    // Connection Management
    setConnectionStatus: (state, action: PayloadAction<PilgrimChatState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },

    // Chat Management
    setChats: (state, action: PayloadAction<PilgrimChatRoom[]>) => {
      state.chats = action.payload;
    },

    addChat: (state, action: PayloadAction<PilgrimChatRoom>) => {
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

    updateChat: (state, action: PayloadAction<Partial<PilgrimChatRoom> & { id: string }>) => {
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
      if (action.payload) {
        // Mark messages as read when opening chat
        const messages = state.messages[action.payload] || [];
        messages.forEach(message => {
          if (message.status !== 'read' && message.senderId !== 'current_user_id') {
            message.status = 'read';
            message.readAt = new Date().toISOString();
          }
        });
        
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

    muteChat: (state, action: PayloadAction<{ chatId: string; duration?: number }>) => {
      const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.chatId);
      if (chatIndex >= 0) {
        state.chats[chatIndex].isMuted = true;
        if (!state.settings.notifications.mutedChats.includes(action.payload.chatId)) {
          state.settings.notifications.mutedChats.push(action.payload.chatId);
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
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: PilgrimChatMessage[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },

    addMessage: (state, action: PayloadAction<PilgrimChatMessage>) => {
      const { chatId } = action.payload;
      
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
        if (action.payload.senderId !== 'current_user_id' && state.activeChat !== chatId) {
          state.chats[chatIndex].unreadCount += 1;
        }
        
        // Move chat to top of list
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      }
    },

    updateMessage: (state, action: PayloadAction<{ chatId: string; messageId: string; updates: Partial<PilgrimChatMessage> }>) => {
      const { chatId, messageId, updates } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[chatId][messageIndex] = { ...messages[messageIndex], ...updates };
        }
      }
    },

    deleteMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      if (state.messages[chatId]) {
        state.messages[chatId] = state.messages[chatId].filter(msg => msg.id !== messageId);
      }
    },

    updateMessageStatus: (state, action: PayloadAction<{ chatId: string; messageId: string; status: PilgrimChatMessage['status'] }>) => {
      const { chatId, messageId, status } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[chatId][messageIndex].status = status;
          
          if (status === 'delivered') {
            state.messages[chatId][messageIndex].deliveredAt = new Date().toISOString();
          } else if (status === 'read') {
            state.messages[chatId][messageIndex].readAt = new Date().toISOString();
          }
        }
      }
    },

    pinMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
          message.isPinned = true;
          if (!state.pinnedMessages[chatId]) {
            state.pinnedMessages[chatId] = [];
          }
          if (!state.pinnedMessages[chatId].find(msg => msg.id === messageId)) {
            state.pinnedMessages[chatId].push(message);
          }
        }
      }
    },

    unpinMessage: (state, action: PayloadAction<{ chatId: string; messageId: string }>) => {
      const { chatId, messageId } = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[chatId][messageIndex].isPinned = false;
        }
      }
      if (state.pinnedMessages[chatId]) {
        state.pinnedMessages[chatId] = state.pinnedMessages[chatId].filter(msg => msg.id !== messageId);
      }
    },

    starMessage: (state, action: PayloadAction<PilgrimChatMessage>) => {
      const message = { ...action.payload, isStarred: true };
      const existingIndex = state.starredMessages.findIndex(msg => msg.id === message.id);
      if (existingIndex >= 0) {
        state.starredMessages[existingIndex] = message;
      } else {
        state.starredMessages.push(message);
      }
      
      // Update in messages array
      const messages = state.messages[message.chatId];
      if (messages) {
        const messageIndex = messages.findIndex(msg => msg.id === message.id);
        if (messageIndex >= 0) {
          state.messages[message.chatId][messageIndex].isStarred = true;
        }
      }
    },

    unstarMessage: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      state.starredMessages = state.starredMessages.filter(msg => msg.id !== messageId);
      
      // Update in messages arrays
      Object.keys(state.messages).forEach(chatId => {
        const messageIndex = state.messages[chatId].findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          state.messages[chatId][messageIndex].isStarred = false;
        }
      });
    },

    // Notifications
    addNotification: (state, action: PayloadAction<PilgrimChatNotification>) => {
      const existingIndex = state.notifications.findIndex(n => n.id === action.payload.id);
      if (existingIndex >= 0) {
        state.notifications[existingIndex] = action.payload;
      } else {
        state.notifications.unshift(action.payload);
      }
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(n => n.id === action.payload);
      if (notificationIndex >= 0) {
        state.notifications[notificationIndex].isRead = true;
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Typing Indicators
    setTypingIndicator: (state, action: PayloadAction<PilgrimChatTypingIndicator>) => {
      const { chatId } = action.payload;
      if (!state.typingIndicators[chatId]) {
        state.typingIndicators[chatId] = [];
      }
      
      const existingIndex = state.typingIndicators[chatId].findIndex(
        indicator => indicator.userId === action.payload.userId
      );
      
      if (action.payload.isTyping) {
        if (existingIndex >= 0) {
          state.typingIndicators[chatId][existingIndex] = action.payload;
        } else {
          state.typingIndicators[chatId].push(action.payload);
        }
      } else {
        if (existingIndex >= 0) {
          state.typingIndicators[chatId].splice(existingIndex, 1);
        }
      }
    },

    clearTypingIndicators: (state, action: PayloadAction<string>) => {
      delete state.typingIndicators[action.payload];
    },

    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSearchResults: (state, action: PayloadAction<PilgrimChatMessage[]>) => {
      state.searchResults = action.payload;
    },

    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },

    // Selection
    selectMessage: (state, action: PayloadAction<string>) => {
      if (!state.selectedMessages.includes(action.payload)) {
        state.selectedMessages.push(action.payload);
      }
    },

    deselectMessage: (state, action: PayloadAction<string>) => {
      state.selectedMessages = state.selectedMessages.filter(id => id !== action.payload);
    },

    clearSelection: (state) => {
      state.selectedMessages = [];
    },

    // Settings
    updateSettings: (state, action: PayloadAction<Partial<PilgrimChatSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Drafts
    saveDraft: (state, action: PayloadAction<{ chatId: string; content: string }>) => {
      if (action.payload.content.trim()) {
        state.drafts[action.payload.chatId] = action.payload.content;
      } else {
        delete state.drafts[action.payload.chatId];
      }
    },

    clearDraft: (state, action: PayloadAction<string>) => {
      delete state.drafts[action.payload];
    },

    // Loading and Error States
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset State
    resetChatState: (state) => {
      return initialState;
    }
  }
});

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
  updateMessage,
  deleteMessage,
  updateMessageStatus,
  pinMessage,
  unpinMessage,
  starMessage,
  unstarMessage,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearAllNotifications,
  setTypingIndicator,
  clearTypingIndicators,
  setSearchQuery,
  setSearchResults,
  clearSearch,
  selectMessage,
  deselectMessage,
  clearSelection,
  updateSettings,
  saveDraft,
  clearDraft,
  setLoading,
  setError,
  clearError,
  resetChatState
} = pilgrimChatSlice.actions;

export default pilgrimChatSlice.reducer; 