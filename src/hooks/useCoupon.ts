
'use client';

import { useState, useCallback } from 'react';
import { paymentService, CouponValidationResponse } from '@/services/payment.service';

interface CouponState {
  code: string;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  message: string;
}

interface UseCouponReturn {
  couponState: CouponState;
  validateCoupon: (code: string, amount: number) => Promise<void>;
  applyCoupon: (bookingId: number) => Promise<boolean>;
  clearCoupon: () => void;
  setCouponCode: (code: string) => void;
  calculateDiscount: (subtotal: number) => number;
}

export function useCoupon(): UseCouponReturn {
  const [couponState, setCouponState] = useState<CouponState>({
    code: '',
    isValid: false,
    isLoading: false,
    error: null,
    discountAmount: 0,
    discountType: null,
    discountValue: 0,
    message: ''
  });

  const validateCoupon = useCallback(async (code: string, amount: number) => {
    if (!code.trim()) {
      clearCoupon();
      return;
    }

    setCouponState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const response = await paymentService.validateCoupon({
        code: code.trim(),
        amount
      });

      if (response.status && response.data) {
        const discountAmount = paymentService.calculateDiscount(amount, response.data);
        
        setCouponState(prev => ({
          ...prev,
          code: code.trim(),
          isValid: true,
          isLoading: false,
          error: null,
          discountAmount,
          discountType: response.data!.discount_type,
          discountValue: response.data!.discount_value,
          message: response.message || 'تم تطبيق الكوبون بنجاح'
        }));
      } else {
        setCouponState(prev => ({
          ...prev,
          code: code.trim(),
          isValid: false,
          isLoading: false,
          error: response.message || 'كوبون غير صالح',
          discountAmount: 0,
          discountType: null,
          discountValue: 0,
          message: response.message || 'كوبون غير صالح'
        }));
      }
    } catch (error: any) {
      setCouponState(prev => ({
        ...prev,
        code: code.trim(),
        isValid: false,
        isLoading: false,
        error: error.message || 'حدث خطأ أثناء التحقق من الكوبون',
        discountAmount: 0,
        discountType: null,
        discountValue: 0,
        message: error.message || 'حدث خطأ أثناء التحقق من الكوبون'
      }));
    }
  }, []);

  const applyCoupon = useCallback(async (bookingId: number): Promise<boolean> => {
    if (!couponState.code || !couponState.isValid) {
      return false;
    }

    try {
      const response = await paymentService.applyCoupon({
        booking_id: bookingId,
        code: couponState.code
      });

      if (response.status) {
        setCouponState(prev => ({
          ...prev,
          message: response.message || 'تم تطبيق الكوبون بنجاح'
        }));
        return true;
      } else {
        setCouponState(prev => ({
          ...prev,
          error: response.message || 'فشل في تطبيق الكوبون',
          message: response.message || 'فشل في تطبيق الكوبون'
        }));
        return false;
      }
    } catch (error: any) {
      setCouponState(prev => ({
        ...prev,
        error: error.message || 'حدث خطأ أثناء تطبيق الكوبون',
        message: error.message || 'حدث خطأ أثناء تطبيق الكوبون'
      }));
      return false;
    }
  }, [couponState.code, couponState.isValid]);

  const clearCoupon = useCallback(() => {
    setCouponState({
      code: '',
      isValid: false,
      isLoading: false,
      error: null,
      discountAmount: 0,
      discountType: null,
      discountValue: 0,
      message: ''
    });
  }, []);

  const setCouponCode = useCallback((code: string) => {
    setCouponState(prev => ({
      ...prev,
      code,
      // Reset validation state when code changes
      isValid: false,
      error: null,
      discountAmount: 0,
      discountType: null,
      discountValue: 0,
      message: ''
    }));
  }, []);

  const calculateDiscount = useCallback((subtotal: number): number => {
    if (!couponState.isValid || !couponState.discountType) {
      return 0;
    }

    if (couponState.discountType === 'percentage') {
      return (subtotal * couponState.discountValue) / 100;
    } else {
      return Math.min(couponState.discountValue, subtotal);
    }
  }, [couponState.isValid, couponState.discountType, couponState.discountValue]);

  return {
    couponState,
    validateCoupon,
    applyCoupon,
    clearCoupon,
    setCouponCode,
    calculateDiscount
  };
} 