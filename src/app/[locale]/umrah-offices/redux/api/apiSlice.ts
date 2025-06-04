import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base RTK Query API slice for all umrah office-related endpoints
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com',
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
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
        // Clear token and redirect to login on unauthorized
        localStorage.removeItem('token');
        // Get the current language from the URL
        const locale = window.location.pathname.split('/')[1] || 'ar';
        window.location.href = `/${locale}/auth/login`;
      }

      return false;
    }
  }),
  tagTypes: ['Offices', 'Packages', 'Campaigns', 'Bookings', 'Payments', 'Transportation', 'Documents', 'Gallery'],
  endpoints: () => ({})
}); 