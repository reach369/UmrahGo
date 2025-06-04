import { z } from 'zod';
import { apiSlice } from './apiSlice';
import { mockCampaigns } from '../../utils/dashboardMockData';

// Update Zod schema for campaign
export const CampaignSchema = z.object({
  id: z.number(), // Changed from string to number (BIGINT)
  office_id: z.number(), // Added (BIGINT FK)
  package_id: z.number(), // Added (BIGINT FK)
  start_date: z.string(), // Changed from startDate
  end_date: z.string(), // Changed from endDate
  available_seats: z.number(), // Added
  description: z.string(),
  status: z.enum(['active', 'completed']), // Updated enum values
});

// Types derived from Zod schema
export type Campaign = z.infer<typeof CampaignSchema>;
export type CampaignList = Campaign[];

// RTK Query extended API slice for campaigns
export const campaignsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all campaigns (with optional filter params)
    getCampaigns: builder.query<CampaignList, { status?: string; officeId?: string }>({
      query: (params = {}) => ({
        url: `/api/v1/umrah-campaigns`,
        method: 'GET',
        params: {
          status: params.status !== 'all' ? params.status : undefined,
          officeId: params.officeId
        }
      }),
      transformResponse: (response: any, meta, arg) => {
        const mockData = mockCampaigns;
        
        // Map the mock data to match the expected Campaign structure
        const transformedData = mockData.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          price: 5000, // Example default price if not available
          capacity: campaign.available_seats + 20, // Example: calculate capacity 
          registeredCount: 20, // Default value
          status: campaign.status as 'active' | 'completed' | 'cancelled' | 'upcoming',
          transportationIncluded: false, // Default value
          accommodationDetails: '', // Default value
        }));
        
        return arg.status && arg.status !== 'all'
          ? transformedData.filter(campaign => campaign.status === arg.status)
          : transformedData;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Campaigns' as const, id })),
              { type: 'Campaigns' as const, id: 'LIST' },
            ]
          : [{ type: 'Campaigns' as const, id: 'LIST' }],
    }),

    // Get campaign by ID
    getCampaignById: builder.query<Campaign, string>({
      query: (id) => `/umrah-campaigns/${id}`,
      transformResponse: (response: any, meta, arg) => {
        // Find the campaign in mock data
        const campaign = mockCampaigns.find(c => c.id === arg);
        
        if (!campaign) {
          throw new Error('Campaign not found');
        }
        
        // Transform to expected structure
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          price: 5000, // Example default price
          capacity: campaign.available_seats + 20,
          registeredCount: 20, // Example value
          status: campaign.status as 'active' | 'completed' | 'cancelled' | 'upcoming',
          transportationIncluded: false,
          accommodationDetails: '',
        };
      },
      providesTags: (_, __, id) => [{ type: 'Campaigns', id }],
    }),

    // Create new campaign
    createCampaign: builder.mutation<Campaign, Omit<Campaign, 'id'> & { officeId: string }>({
      query: ({ officeId, ...campaign }) => ({
        url: `/umrah-campaigns`,
        method: 'POST',
        body: { ...campaign, officeId },
      }),
      invalidatesTags: [{ type: 'Campaigns', id: 'LIST' }],
    }),

    // Update campaign
    updateCampaign: builder.mutation<Campaign, Partial<Campaign> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `/umrah-campaigns/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Campaigns', id }],
    }),

    // Delete campaign
    deleteCampaign: builder.mutation<void, string>({
      query: (id) => ({
        url: `/umrah-campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Campaigns', id },
        { type: 'Campaigns', id: 'LIST' }
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = campaignsApiSlice; 