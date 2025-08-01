import axios from 'axios';
import {
  BusOperator,
  Bus,
  BusBooking,
  BusBookingStatistics,
  CalendarBooking,
  BookingFilters,
  CreateBookingForm,
  UpdateBookingStatusForm,
  CancelBookingForm,
  CreateBusForm,
  UpdateBusOperatorProfile,
  ApiResponse,
  PaginatedResponse,
  Conversation,
  ChatMessage
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com/api/v1';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('operator_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('operator_auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export class BusOperatorService {
  // Bus Booking Management
  static async getBookings(filters?: BookingFilters): Promise<ApiResponse<PaginatedResponse<BusBooking>>> {
    const response = await api.get('/operator/bus-bookings', { params: filters });
    return response.data;
  }

  static async getBooking(id: number): Promise<ApiResponse<BusBooking>> {
    const response = await api.get(`/operator/bus-bookings/${id}`);
    return response.data;
  }

  static async createBooking(bookingData: CreateBookingForm): Promise<ApiResponse<BusBooking>> {
    const response = await api.post('/operator/bus-bookings', bookingData);
    return response.data;
  }

  static async updateBookingStatus(id: number, statusData: UpdateBookingStatusForm): Promise<ApiResponse<BusBooking>> {
    const response = await api.put(`/operator/bus-bookings/${id}/status`, statusData);
    return response.data;
  }

  static async cancelBooking(id: number, cancelData: CancelBookingForm): Promise<ApiResponse<BusBooking>> {
    const response = await api.post(`/operator/bus-bookings/${id}/cancel`, cancelData);
    return response.data;
  }

  // Statistics
  static async getBookingStatistics(): Promise<ApiResponse<BusBookingStatistics>> {
    const response = await api.get('/operator/bus-bookings/statistics');
    return response.data;
  }

  // Calendar
  static async getBookingCalendar(month: number, year: number): Promise<ApiResponse<CalendarBooking[]>> {
    const response = await api.get('/operator/bus-bookings/calendar', {
      params: { month, year }
    });
    return response.data;
  }

  // Bus Management
  static async getBuses(): Promise<ApiResponse<Bus[]>> {
    const response = await api.get('/operator/buses');
    return response.data;
  }

  static async getBus(id: number): Promise<ApiResponse<Bus>> {
    const response = await api.get(`/operator/buses/${id}`);
    return response.data;
  }

  static async createBus(busData: CreateBusForm): Promise<ApiResponse<Bus>> {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('name', busData.name);
    formData.append('type', busData.type);
    formData.append('capacity', busData.capacity.toString());
    formData.append('plate_number', busData.plate_number);
    formData.append('price_per_km', busData.price_per_km.toString());
    formData.append('status', busData.status);
    
    if (busData.description) {
      formData.append('description', busData.description);
    }
    
    if (busData.features && busData.features.length > 0) {
      busData.features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });
    }
    
    if (busData.images && busData.images.length > 0) {
      busData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    const response = await api.post('/operator/buses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async updateBus(id: number, busData: Partial<CreateBusForm>): Promise<ApiResponse<Bus>> {
    const formData = new FormData();
    
    Object.entries(busData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((image: File, index: number) => {
            formData.append(`images[${index}]`, image);
          });
        } else if (key === 'features' && Array.isArray(value)) {
          value.forEach((feature: string, index: number) => {
            formData.append(`features[${index}]`, feature);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post(`/operator/buses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deleteBus(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete(`/operator/buses/${id}`);
    return response.data;
  }

  // Profile Management
  static async getProfile(): Promise<ApiResponse<BusOperator>> {
    const response = await api.get('/operator/profile');
    return response.data;
  }

  static async updateProfile(profileData: UpdateBusOperatorProfile): Promise<ApiResponse<BusOperator>> {
    const formData = new FormData();
    
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post('/operator/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Chat Management
  static async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await api.get('/operator/conversations');
    return response.data;
  }

  static async getConversation(id: number): Promise<ApiResponse<Conversation>> {
    const response = await api.get(`/operator/conversations/${id}`);
    return response.data;
  }

  static async getMessages(conversationId: number, page: number = 1): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> {
    const response = await api.get(`/operator/conversations/${conversationId}/messages`, {
      params: { page }
    });
    return response.data;
  }

  static async sendMessage(conversationId: number, message: string, messageType: string = 'text'): Promise<ApiResponse<ChatMessage>> {
    const response = await api.post(`/operator/conversations/${conversationId}/messages`, {
      message,
      message_type: messageType
    });
    return response.data;
  }

  static async markMessageAsRead(conversationId: number, messageId: number): Promise<ApiResponse<null>> {
    const response = await api.post(`/operator/conversations/${conversationId}/messages/${messageId}/read`);
    return response.data;
  }

  // Dashboard Data
  static async getDashboardData(): Promise<ApiResponse<{
    statistics: BusBookingStatistics;
    recentBookings: BusBooking[];
    activeBuses: Bus[];
  }>> {
    const response = await api.get('/operator/dashboard');
    return response.data;
  }

  // Authentication helpers
  static setAuthToken(token: string): void {
    localStorage.setItem('operator_auth_token', token);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem('operator_auth_token');
  }

  static removeAuthToken(): void {
    localStorage.removeItem('operator_auth_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export default BusOperatorService; 