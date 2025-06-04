import { z } from 'zod';
import { apiSlice } from './apiSlice';

// Zod schema for transportation provider
export const TransportationSchema = z.object({
  id: z.string(),
  name: z.string(),
  contact: z.string(),
  phone: z.string(),
  email: z.string().email(),
  fleetSize: z.number().int().min(0),
  available: z.boolean()
});

// Types derived from Zod schema
export type Transportation = z.infer<typeof TransportationSchema>;
export type TransportationList = Transportation[];

// RTK Query extended API slice for transportation providers
export const transportationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all transportation providers
    getTransportation: builder.query<TransportationList, void>({
      query: () => '/transportation',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transportation' as const, id })),
              { type: 'Transportation' as const, id: 'LIST' },
            ]
          : [{ type: 'Transportation' as const, id: 'LIST' }],
    }),

    // Get transportation provider by ID
    getTransportationById: builder.query<Transportation, string>({
      query: (id) => `/transportation/${id}`,
      providesTags: (_, __, id) => [{ type: 'Transportation', id }],
    }),

    // Contact transportation provider
    contactTransportation: builder.mutation<{ success: boolean }, { id: string, message: string }>({
      query: ({ id, message }) => ({
        url: `/transportation/${id}/contact`,
        method: 'POST',
        body: { message },
      }),
    }),

    // Get available transportation providers
    getAvailableTransportation: builder.query<TransportationList, void>({
      query: () => `/transportation?available=true`,
      providesTags: [{ type: 'Transportation', id: 'AVAILABLE' }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTransportationQuery,
  useGetTransportationByIdQuery,
  useContactTransportationMutation,
  useGetAvailableTransportationQuery,
} = transportationApiSlice; 