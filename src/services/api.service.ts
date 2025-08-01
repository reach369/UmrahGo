import axios from 'axios';

// Default API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with non-2xx status
      if (error.response.status === 401) {
        // Unauthorized - clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API Service class
class ApiService {
  // Auth endpoints
  static async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  }

  static async register(userData) {
    return apiClient.post('/auth/register', userData);
  }

  static async logout() {
    return apiClient.post('/auth/logout');
  }

  static async getProfile() {
    return apiClient.get('/user/profile');
  }

  static async updateProfile(userData) {
    return apiClient.post('/user/profile', userData);
  }

  // User endpoints
  static async getUserOnlineStatus(userId) {
    return apiClient.get(`/user/online/${userId}`);
  }

  static async updateUserOnlineStatus(isOnline = true) {
    return apiClient.post('/user/online', { status: isOnline });
  }

  // Notification endpoints
  static async getNotifications(params = {}) {
    return apiClient.get('/notifications', { params });
  }

  static async getUnreadNotificationCount() {
    return apiClient.get('/notifications/unread/count');
  }

  static async markNotificationAsRead(id) {
    return apiClient.post(`/notifications/${id}/read`);
  }

  static async markAllNotificationsAsRead() {
    return apiClient.post('/notifications/read-all');
  }

  // Chat endpoints
  static async getChats() {
    return apiClient.get('/chats');
  }

  static async getChatById(id) {
    return apiClient.get(`/chats/${id}`);
  }

  static async getChatMessages(chatId, params = {}) {
    return apiClient.get(`/chats/${chatId}/messages`, { params });
  }

  static async sendMessage(chatId, message) {
    return apiClient.post(`/chats/${chatId}/messages`, message);
  }

  static async createChat(data) {
    return apiClient.post('/chats', data);
  }

  // Pusher/Broadcasting auth
  static async getBroadcastingAuth(socketId, channel) {
    return apiClient.post('/broadcasting/auth', {
      socket_id: socketId,
      channel_name: channel
    });
  }

  // Generic request methods
  static async get(endpoint, params = {}) {
    return apiClient.get(endpoint, { params });
  }

  static async post(endpoint, data = {}) {
    return apiClient.post(endpoint, data);
  }

  static async put(endpoint, data = {}) {
    return apiClient.put(endpoint, data);
  }

  static async delete(endpoint) {
    return apiClient.delete(endpoint);
  }
}

export default ApiService;