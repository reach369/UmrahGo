/**
 * Notification Service
 * Basic notification functionality for the application
 */

import axios from 'axios';

import { 
  API_BASE_CONFIG, 
  PILGRIM_ENDPOINTS 
} from '@/config/api.config';

export interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  icon?: string;
  action_url?: string;
  priority?: 'normal' | 'high' | 'urgent';
  read_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all notifications for the current user
 * @param token User authentication token
 * @param page Page number for pagination
 * @param perPage Number of items per page
 * @returns List of notifications
 */
export async function getNotifications(token: string, page: number = 1, perPage: number = 20) {
  try {
    const response = await axios.get(`${API_BASE_CONFIG.BASE_URL}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        page,
        per_page: perPage
      }
    });

    if (response.data && response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || 'Failed to fetch notifications');
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
}

/**
 * Get unread notification count
 * @param token User authentication token
 * @returns Unread notification count
 */
export async function getUnreadCount(token: string) {
  try {
    const response = await axios.get(`${API_BASE_CONFIG.BASE_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data && response.data.success) {
      return response.data.data || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 * @param token User authentication token
 * @param notificationId ID of the notification to mark as read
 * @returns API response
 */
export async function markAsRead(token: string, notificationId: string | number) {
  try {
    const response = await axios.post(
      `${API_BASE_CONFIG.BASE_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
}

/**
 * Mark all notifications as read
 * @param token User authentication token
 * @returns API response
 */
export async function markAllAsRead(token: string) {
  try {
    const response = await axios.post(
      `${API_BASE_CONFIG.BASE_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
}

/**
 * Delete a notification
 * @param token User authentication token
 * @param notificationId ID of the notification to delete
 * @returns API response
 */
export async function deleteNotification(token: string, notificationId: string | number) {
  try {
    const response = await axios.delete(`${API_BASE_CONFIG.BASE_URL}/notifications/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
}

/**
 * Delete all notifications for the current user
 * @param token User authentication token
 * @returns API response
 */
export async function deleteAllNotifications(token: string) {
  try {
      const response = await axios.delete(`${API_BASE_CONFIG.BASE_URL}/notifications/delete-all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error deleting all notifications:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete all notifications');
  }
}

const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};

export default notificationService; 