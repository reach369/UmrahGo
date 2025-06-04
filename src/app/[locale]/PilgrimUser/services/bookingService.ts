import axios from 'axios';
import { API_CONFIG } from '@/lib/constants';

// Flag to control if we use mock data (for development when API is down)
const USE_MOCK_DATA = true;

// API response interfaces
export interface BookingApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: Booking[];
}

export interface SingleBookingApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: Booking;
}

export interface BookingInvoiceApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: BookingInvoice;
}

// Data interfaces
export interface Booking {
  id: number;
  user_id: number;
  booking_type: string;
  package_id: number;
  bus_id: number | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  booking_date: string;
  travel_start: string;
  travel_end: string;
  number_of_persons: number;
  total_price: string;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  package?: Package;
  bus?: any | null;
  payments?: Payment[];
  passengers: Passenger[];
}

export interface Passenger {
  id: number;
  booking_id: number;
  name: string;
  age: number;
  relation_to_user: string | null;
  passport_number: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  amount: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: number;
  office_id: number;
  name: string;
  description: string;
  price: string;
  duration_days: number;
  features: {
    airport_transfer: boolean;
    makkah_visit: boolean;
    madinah_visit: boolean;
    guided_tour: boolean;
    wifi: boolean;
    meals_included: boolean;
    local_transportation: boolean;
    visa_assistance: boolean;
    air_tickets: boolean;
    ziyarat_places: boolean;
    dedicated_guide: boolean;
  };
  status: string;
  is_featured: boolean;
  views_count: number;
  max_persons: number;
  includes_transport: boolean;
  includes_accommodation: boolean;
  includes_meals: boolean;
  includes_guide: boolean;
  includes_insurance: boolean;
  includes_activities: boolean;
  start_location: string;
  end_location: string;
  start_date: string | null;
  end_date: string | null;
  location_coordinates: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  featured_image_url: string;
  thumbnail_url: string;
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

// Create Booking Request Interface
export interface CreateBookingRequest {
  package_id: number;
  booking_date: string;
  number_of_persons: number;
  booking_type: string;
  coupon_code?: string;
  payment_method_id: number;
  transaction_id?: string;
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

// Cancel Booking Request Interface
export interface CancelBookingRequest {
  reason: string;
}

// Mock data for development fallback
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 155,
    user_id: 4,
    booking_type: "package",
    package_id: 1,
    bus_id: null,
    status: "pending",
    payment_status: "pending",
    booking_date: "2025-04-25T00:00:00.000000Z",
    travel_start: "2025-04-28T00:00:00.000000Z",
    travel_end: "2025-05-05T00:00:00.000000Z",
    number_of_persons: 2,
    total_price: "18354.00",
    archived_at: null,
    deleted_at: null,
    created_at: "2025-04-24T23:12:26.000000Z",
    updated_at: "2025-04-24T23:12:26.000000Z",
    package: {
      id: 1,
      office_id: 1,
      name: "كبار الشخصيات - رحلة عمرة 6 أيام",
      description: "برنامج عمرة كبار الشخصيات يقدم تجربة استثنائية مع مرشد خاص وإقامة في فنادق قريبة من الحرم لمدة 6 أيام.",
      price: "9177.00",
      duration_days: 6,
      features: {
        airport_transfer: true,
        makkah_visit: true,
        madinah_visit: true,
        guided_tour: true,
        wifi: true,
        meals_included: true,
        local_transportation: true,
        visa_assistance: true,
        air_tickets: true,
        ziyarat_places: true,
        dedicated_guide: true
      },
      status: "active",
      is_featured: false,
      views_count: 4,
      max_persons: 11,
      includes_transport: true,
      includes_accommodation: true,
      includes_meals: true,
      includes_guide: false,
      includes_insurance: false,
      includes_activities: false,
      start_location: "Jeddah",
      end_location: "Madinah",
      start_date: null,
      end_date: null,
      location_coordinates: null,
      created_at: "2025-04-21T18:39:33.000000Z",
      updated_at: "2025-04-24T22:13:13.000000Z",
      deleted_at: null,
      featured_image_url: "/storage/packages/package_1_0.jpg",
      thumbnail_url: "/storage/packages/package_1_0.jpg"
    },
    passengers: [
      {
        id: 500,
        booking_id: 155,
        name: "John Doe",
        age: 30,
        relation_to_user: null,
        passport_number: "A12345678",
        created_at: "2025-04-24T23:12:26.000000Z",
        updated_at: "2025-04-24T23:12:26.000000Z"
      },
      {
        id: 501,
        booking_id: 155,
        name: "Jane Doe",
        age: 28,
        relation_to_user: null,
        passport_number: "B87654321",
        created_at: "2025-04-24T23:12:26.000000Z",
        updated_at: "2025-04-24T23:12:26.000000Z"
      }
    ],
    payments: []
  },
  {
    id: 156,
    user_id: 4,
    booking_type: "package",
    package_id: 2,
    bus_id: null,
    status: "confirmed",
    payment_status: "paid",
    booking_date: "2025-04-20T00:00:00.000000Z",
    travel_start: "2025-05-10T00:00:00.000000Z",
    travel_end: "2025-05-15T00:00:00.000000Z",
    number_of_persons: 1,
    total_price: "7500.00",
    archived_at: null,
    deleted_at: null,
    created_at: "2025-04-20T10:15:26.000000Z",
    updated_at: "2025-04-20T12:30:26.000000Z",
    package: {
      id: 2,
      office_id: 2,
      name: "رحلة عمرة سريعة - 5 أيام",
      description: "رحلة عمرة سريعة مناسبة للمسافرين الذين لديهم وقت محدود مع خدمات مميزة",
      price: "7500.00",
      duration_days: 5,
      features: {
        airport_transfer: true,
        makkah_visit: true,
        madinah_visit: true,
        guided_tour: true,
        wifi: true,
        meals_included: false,
        local_transportation: true,
        visa_assistance: false,
        air_tickets: false,
        ziyarat_places: true,
        dedicated_guide: false
      },
      status: "active",
      is_featured: true,
      views_count: 12,
      max_persons: 8,
      includes_transport: true,
      includes_accommodation: true,
      includes_meals: false,
      includes_guide: true,
      includes_insurance: false,
      includes_activities: true,
      start_location: "Jeddah",
      end_location: "Jeddah",
      start_date: null,
      end_date: null,
      location_coordinates: null,
      created_at: "2025-04-18T09:22:15.000000Z",
      updated_at: "2025-04-19T11:05:47.000000Z",
      deleted_at: null,
      featured_image_url: "/storage/packages/package_2_0.jpg",
      thumbnail_url: "/storage/packages/package_2_0.jpg"
    },
    passengers: [
      {
        id: 502,
        booking_id: 156,
        name: "Ahmad Khan",
        age: 45,
        relation_to_user: null,
        passport_number: "C98765432",
        created_at: "2025-04-20T10:15:26.000000Z",
        updated_at: "2025-04-20T10:15:26.000000Z"
      }
    ],
    payments: [
      {
        id: 123,
        booking_id: 156,
        amount: "7500.00",
        payment_method: "credit_card",
        transaction_id: "txn_12345678",
        status: "completed",
        created_at: "2025-04-20T10:30:26.000000Z",
        updated_at: "2025-04-20T10:30:26.000000Z"
      }
    ]
  },
  {
    id: 157,
    user_id: 4,
    booking_type: "package",
    package_id: 3,
    bus_id: null,
    status: "cancelled",
    payment_status: "refunded",
    booking_date: "2025-04-15T00:00:00.000000Z",
    travel_start: "2025-05-20T00:00:00.000000Z",
    travel_end: "2025-05-27T00:00:00.000000Z",
    number_of_persons: 3,
    total_price: "25000.00",
    archived_at: null,
    deleted_at: null,
    created_at: "2025-04-15T14:22:48.000000Z",
    updated_at: "2025-04-17T09:30:15.000000Z",
    package: {
      id: 3,
      office_id: 1,
      name: "العائلة الفاخرة - رحلة عمرة 7 أيام",
      description: "رحلة عمرة فاخرة للعائلات تشمل زيارة المدينة المنورة مع إقامة فندقية ممتازة",
      price: "8500.00",
      duration_days: 7,
      features: {
        airport_transfer: true,
        makkah_visit: true,
        madinah_visit: true,
        guided_tour: true,
        wifi: true,
        meals_included: true,
        local_transportation: true,
        visa_assistance: true,
        air_tickets: false,
        ziyarat_places: true,
        dedicated_guide: true
      },
      status: "active",
      is_featured: true,
      views_count: 22,
      max_persons: 15,
      includes_transport: true,
      includes_accommodation: true,
      includes_meals: true,
      includes_guide: true,
      includes_insurance: true,
      includes_activities: true,
      start_location: "Madinah",
      end_location: "Makkah",
      start_date: null,
      end_date: null,
      location_coordinates: null,
      created_at: "2025-04-10T18:39:33.000000Z",
      updated_at: "2025-04-12T22:13:13.000000Z",
      deleted_at: null,
      featured_image_url: "/storage/packages/package_3_0.jpg",
      thumbnail_url: "/storage/packages/package_3_0.jpg"
    },
    passengers: [
      {
        id: 503,
        booking_id: 157,
        name: "Mohammed Ali",
        age: 40,
        relation_to_user: null,
        passport_number: "D12345678",
        created_at: "2025-04-15T14:22:48.000000Z",
        updated_at: "2025-04-15T14:22:48.000000Z"
      },
      {
        id: 504,
        booking_id: 157,
        name: "Fatima Ali",
        age: 38,
        relation_to_user: null,
        passport_number: "D87654321",
        created_at: "2025-04-15T14:22:48.000000Z",
        updated_at: "2025-04-15T14:22:48.000000Z"
      },
      {
        id: 505,
        booking_id: 157,
        name: "Yusuf Ali",
        age: 12,
        relation_to_user: null,
        passport_number: "D23456789",
        created_at: "2025-04-15T14:22:48.000000Z",
        updated_at: "2025-04-15T14:22:48.000000Z"
      }
    ],
    payments: [
      {
        id: 124,
        booking_id: 157,
        amount: "25000.00",
        payment_method: "bank_transfer",
        transaction_id: "txn_23456789",
        status: "refunded",
        created_at: "2025-04-15T15:10:22.000000Z",
        updated_at: "2025-04-17T09:30:15.000000Z"
      }
    ]
  }
];

const MOCK_INVOICE: BookingInvoice = {
  booking_id: 155,
  invoice_number: "INV-2025-155",
  issue_date: "2025-04-24T23:12:26.000000Z",
  due_date: "2025-04-27T23:12:26.000000Z",
  total_amount: "18354.00",
  paid_amount: "0.00",
  balance_due: "18354.00",
  payment_status: "pending",
  booking_details: MOCK_BOOKINGS[0],
  line_items: [
    {
      description: "كبار الشخصيات - رحلة عمرة 6 أيام",
      quantity: 2,
      unit_price: "9177.00",
      total: "18354.00"
    }
  ]
};

// Helper functions for mock data
const getMockBookings = (params: {
  status?: string;
  per_page?: number;
} = {}): BookingApiResponse => {
  let filteredBookings = [...MOCK_BOOKINGS];
  
  // Filter by status if provided
  if (params.status) {
    filteredBookings = filteredBookings.filter(
      booking => booking.status === params.status
    );
  }
  
  // Limit by per_page if provided
  if (params.per_page) {
    filteredBookings = filteredBookings.slice(0, params.per_page);
  }
  
  return {
    status: true,
    code: 200,
    message: "messages.bookings_fetched_successfully",
    data: filteredBookings
  };
};

const getMockBookingById = (id: number | string): SingleBookingApiResponse => {
  const booking = MOCK_BOOKINGS.find(booking => booking.id === Number(id));
  
  if (!booking) {
    throw new Error("Booking not found");
  }
  
  return {
    status: true,
    code: 200,
    message: "messages.booking_fetched_successfully",
    data: booking
  };
};

const getMockBookingInvoice = (id: number | string): BookingInvoiceApiResponse => {
  const booking = MOCK_BOOKINGS.find(booking => booking.id === Number(id));
  
  if (!booking) {
    throw new Error("Booking not found");
  }
  
  // Use mock invoice or create one based on the booking
  const invoice = {...MOCK_INVOICE};
  
  if (booking.id !== MOCK_INVOICE.booking_id) {
    invoice.booking_id = booking.id;
    invoice.invoice_number = `INV-2025-${booking.id}`;
    invoice.total_amount = booking.total_price;
    invoice.balance_due = booking.payment_status === 'paid' ? '0.00' : booking.total_price;
    invoice.paid_amount = booking.payment_status === 'paid' ? booking.total_price : '0.00';
    invoice.payment_status = booking.payment_status;
    invoice.booking_details = booking;
    invoice.line_items = [
      {
        description: booking.package?.name || 'Package',
        quantity: booking.number_of_persons,
        unit_price: booking.package?.price || '0.00',
        total: booking.total_price
      }
    ];
  }
  
  return {
    status: true,
    code: 200,
    message: "messages.invoice_fetched_successfully",
    data: invoice
  };
};

// API Functions

/**
 * Fetch user bookings with optional filters
 */
export const fetchUserBookings = async (
  params: {
    status?: string;
    start_date?: string;
    end_date?: string;
    per_page?: number;
  } = {}
): Promise<BookingApiResponse> => {
  try {
    // Use mock data if flag is set
    if (USE_MOCK_DATA) {
      return getMockBookings(params);
    }
    
    // Real API call
    const response = await axios.get(`${API_CONFIG}/api/v1/bookings`, {
      params: params,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    
    // Fall back to mock data if API fails
    return getMockBookings(params);
  }
};

/**
 * Fetch a specific booking by ID
 */
export const fetchBookingById = async (id: number | string): Promise<SingleBookingApiResponse> => {
  try {
    // Use mock data if flag is set
    if (USE_MOCK_DATA) {
      return getMockBookingById(id);
    }
    
    // Real API call
    const response = await axios.get(`${API_CONFIG}/api/v1/bookings/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking with ID ${id}:`, error);
    
    // Fall back to mock data if API fails
    return getMockBookingById(id);
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: CreateBookingRequest
): Promise<SingleBookingApiResponse> => {
  try {
    // Use mock data if flag is set
    if (USE_MOCK_DATA) {
      // Create a new mock booking based on the request
      const newBooking: Booking = {
        id: MOCK_BOOKINGS.length + 155 + 1,
        user_id: 4,
        booking_type: bookingData.booking_type || "package",
        package_id: bookingData.package_id,
        bus_id: null,
        status: "pending",
        payment_status: "pending",
        booking_date: bookingData.booking_date || new Date().toISOString(),
        travel_start: new Date().toISOString(),
        travel_end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        number_of_persons: bookingData.number_of_persons || bookingData.passengers.length,
        total_price: "9177.00", // Placeholder
        archived_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        package: MOCK_BOOKINGS[0].package, // Placeholder, would normally look up the package
        passengers: bookingData.passengers.map((passenger, index) => ({
          id: 600 + index,
          booking_id: MOCK_BOOKINGS.length + 155 + 1,
          name: passenger.name,
          age: passenger.age || 30,
          relation_to_user: null,
          passport_number: passenger.passport_number,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        payments: []
      };
      
      // Add to mock bookings array
      MOCK_BOOKINGS.push(newBooking);
      
      return {
        status: true,
        code: 201,
        message: "messages.booking_created_successfully",
        data: newBooking
      };
    }
    
    // Real API call
    const response = await axios.post(`${API_CONFIG}/api/v1/user/bookings`, bookingData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  id: number | string,
  data: CancelBookingRequest
): Promise<SingleBookingApiResponse> => {
  try {
    // Use mock data if flag is set
    if (USE_MOCK_DATA) {
      const bookingIndex = MOCK_BOOKINGS.findIndex(booking => booking.id === Number(id));
      
      if (bookingIndex === -1) {
        throw new Error("Booking not found");
      }
      
      // Update the booking status
      MOCK_BOOKINGS[bookingIndex].status = "cancelled";
      MOCK_BOOKINGS[bookingIndex].updated_at = new Date().toISOString();
      
      return {
        status: true,
        code: 200,
        message: "messages.booking_cancelled_successfully",
        data: MOCK_BOOKINGS[bookingIndex]
      };
    }
    
    // Real API call
    const response = await axios.post(`${API_CONFIG}/api/v1/bookings/${id}/cancel`, data, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error cancelling booking with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get invoice for a booking
 */
export const getBookingInvoice = async (id: number | string): Promise<BookingInvoiceApiResponse> => {
  try {
    // Use mock data if flag is set
    if (USE_MOCK_DATA) {
      return getMockBookingInvoice(id);
    }
    
    // Real API call
    const response = await axios.get(`${API_CONFIG}/api/v1/bookings/${id}/invoice`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice for booking ${id}:`, error);
    
    // Fall back to mock data if API fails
    return getMockBookingInvoice(id);
  }
};

/**
 * Generate a link to download the invoice as PDF
 */
export const getInvoicePdfLink = (id: number | string): string => {
  return `${API_CONFIG}/api/v1/bookings/${id}/invoice/download`;
}; 