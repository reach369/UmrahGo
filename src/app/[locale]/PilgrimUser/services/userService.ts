import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '@/lib/constants';
import { 
  API_BASE_CONFIG, 
  PILGRIM_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  USER_ENDPOINTS
} from '@/config/api.config';
import { handleApiError } from '@/lib/utils';
// Import the centralized auth token getter
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

// Flag to control if we use mock data (for development when API is down)
const USE_MOCK_DATA = false;

// API response interfaces
export interface UserProfileApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: UserProfile;
}

export interface UpgradeRequestApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    request_id: number;
    status: string;
  };
}

// Data interfaces
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  gender: string | null;
  phone: string;
  date_of_birth: string | null;
  phone_verification_token: string | null;
  address: string | null;
  city: string | null;
  country: string;
  role_id: number | null;
  status: string;
  profile_photo: string | null;
  avatar: string | null;
  email_verified_at: string | null;
  email_verification_token: string | null;
  phone_verified_at: string | null;
  verification_status: string;
  is_active: boolean;
  preferred_language: string;
  timezone: string;
  notification_preferences: {
    sms: boolean;
    push: boolean;
    email: boolean;
    types: {
      chat: boolean;
      system: boolean;
      booking: boolean;
      payment: boolean;
      support: boolean;
    };
  };
  request_upgrade: string;
  upgrade_docs: any | null;
  upgrade_request_status: string | null;
  upgrade_request_submitted_at: string | null;
  upgrade_request_processed_at: string | null;
  upgrade_request_notes: string | null;
  google_id: string | null;
  facebook_id: string | null;
  twitter_id: string | null;
  apple_id: string | null;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
  profile_photo_path: string | null;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_system: number;
  created_at: string;
  updated_at: string | null;
  pivot: {
    user_id: number;
    role_id: number;
  };
  permissions: any[];
}

// Profile update request interface
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  preferred_language?: string;
  timezone?: string;
  notification_preferences?: {
    sms?: boolean;
    push?: boolean;
    email?: boolean;
    types?: {
      chat?: boolean;
      system?: boolean;
      booking?: boolean;
      payment?: boolean;
      support?: boolean;
    };
  };
}

// Service upgrade request interface
export interface ServiceUpgradeRequest {
  business_type: 'umrah_office' | 'operator';
  business_name: string;
  business_license_number: string;
  business_license_file: File;
  business_address: string;
  business_city: string;
  business_country: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  additional_documents?: File[];
  notes?: string;
}

// Change password request interface
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Mock data for development fallback
const MOCK_USER_PROFILE: UserProfile = {
  id: 5,
  name: "User Name",
  email: "user@example.com",
  gender: null,
  phone: "1234567890",
  date_of_birth: null,
  phone_verification_token: null,
  address: null,
  city: null,
  country: "SA",
  role_id: null,
  status: "active",
  profile_photo: null,
  avatar: "https://example.com/avatar.jpg",
  email_verified_at: "2023-07-07T23:15:53.000000Z",
  email_verification_token: null,
  phone_verified_at: null,
  verification_status: "none",
  is_active: true,
  preferred_language: "ar",
  timezone: "Asia/Riyadh",
  notification_preferences: {
    sms: false,
    push: true,
    email: true,
    types: {
      chat: true,
      system: true,
      booking: true,
      payment: true,
      support: true
    }
  },
  request_upgrade: "0",
  upgrade_docs: null,
  upgrade_request_status: null,
  upgrade_request_submitted_at: null,
  upgrade_request_processed_at: null,
  upgrade_request_notes: null,
  google_id: "103393885106099849127",
  facebook_id: null,
  twitter_id: null,
  apple_id: null,
  fcm_token: null,
  created_at: "2023-07-07T23:15:53.000000Z",
  updated_at: "2023-07-15T14:00:35.000000Z",
  last_activity_at: null,
  profile_photo_path: null,
  roles: [
    {
      id: 4,
      name: "user",
      description: "مستخدم عادي",
      is_system: 1,
      created_at: "2023-07-07T21:52:59.000000Z",
      updated_at: null,
      pivot: {
        user_id: 5,
        role_id: 4
      },
      permissions: []
    }
  ]
};

// Get mock profile
const getMockProfile = (): UserProfileApiResponse => {
  return {
    status: true,
    code: 200,
    message: "Success",
    data: MOCK_USER_PROFILE
  };
};

/**
 * Fetches the user profile
 */
export const fetchUserProfile = async (): Promise<UserProfileApiResponse> => {
  try {
    // Get auth token
    const token = getAuthToken();
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Unauthorized: No token provided');
    }

    // Check if we should use mock data
    if (USE_MOCK_DATA) {
      return getMockProfile();
    }

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.PROFILE, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    
    if (response.status === 200 && response.data) {
      return response.data;
    }
    
    throw new Error('Failed to fetch user profile');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw handleApiError(error);
  }
};

/**
 * Updates the user profile
 */
export const updateUserProfile = async (data: UpdateProfileRequest): Promise<UserProfileApiResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    const url = getFullUrl(`${USER_ENDPOINTS.PROFILE}`);
    
    const response = await apiInstance.put(url, data, {
      headers: getCompleteHeaders({}, token || undefined)
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Changes user password
 */
export const changeUserPassword = async (data: ChangePasswordRequest): Promise<any> => {
  try {
    const token = localStorage.getItem('auth_token');
    const url = getFullUrl(`${USER_ENDPOINTS.PASSWORD}`);
    
    const response = await apiInstance.put(url, data, {
      headers: getCompleteHeaders({}, token || undefined)
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Uploads a profile photo
 */
export const uploadProfilePhoto = async (file: File): Promise<UserProfileApiResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    const url = getFullUrl(`${ILGRIM_ENDPOINTS.PROFILE.AVATAR}`);
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiInstance.post(url, formData, {
      headers: getCompleteHeaders({
        'Content-Type': 'multipart/form-data',
      }, token || undefined)
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Requests an upgrade to service provider
 */
export const requestServiceUpgrade = async (data: FormData): Promise<UpgradeRequestApiResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    const url = getFullUrl('/user/upgrade-request');
    
    const response = await apiInstance.post(url, data, {
      headers: getCompleteHeaders({
        'Content-Type': 'multipart/form-data',
      }, token || undefined)
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};
 
export const getUpgradeRequestStatus = async (): Promise<UpgradeRequestApiResponse> => {
  try {
    const token = localStorage.getItem('auth_token');
    const url = getFullUrl('/user/upgrade-request/status');
    
    const response = await apiInstance.get(url, {
      headers: getCompleteHeaders({}, token || undefined)
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};