import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

export interface Booking {
  id: number;
  reference_number: string;
  package_id: number;
  user_id: number;
  office_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  booking_date: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  infants: number;
  notes: string | null;
  cancellation_reason: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  package: {
    id: number;
    name: string;
    price: number;
    discount_price: number | null;
    duration: number;
    duration_unit: string;
    cover_image: string | null;
  };
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profile_photo: string | null;
  };
  payments: Array<{
    id: number;
    booking_id: number;
    amount: number;
    payment_method: string;
    payment_status: string;
    transaction_id: string;
    payment_date: string;
    created_at: string;
    updated_at: string;
  }>;
  passengers: Array<{
    id: number;
    booking_id: number;
    name: string;
    gender: string;
    date_of_birth: string;
    id_number: string;
    passport_number: string;
    passport_expiry_date: string;
    nationality: string;
    phone: string;
    email: string;
    relationship: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface BookingsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Booking[];
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

export interface SingleBookingResponse {
  status: boolean;
  code: number;
  message: string;
  data: Booking;
}

export interface BookingStatusUpdateRequest {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  notes?: string;
}

export interface BookingsQueryParams {
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface BookingsStatisticsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    rejected: number;
    total_revenue: number;
    paid_amount: number;
    due_amount: number;
  };
}

export interface BookingsCalendarResponse {
  status: boolean;
  code: number;
  message: string;
  data: Array<{
    date: string;
    bookings: Booking[];
  }>;
}

export const bookingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Regular bookings
    getBookings: builder.query<BookingsResponse, void>({
      query: () => OFFICE_ENDPOINTS.BOOKINGS.LIST,
      providesTags: ['Bookings']
    }),
    getBooking: builder.query<SingleBookingResponse, number>({
      query: (id) => OFFICE_ENDPOINTS.BOOKINGS.DETAIL(id),
      providesTags: (_, __, id) => [{ type: 'Bookings', id }]
    }),
    // Add missing endpoint for getBookingById
    getBookingById: builder.query<Booking, string>({
      query: (id) => OFFICE_ENDPOINTS.BOOKINGS.DETAIL(Number(id)),
      transformResponse: (response: SingleBookingResponse) => response.data,
      providesTags: (_, __, id) => [{ type: 'Bookings', id }],
      // Add this configuration to handle errors more gracefully
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error(`Error fetching booking ${id}:`, error);
          // We'll let the UI component handle the error and use mock data if needed
        }
      }
    }),
    updateBookingStatus: builder.mutation<SingleBookingResponse, { id: number, data: BookingStatusUpdateRequest }>({
      query: ({ id, data }) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Bookings', id }, 'Bookings']
    }),
    // Add missing endpoints for confirm and cancel booking
    confirmBooking: builder.mutation<SingleBookingResponse, string>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.UPDATE_STATUS(Number(id)),
        method: 'PUT',
        body: { status: 'confirmed' },
      }),
      invalidatesTags: (_, __, id) => [{ type: 'Bookings', id }, 'Bookings']
    }),
    cancelBooking: builder.mutation<SingleBookingResponse, { id: string, reason?: string }>({
      query: ({ id, reason }) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.UPDATE_STATUS(Number(id)),
        method: 'PUT',
        body: { 
          status: 'cancelled',
          notes: reason
        },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Bookings', id }, 'Bookings']
    }),
    getBookingInvoice: builder.query<any, number>({
      query: (id) => OFFICE_ENDPOINTS.BOOKINGS.INVOICE(id),
      providesTags: (_, __, id) => [{ type: 'Bookings', id }]
    }),
    downloadBookingInvoice: builder.mutation<any, number>({
      query: (id) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.DOWNLOAD_INVOICE(id),
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Package bookings
    getPackageBookings: builder.query<BookingsResponse, BookingsQueryParams | undefined>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS,
        params: params ?? undefined,
      }),
      providesTags: ['Bookings']
    }),
    getPackageBookingById: builder.query<Booking, string>({
      query: (id) => OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS_DETAIL(Number(id)),
      transformResponse: (response: SingleBookingResponse) => response.data,
      providesTags: (_, __, id) => [{ type: 'Bookings', id }],
      // Add error handling
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error(`Error fetching package booking ${id}:`, error);
          // Let the component handle fallback to mock data
        }
      }
    }),
    getPackageBookingsStatistics: builder.query<BookingsStatisticsResponse, BookingsQueryParams | undefined>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS_STATISTICS,
        params: params ?? undefined,
      }),
      providesTags: ['Bookings']
    }),       

    updatePackageBookingStatus: builder.mutation<SingleBookingResponse, { id: number, data: BookingStatusUpdateRequest }>({
      query: ({ id, data }) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKING_STATUS_UPDATE(id),
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Bookings', id }, 'Bookings']
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  // Export the missing hooks
  useGetBookingByIdQuery,
  useConfirmBookingMutation,
  useCancelBookingMutation,
  useUpdateBookingStatusMutation,
  useGetBookingInvoiceQuery,
  useDownloadBookingInvoiceMutation,
  useGetPackageBookingsQuery,
  useGetPackageBookingsStatisticsQuery,
  useUpdatePackageBookingStatusMutation,
  useGetPackageBookingByIdQuery,
} = bookingsApiSlice; 