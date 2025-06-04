import { z } from 'zod';
import { apiSlice } from './apiSlice';

// Zod schema for a payment
export const PaymentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['completed', 'pending', 'failed', 'refunded']),
  method: z.enum(['credit_card', 'bank_transfer', 'cash', 'paypal']),
  date: z.string(),
  referenceNumber: z.string(),
  systemFee: z.number(),
  netAmount: z.number(),
});

// Types derived from Zod schema
export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentList = Payment[];

// RTK Query extended API slice for payments
export const paymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all payments (with optional filter params)
    getPayments: builder.query<PaymentList, { status?: string; bookingId?: string; officeId?: string }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);
        if (params.bookingId) queryParams.append('bookingId', params.bookingId);
        if (params.officeId) queryParams.append('officeId', params.officeId);
        const queryString = queryParams.toString();
        return {
          url: `/umrah-payments${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Payments' as const, id })),
              { type: 'Payments' as const, id: 'LIST' },
            ]
          : [{ type: 'Payments' as const, id: 'LIST' }],
    }),

    // Get payment by ID
    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/umrah-payments/${id}`,
      providesTags: (_, __, id) => [{ type: 'Payments', id }],
    }),

    // Create new payment
    createPayment: builder.mutation<Payment, Omit<Payment, 'id' | 'date' | 'status' | 'systemFee' | 'netAmount'>>({
      query: (payment) => ({
        url: `/umrah-payments`,
        method: 'POST',
        body: payment,
      }),
      invalidatesTags: (_, __, { bookingId }) => [
        { type: 'Payments', id: 'LIST' },
        { type: 'Bookings', id: bookingId }
      ],
    }),

    // Update payment status
    updatePaymentStatus: builder.mutation<Payment, { id: string; status: 'completed' | 'pending' | 'failed' | 'refunded' }>({
      query: ({ id, status }) => ({
        url: `/umrah-payments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Payments', id }],
    }),

    // Process refund
    processRefund: builder.mutation<Payment, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/umrah-payments/${id}/refund`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Payments', id },
        { type: 'Payments', id: 'LIST' }
      ],
    }),

    // Get payment summary by office
    getPaymentSummary: builder.query<{
      totalRevenue: number;
      totalSystemFees: number;
      totalNetAmount: number;
      pendingAmount: number;
    }, string | void>({
      query: (officeId) => ({
        url: `/api/v1/umrah-payments/summary`,
        method: 'GET',
        params: officeId ? { officeId } : undefined
      }),
      providesTags: ['Payments'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentStatusMutation,
  useProcessRefundMutation,
  useGetPaymentSummaryQuery,
} = paymentsApiSlice; 