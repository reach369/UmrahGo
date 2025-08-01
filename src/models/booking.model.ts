import { User } from './user.model';
import { Package } from './package.model';

export interface Passenger {
  id: number;
  booking_id: number;
  name: string;
  age: number;
  relation_to_user: string | null;
  passport_number: string;
  nationality?: string;
  gender?: 'male' | 'female';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: string;
  payment_method: string;
  transaction_id: string;
  payment_method_id?: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  original_price: string;
  discount_amount: string;
  tax_amount: string;
  tax_rate: ReactNode;
  paid_amount: string;
  remaining_amount: string;
  payment_method: any;
  id: number;
  user_id: number;
  booking_type: 'package' | 'transport' | 'custom';
  package_id: number;
  bus_id: number | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  booking_date: string;
  travel_start: string;
  travel_end: string;
  number_of_persons: number;
  total_price: string;
  special_requests?: string;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  package?: Package;
  bus?: any | null;
  payments?: Payment[];
  passengers: Passenger[];
  user?: User;
  rating?: {
    id: number;
    rating: number;
    comment: string | null;
    created_at: string;
  } | null;
}

export interface BookingFilter {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}

export interface BookingInvoice {
  booking_id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  payment_status: string;
  booking_details: Booking;
  line_items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: string;
  total: string;
}

export interface BookingStatistics {
  total_bookings: number;
  active_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: string;
  average_spent: string;
}

export interface CreateBookingRequest {
  package_id: number;
  booking_date: string;
  number_of_persons: number;
  booking_type: string;
  payment_method_id: number;
  transaction_id?: string;
  coupon_code?: string;
  passengers: {
    name: string;
    passport_number: string;
    nationality: string;
    gender: string;
    age: number;
    phone: string;
  }[];
  special_requests?: string;
}

export interface UpdateBookingRequest {
  booking_date?: string;
  number_of_persons?: number;
  special_requests?: string;
  passengers?: {
    id?: number;
    name: string;
    passport_number: string;
    nationality: string;
    gender: string;
    age: number;
    phone: string;
  }[];
}

export interface RateBookingRequest {
  rating: number;
  comment?: string;
}

export interface CancelBookingRequest {
  reason: string;
} 