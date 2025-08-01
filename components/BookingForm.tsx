"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  CreditCard, 
  DollarSign, 
  Users, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Gift,
  Loader2,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { cn } from '@/lib/utils';

// Types
interface PassengerData {
  name: string;
  passport_number: string;
  nationality: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
}

interface CouponInfo {
  valid: boolean;
  message: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  code?: string;
}

interface BookingFormData {
  package_id: number;
  booking_date: string;
  number_of_persons: number;
  passengers: PassengerData[];
  payment_method_id: number;
  coupon_code: string;
  notes: string;
}

interface BookingFormProps {
  packageId: number;
  packagePrice: number;
  packageTitle: string;
  onBookingSuccess?: (bookingId: number) => void;
  onBookingCancel?: () => void;
}

// Payment methods
const paymentMethods = [
  {
    id: 1,
    name: 'الدفع النقدي',
    type: 'cash',
    description: 'الدفع عند الاستلام أو في المكتب',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: 2,
    name: 'الدفع الإلكتروني - جيديا',
    type: 'geidea',
    description: 'الدفع بالبطاقة الائتمانية عبر جيديا',
    icon: <CreditCard className="h-5 w-5" />
  }
];

// Countries list
const countries = [
  'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان', 
  'الأردن', 'لبنان', 'سوريا', 'العراق', 'مصر', 'المغرب', 
  'تونس', 'الجزائر', 'ليبيا', 'السودان', 'اليمن'
];

export default function BookingForm({ 
  packageId, 
  packagePrice, 
  packageTitle, 
  onBookingSuccess, 
  onBookingCancel 
}: BookingFormProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const { getUserData, isAuthenticated } = useSessionPersistence();

  // Get user data
  const user = getUserData();

  // Form states
  const [formData, setFormData] = useState<BookingFormData>({
    package_id: packageId,
    booking_date: new Date().toISOString().split('T')[0],
    number_of_persons: 1,
    passengers: [],
    payment_method_id: 1,
    coupon_code: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassengerDetails, setShowPassengerDetails] = useState(false);

  // Initialize passengers when number changes
  useEffect(() => {
    const newPassengers: PassengerData[] = [];
    for (let i = 0; i < formData.number_of_persons; i++) {
      if (formData.passengers[i]) {
        newPassengers.push(formData.passengers[i]);
      } else {
      newPassengers.push({
          name: '',
        passport_number: '',
        nationality: 'السعودية',
        gender: 'male',
        age: 30,
          phone: ''
      });
      }
    }
    setFormData(prev => ({ ...prev, passengers: newPassengers }));
  }, [formData.number_of_persons]);

  // Auto-fill first passenger with user data if available
  useEffect(() => {
    if (user && formData.passengers.length > 0 && !formData.passengers[0].name) {
      const updatedPassengers = [...formData.passengers];
      updatedPassengers[0] = {
        ...updatedPassengers[0],
        name: user.name || '',
        phone: user.phone || '',
      };
      setFormData(prev => ({ ...prev, passengers: updatedPassengers }));
    }
  }, [user, formData.passengers.length]);

  // Validate coupon
  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponInfo(null);
      return;
    }

    setCouponLoading(true);
    try {
      const token = user?.token; // Use user token if available
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: code,
          amount: calculateSubtotal()
        })
      });

      const data = await response.json();
      
      if (response.ok && data.status) {
        setCouponInfo({
          valid: true,
          message: data.message || 'تم تطبيق الكوبون بنجاح',
          discount_type: data.data?.discount_type || 'fixed',
          discount_value: data.data?.discount_value || 0,
          code: code
        });
      } else {
        setCouponInfo({
          valid: false,
          message: data.message || 'كوبون غير صالح'
        });
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponInfo({
        valid: false,
        message: 'حدث خطأ أثناء التحقق من الكوبون'
      });
    } finally {
      setCouponLoading(false);
    }
  };

  // Calculate pricing
  const calculateSubtotal = () => packagePrice * formData.number_of_persons;
  
  const calculateDiscount = () => {
    if (!couponInfo || !couponInfo.valid) return 0;
    
    const subtotal = calculateSubtotal();
    if (couponInfo.discount_type === 'percentage') {
      return (subtotal * (couponInfo.discount_value || 0)) / 100;
    } else {
      return Math.min(couponInfo.discount_value || 0, subtotal);
    }
  };
  
  const calculateTotal = () => calculateSubtotal() - calculateDiscount();

  // Update passenger data
  const updatePassenger = (index: number, field: keyof PassengerData, value: string | number) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, passengers: updatedPassengers }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.booking_date) {
      newErrors.booking_date = 'تاريخ الحجز مطلوب';
    }
    
    if (formData.number_of_persons < 1) {
      newErrors.number_of_persons = 'عدد الأشخاص يجب أن يكون أكبر من 0';
    }

    // Validate passengers
    formData.passengers.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        newErrors[`passenger_${index}_name`] = 'اسم المسافر مطلوب';
      }
      if (!passenger.passport_number.trim()) {
        newErrors[`passenger_${index}_passport`] = 'رقم الجواز مطلوب';
      }
      if (!passenger.phone.trim()) {
        newErrors[`passenger_${index}_phone`] = 'رقم الهاتف مطلوب';
      }
      if (passenger.age < 1 || passenger.age > 100) {
        newErrors[`passenger_${index}_age`] = 'العمر يجب أن يكون بين 1 و 100';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const token = user?.token; // Use user token if available
      
      // Create booking
      const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          coupon_code: couponInfo?.valid ? formData.coupon_code : undefined
        })
      });

      const bookingData = await bookingResponse.json();
      
      if (!bookingResponse.ok) {
        throw new Error(bookingData.message || 'فشل في إنشاء الحجز');
      }

      const bookingId = bookingData.data.id;

      // Apply coupon if valid
      if (couponInfo?.valid && formData.coupon_code) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/coupons/apply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              booking_id: bookingId,
              code: formData.coupon_code
            })
          });
        } catch (couponError) {
          console.warn('Coupon application failed:', couponError);
        }
      }

      // Handle payment
      if (formData.payment_method_id === 1) {
        // Cash payment - booking is complete
        toast({
          title: 'تم إنشاء الحجز بنجاح',
          description: 'سيتم التواصل معك لتأكيد الحجز والدفع',
          duration: 5000
        });
        
        onBookingSuccess?.(bookingId);
      } else {
        // Geidea payment - initiate payment
        const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/geidea/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            booking_id: bookingId,
            amount: calculateTotal(),
            customer_email: user?.email || '',
            customer_name: user?.name || '',
            customer_phone: user?.phone || '',
            language: 'ar',
            return_url: `${window.location.origin}/payment/success`,
            cancel_url: `${window.location.origin}/payment/cancelled`
          })
        });

        const paymentData = await paymentResponse.json();
        
        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || 'فشل في بدء عملية الدفع');
        }

        // Redirect to payment gateway
        if (paymentData.data?.payment_url || paymentData.data?.redirect_url) {
          window.location.href = paymentData.data.payment_url || paymentData.data.redirect_url;
        } else {
          throw new Error('لم يتم الحصول على رابط الدفع');
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: 'خطأ في عملية الحجز',
        description: error.message || 'حدث خطأ أثناء عملية الحجز'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step 1: Basic booking info
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">معلومات الحجز الأساسية</h3>
        <p className="text-sm text-muted-foreground">اختر تاريخ الحجز وعدد الأشخاص</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="booking_date">تاريخ الحجز</Label>
          <Input
            id="booking_date"
            type="date"
            value={formData.booking_date}
            onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.booking_date && (
            <p className="text-sm text-red-500">{errors.booking_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number_of_persons">عدد الأشخاص</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                number_of_persons: Math.max(1, prev.number_of_persons - 1) 
              }))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="number_of_persons"
              type="number"
              value={formData.number_of_persons}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                number_of_persons: Math.max(1, parseInt(e.target.value) || 1) 
              }))}
              min="1"
              max="20"
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                number_of_persons: Math.min(20, prev.number_of_persons + 1) 
              }))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.number_of_persons && (
            <p className="text-sm text-red-500">{errors.number_of_persons}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="أي ملاحظات أو طلبات خاصة..."
          rows={3}
        />
      </div>
    </div>
  );

  // Render step 2: Passenger details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">بيانات المسافرين</h3>
        <p className="text-sm text-muted-foreground">أدخل بيانات جميع المسافرين</p>
      </div>

      <div className="space-y-4">
        {formData.passengers.map((passenger, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                المسافر {index + 1}
                {index === 0 && <Badge variant="secondary">المسافر الرئيسي</Badge>}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input
                  value={passenger.name}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                  placeholder="أدخل الاسم الكامل"
                />
                {errors[`passenger_${index}_name`] && (
                  <p className="text-sm text-red-500">{errors[`passenger_${index}_name`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>رقم الجواز</Label>
                <Input
                  value={passenger.passport_number}
                  onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)}
                  placeholder="رقم الجواز"
                />
                {errors[`passenger_${index}_passport`] && (
                  <p className="text-sm text-red-500">{errors[`passenger_${index}_passport`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>الجنسية</Label>
                <Select 
                  value={passenger.nationality} 
                  onValueChange={(value) => updatePassenger(index, 'nationality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الجنس</Label>
                <Select 
                  value={passenger.gender} 
                  onValueChange={(value) => updatePassenger(index, 'gender', value as 'male' | 'female')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>العمر</Label>
                <Input
                  type="number"
                  value={passenger.age}
                  onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 30)}
                  min="1"
                  max="100"
                />
                {errors[`passenger_${index}_age`] && (
                  <p className="text-sm text-red-500">{errors[`passenger_${index}_age`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={passenger.phone}
                  onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                  placeholder="+966501234567"
                />
                {errors[`passenger_${index}_phone`] && (
                  <p className="text-sm text-red-500">{errors[`passenger_${index}_phone`]}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render step 3: Payment and coupon
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">الكوبون وطريقة الدفع</h3>
        <p className="text-sm text-muted-foreground">أدخل كوبون الخصم واختر طريقة الدفع</p>
      </div>

      {/* Coupon section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Gift className="h-4 w-4" />
            كوبون الخصم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="أدخل كوبون الخصم"
              value={formData.coupon_code}
              onChange={(e) => setFormData(prev => ({ ...prev, coupon_code: e.target.value }))}
              onBlur={() => validateCoupon(formData.coupon_code)}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => validateCoupon(formData.coupon_code)}
              disabled={couponLoading}
            >
              {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تحقق'}
            </Button>
          </div>
          
          {couponInfo && (
            <div className={`mt-3 p-3 rounded-md ${couponInfo.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${couponInfo.valid ? 'text-green-800' : 'text-red-800'}`}>
                {couponInfo.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment method selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            طريقة الدفع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.payment_method_id.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method_id: parseInt(value) }))}
          >
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                <RadioGroupItem value={method.id.toString()} id={`payment-${method.id}`} />
                <Label htmlFor={`payment-${method.id}`} className="flex items-center gap-2 cursor-pointer">
                  {method.icon}
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Price summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ملخص الأسعار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="flex justify-between">
            <span>المبلغ الأساسي ({formData.number_of_persons} أشخاص)</span>
              <span>{calculateSubtotal().toLocaleString()} ريال</span>
            </div>
            
          {couponInfo?.valid && (
              <div className="flex justify-between text-green-600">
                <span>الخصم ({couponInfo.code})</span>
                <span>-{calculateDiscount().toLocaleString()} ريال</span>
              </div>
            )}
            
            <Separator />
          
          <div className="flex justify-between font-bold text-lg">
            <span>المجموع النهائي</span>
            <span>{calculateTotal().toLocaleString()} ريال</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Check authentication
  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          يجب تسجيل الدخول أولاً لإتمام عملية الحجز.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">حجز {packageTitle}</h2>
        <p className="text-muted-foreground">املأ البيانات المطلوبة لإتمام الحجز</p>
      </div>
          
          {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= step 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}>
                    {step}
                  </div>
                  {step < 3 && (
              <div className={cn(
                "w-16 h-1 mx-2",
                currentStep > step ? "bg-primary" : "bg-muted"
              )} />
                  )}
                </div>
              ))}
            </div>
        
      {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

            {/* Navigation buttons */}
        <div className="flex justify-between">
          <div>
                {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                    السابق
                  </Button>
                )}
          </div>
          
          <div className="flex gap-2">
                {onBookingCancel && (
              <Button type="button" variant="outline" onClick={onBookingCancel}>
                    إلغاء
                  </Button>
                )}

                {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                    التالي
                  </Button>
                ) : (
              <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري المعالجة...
                      </>
                    ) : (
                  'تأكيد الحجز'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
    </div>
  );
} 