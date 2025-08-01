import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

// Types
export interface Chat {
  id: number;
  title?: string;
  type: 'private' | 'group';
  is_active: boolean;
  created_by: number;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
}

export interface ChatParticipant {
  id: number;
  chat_id: number;
  user_id: number;
  joined_at: string;
  last_seen_at?: string;
  is_active: boolean;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path?: string;
  role?: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_id: number;
  message: string;
  type: 'text' | 'image' | 'file' | 'system';
  status: 'sent' | 'delivered' | 'read';
  is_system: boolean;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
  sender: User;
  created_at: string;
  updated_at: string;
}

export interface CreateChatRequest {
  title?: string;
  type: 'private' | 'group';
  participants: number[];
  first_message: string;
}

export interface SendMessageRequest {
  message: string;
  type?: 'text' | 'image' | 'file';
  attachment?: File;
}

export interface ChatsResponse {
  success: boolean;
  data: Chat[];
  message: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    chat: Chat;
    messages: ChatMessage[];
    participants: ChatParticipant[];
  };
  message: string;
}

export interface MessagesResponse {
  success: boolean;
  data: ChatMessage[];
  message: string;
}

export interface MessageResponse {
  success: boolean;
  data: ChatMessage;
  message: string;
}

export interface UnreadCountResponse {
  status: string;
  unread_count: number;
}

export const chatsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get chats list
    getChats: builder.query<ChatsResponse, void>({
      query: () => OFFICE_ENDPOINTS.CHATS.LIST,
      providesTags: ['Chats'],
    }),

    // Get single chat with messages
    getChat: builder.query<ChatResponse, number>({
      query: (id) => OFFICE_ENDPOINTS.CHATS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Chats', id }],
    }),

    // Create new chat
    createChat: builder.mutation<ChatResponse, CreateChatRequest>({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.CHATS.CREATE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chats'],
    }),

    // Send message
    sendMessage: builder.mutation<MessageResponse, { chatId: number; data: SendMessageRequest }>({
      query: ({ chatId, data }) => {
        const formData = new FormData();
        
        formData.append('message', data.message);
        if (data.type) {
          formData.append('type', data.type);
        }
        if (data.attachment) {
          formData.append('attachment', data.attachment);
        }

        return {
          url: OFFICE_ENDPOINTS.CHATS.SEND_MESSAGE(chatId),
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Chats', id: chatId },
        'Chats',
      ],
    }),

    // Get chat messages
    getChatMessages: builder.query<
      MessagesResponse,
      { chatId: number; limit?: number; offset?: number; before?: number }
    >({
      query: ({ chatId, ...params }) => ({
        url: OFFICE_ENDPOINTS.CHATS.GET_MESSAGES(chatId),
        params,
      }),
      providesTags: (result, error, { chatId }) => [{ type: 'Chats', id: chatId }],
    }),

    // Get older messages for pagination
    getOlderMessages: builder.query<
      MessagesResponse,
      { chatId: number; lastMessageId?: number; limit?: number }
    >({
      query: ({ chatId, ...params }) => ({
        url: OFFICE_ENDPOINTS.CHATS.OLDER_MESSAGES(chatId),
        params: {
          before_id: params.lastMessageId,
          limit: params.limit,
        },
      }),
      providesTags: (result, error, { chatId }) => [{ type: 'Chats', id: chatId }],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<{ success: boolean }, number>({
      query: (chatId) => ({
        url: OFFICE_ENDPOINTS.CHATS.MARK_READ(chatId),
        method: 'POST',
      }),
      invalidatesTags: (result, error, chatId) => [
        { type: 'Chats', id: chatId },
        'Chats',
      ],
    }),

    // Update typing status
    updateTypingStatus: builder.mutation<
      { success: boolean },
      { chatId: number; isTyping: boolean }
    >({
      query: ({ chatId, isTyping }) => ({
        url: OFFICE_ENDPOINTS.CHATS.TYPING_STATUS(chatId),
        method: 'POST',
        body: { is_typing: isTyping },
      }),
    }),

    // Get unread chats count
    getUnreadChatsCount: builder.query<UnreadCountResponse, void>({
      query: () => OFFICE_ENDPOINTS.CHATS.UNREAD_COUNT,
      providesTags: ['Chats'],
    }),

    // Upload file to chat
    uploadFileToChat: builder.mutation<
      MessageResponse,
      { chatId: number; file: File; message?: string }
    >({
      query: ({ chatId, file, message }) => {
        const formData = new FormData();
        formData.append('file', file);
        if (message) {
          formData.append('message', message);
        }

        return {
          url: OFFICE_ENDPOINTS.CHATS.UPLOAD_FILE(chatId),
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Chats', id: chatId },
        'Chats',
      ],
    }),

    // Search messages
    searchMessages: builder.query<
      MessagesResponse,
      { query: string; chatId?: number; limit?: number }
    >({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.CHATS.SEARCH_MESSAGES,
        params,
      }),
    }),

    // Leave chat
    leaveChat: builder.mutation<{ success: boolean; message: string }, number>({
      query: (chatId) => ({
        url: OFFICE_ENDPOINTS.CHATS.LEAVE_CHAT(chatId),
        method: 'POST',
      }),
      invalidatesTags: ['Chats'],
    }),

    // Get or create conversation with user
    getOrCreateConversation: builder.query<
      {
        success: boolean;
        exists: boolean;
        data?: {
          chat: Chat;
          messages: ChatMessage[];
          unread_count: number;
          last_message?: ChatMessage;
        };
      },
      number
    >({
      query: (userId) => OFFICE_ENDPOINTS.CHATS.GET_OR_CREATE_CONVERSATION(userId),
      providesTags: ['Chats'],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useGetChatMessagesQuery,
  useGetOlderMessagesQuery,
  useMarkMessagesAsReadMutation,
  useUpdateTypingStatusMutation,
  useGetUnreadChatsCountQuery,
  useUploadFileToChatMutation,
  useSearchMessagesQuery,
  useLeaveChatMutation,
  useGetOrCreateConversationQuery,
} = chatsApiSlice; 