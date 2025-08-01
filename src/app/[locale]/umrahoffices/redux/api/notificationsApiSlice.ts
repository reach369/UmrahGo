import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

// Types
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  content?: string;  // Add content as optional since backend uses both message and content
  data?: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  is_delivered: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'booking' | 'payment' | 'system' | 'chat' | 'package' | 'hotel';
  action_url?: string;
  link?: string;  // Add link as optional since backend uses both action_url and link
  action_text?: string;
  icon?: string;
  user_id: number;
  sender_id?: number;
  sender?: User;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path?: string;
  role?: string;
}

export interface NotificationSettings {
  id: number;
  user_id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    bookings: boolean;
    payments: boolean;
    chat_messages: boolean;
    system_updates: boolean;
    package_updates: boolean;
    hotel_updates: boolean;
  };
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
}

export interface NotificationsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Notification[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    unread_count: number;
  };
}

export interface NotificationResponse {
  status: boolean;
  code: number;
  message: string;
  data: Notification;
}

export interface UnreadCountResponse {
  status: boolean;
  data: {
    total_unread: number;
    by_category: Record<string, number>;
  };
}

export interface NotificationSettingsResponse {
  status: boolean;
  data: NotificationSettings;
}

export interface NotificationsQueryParams {
  page?: number;
  per_page?: number;
  type?: string;
  category?: string;
  is_read?: boolean;
  priority?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface BulkActionRequest {
  notification_ids: number[];
  action: 'mark_read' | 'mark_unread' | 'delete';
}

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get notifications list
    getNotifications: builder.query<NotificationsResponse, NotificationsQueryParams>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.LIST,
        params,
      }),
      providesTags: ['Offices'],
    }),

    // Get unread notifications count
    getUnreadNotificationsCount: builder.query<UnreadCountResponse, void>({
      query: () => OFFICE_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
        providesTags: ['Offices'],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<
      { status: boolean; message: string },
      number
    >({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Offices'],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<
      { status: boolean; message: string },
      void
    >({
      query: () => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        method: 'PATCH',
      }),
      invalidatesTags: ['Offices'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<
      { status: boolean; message: string },
      number
    >({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Offices'],
    }),

    // Get notification settings
    getNotificationSettings: builder.query<NotificationSettingsResponse, void>({
      query: () => OFFICE_ENDPOINTS.NOTIFICATIONS.SETTINGS,
      providesTags: ['Offices'],
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation<
      NotificationSettingsResponse,
      Partial<NotificationSettings>
    >({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.UPDATE_SETTINGS,
        method: 'PUT',
        body: data,
      }),
        invalidatesTags: ['Offices'],
    }),

    // Bulk actions on notifications
    bulkNotificationActions: builder.mutation<
      { status: boolean; message: string; affected_count: number },
      BulkActionRequest
    >({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.BULK_ACTIONS,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Offices'],
    }),

    // Mark notification as delivered
    markNotificationAsDelivered: builder.mutation<
      { status: boolean; message: string },
      number
    >({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.MARK_DELIVERED(id),
        method: 'PATCH',
      }),
      invalidatesTags: ['Offices'],
    }),

    // Get notification types
    getNotificationTypes: builder.query<
      { status: boolean; data: { type: string; label: string; description: string }[] },
      void
    >({
      query: () => OFFICE_ENDPOINTS.NOTIFICATIONS.GET_TYPES,
    }),

    // Subscribe to notifications
    subscribeToNotifications: builder.mutation<
      { status: boolean; message: string },
      { endpoint: string; keys: { p256dh: string; auth: string } }
    >({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE,
        method: 'POST',
        body: data,
      }),
    }),

    // Unsubscribe from notifications
    unsubscribeFromNotifications: builder.mutation<
      { status: boolean; message: string },
      { endpoint: string }
    >({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useBulkNotificationActionsMutation,
  useMarkNotificationAsDeliveredMutation,
  useGetNotificationTypesQuery,
  useSubscribeToNotificationsMutation,
  useUnsubscribeFromNotificationsMutation,
} = notificationsApiSlice; 