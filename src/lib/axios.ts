import axios from 'axios';
import { API_CONFIG } from './constants';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com';

// Create an Axios instance with custom config
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  timeout: 30000,
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get auth token from multiple sources
    let token = null;
    let tokenType = 'Bearer';

    // Try localStorage first (client-side only)
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token');
      tokenType = localStorage.getItem('token_type') || 'Bearer';
      
      // If no token in localStorage, try cookies
      if (!token) {
        // Parse cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        token = cookies['token'];
        tokenType = cookies['token_type'] || 'Bearer';
      }
    }
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
      console.log('Added auth token to request:', config.url);
    } else {
      console.log('No auth token available for request:', config.url);
    }

    // Remove any double slashes in the URL (except after http:// or https://)
    if (config.url) {
      config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
    }

    console.log('Request URL:', config.url);
    console.log('Request Headers:', {
      ...config.headers,
      Authorization: config.headers.Authorization ? '[PRESENT]' : '[MISSING]'
    });

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response is HTML (usually means we got redirected to login)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        contentType
      });
      
      // If we received HTML on an API call, it's likely we were redirected to login
      // For debugging only - in production we'd throw an error without this log
      console.log('Response preview:', response.data.substring(0, 150));
      
      throw new Error('تم تسجيل خروجك. يرجى تسجيل الدخول مرة أخرى.');
    }

    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('user');
          
          // Get the current language from the URL
          const currentPath = window.location.pathname;
          const locale = currentPath.split('/')[1] || 'ar';
          
          // Redirect to the login page with the correct locale
          window.location.href = `/${locale}/auth/login`;
        }
        throw new Error('جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.');
      }

      // Handle 500 Internal Server Error
      if (status === 500) {
        if (data.message?.includes('Target class')) {
          throw new Error(`خطأ في النظام: المسار غير صحيح (${error.config?.url}). يرجى التواصل مع الدعم الفني.`);
        }
        throw new Error(`حدث خطأ في الخادم: ${data.message || 'خطأ غير معروف'}. يرجى المحاولة مرة أخرى لاحقاً`);
      }

      // Handle validation errors
      if (status === 422) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          throw new Error(Array.isArray(firstError) ? firstError[0] : 'بيانات غير صالحة');
        }
      }

      // Handle rate limiting
      if (status === 429) {
        throw new Error('تم تجاوز الحد المسموح به من المحاولات. يرجى الانتظار قليلاً.');
      }

      if (data.message) {
        throw new Error(data.message);
      }
    }

    if (error.request) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('انتهت مهلة الاتصال. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      }
      throw new Error('لم نتمكن من الوصول إلى الخادم. يرجى التحقق من اتصال الإنترنت.');
    }

    throw new Error(error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  }
);

export default axiosInstance; 