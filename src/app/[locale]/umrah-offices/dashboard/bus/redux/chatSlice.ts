import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ChatRoom, ChatNotification } from '../types/chat.types';

interface ChatState {
  activeChats: ChatRoom[];
  messages: { [chatId: string]: ChatMessage[] };
  notifications: ChatNotification[];
  selectedChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  activeChats: [],
  messages: {},
  notifications: [],
  selectedChatId: null,
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'busChat',
  initialState,
  reducers: {
    setActiveChats: (state, action: PayloadAction<ChatRoom[]>) => {
      state.activeChats = action.payload;
    },
    addChat: (state, action: PayloadAction<ChatRoom>) => {
      state.activeChats.push(action.payload);
      state.messages[action.payload.id] = [];
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { chatId } = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; chatId: string; status: 'sent' | 'delivered' | 'read' }>) => {
      const { messageId, chatId, status } = action.payload;
      const message = state.messages[chatId]?.find(msg => msg.id === messageId);
      if (message) {
        message.status = status;
      }
    },
    addNotification: (state, action: PayloadAction<ChatNotification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setSelectedChat: (state, action: PayloadAction<string | null>) => {
      state.selectedChatId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setActiveChats,
  addChat,
  setMessages,
  addMessage,
  updateMessageStatus,
  addNotification,
  removeNotification,
  setSelectedChat,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer; 