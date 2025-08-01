import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base RTK Query API slice for all umrah office-related endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1',
    prepareHeaders: (headers) => {
      // Get token from localStorage (prefer NextAuth tokens)
      let token = localStorage.getItem('nextauth_token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
    // Handle API errors
    validateStatus: (response, body) => {
      // Consider only 2xx status codes as success
      if (response.status >= 200 && response.status < 300) {
        return true;
      }
    
      // Handle specific error cases
      if (response.status === 401) {
        // Clear all authentication data and redirect to login on unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        localStorage.removeItem('nextauth_session');
        localStorage.removeItem('nextauth_token');
        localStorage.removeItem('nextauth_token_type');
        localStorage.removeItem('nextauth_user');
        
        // Get the current language from the URL
        const locale = window.location.pathname.split('/')[1] || 'ar';
        window.location.href = `/${locale}/auth/login`;
      }

      return false;
    }
  }),
  tagTypes: ['Offices', 'Packages', 'Campaigns', 'Bookings', 'Payments', 'Transportation', 'Documents', 'Gallery', 'Profile'],
  endpoints: () => ({})
}); 