'use client';

import axios from 'axios';
import { API_BASE_CONFIG } from '@/config/api.config';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  content?: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  is_delivered: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'booking' | 'payment' | 'system' | 'chat' | 'package' | 'hotel';
  action_url?: string;
  link?: string;
  action_text?: string;
  icon?: string;
  user_id: number;
  sender_id?: number;
  sender?: any;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push_enabled: boolean;
  notification_types: {
    system: boolean;
    booking: boolean;
    payment: boolean;
    chat: boolean;
    support: boolean;
  };
  notification_frequency: 'immediately' | 'hourly' | 'daily' | 'weekly';
  notification_retention: '1_month' | '3_months' | '6_months' | '1_year' | 'forever';
}

class NotificationService {
  private baseUrl = `${API_BASE_CONFIG.BASE_URL}`;

  /**
   * Get all notifications with pagination and filters
   */
  async getNotifications(
    page: number = 1,
    perPage: number = 15,
    filters?: {
      unread?: boolean;
      type?: string;
      priority?: string;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<NotificationsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      
      // Add filters if provided
      if (filters) {
        if (filters.unread !== undefined) params.append('unread', filters.unread.toString());
        if (filters.type) params.append('type', filters.type);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.search) params.append('search', filters.search);
        if (filters.dateFrom) params.append('date_from', filters.dateFrom);
        if (filters.dateTo) params.append('date_to', filters.dateTo);
      }

      const response = await axios.get(
        `${this.baseUrl}/notifications?${params.toString()}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/notifications/unread-count`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Get latest notifications
   */
  async getLatestNotifications(limit: number = 5): Promise<Notification[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/notifications/latest?limit=${limit}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.notifications || [];
    } catch (error) {
      console.error('Error fetching latest notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number | string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/notifications/${id}/mark-as-read`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/notifications/mark-all-as-read`,
        {},
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number | string): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/notifications/${id}`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/notifications`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/notifications/settings`,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.settings;
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      
      // Return default settings
      return {
        enabled: true,
        sound: true,
        desktop: true,
        email: true,
        push_enabled: true,
        notification_types: {
          system: true,
          booking: true,
          payment: true,
          chat: true,
          support: true,
        },
        notification_frequency: 'immediately',
        notification_retention: '3_months'
      };
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/notifications/settings`,
        settings,
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  /**
   * Save FCM token for push notifications
   */
  async saveFcmToken(token: string, deviceInfo?: { 
    deviceId?: string; 
    deviceType?: 'web' | 'android' | 'ios';
  }): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/notifications/fcm-token`,
        {
          token,
          device_id: deviceInfo?.deviceId,
          device_type: deviceInfo?.deviceType || 'web'
        },
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error saving FCM token:', error);
      return false;
    }
  }

  /**
   * Bulk actions on notifications
   */
  async bulkAction(ids: (number | string)[], action: 'mark_read' | 'mark_unread' | 'delete'): Promise<boolean> {
    try {
      // Convert string IDs to numbers if needed
      const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      
      const response = await axios.post(
        `${this.baseUrl}/notifications/bulk`,
        {
          ids: numericIds,
          action
        },
        {
          headers: this.getAuthHeaders()
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('Error performing bulk action on notifications:', error);
      return false;
    }
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('nextauth_token') || localStorage.getItem('token') 
      : null;

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService; 