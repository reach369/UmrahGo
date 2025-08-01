import axios from 'axios';
import { API_CONFIG } from './constants';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';

// Create an Axios instance with custom config
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
 // timeout: 30000,
});

// Function to get auth token from multiple sources
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;

  let token: string | null = null;
  let tokenType: string = 'Bearer';

  try {
    // Priority order:
    // 1. NextAuth tokens (most recent)
    // 2. Regular tokens
    // 3. Cookies
    
    // Check NextAuth tokens
    const nextAuthToken = localStorage.getItem('nextauth_token');
    const nextAuthTokenType = localStorage.getItem('nextauth_token_type');
    
    if (nextAuthToken) {
      return { 
        token: nextAuthToken, 
        tokenType: nextAuthTokenType || 'Bearer' 
      };
    }
    
    // Check regular localStorage tokens
    token = localStorage.getItem('token');
    tokenType = localStorage.getItem('token_type') || 'Bearer';
    
    if (token) {
      // Sync with nextauth format for consistency
      localStorage.setItem('nextauth_token', token);
      localStorage.setItem('nextauth_token_type', tokenType);
      return { token, tokenType };
    }
    
    // Finally, check cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);
    
    const cookieToken = cookies['nextauth_token'] || cookies['token'];
    const cookieTokenType = cookies['nextauth_token_type'] || cookies['token_type'] || 'Bearer';
    
    if (cookieToken) {
      // Sync with localStorage for consistency
      localStorage.setItem('nextauth_token', cookieToken);
      localStorage.setItem('nextauth_token_type', cookieTokenType);
      localStorage.setItem('token', cookieToken);
      localStorage.setItem('token_type', cookieTokenType);
      return { token: cookieToken, tokenType: cookieTokenType };
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }

  return null;
};

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip auth headers for social auth endpoints
    const skipAuth = config.url?.includes('/auth/social/') || config.metadata?. skipAuth;
    let authData = null;
    
    if (!skipAuth) {
      authData = getAuthToken();
      
      if (authData) {
        config.headers.Authorization = `${authData.tokenType} ${authData.token}`;
      }
    }
    
    // Add CORS headers for better server compatibility
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    // For social auth endpoints, add specific headers
    if (config.url?.includes('/auth/social/')) {
      config.headers['Access-Control-Allow-Origin'] = '*';
      config.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    
    // Log the request for debugging (remove in production)
    console.log('Axios request:', {
      method: config.method,
      url: config.url,
      hasAuth: !!authData,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses (remove in production)
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('Response interceptor error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.warn('🔐 Authentication error - attempting to refresh token');
      
      // Try to get a fresh token
      const authData = getAuthToken();
      if (authData) {
        // Update the authorization header and retry
        originalRequest.headers.Authorization = `${authData.tokenType} ${authData.token}`;
        return axiosInstance(originalRequest);
      }
      
      // No valid token found, clear all data and redirect
      if (typeof window !== 'undefined') {
        // Don't redirect if we're already on the login page or a public page
        const currentPath = window.location.pathname;
        if (currentPath.includes('/auth/login') || 
            currentPath.includes('/landing') || 
            currentPath === '/' || 
            currentPath.includes('/about-us') ||
            currentPath.includes('/contact') ||
            currentPath.includes('/how-it-works') ||
            currentPath.includes('/packages') ||
            currentPath.includes('/privacy') ||
            currentPath.includes('/terms') ||
            currentPath.includes('/umrah-offices')) {
          // Don't redirect on public pages
          return Promise.reject(error);
        }
        
        // Clear all authentication data
        const keysToRemove = [
          'token', 'token_type', 'user',
          'nextauth_session', 'nextauth_token', 'nextauth_token_type', 'nextauth_user'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear cookies
        const cookiesToClear = [
          'token', 'token_type', 'user',
          'nextauth_token', 'nextauth_token_type', 'nextauth_user'
        ];
        cookiesToClear.forEach(name => {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
        });
        
        // Get the current language from the URL
        const locale = window.location.pathname.split('/')[1] || 'ar';
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = `/${locale}/auth/login`;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Export additional utilities
export const setAuthToken = (token: string, tokenType: string = 'Bearer') => {
  if (!token) return;
  
  try {
    // Set token in axios headers
    axiosInstance.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    
    // Store in both formats for compatibility
    localStorage.setItem('nextauth_token', token);
    localStorage.setItem('nextauth_token_type', tokenType);
    localStorage.setItem('token', token);
    localStorage.setItem('token_type', tokenType);
    
    // Set cookies for cross-tab synchronization
    document.cookie = `nextauth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `nextauth_token_type=${encodeURIComponent(tokenType)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `token_type=${encodeURIComponent(tokenType)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const clearAuthToken = () => {
  try {
    // Clear from axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    // Clear from localStorage
    const keysToRemove = [
      'token', 'token_type', 'user',
      'nextauth_session', 'nextauth_token', 'nextauth_token_type', 'nextauth_user'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear from cookies
    const cookiesToClear = [
      'token', 'token_type', 'user',
      'nextauth_token', 'nextauth_token_type', 'nextauth_user'
    ];
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}; 