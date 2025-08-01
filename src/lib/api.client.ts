/**
 * API Client - عميل API محسن مع retry logic ومعالجة الأخطاء
 * Enhanced API client with retry logic and error handling
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_CONFIG, API_ENDPOINTS } from '@/config/api.config';

// Types


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
export interface ApiResponse<T = any> {
  status: boolean;
  code: number;
  message: string;
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  status: boolean;
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Client configuration interfaces
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  enableAuth?: boolean;
  customHeaders?: Record<string, string>;
}

/**
 * Creates a configured Axios instance with error handling and retries
 * @param config Client configuration
 * @returns Axios instance
 */
export const createApiClient = (config: ApiClientConfig = {}): AxiosInstance => {
  const { 
    baseURL = API_BASE_CONFIG.BASE_URL, 
    timeout = API_BASE_CONFIG.TIMEOUT.DEFAULT, 
    enableAuth = false, 
    customHeaders = {} 
  } = config;

  // Create Axios instance
  const client = axios.create({
    baseURL: typeof baseURL === 'string' ? baseURL : API_BASE_CONFIG.BASE_URL,
    timeout,
    headers: { ...(API_BASE_CONFIG.DEFAULT_HEADERS || {}), ...customHeaders },
  });

  // Request Interceptor - Add Auth Token
  if (enableAuth) {
    client.interceptors.request.use(
      async (config) => {
        let token: string | null = null;
        
        // Try to get token from localStorage if available
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('auth_token');
        }

        // Check for session storage as fallback
        if (!token && typeof window !== 'undefined') {
          token = sessionStorage.getItem('auth_token');
        }

        // Add token to headers if available
        if (token) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor - Token refresh handling
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and request hasn't been retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshToken = localStorage.getItem('refresh_token');
            
            if (refreshToken) {
              // Call refresh token endpoint
              const response = await axios.post(
                `${baseURL}${API_ENDPOINTS.AUTH.REFRESH}`,
                { refresh_token: refreshToken }
              );

              if (response.data.status && response.data.data?.access_token) {
                const { access_token, refresh_token } = response.data.data;
                
                // Save new tokens
                localStorage.setItem('auth_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                // Update authorization header
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                
                // Retry original request
                return client(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            
            // If refresh fails, clear tokens and redirect to login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              
              // Redirect to login page
              if (window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login';
              }
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Add retry functionality to the client
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config } = error;
      
      // Skip retry for certain conditions
      if (!config || config._isRetry || (error.response?.status && error.response?.status < 500)) {
        return Promise.reject(error);
      }
      
      // Set retry counter
      config._retryCount = config._retryCount || 0;
      
      // Check if max retries reached
      if (config._retryCount >= API_BASE_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
        return Promise.reject(error);
      }
      
      // Increment retry counter
      config._retryCount += 1;
      config._isRetry = true;
      
      // Create new promise with delay
      const delay = new Promise((resolve) => {
        setTimeout(resolve, API_BASE_CONFIG.RATE_LIMIT.WINDOW_MS * config._retryCount);
      });
      
      // Retry the request after delay
      await delay;
      return client(config);
    }
  );

  return client;
};

/**
 * Creates a dedicated upload client for handling file uploads
 * @param config Client configuration
 * @returns AxiosInstance configured for file uploads
 */
export const createUploadClient = (config: ApiClientConfig = {}): AxiosInstance => {
  const { 
    baseURL = API_BASE_CONFIG.BASE_URL, 
    timeout = API_BASE_CONFIG.TIMEOUT.DEFAULT * 2, // Double timeout for uploads
    enableAuth = true, 
    customHeaders = {} 
  } = config;
  
  // Create upload client with multipart/form-data header
  const uploadClient = createApiClient({
    baseURL: typeof baseURL === 'string' ? baseURL : API_BASE_CONFIG.BASE_URL,
    timeout,
    enableAuth,
    customHeaders: {
      ...customHeaders,
      'Content-Type': 'multipart/form-data',
    },
  });

  return uploadClient;
};

// Create standard API clients
export const publicApiClient = createApiClient({ enableAuth: false });
export const authApiClient = createApiClient({ enableAuth: true });
export const uploadApiClient = createUploadClient();

// Error handling

/**
 * Checks if error is a network error
 * @param error Error to check
 * @returns boolean
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && Boolean(error.request);
};

/**
 * Handles API errors consistently
 * @param error Error object
 * @returns Standardized error
 */
export const handleApiError = (error: any): Error => {
  // Network error (no response)
  if (isNetworkError(error)) {
    console.error('Network Error:', error);
    return new Error('خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.');
  }
  
  // Response error with data
  if (error.response?.data) {
    const { message, errors } = error.response.data;
    
    // If validation errors, return first one
    if (errors && Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const firstError = errors[firstErrorKey][0];
      return new Error(firstError || message || 'حدث خطأ ما');
    }
    
    // Return message from API
    if (message) {
      return new Error(message);
    }
  }
  
  // Status code based messages
  if (error.response?.status) {
    switch (error.response.status) {
      case 401:
        return new Error('غير مصرح لك. يرجى تسجيل الدخول مرة أخرى.');
      case 403:
        return new Error('غير مسموح لك بالوصول إلى هذا المورد.');
      case 404:
        return new Error('المورد المطلوب غير موجود.');
      case 422:
        return new Error('البيانات المدخلة غير صالحة.');
      case 429:
        return new Error('عدد كثير من الطلبات، يرجى المحاولة بعد قليل.');
      case 500:
        return new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.');
      default:
        return new Error(`خطأ (${error.response.status}): يرجى المحاولة مرة أخرى لاحقاً.`);
    }
  }
  
  // Default error
  return new Error('حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.');
};

// Convenience method to safely handle API requests
export const apiRequest = async <T>(
  requestPromise: Promise<AxiosResponse<any>>
): Promise<T> => {
  try {
    const response = await requestPromise;
    return response.data as T;
    } catch (error) {
    throw handleApiError(error);
  }
};

// Helper for file uploads with progress tracking
export const uploadFile = async (
    endpoint: string,
    formData: FormData,
  onProgress?: (percentage: number) => void
): Promise<any> => {
  try {
    const response = await uploadApiClient.post(endpoint, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });
    
    return response.data;
    } catch (error) {
    throw handleApiError(error);
  }
};

// Helper for file downloads
export const downloadFile = async (
  url: string,
  filename?: string
): Promise<void> => {
  try {
    const response = await authApiClient.get(url, {
        responseType: 'blob',
      });

    // Create download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Set filename
    const disposition = response.headers['content-disposition'];
    const serverFilename = disposition && disposition.match(/filename="(.+)"/);
    link.download = filename || (serverFilename ? serverFilename[1] : 'download');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw handleApiError(error);
  }
};

// Export for convenience
export default {
  publicApiClient,
  authApiClient,
  uploadApiClient,
  createApiClient,
  createUploadClient,
  isNetworkError,
  handleApiError,
  apiRequest,
  uploadFile,
  downloadFile
}; 