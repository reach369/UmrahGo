import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

export interface GalleryImage {
  id: number;
  office_id?: number;
  image_path?: string;
  image?: string | null;
  thumbnail_path?: string | null;
  title?: string | null;
  description?: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImageDetail {
  id: number;
  image: string | null;
  image_path?: string;
  is_featured: boolean;
  description: string | null;
  title?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
}

export interface GalleryResponse extends ApiResponse<GalleryImage[]> {}
export interface SingleGalleryImageResponse extends ApiResponse<GalleryImageDetail> {}
export interface UploadImageResponse extends ApiResponse<GalleryImage> {}
export interface SetFeaturedResponse extends ApiResponse<GalleryImage> {}

export interface UpdateGalleryImageRequest {
  id: number;
  formData: FormData;
}

export interface ReorderImagesRequest {
  images: { id: number; display_order: number }[];
}

export const galleryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all gallery images
    getGallery: builder.query<GalleryResponse, void>({
      query: () => ({
        url: OFFICE_ENDPOINTS.GALLERY.LIST,
        method: 'GET',
      }),
      providesTags: ['Gallery'],
      // Add error handling
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Gallery fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع معرض الصور',
          code: response.status
        };
      }
    }),

    // Get a single gallery image
    getGalleryImage: builder.query<SingleGalleryImageResponse, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.GALLERY.UPDATE(id),
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Gallery', id }],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Gallery image fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع الصورة',
          code: response.status
        };
      }
    }),

    // Upload a new image
    uploadImage: builder.mutation<UploadImageResponse, FormData>({
      query: (formData) => ({
        url: OFFICE_ENDPOINTS.GALLERY.UPLOAD,
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Gallery'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Image upload error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في تحميل الصورة',
          code: response.status
        };
      }
    }),

    // Update an existing image
    updateImage: builder.mutation<UploadImageResponse, UpdateGalleryImageRequest>({
      query: ({ id, formData }) => ({
        url: OFFICE_ENDPOINTS.GALLERY.UPDATE(id),
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Gallery'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Image update error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في تحديث الصورة',
          code: response.status
        };
      }
    }),

    // Delete an image
    deleteImage: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.GALLERY.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Gallery'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Image deletion error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في حذف الصورة',
          code: response.status
        };
      }
    }),

    // Set an image as featured
    setFeatured: builder.mutation<SetFeaturedResponse, number>({
      query: (id) => ({
        url: `${OFFICE_ENDPOINTS.GALLERY.UPDATE(id)}/featured`,
        method: 'PUT',
      }),
      invalidatesTags: ['Gallery'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Set featured image error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في تعيين الصورة كصورة مميزة',
          code: response.status
        };
      }
    }),

    // Reorder images
    reorderImages: builder.mutation<ApiResponse<null>, ReorderImagesRequest>({
      query: (data) => ({
        url: `${OFFICE_ENDPOINTS.GALLERY.LIST}/reorder`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Gallery'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Reorder images error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في إعادة ترتيب الصور',
          code: response.status
        };
      }
    }),
  }),
});

export const {
  useGetGalleryQuery,
  useGetGalleryImageQuery,
  useUploadImageMutation,
  useUpdateImageMutation,
  useDeleteImageMutation,
  useSetFeaturedMutation,
  useReorderImagesMutation,
} = galleryApiSlice; 