'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const bookingSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  idNumber: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  email: z.string().email('البريد الإلكتروني غير صالح'),

  // Booking Information
  departureDate: z.date(),
  returnDate: z.date(),
  packageType: z.enum(['single', 'double', 'triple', 'quad', 'transport']),
  quantity: z.number().min(1, 'يجب اختيار عدد المقاعد'),

  // Payment Information
  paymentMethod: z.enum(['credit_card', 'apple_pay', 'mada']),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const packages = [
  { id: 'single', name: 'فردي', price: 600.0, description: '(السكن والمواصلات)' },
  { id: 'double', name: 'ثنائي', price: 1500.0, description: '(السكن والمواصلات)' },
  { id: 'triple', name: 'ثلاثي', price: 1950.0, description: '(السكن والمواصلات)' },
  { id: 'quad', name: 'رباعي', price: 2400.0, description: '(السكن والمواصلات)' },
  { id: 'transport', name: 'مواصلات فقط', price: 450.0, description: '' },
];

export function PilgrimBookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('single');
  const [quantity, setQuantity] = useState<number>(1);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      quantity: 1,
      paymentMethod: 'credit_card',
      termsAccepted: false,
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    try {
      // TODO: Implement booking submission logic
      console.log(data);
      toast.success('تم الحجز بنجاح! سيتم إرسال تفاصيل الحجز إلى بريدك الإلكتروني');
    } catch (error) {
      console.error('Booking submission failed:', error);
      toast.error('حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  }

  const calculateTotal = () => {
    const package_ = packages.find(p => p.id === selectedPackage);
    return package_ ? package_.price * quantity : 0;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">حجز رحلة العمرة</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">المعلومات الشخصية</h3>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسمك الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهوية</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رقم الهوية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رقم الهاتف" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل البريد الإلكتروني" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Booking Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">تفاصيل الحجز</h3>
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ السفر</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ العودة</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الباقة</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedPackage(value);
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الباقة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packages.map((pkg, index) => (
                          <SelectItem key={`package-${pkg.id}-${index}`} value={pkg.id}>
                            {pkg.name} - {pkg.price} ريال {pkg.description}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عدد المقاعد</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={quantity.toString()}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 1 : parseInt(e.target.value);
                            const validValue = isNaN(value) ? 1 : Math.max(1, value);
                            setQuantity(validValue);
                            field.onChange(validValue);
                          }}
                          className="w-20 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">معلومات الدفع</h3>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>طريقة الدفع</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit_card" id="credit_card" />
                          <label htmlFor="credit_card">بطاقة ائتمان</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apple_pay" id="apple_pay" />
                          <label htmlFor="apple_pay">Apple Pay</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mada" id="mada" />
                          <label htmlFor="mada">مدى</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total and Terms */}
            <div className="space-y-4">
              <div className="text-xl font-bold text-right">
                المجموع: {calculateTotal().toFixed(1)} ريال
              </div>
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        أوافق على الشروط والأحكام
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 