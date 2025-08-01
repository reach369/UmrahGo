import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Bus, BusCompany } from '../types/bus.types';

export const busApi = createApi({
  reducerPath: 'busApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/bus' }),
  tagTypes: ['Bus', 'Company'],
  endpoints: (builder) => ({
    // Company endpoints
    registerCompany: builder.mutation<BusCompany, Partial<BusCompany>>({
      query: (data) => ({
        url: '/company/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Company'],
    }),

    getCompanyProfile: builder.query<BusCompany, string>({
      query: (id) => `/company/${id}`,
      providesTags: ['Company'],
    }),

    updateCompanyProfile: builder.mutation<BusCompany, Partial<BusCompany>>({
      query: (data) => ({
        url: `/company/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Company'],
    }),

    // Bus endpoints
    addBus: builder.mutation<Bus, Partial<Bus>>({
      query: (data) => ({
        url: '/buses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bus'],
    }),

    getBuses: builder.query<Bus[], void>({
      query: () => '/buses',
      providesTags: ['Bus'],
    }),

    updateBus: builder.mutation<Bus, Partial<Bus>>({
      query: (data) => ({
        url: `/buses/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Bus'],
    }),

    deleteBus: builder.mutation<void, string>({
      query: (id) => ({
        url: `/buses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bus'],
    }),

    // Booking endpoints
    getBookings: builder.query<any[], void>({
      query: () => '/bookings',
    }),

    // Premium package endpoints
    getPremiumPackages: builder.query<any[], void>({
      query: () => '/premium-packages',
    }),

    subscribeToPremium: builder.mutation<any, string>({
      query: (packageId) => ({
        url: '/premium-packages/subscribe',
        method: 'POST',
        body: { packageId },
      }),
    }),
  }),
});

export const {
  useRegisterCompanyMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useAddBusMutation,
  useGetBusesQuery,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useGetBookingsQuery,
  useGetPremiumPackagesQuery,
  useSubscribeToPremiumMutation,
} = busApi; 