import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '@/lib/constants';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getProxyUrl,
  getImageUrl,
  USER_ENDPOINTS
} from '@/config/api.config';
import { handleApiError } from 'lib/utils';
// Import the centralized auth token getter
import { getAuthToken } from '@/lib/auth.service';
const token = getAuthToken();

// Create axios instance with retry functionality
const createApiInstance = () => {
  const instance = axios.create({
    timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
    headers: API_BASE_CONFIG.DEFAULT_HEADERS,
  });

  // Add request interceptor for retries
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as any;
      
      if (!config || config.retryCount >= 2) {
        throw error;
      }

      config.retryCount = (config.retryCount || 0) + 1;
      
      // Try fallback URLs if main URL fails
      if (config.retryCount === 1 && API_BASE_CONFIG.FALLBACK_URLS.length > 0) {
        const fallbackUrl = API_BASE_CONFIG.FALLBACK_URLS[0];
        config.baseURL = fallbackUrl;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
      
      return instance.request(config);
    }
  );

  return instance;
};

const apiInstance = createApiInstance();

// Flag to control if we use mock data (for development when API is down)
const USE_MOCK_DATA = false;

// API response interfaces
export interface BookingApiResponse {
  [x: string]: any;
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
  nationality?: string;
  gender?: string;
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
  invoice_url: any;
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

// Update Booking Request Interface
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

// Rate Booking Request Interface
export interface RateBookingRequest {
  rating: number;
  comment?: string;
}

// Filter Bookings Request Interface
export interface FilterBookingsRequest {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  start_date?: string;
  end_date?: string;
  payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
  per_page?: number;
  page?: number;
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
  ],
  invoice_url: undefined
};

// Helper functions for mock data
const getMockBookings = (params: FilterBookingsRequest = {}): BookingApiResponse => {
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
  params: FilterBookingsRequest = {}
): Promise<BookingApiResponse> => {
  try {
    // Get auth token
    const token = getAuthToken();
    console.log('Auth token available:', !!token, token ? `${token.substring(0, 10)}...` : 'null');
    
    if (!token) {
      console.error('No authentication token available');
      
      // During development, use mock data if token is not available
      if (process.env.NODE_ENV === 'development' || USE_MOCK_DATA) {
        console.warn('Using mock data due to missing authentication token');
        return getMockBookings(params);
      }
      
      throw new Error('Unauthorized: No token provided');
    }

    // Check if we should use mock data
    if (USE_MOCK_DATA) {
      console.log('Using mock booking data due to USE_MOCK_DATA flag');
      return getMockBookings(params);
    }

    console.log('Fetching bookings from API:', {
      url: `${API_BASE_CONFIG.BASE_URL}${USER_ENDPOINTS.BOOKINGS.LIST}`,
      params,
    });

    const response = await apiInstance.get(API_BASE_CONFIG.BASE_URL + USER_ENDPOINTS.BOOKINGS.LIST, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT
    });
    
    console.log('API response status:', response.status);
    
    if (response.status === 200 && response.data) {
      console.log('Bookings fetched successfully:', {
        status: response.data.status,
        code: response.data.code,
        count: response.data.data?.length || 0,
        pagination: response.data.pagination
      });
      
      return response.data;
    }
    
    console.error('Unexpected API response:', response);
    throw new Error('Failed to fetch bookings');
  } catch (error: any) {
    console.error('Error fetching user bookings:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Error response data:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Error request made but no response received');
    }
    
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data due to API error');
      return getMockBookings(params);
    }
    
    throw handleApiError(error);
  }
};


/**
 * Fetch a specific booking by ID
 */
export const fetchBookingById = async (id: number | string): Promise<SingleBookingApiResponse> => {
    if (USE_MOCK_DATA) {
      return getMockBookingById(id);
    }
    
  try {
    const response = await apiInstance.get(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.DETAIL(id),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data for booking details');
      return getMockBookingById(id);
    }
    
    throw handleApiError(error);
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (
  bookingData: CreateBookingRequest
): Promise<SingleBookingApiResponse> => {
    if (USE_MOCK_DATA) {
    // Mock successful booking creation
    return {
      status: true,
      code: 200,
      message: 'Booking created successfully',
      data: {
        id: Math.floor(Math.random() * 1000) + 1,
        user_id: 1,
        booking_type: bookingData.booking_type,
        package_id: bookingData.package_id,
        bus_id: null,
        status: 'pending',
        payment_status: 'pending',
        booking_date: bookingData.booking_date,
        travel_start: new Date().toISOString(),
        travel_end: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        number_of_persons: bookingData.number_of_persons,
        total_price: '9177.00',
        archived_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        passengers: bookingData.passengers.map((passenger, index) => ({
          id: index + 1,
          booking_id: Math.floor(Math.random() * 1000) + 1,
          name: passenger.name,
          age: passenger.age,
          relation_to_user: null,
          passport_number: passenger.passport_number,
          nationality: passenger.nationality,
          gender: passenger.gender,
          phone: passenger.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      }
    };
  }

  try {
   
    const response = await apiInstance.post(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.CREATE, bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw handleApiError(error);
  }
};

/**
 * Update an existing booking
 */
export const updateBooking = async (
  id: number | string,
  data: UpdateBookingRequest
): Promise<SingleBookingApiResponse> => {
  try {
    const response = await apiInstance.put(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.DETAIL(id),
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  id: number | string,
  data: CancelBookingRequest
): Promise<SingleBookingApiResponse> => {
  if (USE_MOCK_DATA) {
    // Mock successful booking cancellation
    const mockBooking = getMockBookingById(id);
    mockBooking.data.status = 'cancelled';
    return mockBooking;
  }

  try {
    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.CANCEL(id),
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error cancelling booking ${id}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Rate a booking
 */
export const rateBooking = async (
  id: number | string,
  data: RateBookingRequest
): Promise<SingleBookingApiResponse> => {
  try {
    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.DETAIL(id),
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error rating booking ${id}:`, error);
    throw handleApiError(error);
  }
};

/**
 * Get invoice for a booking
 */
export const getBookingInvoice = async (id: number | string): Promise<BookingInvoiceApiResponse> => {
    if (USE_MOCK_DATA) {
      return getMockBookingInvoice(id);
    }
    
  try {
    const response = await apiInstance.get(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.INVOICE(id),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice for booking ${id}:`, error);
    
    // Fallback to mock data in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock data for invoice');
    return getMockBookingInvoice(id);
    }
    
    throw handleApiError(error);
  }
};

/**
 * Generate a link to download the invoice as PDF
 */
export const getInvoicePdfLink = async (id: number | string): Promise<string> => {
  try {
    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.BOOKINGS.INVOICE_DOWNLOAD(id),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error requesting receipt for booking ${id}:`, error);
    throw handleApiError(error);
  }}; 

/**
 * Request booking receipt
 */
export const requestBookingReceipt = async (id: number | string, email?: string): Promise<any> => {
  try {
    const response = await apiInstance.post(
      API_BASE_CONFIG.BASE_URL+ USER_ENDPOINTS.BOOKINGS.INVOICE_DOWNLOAD(id),
      { email },
      {
          headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error requesting receipt for booking ${id}:`, error);
    throw handleApiError(error);
  }
}; 