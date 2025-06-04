import { apiSlice } from './apiSlice';

export interface PackageImage {
  id: number;
  package_id: number;
  image_path: string;
  is_main: boolean;
  title: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  url: string;
}

export interface PackageTranslation {
  id: number;
  package_id: number;
  locale: string;
  name: string;
  description: string;
  features: Record<string, string>;
  start_location: string | null;
  end_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Office {
  id: number;
  user_id: number;
  office_name: string;
  address: string;
  contact_number: string;
  logo: string;
  license_doc: string;
  verification_status: string;
  subscription_id: number;
  email: string;
  website: string | null;
  fax: string | null;
  whatsapp: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  commercial_register_number: string;
  license_number: string;
  license_expiry_date: string;
  description: string;
  services_offered: string;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_featured: boolean;
  rating: string;
  reviews_count: number;
  rejection_reason: string | null;
  rejection_notes: string | null;
  verified_by: number | null;
  verified_at: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UmrahPackage {
  id: number;
  office_id: number;
  name: string;
  description: string;
  price: string;
  discount_price: string | null;
  duration_days: number;
  features: Record<string, boolean>;
  status: 'active' | 'inactive' | 'draft';
  type: 'umrah' | 'hajj' | 'combined';
  is_featured: boolean;
  views_count: number;
  max_persons: number;
  includes_transport: boolean;
  includes_accommodation: boolean;
  includes_meals: boolean;
  includes_guide: boolean;
  includes_insurance: boolean;
  includes_activities: boolean;
  start_location: string;
  end_location: string;
  start_date: string | null;
  end_date: string | null;
  location_coordinates: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  featured_image_url: string;
  thumbnail_url: string;
  has_discount: boolean;
  discount_percentage: number;
  images: PackageImage[];
  translations: PackageTranslation[];
  hotels: any[];
  office: Office;
}

export interface PackagesResponse {
  current_page: number;
  data: UmrahPackage[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface GetPackagesParams {
  status?: 'active' | 'inactive' | 'draft';
  featured?: boolean;
  type?: 'umrah' | 'hajj' | 'combined';
  per_page?: number;
  page?: number;
}

export interface UpdatePackageStatusRequest {
  status: 'active' | 'inactive' | 'draft';
  reason?: string;
}

export interface UpdatePackageFeaturedRequest {
  is_featured: boolean;
  featured_until?: string;
}

export interface DuplicatePackageRequest {
  name_suffix?: string;
  start_date?: string;
  end_date?: string;
  booking_deadline?: string;
  status?: 'active' | 'inactive' | 'draft';
}

export const packagesApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPackages: builder.query<PackagesResponse, GetPackagesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.status) queryParams.append('status', params.status);
          if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
          if (params.type) queryParams.append('type', params.type);
          if (params.per_page) queryParams.append('per_page', params.per_page.toString());
          if (params.page) queryParams.append('page', params.page.toString());
        }
        
        const queryString = queryParams.toString();
        return {
          url: `/api/v1/office/packages${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: { status: boolean; code: number; message: string; data: PackagesResponse }) => {
        return response.data;
      },
      providesTags: ['Packages'],
    }),
    getPackage: builder.query<{ data: UmrahPackage }, number>({
      query: (id) => `/api/v1/office/packages/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Packages', id }]
    }),
    createPackage: builder.mutation<{ data: UmrahPackage }, FormData>({
      query: (data) => ({
        url: '/api/v1/office/packages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Packages']
    }),
    updatePackage: builder.mutation<{ data: UmrahPackage }, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/api/v1/office/packages/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Packages',
        { type: 'Packages', id }
      ]
    }),
    updatePackageStatus: builder.mutation<{ data: UmrahPackage }, { id: number; data: UpdatePackageStatusRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/office/packages/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Packages',
        { type: 'Packages', id }
      ]
    }),
    updatePackageFeatured: builder.mutation<{ data: UmrahPackage }, { id: number; data: UpdatePackageFeaturedRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/office/packages/${id}/featured`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Packages',
        { type: 'Packages', id }
      ]
    }),
    duplicatePackage: builder.mutation<{ data: UmrahPackage }, { id: number; data: DuplicatePackageRequest }>({
      query: ({ id, data }) => ({
        url: `/api/v1/office/packages/${id}/duplicate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Packages']
    }),
    deletePackage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/office/packages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Packages']
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useUpdatePackageStatusMutation,
  useUpdatePackageFeaturedMutation,
  useDuplicatePackageMutation,
  useDeletePackageMutation,
} = packagesApiSlice; 