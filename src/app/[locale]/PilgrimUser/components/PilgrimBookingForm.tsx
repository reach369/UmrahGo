'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createBooking, CreateBookingRequest } from '../services/bookingService';
import { Loader2, Plus, Minus, Trash2 } from 'lucide-react';

// تعريف مخطط التحقق من صحة الحقول
const bookingSchema = z.object({
  // معلومات الباقة
  package_id: z.string().min(1, 'يرجى اختيار باقة'),
  booking_date: z.date({
    required_error: 'يرجى تحديد تاريخ الحجز',
  }),
  number_of_persons: z.number().min(1, 'يجب أن يكون عدد المسافرين واحد على الأقل').max(10, 'الحد الأقصى 10 مسافرين'),
  special_requests: z.string().optional(),
  
  // طريقة الدفع
  payment_method_id: z.string().min(1, 'يرجى اختيار طريقة الدفع'),
  coupon_code: z.string().optional(),
  
  // قبول الشروط والأحكام
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
});

// نموذج بيانات المسافرين
const passengerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  passport_number: z.string().min(5, 'رقم الجواز غير صالح'),
  nationality: z.string().min(2, 'يرجى تحديد الجنسية'),
  gender: z.enum(['male', 'female']),
  age: z.number().min(1, 'العمر يجب أن يكون أكبر من صفر'),
  phone: z.string().min(9, 'رقم الهاتف غير صالح').optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;
type PassengerFormValues = z.infer<typeof passengerSchema>;

// الباقات المتاحة (سيتم جلبها من واجهة برمجة التطبيقات فيما بعد)
const packages = [
  { id: '1', name: 'باقة العمرة الفاخرة', price: 9177, description: '(فنادق 5 نجوم، وجبات فاخرة، مرشد خاص)', max_persons: 10 },
  { id: '2', name: 'باقة العمرة الاقتصادية', price: 5500, description: '(فنادق 4 نجوم، وجبات يومية، مرشد مشترك)', max_persons: 10 },
  { id: '3', name: 'باقة الأسرة', price: 12000, description: '(مناسبة للعائلات، خصم خاص للأطفال)', max_persons: 10 },
  { id: '4', name: 'باقة النخبة', price: 15000, description: '(خدمة VIP كاملة، سكن قريب من الحرم)', max_persons: 5 },
  { id: '5', name: 'باقة السريعة', price: 7000, description: '(3 أيام، مناسبة للزيارات القصيرة)', max_persons: 10 },
];

// طرق الدفع المتاحة
const paymentMethods = [
  { id: '1', name: 'بطاقة ائتمانية' },
  { id: '2', name: 'مدفوعات Apple' },
  { id: '3', name: 'مدى' },
  { id: '4', name: 'STC Pay' },
];

export function PilgrimBookingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('1');
  const [numOfPersons, setNumOfPersons] = useState<number>(1);
  const [passengers, setPassengers] = useState<PassengerFormValues[]>([
    { name: '', passport_number: '', nationality: '', gender: 'male', age: 30, phone: '' }
  ]);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [passengerErrors, setPassengerErrors] = useState<Array<Record<string, string>>>([{}]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      package_id: '1',
      number_of_persons: 1,
      booking_date: new Date(),
      special_requests: '',
      payment_method_id: '1',
      coupon_code: '',
      termsAccepted: false,
    },
  });

  // تحديث عدد المسافرين عند تغيير الباقة
  useEffect(() => {
    form.setValue('package_id', selectedPackage);
    const selected = packages.find(p => p.id === selectedPackage);
    // إذا كان عدد المسافرين أكبر من الحد الأقصى للباقة، قم بتحديثه
    if (selected && numOfPersons > selected.max_persons) {
      setNumOfPersons(selected.max_persons);
      form.setValue('number_of_persons', selected.max_persons);
      updatePassengersArray(selected.max_persons);
    }
  }, [selectedPackage, form]);

  // تحديث مصفوفة المسافرين عند تغيير عدد المسافرين
  const updatePassengersArray = (count: number) => {
    if (count > passengers.length) {
      // إضافة مسافرين جدد
      const newPassengers = [...passengers];
      for (let i = passengers.length; i < count; i++) {
        newPassengers.push({ name: '', passport_number: '', nationality: '', gender: 'male', age: 30, phone: '' });
      }
      setPassengers(newPassengers);
      setPassengerErrors([...passengerErrors, ...Array(count - passengers.length).fill({})]);
    } else if (count < passengers.length) {
      // إزالة المسافرين الزائدين
      setPassengers(passengers.slice(0, count));
      setPassengerErrors(passengerErrors.slice(0, count));
      if (activePassengerIndex >= count) {
        setActivePassengerIndex(count - 1);
      }
    }
  };

  // التحقق من صحة بيانات المسافر
  const validatePassenger = (passenger: PassengerFormValues, index: number) => {
    try {
      passengerSchema.parse(passenger);
      const newErrors = [...passengerErrors];
      newErrors[index] = {};
      setPassengerErrors(newErrors);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = [...passengerErrors];
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            errorMap[err.path[0]] = err.message;
          }
        });
        newErrors[index] = errorMap;
        setPassengerErrors(newErrors);
      }
      return false;
    }
  };

  // تحديث بيانات المسافر
  const updatePassenger = (index: number, field: keyof PassengerFormValues, value: any) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
    validatePassenger(newPassengers[index], index);
  };

  // تقديم النموذج
  async function onSubmit(data: BookingFormValues) {
    // التحقق من صحة بيانات جميع المسافرين
    let allPassengersValid = true;
    for (let i = 0; i < passengers.length; i++) {
      const isValid = validatePassenger(passengers[i], i);
      if (!isValid) {
        allPassengersValid = false;
      }
    }

    if (!allPassengersValid) {
      toast.error('يرجى تصحيح بيانات المسافرين');
      return;
    }

    setIsSubmitting(true);

    try {
      // إعداد بيانات الحجز للإرسال
      const bookingData: CreateBookingRequest = {
        package_id: parseInt(data.package_id),
        booking_date: data.booking_date.toISOString().split('T')[0],
        number_of_persons: data.number_of_persons,
        booking_type: 'package',
        payment_method_id: parseInt(data.payment_method_id),
        passengers: passengers.map(p => ({
          name: p.name,
          passport_number: p.passport_number,
          nationality: p.nationality,
          gender: p.gender,
          age: p.age,
          phone: p.phone || ''
        })),
        special_requests: data.special_requests,
      };

      if (data.coupon_code) {
        bookingData.coupon_code = data.coupon_code;
      }

      // إرسال الحجز
      const response = await createBooking(bookingData);

      if (response.status && response.data) {
      toast.success('تم الحجز بنجاح! سيتم إرسال تفاصيل الحجز إلى بريدك الإلكتروني');
        // الانتقال إلى صفحة تأكيد الحجز
        setTimeout(() => {
          router.push(`/PilgrimUser/booking?success=true&booking_id=${response.data.id}`);
        }, 1500);
      } else {
        throw new Error('حدث خطأ أثناء إنشاء الحجز');
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      toast.error('حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  }

  // حساب إجمالي السعر
  const calculateTotal = () => {
    const package_ = packages.find(p => p.id === selectedPackage);
    return package_ ? package_.price * numOfPersons : 0;
  };

  // زيادة عدد المسافرين
  const increasePersons = () => {
    const selected = packages.find(p => p.id === selectedPackage);
    if (selected && numOfPersons < selected.max_persons) {
      const newCount = numOfPersons + 1;
      setNumOfPersons(newCount);
      form.setValue('number_of_persons', newCount);
      updatePassengersArray(newCount);
    } else {
      toast.info(`عذراً، الحد الأقصى للمسافرين في هذه الباقة هو ${selected?.max_persons}`);
    }
  };

  // إنقاص عدد المسافرين
  const decreasePersons = () => {
    if (numOfPersons > 1) {
      const newCount = numOfPersons - 1;
      setNumOfPersons(newCount);
      form.setValue('number_of_persons', newCount);
      updatePassengersArray(newCount);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">حجز رحلة العمرة</CardTitle>
        <CardDescription className="text-center">يرجى ملء النموذج لإكمال الحجز</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* معلومات الباقة */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">تفاصيل الباقة</h3>
              <FormField
                control={form.control}
                name="package_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختر الباقة</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedPackage(value);
                      }} 
                      defaultValue={field.value}
                    >
                    <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الباقة" />
                        </SelectTrigger>
                    </FormControl>
                      <SelectContent>
                        {packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.price} ر.س {pkg.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="booking_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الحجز</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        disablePastDates={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number_of_persons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد المسافرين</FormLabel>
                    <div className="flex items-center space-x-2 gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={decreasePersons}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">{numOfPersons}</div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={increasePersons}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="special_requests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طلبات خاصة</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أي طلبات خاصة للحجز (اختياري)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* بيانات المسافرين */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">بيانات المسافرين</h3>
              
              {/* أزرار التبديل بين المسافرين */}
              <div className="flex flex-wrap gap-2">
                {passengers.map((_, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={activePassengerIndex === index ? "default" : "outline"}
                    className="px-3 py-1 h-8"
                    onClick={() => setActivePassengerIndex(index)}
                  >
                    مسافر {index + 1}
                    {Object.keys(passengerErrors[index] || {}).length > 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    )}
                  </Button>
                ))}
              </div>
              
              {/* نموذج بيانات المسافر النشط */}
              <div className="p-4 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الاسم */}
                  <div>
                    <label className="text-sm font-medium">الاسم الكامل</label>
                    <Input 
                      placeholder="الاسم كما في الجواز" 
                      value={passengers[activePassengerIndex]?.name || ''} 
                      onChange={(e) => updatePassenger(activePassengerIndex, 'name', e.target.value)}
                      className={passengerErrors[activePassengerIndex]?.name ? 'border-red-500' : ''}
                    />
                    {passengerErrors[activePassengerIndex]?.name && (
                      <p className="text-sm text-red-500 mt-1">{passengerErrors[activePassengerIndex].name}</p>
                    )}
                  </div>
                  
                  {/* رقم الجواز */}
                  <div>
                    <label className="text-sm font-medium">رقم الجواز</label>
                    <Input 
                      placeholder="رقم جواز السفر" 
                      value={passengers[activePassengerIndex]?.passport_number || ''} 
                      onChange={(e) => updatePassenger(activePassengerIndex, 'passport_number', e.target.value)}
                      className={passengerErrors[activePassengerIndex]?.passport_number ? 'border-red-500' : ''}
                    />
                    {passengerErrors[activePassengerIndex]?.passport_number && (
                      <p className="text-sm text-red-500 mt-1">{passengerErrors[activePassengerIndex].passport_number}</p>
                    )}
                  </div>
                  
                  {/* الجنسية */}
                  <div>
                    <label className="text-sm font-medium">الجنسية</label>
                    <Input 
                      placeholder="الجنسية" 
                      value={passengers[activePassengerIndex]?.nationality || ''} 
                      onChange={(e) => updatePassenger(activePassengerIndex, 'nationality', e.target.value)}
                      className={passengerErrors[activePassengerIndex]?.nationality ? 'border-red-500' : ''}
                    />
                    {passengerErrors[activePassengerIndex]?.nationality && (
                      <p className="text-sm text-red-500 mt-1">{passengerErrors[activePassengerIndex].nationality}</p>
                    )}
                  </div>
                  
                  {/* العمر */}
                  <div>
                    <label className="text-sm font-medium">العمر</label>
                    <Input 
                      type="number" 
                      placeholder="العمر" 
                      value={passengers[activePassengerIndex]?.age || ''} 
                      onChange={(e) => updatePassenger(activePassengerIndex, 'age', parseInt(e.target.value) || 0)}
                      className={passengerErrors[activePassengerIndex]?.age ? 'border-red-500' : ''}
                    />
                    {passengerErrors[activePassengerIndex]?.age && (
                      <p className="text-sm text-red-500 mt-1">{passengerErrors[activePassengerIndex].age}</p>
                    )}
                  </div>
                  
                  {/* الجنس */}
                  <div>
                    <label className="text-sm font-medium">الجنس</label>
                    <Select
                      value={passengers[activePassengerIndex]?.gender || 'male'}
                      onValueChange={(value: 'male' | 'female') => updatePassenger(activePassengerIndex, 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                    {passengerErrors[activePassengerIndex]?.gender && (
                      <p className="text-sm text-red-500 mt-1">{passengerErrors[activePassengerIndex].gender}</p>
                    )}
                  </div>
                  
                  {/* رقم الهاتف */}
                  <div>
                    <label className="text-sm font-medium">رقم الهاتف (اختياري)</label>
                    <Input 
                      placeholder="رقم الهاتف" 
                      value={passengers[activePassengerIndex]?.phone || ''} 
                      onChange={(e) => updatePassenger(activePassengerIndex, 'phone', e.target.value)}
                      className={passengerErrors[activePassengerIndex]?.phone ? 'border-red-500' : ''}
                    />
                    {passengerErrors[activePassengerIndex]?.phone && (
                      <p className="text-sm text-red-500 mt-1">{passengerErrors[activePassengerIndex].phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات الدفع */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">معلومات الدفع</h3>
              <FormField
                control={form.control}
                name="payment_method_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة الدفع</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coupon_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كود الخصم (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل كود الخصم إن وجد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* إجمالي السعر */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>سعر الباقة للشخص:</span>
                  <span>{packages.find(p => p.id === selectedPackage)?.price || 0} ر.س</span>
                        </div>
                <div className="flex justify-between mb-2">
                  <span>عدد المسافرين:</span>
                  <span>{numOfPersons}</span>
                        </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي:</span>
                  <span>{calculateTotal().toLocaleString()} ر.س</span>
            </div>
              </div>

              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0 gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        أوافق على الشروط والأحكام وسياسة الخصوصية
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري إتمام الحجز...
                </>
              ) : (
                'تأكيد الحجز'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 