import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TransportChatMessage, TransportChatRoom, TransportChatNotification } from '../types/chat.types';
import { mockApi } from './mockApi';

export const transportChatApi = createApi({
  reducerPath: 'transportChatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/transport/chat' }),
  tagTypes: ['Chat', 'Messages', 'Notifications'],
  endpoints: (builder) => ({
    getChats: builder.query<TransportChatRoom[], void>({
      queryFn: async () => {
        const data = await mockApi.getChats();
        return { data };
      },
      providesTags: ['Chat'],
    }),

    getChatMessages: builder.query<TransportChatMessage[], string>({
      queryFn: async (chatId) => {
        const data = await mockApi.getChatMessages(chatId);
        return { data };
      },
      providesTags: (result, error, chatId) => [{ type: 'Messages', id: chatId }],
    }),

    sendMessage: builder.mutation<TransportChatMessage, { chatId: string; content: string; contentType: 'text' | 'image' | 'document'; file?: File }>({
      queryFn: async ({ chatId, content, contentType, file }) => {
        const data = await mockApi.sendMessage(chatId, content, contentType, file);
        return { data };
      },
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Messages', id: chatId }],
    }),

    updateMessageStatus: builder.mutation<void, { messageId: string; chatId: string; status: 'delivered' | 'read' }>({
      queryFn: async ({ messageId, chatId, status }) => {
        await mockApi.updateMessageStatus(messageId, chatId, status);
        return { data: undefined };
      },
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Messages', id: chatId }],
    }),

    createGroupChat: builder.mutation<TransportChatRoom, { name: string; participantIds: string[] }>({
      queryFn: async ({ name, participantIds }) => {
        const data = await mockApi.createGroupChat(name, participantIds);
        return { data };
      },
      invalidatesTags: ['Chat'],
    }),

    getNotifications: builder.query<TransportChatNotification[], void>({
      queryFn: async () => {
        const data = await mockApi.getNotifications();
        return { data };
      },
      providesTags: ['Notifications'],
    }),

    markNotificationAsRead: builder.mutation<void, string>({
      queryFn: async (notificationId) => {
        await mockApi.markNotificationAsRead(notificationId);
        return { data: undefined };
      },
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageStatusMutation,
  useCreateGroupChatMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} = transportChatApi; 