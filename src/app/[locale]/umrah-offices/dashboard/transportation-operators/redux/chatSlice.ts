import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransportChatMessage, TransportChatRoom, TransportChatNotification } from '../types/chat.types';

interface TransportChatState {
  activeChats: TransportChatRoom[];
  messages: { [chatId: string]: TransportChatMessage[] };
  notifications: TransportChatNotification[];
  selectedChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransportChatState = {
  activeChats: [],
  messages: {},
  notifications: [],
  selectedChatId: null,
  isLoading: false,
  error: null,
};

const transportChatSlice = createSlice({
  name: 'transportChat',
  initialState,
  reducers: {
    setActiveChats: (state, action: PayloadAction<TransportChatRoom[]>) => {
      state.activeChats = action.payload;
    },
    addChat: (state, action: PayloadAction<TransportChatRoom>) => {
      state.activeChats.push(action.payload);
      state.messages[action.payload.id] = [];
    },
    setMessages: (state, action: PayloadAction<{ chatId: string; messages: TransportChatMessage[] }>) => {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<TransportChatMessage>) => {
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
    addNotification: (state, action: PayloadAction<TransportChatNotification>) => {
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
} = transportChatSlice.actions;

export default transportChatSlice.reducer; 