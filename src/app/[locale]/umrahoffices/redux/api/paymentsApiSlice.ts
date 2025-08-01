import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

export interface Payment {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  transaction_id?: string;
  gateway_response?: any;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  booking?: {
    id: number;
    booking_number: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
    package?: {
      id: number;
      name: string;
    };
  };
}

export interface PaymentsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    data: Payment[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface SinglePaymentResponse {
  status: boolean;
  code: number;
  message: string;
  data: Payment;
}

export interface PaymentQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_method?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export const paymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get payments list
    getPayments: builder.query<PaymentsResponse, PaymentQueryParams>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.PAYMENTS.LIST,
        params,
      }),
      providesTags: ['Payments'],
    }),

    // Get single payment
    getPayment: builder.query<SinglePaymentResponse, number>({
      query: (id) => OFFICE_ENDPOINTS.PAYMENTS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Payments', id }],
    }),

    // Refund payment
    refundPayment: builder.mutation<SinglePaymentResponse, { id: number; amount?: number; reason?: string }>({
      query: ({ id, ...data }) => ({
        url: OFFICE_ENDPOINTS.PAYMENTS.REFUND(id),
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Payments', id }, 'Payments'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useRefundPaymentMutation,
} = paymentsApiSlice; 