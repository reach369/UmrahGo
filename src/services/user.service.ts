import { API_BASE_CONFIG } from '@/config/api.config';
import axios from '@/lib/axios';

const API_BASE = API_BASE_CONFIG.BASE_URL;

interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  rtl?: boolean;
  reduce_animations?: boolean;
  high_contrast?: boolean;
  notification_sounds?: boolean;
  auto_play_videos?: boolean;
  preferred_currency?: string;
}

export const userService = {
  /**
   * Get user profile data
   */
  async getUserProfile(userId: string | number) {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/profile`);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string | number, profileData: any) {
    try {
      const response = await axios.put(`${API_BASE}/users/${userId}/profile`, profileData);
      return response.data?.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string | number): Promise<UserPreferences> {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/preferences`);
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Return empty object on error
      return {};
    }
  },

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string | number, preferences: UserPreferences): Promise<boolean> {
    try {
      const response = await axios.put(`${API_BASE}/users/${userId}/preferences`, preferences);
      return response.status === 200;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  /**
   * Change user password
   */
  async changePassword(userId: string | number, data: { current_password: string; new_password: string; confirm_password: string }) {
    try {
      const response = await axios.post(`${API_BASE}/users/${userId}/change-password`, data);
      return response.status === 200;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(userId: string | number, file: File) {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(`${API_BASE}/users/${userId}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data?.data;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  },

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string | number, page = 1, limit = 10) {
    try {
      const response = await axios.get(`${API_BASE}/users/${userId}/activity`, {
        params: { page, limit }
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }
}; 