import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

export interface OfficeProfile {
  id: number;
  office_name: string;
  email: string;
  contact_number: string;
  whatsapp?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  logo?: string;
  cover_image?: string;
  license_number?: string;
  license_expiry_date?: string;
  commercial_register_number?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficeProfileResponse {
  status: boolean;
  code: number;
  message: string;
  data: OfficeProfile;
}

export interface UpdateOfficeProfileRequest {
  office_name?: string;
  email?: string;
  contact_number?: string;
  whatsapp?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  license_number?: string;
  license_expiry_date?: string;
  commercial_register_number?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
}

export const officesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOfficeProfile: builder.query<OfficeProfile, void>({
      query: () => OFFICE_ENDPOINTS.PROFILE.GET,
      providesTags: ['Profile'],
      transformResponse: (response: OfficeProfileResponse) => {
        if (response.status === false) {
          throw new Error(response.message || 'Failed to fetch office profile');
        }
        return response.data;
      }
    }),
    updateOfficeProfile: builder.mutation<OfficeProfileResponse, UpdateOfficeProfileRequest>({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.PROFILE.UPDATE,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile']
    }),
    uploadLogo: builder.mutation<OfficeProfileResponse, FormData>({
      query: (formData) => ({
        url: OFFICE_ENDPOINTS.PROFILE.LOGO,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile']
    }),
    uploadCover: builder.mutation<OfficeProfileResponse, FormData>({
      query: (formData) => ({
        url: OFFICE_ENDPOINTS.PROFILE.COVER,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile']
    }),
    updateOfficeEmail: builder.mutation<OfficeProfileResponse, { email: string }>({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.PROFILE.EMAIL_UPDATE,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile']
    }),
    updateOfficePhone: builder.mutation<OfficeProfileResponse, { phone: string }>({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.PROFILE.PHONE_UPDATE,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile']
    }),
    updateOfficePassword: builder.mutation<OfficeProfileResponse, { current_password: string; password: string; password_confirmation: string; }>({
      query: (data) => ({
        url: OFFICE_ENDPOINTS.PROFILE.PASSWORD_UPDATE,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile']
    }),
  }),
});

export const {
  useGetOfficeProfileQuery,
  useUpdateOfficeProfileMutation,
  useUploadLogoMutation,
  useUploadCoverMutation,
  useUpdateOfficeEmailMutation,
  useUpdateOfficePhoneMutation,
  useUpdateOfficePasswordMutation,
} = officesApiSlice; 