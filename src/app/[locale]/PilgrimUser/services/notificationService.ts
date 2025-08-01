import axios, { AxiosError } from 'axios';
import { 
  API_BASE_CONFIG, 
  USER_ENDPOINTS
} from '@/config/api.config';
import { handleApiError } from '@/lib/utils';
import { getAuthToken } from '@/lib/auth.service';

// Create axios instance with retry functionality
const createApiInstance = () => {
  const instance = axios.create({
    timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
    headers: API_BASE_CONFIG.DEFAULT_HEADERS,
  });

  // Add request interceptor for retries
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      
      if (!config || config.retryCount >= 2) {
        throw error;
      }

      config.retryCount = (config.retryCount || 0) + 1;
      
      // Try fallback URLs if main URL fails
      if (config.retryCount === 1 && API_BASE_CONFIG.FALLBACK_URLS.length > 0) {
        const fallbackUrl = API_BASE_CONFIG.FALLBACK_URLS[0];
        config.baseURL = fallbackUrl;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
      
      return instance.request(config);
    }
  );

  return instance;
};

const apiInstance = createApiInstance();

// Data interfaces
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system' | 'chat' | 'announcement' | 'other';
  status: 'read' | 'unread';
  data?: {
    booking_id?: number;
    payment_id?: number;
    chat_id?: string;
    redirect_url?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

// Response interfaces
export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Fetch all notifications for the logged-in user
 * Similar to getNotifications in the Dart implementation
 */
export const getNotifications = async (token: string, params: {
  status?: 'read' | 'unread';
  type?: 'booking' | 'payment' | 'system' | 'chat' | 'announcement' | 'other';
  per_page?: number;
  page?: number;
} = {}): Promise<ApiResponse<Notification[]>> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.NOTIFICATIONS.LIST, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    }
    
    throw new Error('Server error');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw handleApiError(error);
  }
};

/**
 * Get unread notifications count
 * Similar to getUnreadCount in the Dart implementation
 */
export const getUnreadCount = async (token: string): Promise<number> => {
  try {
    if (!token) {
      console.warn('No token provided for getUnreadCount, returning 0');
      return 0; // Return 0 instead of throwing an error
    }

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data) {
      // Safely access nested properties with fallbacks
      if (response.data.data && typeof response.data.data.count === 'number') {
        return response.data.data.count;
      } else if (response.data.count && typeof response.data.count === 'number') {
        return response.data.count;
      } else if (response.data.unread_count && typeof response.data.unread_count === 'number') {
        return response.data.unread_count;
      } else if (response.data.data && typeof response.data.data === 'number') {
        return response.data.data;
      }
      
      // If we can't find a valid count in the expected locations, log and return 0
      console.warn('Unread count not found in expected response structure:', response.data);
      return 0;
    }
    
    return 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    // Return 0 instead of throwing to prevent UI errors
    return 0;
  }
};

/**
 * Mark all notifications as read
 * Similar to markAllAsRead in the Dart implementation
 */
export const markAllAsRead = async (token: string): Promise<number> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data.data.count;
    }
    
    return 0;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw handleApiError(error);
  }
};

/**
 * Mark a specific notification as read
 */
export const markAsRead = async (token: string, id: string | number): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error(`Error marking notification ${id} as read:`, error);
    throw handleApiError(error);
  }
};

/**
 * Delete a notification by ID
 * Similar to deleteNotification in the Dart implementation
 */
export const deleteNotification = async (token: string, id: string | number): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.delete(`${USER_ENDPOINTS.NOTIFICATIONS.LIST}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Updates FCM token for push notifications
 */
export const updateFCMToken = async (token: string, fcmToken: string): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.FCM_TOKEN, 
      { token: fcmToken },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw handleApiError(error);
  }
};

/**
 * Unsubscribe from notifications
 */
export const unsubscribe = async (token: string, types?: string[]): Promise<boolean> => {
  try {
    if (!token) {
      throw new Error('Unauthorized: No token provided');
    }

    const response = await apiInstance.post(API_BASE_CONFIG.BASE_URL+  USER_ENDPOINTS.UNSUBSCRIBE, 
      { notification_types: types },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      }
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    throw handleApiError(error);
  }
}; 


const API_BASE = API_BASE_CONFIG.BASE_URL;

interface NotificationSettings {
  email_notifications?: boolean;
  push_notifications?: boolean;
  booking_updates?: boolean;
  marketing_emails?: boolean;
  new_packages?: boolean;
}

export const notificationService = {
  /**
   * Get notification settings for a user
   */
  async getNotificationSettings(userId: string | number): Promise<NotificationSettings> {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/notification-settings`);
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Return default settings on error
      return {
        email_notifications: true,
        push_notifications: true,
        booking_updates: true,
        marketing_emails: false,
        new_packages: true
      };
    }
  },

  /**
   * Update notification settings for a user
   */
  async updateNotificationSettings(userId: string | number, settings: NotificationSettings): Promise<boolean> {
    try {
      const response = await axios.put(`${API_BASE}/users/${userId}/notification-settings`, settings);
      return response.status === 200;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(notificationIds: string[] | number[]): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE}/notifications/mark-read`, {
        notification_ids: notificationIds
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await axios.get(`${API_BASE}/notifications/unread-count`);
      return response.data?.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  }
}; 