import axios from 'axios';
import { API_BASE_CONFIG } from '@/config/api.config';

// Types
export interface CouponValidationRequest {
  code: string;
  amount: number;
}

export interface CouponValidationResponse {
  status: boolean;
  message: string;
  data?: {
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    code: string;
    valid_until?: string;
    minimum_amount?: number;
  };
}

export interface CouponApplyRequest {
  booking_id: number;
  code: string;
}

export interface GeideaPaymentRequest {
  booking_id: number;
  amount: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  language: 'ar' | 'en';
  return_url: string;
  cancel_url: string;
}

export interface GeideaPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    payment_id: string;
    payment_url?: string;
    redirect_url?: string;
    session_id?: string;
  };
}

export interface PaymentStatusResponse {
  status: boolean;
  message: string;
  data?: {
    payment_id: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    transaction_reference?: string;
    paid_at?: string;
  };
}

export interface BookingRequest {
  package_id: number;
  booking_date: string;
  number_of_persons: number;
  booking_type: 'package';
  travel_start?: string;
  travel_end?: string;
  coupon_code?: string;
  payment_method_id: number; // 1 for cash, 2 for Geidea
  transaction_id?: string;
  passengers: Array<{
    name: string;
    passport_number: string;
    nationality: string;
    gender: 'male' | 'female';
    age: number;
    phone: string;
  }>;
}

export interface BookingResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    user_id: number;
    package_id: number;
    booking_date: string;
    number_of_persons: number;
    total_price: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    payment_status: 'pending' | 'completed' | 'failed';
    created_at: string;
  };
}

class PaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || API_BASE_CONFIG.BASE_URL;
  }

  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get token from multiple sources
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Try multiple token sources
    const tokenSources = [
      localStorage.getItem('nextauth_token'),
      localStorage.getItem('token'),
    ];

    for (const token of tokenSources) {
      if (token && token.length > 10) {
        return token;
      }
    }

    // Try cookies as fallback
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    return cookies.nextauth_token || cookies.token || null;
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(request: CouponValidationRequest): Promise<CouponValidationResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/user/coupons/validate`,
        request,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      return {
        status: false,
        message: error.response?.data?.message || 'حدث خطأ أثناء التحقق من الكوبون'
      };
    }
  }

  /**
   * Apply coupon to booking
   */
  async applyCoupon(request: CouponApplyRequest): Promise<{ status: boolean; message: string }> {
    try {
      const response = await axios.post(
        `${this.baseURL}/user/coupons/apply`,
        request,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Coupon apply error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      return {
        status: false,
        message: error.response?.data?.message || 'حدث خطأ أثناء تطبيق الكوبون'
      };
    }
  }

  /**
   * Create booking
   */
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/user/bookings`,
        request,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Booking creation error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      if (error.response?.status === 422) {
        throw new Error('بيانات الحجز غير صحيحة، يرجى التحقق من المعلومات المدخلة');
      }
      
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحجز');
    }
  }

  /**
   * Initiate Geidea payment
   */
  async initiateGeideaPayment(request: GeideaPaymentRequest): Promise<GeideaPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/geidea/payments/initiate`,
        request,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Geidea payment initiation error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      if (error.response?.status === 404) {
        throw new Error('الحجز غير موجود');
      }
      
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تهيئة عملية الدفع');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}/status`,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Payment status check error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      if (error.response?.status === 404) {
        throw new Error('الدفعة غير موجودة');
      }
      
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء فحص حالة الدفع');
    }
  }

  /**
   * Process complete booking with payment
   */
  async processBookingWithPayment(
    bookingData: BookingRequest,
    couponCode?: string
  ): Promise<{
    bookingId: number;
    paymentUrl?: string;
    requiresPayment: boolean;
  }> {
    try {
      // Step 1: Create booking
      const bookingResponse = await this.createBooking(bookingData);
      
      if (!bookingResponse.status || !bookingResponse.data) {
        throw new Error(bookingResponse.message || 'فشل في إنشاء الحجز');
      }

      const bookingId = bookingResponse.data.id;

      // Step 2: Apply coupon if provided
      if (couponCode && couponCode.trim()) {
        try {
          await this.applyCoupon({
            booking_id: bookingId,
            code: couponCode.trim()
          });
        } catch (couponError) {
          console.warn('Coupon application failed:', couponError);
          // Don't fail the entire process if coupon application fails
        }
      }

      // Step 3: Handle payment based on method
      if (bookingData.payment_method_id === 1) {
        // Cash payment - no additional processing needed
        return {
          bookingId,
          requiresPayment: false
        };
      } else {
        // Geidea payment - initiate payment process
        const paymentRequest: GeideaPaymentRequest = {
          booking_id: bookingId,
          amount: parseFloat(bookingResponse.data.total_price),
          customer_email: '', // Will be filled from user context
          customer_name: '', // Will be filled from user context
          customer_phone: '', // Will be filled from user context
          language: 'ar',
          return_url: `${window.location.origin}/payment/success?booking_id=${bookingId}`,
          cancel_url: `${window.location.origin}/payment/cancel?booking_id=${bookingId}`
        };

        const paymentResponse = await this.initiateGeideaPayment(paymentRequest);
        
        if (!paymentResponse.status || !paymentResponse.data) {
          throw new Error(paymentResponse.message || 'فشل في تهيئة عملية الدفع');
        }

        return {
          bookingId,
          paymentUrl: paymentResponse.data.payment_url || paymentResponse.data.redirect_url,
          requiresPayment: true
        };
      }
    } catch (error: any) {
      console.error('Booking processing error:', error);
      throw error;
    }
  }

  /**
   * Calculate discount amount from coupon
   */
  calculateDiscount(
    subtotal: number,
    couponData: CouponValidationResponse['data']
  ): number {
    if (!couponData) return 0;

    if (couponData.discount_type === 'percentage') {
      return (subtotal * couponData.discount_value) / 100;
    } else {
      return Math.min(couponData.discount_value, subtotal);
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'SAR'): string {
    return `${amount.toLocaleString('ar-SA')} ${currency === 'SAR' ? 'ريال' : currency}`;
  }

  /**
   * Get payment method name
   */
  getPaymentMethodName(paymentMethodId: number): string {
    switch (paymentMethodId) {
      case 1:
        return 'الدفع النقدي';
      case 2:
        return 'الدفع الإلكتروني - جيديا';
      default:
        return 'طريقة دفع غير معروفة';
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Export individual functions for convenience
export const {
  validateCoupon,
  applyCoupon,
  createBooking,
  initiateGeideaPayment,
  checkPaymentStatus,
  processBookingWithPayment,
  calculateDiscount,
  formatCurrency,
  getPaymentMethodName
} = paymentService; 