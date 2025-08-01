import { apiSlice } from './apiSlice';

export interface Campaign {
  id: number;
  office_id: number;
  name: string;
  description: string | null;
  type: 'email' | 'sms' | 'push' | 'social';
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  target_audience: string | null;
  content: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CampaignsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Campaign[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
      from: number;
      to: number;
    }
  };
}

export interface SingleCampaignResponse {
  status: boolean;
  code: number;
  message: string;
  data: Campaign;
}

export const campaignsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<CampaignsResponse, void>({
      query: () => '/api/v1/office/campaigns',
      providesTags: ['Campaigns']
    }),
    getCampaign: builder.query<SingleCampaignResponse, number>({
      query: (id) => `/api/v1/office/campaigns/${id}`,
      providesTags: (_, __, id) => [{ type: 'Campaigns', id }]
    }),
    // Add missing endpoint for getCampaignById
    getCampaignById: builder.query<Campaign, string>({
      query: (id) => `/api/v1/office/campaigns/${id}`,
      transformResponse: (response: SingleCampaignResponse) => response.data,
      providesTags: (_, __, id) => [{ type: 'Campaigns', id }]
    }),
    createCampaign: builder.mutation<SingleCampaignResponse, FormData>({
      query: (formData) => ({
        url: '/api/v1/office/campaigns',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Campaigns']
    }),
    updateCampaign: builder.mutation<SingleCampaignResponse, { id: number, formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/api/v1/office/campaigns/${id}`,
        method: 'POST', // Using POST with _method=PUT for Laravel
        body: formData,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Campaigns', id }, 'Campaigns']
    }),
    deleteCampaign: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/office/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaigns']
    }),
    scheduleCampaign: builder.mutation<SingleCampaignResponse, { id: number, scheduled_at: string }>({
      query: ({ id, scheduled_at }) => ({
        url: `/api/v1/office/campaigns/${id}/schedule`,
        method: 'PUT',
        body: { scheduled_at },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Campaigns', id }, 'Campaigns']
    }),
    cancelCampaign: builder.mutation<SingleCampaignResponse, number>({
      query: (id) => ({
        url: `/api/v1/office/campaigns/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Campaigns', id }, 'Campaigns']
    }),
    sendCampaign: builder.mutation<SingleCampaignResponse, number>({
      query: (id) => ({
        url: `/api/v1/office/campaigns/${id}/send`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Campaigns', id }, 'Campaigns']
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  // Add missing hook export
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useScheduleCampaignMutation,
  useCancelCampaignMutation,
  useSendCampaignMutation,
} = campaignsApiSlice; 