import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

// Types matching backend API
export interface Package {
  id: number;
  office_id: number;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  duration?: number;
  price?: number;
  discount_price?: number | null;
  starting_date?: string;
  ending_date?: string;
  max_people?: number;
  unlimited_persons?: boolean;
  is_featured: boolean;
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'suspended' | 'archived';
  destination?: string;
  destination_ar?: string;
  destination_location?: string;
  meeting_location?: string;
  meeting_location_ar?: string;
  start_location?: string;
  end_location?: string;
  includes_accommodation: boolean;
  includes_transport: boolean;
  includes_meals: boolean;
  includes_guide: boolean;
  includes_insurance: boolean;
  includes_activities: boolean;
  features?: string[];
  features_ar?: string[];
  accommodation_pricing?: AccommodationPricing[];
  images: PackageImage[];
  hotels: PackageHotel[];
  translations?: PackageTranslation[];
  confirmed_bookings_count?: number;
  confirmed_persons_count?: number;
  available_seats_count?: number;
  is_fully_booked?: boolean;
  total_bookings_count?: number;
  pending_bookings_count?: number;
  canceled_bookings_count?: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AccommodationPricing {
  key: string;
  name: string;
  type: 'عائلي' | 'عزابي';
  price: number;
}

export interface PackageHotel {
  id: number;
  name: string;
  rating?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  pivot?: {
    nights: number;
    room_type?: string;
  };
  images?: HotelImage[];
}

export interface HotelImage {
  id: number;
  image_url: string;
  is_featured: boolean;
}

export interface PackageTranslation {
  id: number;
  package_id: number;
  locale: string;
  name?: string;
  description?: string;
  destination?: string;
  meeting_location?: string;
  features?: string[];
}

export interface PackageImage {
  id: number;
  package_id: number;
  image_path: string;
  image_url: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
  title?: string | null;
  description?: string | null;
  is_featured: boolean;
  is_main: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Request/Response interfaces
export interface CreatePackageRequest {
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  duration?: number;
  price?: number;
  discount_price?: number;
  starting_date?: string;
  ending_date?: string;
  max_people?: number;
  unlimited_persons?: boolean;
  is_featured?: boolean;
  status?: 'active' | 'inactive' | 'draft';
  destination?: string;
  destination_ar?: string;
  destination_location?: string;
  meeting_location?: string;
  meeting_location_ar?: string;
  start_location?: string;
  end_location?: string;
  includes_accommodation?: boolean;
  includes_transport?: boolean;
  includes_meals?: boolean;
  includes_guide?: boolean;
  includes_insurance?: boolean;
  includes_activities?: boolean;
  features?: string[];
  features_ar?: string[];
  accommodation_pricing?: AccommodationPricing[];
  images?: File[];
  hotels?: PackageHotelRequest[];
}

export interface PackageHotelRequest {
  id: number;
  nights: number;
  room_type?: string;
}

export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  delete_images?: number[];
}

export interface PackagesResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Package[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface SinglePackageResponse {
  status: boolean;
  code: number;
  message: string;
  data: Package;
}

export interface PackageQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  type?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  locale?: string;
}

export interface PackageStatusRequest {
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'suspended' | 'archived';
  reason?: string;
}

export interface PackageFeaturedRequest {
  is_featured: boolean;
}

export const packagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get packages list
    getPackages: builder.query<PackagesResponse, PackageQueryParams>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.LIST,
        params,
      }),
      providesTags: ['Packages'],
    }),

    // Get single package
    getPackage: builder.query<SinglePackageResponse, number>({
      query: (id) => OFFICE_ENDPOINTS.PACKAGES.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Packages', id }],
    }),

    // Create package
    createPackage: builder.mutation<SinglePackageResponse, CreatePackageRequest>({
      query: (data) => {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'images' || key === 'hotels') return; // Handle separately
          
          if (key === 'features' && Array.isArray(value)) {
            value.forEach((feature, index) => {
              formData.append(`features[${index}]`, feature);
            });
          } else if (key === 'features_ar' && Array.isArray(value)) {
            value.forEach((feature, index) => {
              formData.append(`features_ar[${index}]`, feature);
            });
          } else if (key === 'accommodation_pricing' && Array.isArray(value)) {
            value.forEach((pricing, index) => {
              formData.append(`accommodation_pricing[${index}][key]`, pricing.key);
              formData.append(`accommodation_pricing[${index}][name]`, pricing.name);
              formData.append(`accommodation_pricing[${index}][type]`, pricing.type);
              formData.append(`accommodation_pricing[${index}][price]`, pricing.price.toString());
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add hotels
        if (data.hotels) {
          data.hotels.forEach((hotel, index) => {
            formData.append(`hotels[${index}][id]`, hotel.id.toString());
            formData.append(`hotels[${index}][nights]`, hotel.nights.toString());
            if (hotel.room_type) {
              formData.append(`hotels[${index}][room_type]`, hotel.room_type);
            }
          });
        }

        // Add images
        if (data.images) {
          data.images.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
          });
        }

        return {
          url: OFFICE_ENDPOINTS.PACKAGES.CREATE,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Packages'],
    }),

    // Update package
    updatePackage: builder.mutation<SinglePackageResponse, { id: number; data: UpdatePackageRequest }>({
      query: ({ id, data }) => {
        const formData = new FormData();

        // Add _method field for Laravel compatibility with file uploads
        formData.append('_method', 'PUT');

        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'images' || key === 'hotels') return; // Handle separately
          
          if (key === 'features' && Array.isArray(value)) {
            value.forEach((feature, index) => {
              formData.append(`features[${index}]`, feature);
            });
          } else if (key === 'features_ar' && Array.isArray(value)) {
            value.forEach((feature, index) => {
              formData.append(`features_ar[${index}]`, feature);
            });
          } else if (key === 'accommodation_pricing' && Array.isArray(value)) {
            value.forEach((pricing, index) => {
              formData.append(`accommodation_pricing[${index}][key]`, pricing.key);
              formData.append(`accommodation_pricing[${index}][name]`, pricing.name);
              formData.append(`accommodation_pricing[${index}][type]`, pricing.type);
              formData.append(`accommodation_pricing[${index}][price]`, pricing.price.toString());
            });
          } else if (key === 'delete_images' && Array.isArray(value)) {
            value.forEach((imageId, index) => {
              formData.append(`delete_images[${index}]`, imageId.toString());
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add hotels
        if (data.hotels) {
          data.hotels.forEach((hotel, index) => {
            formData.append(`hotels[${index}][id]`, hotel.id.toString());
            formData.append(`hotels[${index}][nights]`, hotel.nights.toString());
            if (hotel.room_type) {
              formData.append(`hotels[${index}][room_type]`, hotel.room_type);
            }
          });
        }

        // Add images
        if (data.images) {
          data.images.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
          });
        }

        return {
          url: OFFICE_ENDPOINTS.PACKAGES.UPDATE(id),
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Packages', id }, 'Packages'],
    }),

    // Delete package
    deletePackage: builder.mutation<{ status: boolean; message: string }, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Packages'],
    }),

    // Duplicate package
    duplicatePackage: builder.mutation<SinglePackageResponse, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.DUPLICATE(id),
        method: 'POST',
      }),
      invalidatesTags: ['Packages'],
    }),

    // Change package status
    changePackageStatus: builder.mutation<SinglePackageResponse, { id: number; data: PackageStatusRequest }>({
      query: ({ id, data }) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.CHANGE_STATUS(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Packages', id }, 'Packages'],
    }),

    // Reorder package images
    reorderPackageImages: builder.mutation<
      SinglePackageResponse,
      {
        id: number;
        images: { id: number; order: number }[];
        featured_image_id?: number;
        main_image_id?: number;
      }
    >({
      query: ({ id, ...data }) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.REORDER_IMAGES(id),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Packages', id }],
    }),

    // Get trashed packages
    getTrashedPackages: builder.query<PackagesResponse, PackageQueryParams>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.TRASHED,
        params,
      }),
            providesTags: ['Packages'],
    }),

    // Restore package
    restorePackage: builder.mutation<SinglePackageResponse, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.RESTORE(id),
        method: 'POST',
      }),
      invalidatesTags: ['Packages'],
    }),

    // Force delete package
    forceDeletePackage: builder.mutation<{ status: boolean; message: string }, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.PACKAGES.FORCE_DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Packages'],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useDuplicatePackageMutation,
  useChangePackageStatusMutation,
  useReorderPackageImagesMutation,
  useGetTrashedPackagesQuery,
  useRestorePackageMutation,
  useForceDeletePackageMutation,
} = packagesApiSlice;

// Legacy exports for backward compatibility
export const useSetPackageStatusMutation = useChangePackageStatusMutation;
export const useSetPackageFeaturedMutation = useChangePackageStatusMutation; 