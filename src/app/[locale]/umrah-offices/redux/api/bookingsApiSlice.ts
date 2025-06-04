import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// Types
export interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'refunded';
  user: {
    name: string;
    contact: string;
    email: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
  };
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface BookingStatistics {
  total_bookings: number;
  total_revenue: number;
  status_counts: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  payment_status_counts: {
    paid: number;
    pending: number;
    refunded: number;
  };
  popular_packages: Array<{
    package_id: string;
    package_name: string;
    booking_count: number;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  color: string;
}

export interface BookingFilters {
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

// API Slice
export const bookingsApiSlice = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://umrahgo.reach369.com/api/v1/office',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // Get all bookings with filters
    getBookings: builder.query<{ data: Booking[]; total: number }, BookingFilters>({
      query: (filters) => ({
        url: 'bookings',
        method: 'GET',
        params: filters,
      }),
      providesTags: ['Booking'],
    }),

    // Get booking by ID
    getBookingById: builder.query<Booking, string>({
      query: (id) => `bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // Update booking status
    updateBookingStatus: builder.mutation<
      Booking,
      { id: string; status: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `bookings/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),

    // Get booking statistics
    getBookingStatistics: builder.query<BookingStatistics, void>({
      query: () => 'bookings/statistics',
      providesTags: ['Booking'],
    }),

    // Get calendar events
    getCalendarEvents: builder.query<
      CalendarEvent[],
      { start_date: string; end_date: string }
    >({
      query: (params) => ({
        url: 'bookings/calendar',
        method: 'GET',
        params,
      }),
      providesTags: ['Booking'],
    }),

    // Export bookings
    exportBookings: builder.query<
      Blob,
      {
        format: 'excel' | 'csv';
        from_date?: string;
        to_date?: string;
        status?: string;
      }
    >({
      query: (params) => ({
        url: 'bookings/export',
        method: 'GET',
        params,
        responseHandler: async (response) => response.blob(),
      }),
    }),

    // Confirm booking
    confirmBooking: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}/confirm`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // Cancel booking
    cancelBooking: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // Approve booking
    approveBooking: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `bookings/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // Reject booking
    rejectBooking: builder.mutation<Booking, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `bookings/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),
  }),
});

// Export hooks
export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useGetBookingStatisticsQuery,
  useGetCalendarEventsQuery,
  useExportBookingsQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useApproveBookingMutation,
  useRejectBookingMutation,
} = bookingsApiSlice; 