import { apiSlice } from './apiSlice';

export interface GalleryImage {
  id: number;
  office_id: number;
  image_path: string;
  thumbnail_path: string;
  title: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImageDetail {
  id: number;
  image: string | null;
  is_featured: boolean;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryResponse {
  status: boolean;
  code: number;
  message: string;
  data: GalleryImage[];
}

export interface SingleGalleryImageResponse {
  status: boolean;
  code: number;
  message: string;
  data: GalleryImageDetail;
}

export interface UploadImageRequest {
  name: string;
  type: string;
  description: string;
  expiry_date: string;
  file: File;
}

export interface UploadImageResponse {
  status: boolean;
  code: number;
  message: string;
  data: GalleryImage;
}

export interface UpdateGalleryImageRequest {
  is_featured: boolean;
}

export interface SetFeaturedResponse {
  status: boolean;
  code: number;
  message: string;
  data: GalleryImage;
}

export const galleryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query({
      query: () => '/api/v1/office/gallery',
      providesTags: ['Gallery']
    }),
    getGalleryImage: builder.query<SingleGalleryImageResponse, number>({
      query: (id) => ({
        url: `/api/v1/office/gallery/${id}`,
        method: 'GET',
      }),
    }),
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/api/v1/office/gallery',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Gallery']
    }),
    updateImage: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/office/gallery/${id}`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Gallery']
    }),
    deleteImage: builder.mutation({
      query: (id) => ({
        url: `/api/v1/office/gallery/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Gallery']
    }),
    setFeatured: builder.mutation({
      query: (id) => ({
        url: `/api/v1/office/gallery/${id}/featured`,
        method: 'PUT',
      }),
      invalidatesTags: ['Gallery']
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
} = galleryApiSlice; 