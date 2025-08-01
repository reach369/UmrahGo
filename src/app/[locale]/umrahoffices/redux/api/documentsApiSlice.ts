import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

export interface Document {
  id: number;
  office_id: number;
  name: string;
  type: string;
  file_path: string;
  description: string | null;
  expiry_date: string | null;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentsResponse {
  status: boolean;
  code: number;
  message: string;
  data: Document[];
}

export interface SingleDocumentResponse {
  status: boolean;
  code: number;
  message: string;
  data: Document;
}

export interface UploadDocumentRequest {
  name: string;
  type: string;
  description?: string;
  expiry_date?: string;
  file: File;
}

export interface UploadDocumentResponse {
  status: boolean;
  code: number;
  message: string;
  data: Document;
}

export interface UpdateDocumentRequest {
  id: number;
  name?: string;
  description?: string;
  expiry_date?: string;
}

export const documentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentsResponse, void>({
      query: () => OFFICE_ENDPOINTS.DOCUMENTS.LIST,
      providesTags: ['Documents']
    }),
    getDocument: builder.query<SingleDocumentResponse, number>({
      query: (id) => OFFICE_ENDPOINTS.DOCUMENTS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Documents', id }]
    }),
    uploadDocument: builder.mutation<UploadDocumentResponse, FormData>({
      query: (formData) => ({
        url: OFFICE_ENDPOINTS.DOCUMENTS.UPLOAD,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Documents']
    }),
    updateDocument: builder.mutation<SingleDocumentResponse, { id: number, formData: FormData }>({
      query: ({ id, formData }) => ({
        url: OFFICE_ENDPOINTS.DOCUMENTS.UPDATE(id),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Documents', id }, 'Documents']
    }),
    deleteDocument: builder.mutation<void, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.DOCUMENTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Documents']
    }),
    getDocumentTypes: builder.query<{ data: string[] }, void>({
      query: () => `${OFFICE_ENDPOINTS.DOCUMENTS.LIST}/types`,
      providesTags: ['Documents']
    })
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentTypesQuery
} = documentsApiSlice; 