import { apiSlice } from './apiSlice';
import { OFFICE_ENDPOINTS } from '@/config/api.config';

export interface BookingsStatisticsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    canceled_bookings: number;
    total_revenue: string;
    today_bookings: number;
  };
}

export interface PackageBookingsStatisticsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    canceled_bookings: number;
    total_revenue: number;
    today_bookings: number;
    monthly_bookings: number;
    average_booking_value: number;
    popular_packages: Array<{
      id: number;
      office_id: number;
      name: string;
      description: string;
      price: number;
      discount_price: number;
      duration_days: number;
      bookings_count: number;
      featured_image_url: string;
      thumbnail_url: string;
      has_discount: boolean;
      discount_percentage: number;
    }>;
  };
}

export interface PackageBookingsResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Array<{
      id: number;
      booking_number: string;
      user_id: number;
      booking_type: string;
      package_id: number;
      status: string;
      payment_status: string;
      total_amount: string;
      total_price: string;
      created_at: string;
      user: {
        id: number;
        name: string;
      };
      package: {
        id: number;
        name: string;
      };
    }>;
    total: number;
  };
}

export interface ChartParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date?: string;
  end_date?: string;
}

export interface DateRangeParams {
  start_date: string;
  end_date: string;
}

export interface PackageBookingsCalendarResponse {
  status: boolean;
  code: number;
  message: string;
  data: Array<{
    id: number;
    title: string;
    start: string;
    end: string;
    status: string;
    color: string;
    customer: string;
    package: string;
    total_price: string;
    persons: number;
  }>;
}

export interface BookingsQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  payment_status?: string;
  from_date?: string;
  to_date?: string;
}

export interface GalleryResponse {
  status: boolean;
  code: number;
  message: string;
  data: Array<{
    id: number;
    office_id: number;
    title: string;
    description: string;
    image_path: string;
    is_featured: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
  }>;
}

export interface PackagesResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Array<{
      id: number;
      office_id: number;
      name: string;
      description: string;
      price: number;
      discount_price: number;
      duration_days: number;
      status: string;
      is_featured: boolean;
      featured_image_url: string;
      thumbnail_url: string;
      has_discount: boolean;
      discount_percentage: number;
      views_count: number;
    }>;
    total: number;
  };
}

export const dashboardApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBookingsStatistics: builder.query<BookingsStatisticsResponse, void>({
      query: () => OFFICE_ENDPOINTS.DASHBOARD.STATS,
      providesTags: ['Bookings'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Bookings statistics fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع إحصائيات الحجوزات',
          code: response.status
        };
      }
    }),
    
    getPackageBookingsStatistics: builder.query<PackageBookingsStatisticsResponse, void>({
      query: () => OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS_STATISTICS,
      providesTags: ['Bookings'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Package bookings statistics fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع إحصائيات حجوزات الباقات',
          code: response.status
        };
      }
    }),

    getPackageBookings: builder.query<PackageBookingsResponse, BookingsQueryParams | void>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS,
        params: params ?? undefined
      }),
      providesTags: ['Bookings'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Package bookings fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع حجوزات الباقات',
          code: response.status
        };
      }
    }),

    getBookingsCalendar: builder.query<PackageBookingsCalendarResponse, DateRangeParams>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS_CALENDAR,
        params
      }),
      providesTags: ['Bookings'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Bookings calendar fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع تقويم الحجوزات',
          code: response.status
        };
      }
    }),

    // Get gallery images for the office
    getGallery: builder.query<GalleryResponse, void>({
      query: () => OFFICE_ENDPOINTS.GALLERY.LIST,
      providesTags: ['Gallery'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Gallery fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع معرض الصور',
          code: response.status
        };
      }
    }),

    // Get packages for the office
    getPackages: builder.query<PackagesResponse, { status?: string, is_featured?: boolean } | void>({
      query: (params) => {
        // Only pass params if defined, otherwise omit
        return {
          url: OFFICE_ENDPOINTS.PACKAGES.LIST,
          ...(params ? { params } : {})
        };
      },
      providesTags: ['Packages'],
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Packages fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع الباقات',
          code: response.status
        };
      }
    }),

    // Get daily/monthly/yearly stats for charts with date filtering
    getBookingsChartData: builder.query<any, { period: string, start_date?: string, end_date?: string }>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS,
        params: {
          period: params.period,
          start_date: params.start_date,
          end_date: params.end_date,
          chart: true
        }
      }),
      providesTags: ['Bookings'],
      transformResponse: (response: any) => {
        // Transform API response to chart-friendly format
        if (!response?.data) return [];
        
        // Create chart data from bookings, grouped by date
        const chartData = response.data?.data?.reduce((acc: any[], booking: any) => {
          const date = new Date(booking.created_at).toLocaleDateString();
          const existingEntry = acc.find(item => item.date === date);
          
          if (existingEntry) {
            existingEntry.count += 1;
          } else {
            acc.push({ date, count: 1 });
          }
          
          return acc;
        }, []) || [];
        
        return {
          status: response.status,
          code: response.code,
          message: response.message,
          data: chartData
        };
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Bookings chart data fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع بيانات الرسم البياني للحجوزات',
          code: response.status
        };
      }
    }),

    // Get revenue chart data with date filtering
    getRevenueChartData: builder.query<any, { period: string, start_date?: string, end_date?: string }>({
      query: (params) => ({
        url: OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS,
        params: {
          period: params.period,
          start_date: params.start_date,
          end_date: params.end_date,
          chart: true
        }
      }),
      providesTags: ['Bookings', 'Payments'],
      transformResponse: (response: any) => {
        // Transform API response to chart-friendly format
        if (!response?.data) return [];
        
        // Create chart data from bookings, grouped by date with sum of total_price
        const chartData = response.data?.data?.reduce((acc: any[], booking: any) => {
          const date = new Date(booking.created_at).toLocaleDateString();
          const amount = parseFloat(booking.total_price) || 0;
          
          const existingEntry = acc.find(item => item.date === date);
          
          if (existingEntry) {
            existingEntry.amount += amount;
          } else {
            acc.push({ date, amount });
          }
          
          return acc;
        }, []) || [];
        
        return {
          status: response.status,
          code: response.code,
          message: response.message,
          data: chartData
        };
      },
      transformErrorResponse: (response: { status: number, data: any }) => {
        console.error('Revenue chart data fetch error:', response);
        return {
          status: false,
          message: response.data?.message || 'خطأ في استرجاع بيانات الرسم البياني للإيرادات',
          code: response.status
        };
      }
    })
  }),
});

export const {
  useGetBookingsStatisticsQuery,
  useGetPackageBookingsStatisticsQuery,
  useGetPackageBookingsQuery,
  useGetBookingsCalendarQuery,
  useGetGalleryQuery,
  useGetPackagesQuery,
  useGetBookingsChartDataQuery,
  useGetRevenueChartDataQuery
} = dashboardApiSlice; 