import { apiSlice } from './apiSlice';

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
        url: '/api/v1/auth/change-password',
        method: 'POST',
        body: credentials,
      }),
      // Invalidate relevant cache tags if needed
      invalidatesTags: ['Offices'],
    }),
  }),
});

// Export the generated hooks
export const {
  useChangePasswordMutation,
} = authApiSlice; 