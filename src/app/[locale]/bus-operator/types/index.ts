// Bus Operator Types
export interface BusOperator {
  id: number;
  user_id: number;
  name: string;
  company_name?: string;
  email: string;
  phone: string;
  registration_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  commercial_register?: string;
  license_number?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  services?: string;
  working_hours?: string;
  profile_photo?: string;
  company_logo?: string;
  created_at: string;
  updated_at: string;
}

// Bus Types
export interface Bus {
  id: number;
  operator_id: number;
  name: string;
  type: 'luxury' | 'standard' | 'economy' | 'vip';
  capacity: number;
  plate_number: string;
  description?: string;
  price_per_km: number;
  features?: string[];
  images?: string[];
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

// Booking Types
export interface BusBooking {
  id: number;
  bus_id: number;
  user_id: number;
  travel_start: string;
  travel_end: string;
  number_of_persons: number;
  total_price: number;
  original_price: number;
  payment_method_id: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partially_paid' | 'paid' | 'refunded';
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  bus?: Bus;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  passengers?: Passenger[];
}

export interface Passenger {
  id?: number;
  booking_id?: number;
  name: string;
  passport_number: string;
  nationality: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
}

// Statistics Types
export interface BusBookingStatistics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  this_month_revenue: number;
  this_week_revenue: number;
  today_revenue: number;
  active_buses: number;
  total_buses: number;
}

// Calendar Types
export interface CalendarBooking {
  id: number;
  date: string;
  bookings: BusBooking[];
}

// Filter Types
export interface BookingFilters {
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

// Form Types
export interface CreateBookingForm {
  bus_id: number;
  user_id: number;
  travel_start: string;
  travel_end: string;
  number_of_persons: number;
  total_price: number;
  original_price: number;
  payment_method_id: number;
  notes?: string;
  passengers: Passenger[];
}

export interface UpdateBookingStatusForm {
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface CancelBookingForm {
  cancellation_reason: string;
}

export interface CreateBusForm {
  name: string;
  type: 'luxury' | 'standard' | 'economy' | 'vip';
  capacity: number;
  plate_number: string;
  description?: string;
  price_per_km: number;
  features?: string[];
  images?: File[];
  status: 'active' | 'inactive' | 'maintenance';
}

export interface UpdateBusOperatorProfile {
  name: string;
  phone: string;
  company_name?: string;
  commercial_register?: string;
  license_number?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  services?: string;
  working_hours?: string;
  profile_photo?: File;
  company_logo?: File;
}

// API Response Types
export interface ApiResponse<T> {
  status: boolean;
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Chat Types
export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_type: 'operator' | 'office' | 'customer';
  message: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface Conversation {
  id: number;
  participant_one_id: number;
  participant_one_type: string;
  participant_two_id: number;
  participant_two_type: string;
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
  participant?: {
    id: number;
    name: string;
    avatar?: string;
    is_online: boolean;
    last_seen?: string;
  };
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
} 