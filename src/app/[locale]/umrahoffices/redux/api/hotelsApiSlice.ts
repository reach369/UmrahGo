import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

// Types
export interface Hotel {
  id: number;
  office_id: number;
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  amenities?: string[];
  is_active: boolean;
  images?: HotelImage[];
  packages?: Package[];
  created_at: string;
  updated_at: string;
}

export interface HotelImage {
  id: number;
  hotel_id: number;
  image_url: string;
  image_path: string;
  thumbnail_url?: string;
  display_order: number;
  is_featured: boolean;
  alt_text?: string;
}

export interface Package {
  id: number;
  name: string;
  price: number;
  pivot?: {
    nights?: number;
    room_type?: string;
  };
}

export interface CreateHotelRequest {
  name: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  amenities?: string[];
  is_active?: boolean;
  images?: File[];
  package_ids?: number[];
  nights?: number;
  room_type?: string;
}

export interface UpdateHotelRequest extends Partial<CreateHotelRequest> {
  delete_images?: number[];
}

export interface HotelsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Hotel[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface HotelResponse {
  status: boolean;
  code: number;
  message: string;
  data: Hotel;
}

export interface HotelsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  rating?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const hotelsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get hotels list
    getHotels: builder.query<HotelsResponse, HotelsQueryParams>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.HOTELS.LIST,
        params,
      }),
        providesTags: ['Offices'],
    }),

    // Get single hotel
    getHotel: builder.query<HotelResponse, number>({
      query: (id) => OFFICE_ENDPOINTS.HOTELS.DETAIL(id),
      providesTags: ['Offices'],
    }),

    // Create hotel
    createHotel: builder.mutation<HotelResponse, CreateHotelRequest>({
      query: (data) => {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'images') return; // Handle images separately
          if (key === 'amenities' && Array.isArray(value)) {
            value.forEach((amenity, index) => {
              formData.append(`amenities[${index}]`, amenity);
            });
          } else if (key === 'package_ids' && Array.isArray(value)) {
            value.forEach((id, index) => {
              formData.append(`package_ids[${index}]`, id.toString());
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add images
        if (data.images) {
          data.images.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
          });
        }

        return {
          url: OFFICE_ENDPOINTS.HOTELS.CREATE,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Offices'],
    }),

    // Update hotel
    updateHotel: builder.mutation<HotelResponse, { id: number; data: UpdateHotelRequest }>({
      query: ({ id, data }) => {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'images') return; // Handle images separately
          if (key === 'delete_images' && Array.isArray(value)) {
            value.forEach((imageId, index) => {
              formData.append(`delete_images[${index}]`, imageId.toString());
            });
          } else if (key === 'amenities' && Array.isArray(value)) {
            value.forEach((amenity, index) => {
              formData.append(`amenities[${index}]`, amenity);
            });
          } else if (key === 'package_ids' && Array.isArray(value)) {
            value.forEach((packageId, index) => {
              formData.append(`package_ids[${index}]`, packageId.toString());
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add images
        if (data.images) {
          data.images.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
          });
        }

        return {
          url: OFFICE_ENDPOINTS.HOTELS.UPDATE(id),
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Offices', id },
        'Offices',
      ],
    }),

    // Delete hotel
    deleteHotel: builder.mutation<{ status: boolean; message: string }, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.HOTELS.DELETE(id),
        method: 'DELETE',
      }),
        invalidatesTags: ['Offices'],
    }),

    // Duplicate hotel
    duplicateHotel: builder.mutation<HotelResponse, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.HOTELS.DUPLICATE(id),
        method: 'POST',
      }),
      invalidatesTags: ['Offices'],
    }),

    // Get hotels for a package
    getPackageHotels: builder.query<{ status: boolean; data: Hotel[] }, number>({
      query: (packageId) => OFFICE_ENDPOINTS.HOTELS.PACKAGE_HOTELS(packageId),
      providesTags: ['Offices'],
    }),

    // Attach hotel to package
    attachHotelToPackage: builder.mutation<
      { status: boolean; message: string },
      { hotelId: number; packageId: number; nights?: number; room_type?: string }
    >({
      query: ({ hotelId, packageId, ...data }) => ({
        url: OFFICE_ENDPOINTS.HOTELS.ATTACH_TO_PACKAGE(hotelId, packageId),
        method: 'POST',
        body: data,
      }),
        invalidatesTags: ['Offices', 'Packages'],
    }),

    // Detach hotel from package
    detachHotelFromPackage: builder.mutation<
      { status: boolean; message: string },
      { hotelId: number; packageId: number }
    >({
      query: ({ hotelId, packageId }) => ({
        url: OFFICE_ENDPOINTS.HOTELS.DETACH_FROM_PACKAGE(hotelId, packageId),
        method: 'DELETE',
      }),
      invalidatesTags: ['Offices', 'Packages'],
    }),

    // Update hotel-package relationship
    updateHotelPackageRelation: builder.mutation<
      { status: boolean; message: string },
      { hotelId: number; packageId: number; nights?: number; room_type?: string }
    >({
      query: ({ hotelId, packageId, ...data }) => ({
        url: OFFICE_ENDPOINTS.HOTELS.UPDATE_PACKAGE_RELATION(hotelId, packageId),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Offices', 'Packages'],
    }),

    // Get available hotels
    getAvailableHotels: builder.query<
      { status: boolean; data: Hotel[] },
      { search?: string; rating?: number; city?: string }
    >({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.HOTELS.AVAILABLE_HOTELS,
        params,
      }),
      providesTags: ['Offices'],
    }),

    // Get office hotels
    getOfficeHotels: builder.query<
      { status: boolean; data: Hotel[] },
      { search?: string }
    >({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.HOTELS.OFFICE_HOTELS,
        params,
      }),
            providesTags: ['Offices'],
    }),

    // Reorder hotel images
    reorderHotelImages: builder.mutation<
      HotelResponse,
      {
        id: number;
        images: { id: number; order: number }[];
        featured_image_id?: number;
      }
    >({
      query: ({ id, ...data }) => ({
        url: OFFICE_ENDPOINTS.HOTELS.REORDER_IMAGES(id),
        method: 'POST',
        body: data,
      }),
        invalidatesTags: ['Offices'],
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetHotelQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useDuplicateHotelMutation,
  useGetPackageHotelsQuery,
  useAttachHotelToPackageMutation,
  useDetachHotelFromPackageMutation,
  useUpdateHotelPackageRelationMutation,
  useGetAvailableHotelsQuery,
  useGetOfficeHotelsQuery,
  useReorderHotelImagesMutation,
} = hotelsApiSlice; 