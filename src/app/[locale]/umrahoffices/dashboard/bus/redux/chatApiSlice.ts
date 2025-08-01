import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ChatMessage, ChatRoom, ChatNotification } from '../types/chat.types';

export const chatApi = createApi({
  reducerPath: 'busChatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/bus/chat' }),
  tagTypes: ['Chat', 'Messages', 'Notifications'],
  endpoints: (builder) => ({
    getChats: builder.query<ChatRoom[], void>({
      query: () => 'rooms',
      providesTags: ['Chat'],
    }),

    getChatMessages: builder.query<ChatMessage[], string>({
      query: (chatId) => `messages/${chatId}`,
      providesTags: (result, error, chatId) => [{ type: 'Messages', id: chatId }],
    }),

    sendMessage: builder.mutation<ChatMessage, { chatId: string; content: string; contentType: 'text' | 'image' | 'document'; file?: File }>({
      query: ({ chatId, content, contentType, file }) => {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('contentType', contentType);
        if (file) {
          formData.append('file', file);
        }

        return {
          url: `messages/${chatId}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Messages', id: chatId }],
    }),

    updateMessageStatus: builder.mutation<void, { messageId: string; chatId: string; status: 'delivered' | 'read' }>({
      query: ({ messageId, status }) => ({
        url: `messages/${messageId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { chatId }) => [{ type: 'Messages', id: chatId }],
    }),

    createGroupChat: builder.mutation<ChatRoom, { name: string; participantIds: string[] }>({
      query: (body) => ({
        url: 'rooms/group',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    getNotifications: builder.query<ChatNotification[], void>({
      query: () => 'notifications',
      providesTags: ['Notifications'],
    }),

    markNotificationAsRead: builder.mutation<void, string>({
      query: (notificationId) => ({
        url: `notifications/${notificationId}`,
        method: 'PUT',
        body: { isRead: true },
      }),
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
} = chatApi; 