'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Tag, 
  CheckCircle, 
  X, 
  Loader2, 
  Phone,
  LogIn,
  Shield,
  BedDouble
} from 'lucide-react';
import axios from 'axios';

interface BookingSystemProps {
  pkg: any;
  numberOfPersons: number;
  setNumberOfPersons: (num: number) => void;
  selectedAccommodation: string;
  setSelectedAccommodation: (accommodation: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  totalPrice: number;
  onBookNow: () => void;
  isProcessingBooking: boolean;
  userIsAuthenticated: boolean;
  t: any;
  getAccessToken: () => string | null;
}

export default function BookingSystem({
  pkg,
  numberOfPersons,
  setNumberOfPersons,
  selectedAccommodation,
  setSelectedAccommodation,
  paymentMethod,
  setPaymentMethod,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  totalPrice,
  onBookNow,
  isProcessingBooking,
  userIsAuthenticated,
  t,
  getAccessToken
}: BookingSystemProps) {
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const { toast } = useToast();

  const decrementPersons = () => {
    setNumberOfPersons(Math.max(1, numberOfPersons - 1));
  };

  const incrementPersons = () => {
    const maxPersons = pkg?.max_persons || 10;
    const availableSeats = pkg?.available_seats_count || 0;
    setNumberOfPersons(Math.min(maxPersons, availableSeats, numberOfPersons + 1));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(t('packages.enterCouponCode') || 'أدخل كود الخصم');
      return;
    }

    if (!userIsAuthenticated) {
      toast({
        title: t('packages.loginRequired') || 'تسجيل الدخول مطلوب',
        description: t('packages.loginRequiredDesc') || 'يجب تسجيل الدخول لاستخدام كود الخصم',
        variant: 'destructive'
      });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('رمز المصادقة غير موجود');
      }

      const response = await axios.post(
        `/api/v1/user/coupons/validate`,
        {
          code: couponCode,
          amount: totalPrice
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === true) {
        setAppliedCoupon(response.data.data);
        toast({
          title: t('packages.couponApplied') || 'تم تطبيق الكوبون',
          description: t('packages.couponAppliedDesc') || 'تم تطبيق كود الخصم بنجاح',
        });
      } else {
        setCouponError(response.data.message || t('packages.invalidCoupon') || 'كود خصم غير صالح');
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      setCouponError(error.response?.data?.message || t('packages.couponError') || 'خطأ في تطبيق الكوبون');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const basePrice = pkg?.has_discount && pkg?.discount_price ? pkg.discount_price : (pkg?.price || 0);
  const accommodationPrice = selectedAccommodation && pkg?.accommodation_pricing 
    ? pkg.accommodation_pricing[selectedAccommodation]?.price || 0 
    : 0;
  
  const unitPrice = accommodationPrice || basePrice;
  const subtotal = unitPrice * numberOfPersons;

  return (
    <Card className="booking-sidebar shadow-lg md:shadow-xl bg-gray-800 border-gray-700 sticky top-24">
      {/* Header */}
      <div className="booking-header p-4 md:p-6 text-white relative bg-gradient-to-r from-gray-700 to-gray-800">
        <div className="text-center relative z-10">
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">
            {totalPrice.toLocaleString()}
            <span className="text-sm md:text-base lg:text-lg font-normal mr-2">
              {t('packages.currency') || 'ر.س'}
            </span>
          </div>
          {pkg?.has_discount && (
            <Badge className="bg-yellow-500 text-white mb-2 shadow-lg text-xs md:text-sm">
              <Tag className="h-3 w-3 mr-1" />
              {t('packages.discountAvailable') || 'خصم متوفر'}
            </Badge>
          )}
          <div className="text-xs md:text-sm opacity-90 text-white">
            {t('packages.perPerson') || 'للشخص الواحد'}: {(totalPrice / numberOfPersons).toLocaleString()} {t('packages.currency') || 'ر.س'}
          </div>
        </div>
      </div>

      <CardContent className="p-3 md:p-4 lg:p-6 bg-gray-800">
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          {/* Number of Persons */}
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {t('packages.numberOfPersons') || 'عدد المعتمرين'}
            </Label>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={decrementPersons}
                disabled={numberOfPersons <= 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-primary/20 transition-colors border-gray-600 text-gray-300"
              >
                <Minus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <span className="text-lg md:text-xl font-bold text-center min-w-[2.5rem] md:min-w-[3rem] text-white">
                {numberOfPersons}
              </span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={incrementPersons}
                disabled={numberOfPersons >= (pkg?.max_persons || 10) || numberOfPersons >= (pkg?.available_seats_count || 0)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-primary/20 transition-colors border-gray-600 text-gray-300"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Accommodation Selection */}
          {pkg?.accommodation_pricing && Object.keys(pkg.accommodation_pricing).length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" />
                {t('packages.selectAccommodation') || 'اختر التسكين'}
              </Label>
              <select 
                value={selectedAccommodation} 
                onChange={(e) => setSelectedAccommodation(e.target.value)}
                className="w-full h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl border border-gray-600 focus:border-primary focus:ring-primary/20 text-sm md:text-base bg-gray-700 text-white"
              >
                {Object.entries(pkg.accommodation_pricing).map(([key, acc]: [string, any]) => (
                  <option key={key} value={key}>
                    {acc.name} - {acc.price?.toLocaleString()} {t('packages.currency') || 'ر.س'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              {t('packages.paymentMethod') || 'طريقة الدفع'}
            </Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 md:p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-300">
                  <Banknote className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                  {t('packages.cashPayment') || 'الدفع نقدًا'}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 md:p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-300">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  {t('packages.onlinePayment') || 'الدفع الإلكتروني'}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              {t('packages.couponCode') || 'كود الخصم'}
            </Label>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={t('packages.enterCouponCode') || 'أدخل كود الخصم'}
                  className="flex-1 h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl border border-gray-600 focus:border-primary focus:ring-primary/20 text-sm md:text-base bg-gray-700 text-white"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                  className="bg-primary hover:bg-primary/80 h-10 md:h-11 px-3 md:px-4 text-xs md:text-sm"
                >
                  {isApplyingCoupon ? (
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  ) : (
                    t('packages.apply') || 'تطبيق'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 md:p-3 bg-green-900/50 rounded-lg border border-green-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs md:text-sm font-medium text-green-300">
                    {appliedCoupon.code} - {appliedCoupon.discount_value}
                    {appliedCoupon.discount_type === 'percentage' ? '%' : ` ${t('packages.currency') || 'ر.س'}`}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleRemoveCoupon}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/50 h-8 w-8 p-0"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-xs md:text-sm text-red-400 mt-1">{couponError}</p>
            )}
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-gradient-to-r from-gray-700 to-slate-700 rounded-xl border border-gray-600">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{t('packages.packagePrice') || 'سعر الباقة'}</span>
                <span className="text-gray-300">
                  {subtotal.toLocaleString()} {t('packages.currency') || 'ر.س'}
                </span>
              </div>
              
              {pkg?.has_discount && pkg?.discount_price && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 line-through">{t('packages.originalPrice') || 'السعر الأصلي'}</span>
                  <span className="text-gray-500 line-through">
                    {((pkg?.price || 0) * numberOfPersons).toLocaleString()} {t('packages.currency') || 'ر.س'}
                  </span>
                </div>
              )}
              
              {appliedCoupon && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">{t('packages.couponDiscount') || 'خصم الكوبون'}</span>
                  <span className="text-green-400">
                    -{appliedCoupon.discount_type === 'percentage' 
                      ? `${appliedCoupon.discount_value}%` 
                      : `${appliedCoupon.discount_value} ${t('packages.currency') || 'ر.س'}`}
                  </span>
                </div>
              )}
              
              <Separator className="bg-gray-600" />
              <div className="flex justify-between font-bold text-lg">
                <span className="text-white">{t('packages.total') || 'الإجمالي'}</span>
                <span className="text-primary">{totalPrice.toLocaleString()} {t('packages.currency') || 'ر.س'}</span>
              </div>
            </div>
          </div>

          {/* Booking Buttons */}
          <div className="space-y-3 md:space-y-4 mt-6 md:mt-8">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white text-sm md:text-base lg:text-lg py-3 md:py-4 h-12 md:h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={pkg?.is_fully_booked || ((pkg?.available_seats_count || 0) < numberOfPersons) || isProcessingBooking}
              onClick={onBookNow}
            >
              {isProcessingBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-xs md:text-sm lg:text-base">
                    {t('packages.processingBooking') || 'جاري المعالجة...'}
                  </span>
                </>
              ) : !userIsAuthenticated ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span className="text-xs md:text-sm lg:text-base">
                    {t('packages.loginToBook') || 'تسجيل الدخول للحجز'}
                  </span>
                </>
              ) : pkg?.is_fully_booked ? (
                <span className="text-xs md:text-sm lg:text-base">
                  {t('packages.fullyBooked') || 'مكتمل'}
                </span>
              ) : (
                <span className="text-xs md:text-sm lg:text-base">
                  {t('packages.bookNow') || 'احجز الآن'}
                </span>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-2 border-primary text-primary hover:bg-primary/10 rounded-xl transition-all duration-300 h-12 md:h-14"
              onClick={() => window.open(`tel:${pkg?.office?.contact_number}`, '_self')}
            >
              <Phone className="mr-2 h-4 w-4" />
              <span className="text-xs md:text-sm lg:text-base">
                {t('packages.contactOffice') || 'اتصل بالمكتب'}
              </span>
            </Button>

            {/* Security Info */}
            <div className="text-center text-xs text-gray-500 mt-3 md:mt-4">
              <p>{t('packages.secureBooking') || 'حجز آمن ومحمي'}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Shield className="h-3 w-3" />
                <span>{t('packages.sslProtected') || 'محمي بتقنية SSL'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 