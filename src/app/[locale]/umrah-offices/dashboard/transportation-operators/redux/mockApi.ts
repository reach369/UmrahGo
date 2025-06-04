import { mockChatRooms, mockMessages, mockParticipants } from '../types/mockData';
import { TransportChatMessage, TransportChatRoom, TransportChatNotification } from '../types/chat.types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  getChats: async (): Promise<TransportChatRoom[]> => {
    await delay(500);
    return mockChatRooms;
  },

  getChatMessages: async (chatId: string): Promise<TransportChatMessage[]> => {
    await delay(300);
    return mockMessages[chatId] || [];
  },

  sendMessage: async (chatId: string, content: string, contentType: 'text' | 'image' | 'document', file?: File): Promise<TransportChatMessage> => {
    await delay(500);
    const newMessage: TransportChatMessage = {
      id: `msg${Date.now()}`,
      senderId: '1', // Mock current user ID
      senderType: 'transport_operator',
      senderName: 'أحمد محمد',
      content,
      contentType,
      timestamp: new Date().toISOString(),
      status: 'sent',
      chatId,
      ...(file && { fileName: file.name, fileSize: file.size })
    };

    // Add message to mock data
    if (!mockMessages[chatId]) {
      mockMessages[chatId] = [];
    }
    mockMessages[chatId].push(newMessage);

    // Update last message in chat room
    const chatRoom = mockChatRooms.find(chat => chat.id === chatId);
    if (chatRoom) {
      chatRoom.lastMessage = newMessage;
      chatRoom.updatedAt = new Date().toISOString();
    }

    return newMessage;
  },

  updateMessageStatus: async (messageId: string, chatId: string, status: 'delivered' | 'read'): Promise<void> => {
    await delay(300);
    const messages = mockMessages[chatId];
    if (messages) {
      const message = messages.find(msg => msg.id === messageId);
      if (message) {
        message.status = status;
      }
    }
  },

  createGroupChat: async (name: string, participantIds: string[]): Promise<TransportChatRoom> => {
    await delay(500);
    const newChat: TransportChatRoom = {
      id: `chat${Date.now()}`,
      type: 'group',
      name,
      participants: mockParticipants.filter(p => participantIds.includes(p.id)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockChatRooms.push(newChat);
    mockMessages[newChat.id] = [];
    return newChat;
  },

  getNotifications: async (): Promise<TransportChatNotification[]> => {
    await delay(300);
    return [];
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    await delay(300);
  }
}; 