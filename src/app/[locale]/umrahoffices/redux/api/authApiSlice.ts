import { apiSlice } from './apiSlice';
import { AUTH_ENDPOINTS } from '@/config/api.config';

// Define types for the change password request and response
interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

interface ChangePasswordResponse {
  status: boolean;
  message: string;
  code: number;
  data?: any;
}

// Create the auth API slice with change password endpoint
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (credentials) => ({
        url: AUTH_ENDPOINTS.CHANGE_PASSWORD,
        method: 'POST',
        body: credentials,
      }),
      // Invalidate relevant cache tags if needed
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export the generated hooks
export const {
  useChangePasswordMutation,
} = authApiSlice; 