import { apiSlice } from './apiSlice';

export interface Document {
  id: number;
  office_id: number;
  user_id: number;
  uploaded_by: number;
  name: string;
  path: string;
  file_path: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  type: 'license' | 'certificate' | 'identification' | 'other';
  document_type: string;
  description: string | null;
  expiry_date: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  approved_by: number | null;
  approved_at: string | null;
  is_archived: boolean;
  category: string | null;
  title: string | null;
  documentable_type: string | null;
  documentable_id: number | null;
  comment: string | null;
  operator_id: number | null;
  deleted_at: string | null;
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
  file: File;
  name: string;
  type: 'license' | 'certificate' | 'identification' | 'other';
  description?: string;
  expiry_date: string;
}

export const documentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentsResponse, void>({
      query: () => '/api/v1/office/documents',
      providesTags: ['Documents']
    }),
    getDocument: builder.query<SingleDocumentResponse, number>({
      query: (id) => ({
        url: `/api/v1/office/documents/${id}`,
        method: 'GET',
      }),
    }),
    uploadDocument: builder.mutation<SingleDocumentResponse, FormData>({
      query: (formData) => ({
        url: '/api/v1/office/documents',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Documents']
    }),
    updateDocument: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/v1/office/documents/${id}`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Documents']
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/api/v1/office/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Documents']
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApiSlice; 