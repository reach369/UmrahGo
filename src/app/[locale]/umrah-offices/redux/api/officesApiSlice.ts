import { z } from 'zod';
import { apiSlice } from './apiSlice';

// Zod schema for an umrah office
export const OfficeSchema = z.object({
  id: z.string(),
  name: z.string(),
  licenseNumber: z.string(),
  rating: z.number().min(0).max(5),
  location: z.string(),
  address: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string().optional(),
  packages: z.array(z.string()),
  verified: z.boolean(),
  availableSeats: z.number().int().min(0),
  description: z.string(),
  createdAt: z.string(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

// Zod schema for an umrah package
export const PackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  includes: z.array(z.string()),
  accommodationLevel: z.string(),
  transportation: z.string(),
  meals: z.string(),
  maxPersons: z.number().int().positive()
});

// Zod schema for office profile response
export const OfficeProfileSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  office_name: z.string(),
  address: z.string(),
  contact_number: z.string(),
  logo: z.string().nullable(),
  license_doc: z.string().nullable(),
  verification_status: z.string(),
  subscription_id: z.number(),
  email: z.string(),
  website: z.string().nullable(),
  fax: z.string().nullable(),
  whatsapp: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postal_code: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  commercial_register_number: z.string(),
  license_number: z.string(),
  license_expiry_date: z.string(),
  description: z.string(),
  services_offered: z.string(),
  facebook_url: z.string().nullable(),
  twitter_url: z.string().nullable(),
  instagram_url: z.string().nullable(),
  is_featured: z.boolean(),
  rating: z.string(),
  reviews_count: z.number(),
  rejection_reason: z.string().nullable(),
  rejection_notes: z.string().nullable(),
  verified_by: z.number().nullable(),
  verified_at: z.string().nullable(),
  is_active: z.boolean(),
  deleted_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    gender: z.string().nullable(),
    phone: z.string(),
    role_id: z.number(),
    status: z.string(),
    profile_photo: z.string().nullable(),
    avatar: z.string().nullable(),
    email_verified_at: z.string().nullable(),
    phone_verified_at: z.string().nullable(),
    verification_status: z.string(),
    is_active: z.boolean(),
    preferred_language: z.string(),
    notification_preferences: z.any().nullable(),
    request_upgrade: z.string(),
    upgrade_docs: z.any().nullable(),
    fcm_token: z.string().nullable(),
    google_id: z.string().nullable(),
    facebook_id: z.string().nullable(),
    twitter_id: z.string().nullable(),
    apple_id: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    deleted_at: z.string().nullable(),
    profile_photo_path: z.string().nullable(),
    roles: z.array(z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
      pivot: z.object({
        user_id: z.number(),
        role_id: z.number()
      })
    }))
  }),
  documents: z.array(z.any()),
  gallery: z.array(z.object({
    id: z.number(),
    office_id: z.number(),
    image_path: z.string(),
    thumbnail_path: z.string(),
    title: z.string(),
    description: z.string(),
    is_featured: z.boolean(),
    display_order: z.number(),
    created_at: z.string(),
    updated_at: z.string()
  })),
  comments: z.array(z.any())
});

// Types derived from Zod schema
export type Office = z.infer<typeof OfficeSchema>;
export type OfficeList = Office[];
export type UmrahPackage = z.infer<typeof PackageSchema>;
export type PackageList = UmrahPackage[];
export type OfficeProfile = z.infer<typeof OfficeProfileSchema>;

// API Response types
export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
}

// RTK Query extended API slice for umrah offices
export const officesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all offices (with optional filter params)
    getOffices: builder.query<OfficeList, { location?: string; verified?: boolean; status?: string }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.location) queryParams.append('location', params.location);
        if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());
        if (params.status) queryParams.append('status', params.status);
        const queryString = queryParams.toString();
        return {
          url: `/umrah-offices${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Offices' as const, id })),
              { type: 'Offices' as const, id: 'LIST' },
            ]
          : [{ type: 'Offices' as const, id: 'LIST' }],
    }),

    // Get office by ID
    getOfficeById: builder.query<Office, string>({
      query: (id) => `/umrah-offices/${id}`,
      providesTags: (_, __, id) => [{ type: 'Offices', id }],
    }),

    // Get packages by office ID
    getPackagesByOfficeId: builder.query<PackageList, string>({
      query: (officeId) => `/umrah-offices/${officeId}/packages`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Packages' as const, id })),
              { type: 'Packages' as const, id: 'LIST' },
            ]
          : [{ type: 'Packages' as const, id: 'LIST' }],
    }),

    // Create new office
    createOffice: builder.mutation<Office, Omit<Office, 'id'>>({
      query: (office) => ({
        url: '/umrah-offices',
        method: 'POST',
        body: office,
      }),
      invalidatesTags: [{ type: 'Offices', id: 'LIST' }],
    }),

    // Update office
    updateOffice: builder.mutation<Office, Partial<Office> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/umrah-offices/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Offices', id }],
    }),

    // Create package for an office
    createPackage: builder.mutation<UmrahPackage, UmrahPackage & { officeId: string }>({
      query: ({ officeId, ...packageData }) => ({
        url: `/umrah-offices/${officeId}/packages`,
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: (_, __, { officeId }) => [
        { type: 'Packages', id: 'LIST' },
        { type: 'Offices', id: officeId }
      ],
    }),

    // Update package
    updatePackage: builder.mutation<UmrahPackage, Partial<UmrahPackage> & { id: string, officeId: string }>({
      query: ({ id, officeId, ...patch }) => ({
        url: `/umrah-offices/${officeId}/packages/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Packages', id }],
    }),

    // Search offices
    searchOffices: builder.query<OfficeList, { query: string }>({
      query: (params) => ({
        url: `/umrah-offices/search`,
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'Offices', id: 'LIST' }],
    }),

    // Get top rated offices
    getTopRatedOffices: builder.query<OfficeList, void>({
      query: () => `/umrah-offices/top-rated`,
      providesTags: [{ type: 'Offices', id: 'TOP_RATED' }],
    }),

    // Get office profile
    getOfficeProfile: builder.query<ApiResponse<OfficeProfile>, void>({
      query: () => ({
        url: '/api/v1/office/profile',
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }),
      providesTags: [{ type: 'Offices', id: 'PROFILE' }]
    }),

    // Update office profile
    updateOfficeProfile: builder.mutation<OfficeProfile, Partial<OfficeProfile>>({
      query: (profileData) => ({
        url: '/api/v1/office/profile',
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: profileData
      }),
      transformResponse: (baseQueryReturnValue: unknown) => {
        const response = baseQueryReturnValue as ApiResponse<OfficeProfile>;
        return response.data;
      },
      invalidatesTags: [{ type: 'Offices', id: 'PROFILE' }]
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetOfficesQuery,
  useGetOfficeByIdQuery,
  useGetPackagesByOfficeIdQuery,
  useCreateOfficeMutation,
  useUpdateOfficeMutation,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useSearchOfficesQuery,
  useGetTopRatedOfficesQuery,
  useGetOfficeProfileQuery,
  useUpdateOfficeProfileMutation,
} = officesApiSlice; 