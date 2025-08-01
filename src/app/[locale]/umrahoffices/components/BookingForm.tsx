'use client';

import { useState, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon } from 'lucide-react';

const bookingSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  idNumber: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل'),
  nationality: z.string().min(1, 'الرجاء اختيار الجنسية'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),

  // Booking Information
  departureDate: z.date(),
  returnDate: z.date(),
  departureCity: z.string().min(1, 'الرجاء اختيار مدينة الانطلاق'),
  officeId: z.string().min(1, 'الرجاء اختيار المكتب'),
  packageId: z.string().min(1, 'الرجاء اختيار الباقة'),
  busType: z.string().min(1, 'الرجاء اختيار نوع الباص'),
  numberOfCompanions: z.number().min(0),

  // Payment Information
  paymentMethod: z.string().min(1, 'الرجاء اختيار طريقة الدفع'),
  paymentConfirmed: z.boolean().refine((val) => val === true, {
    message: 'يجب تأكيد الدفع',
  }),

  // Terms and Conditions
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'يجب الموافقة على الشروط والأحكام',
  }),

  packageType: z.enum(['single', 'double', 'triple', 'quad', 'transport']),
  quantity: z.number().min(0),
});

const pilgrimSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم المعتمر'),
  idNumber: z.string().min(1, 'يرجى إدخال رقم الهوية'),
  phone: z.string().min(1, 'يرجى إدخال رقم الهاتف'),
  idImage: z.any().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;
type PilgrimFormValues = z.infer<typeof pilgrimSchema>;

const packages = [
  { id: 'single', name: 'فردي', price: 600.0, description: '(السكن والمواصلات)' },
  { id: 'double', name: 'ثنائي', price: 1500.0, description: '(السكن والمواصلات)' },
  { id: 'triple', name: 'ثلاثي', price: 1950.0, description: '(السكن والمواصلات)' },
  { id: 'quad', name: 'رباعي', price: 2400.0, description: '(السكن والمواصلات)' },
  { id: 'transport', name: 'مواصلات فقط', price: 450.0, description: '' },
];

export function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    single: 1,
    double: 1,
    triple: 1,
    quad: 1,
    transport: 1,
  });
  const [selectedPackage, setSelectedPackage] = useState<string>('single');
  const [isAddPilgrimOpen, setIsAddPilgrimOpen] = useState(false);
  const [idImage, setIdImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfCompanions: 0,
      paymentConfirmed: false,
      termsAccepted: false,
      packageType: 'single',
      quantity: 1,
      paymentMethod: 'electronic',
    },
  });

  const pilgrimForm = useForm<PilgrimFormValues>({
    resolver: zodResolver(pilgrimSchema),
    defaultValues: {
      name: '',
      idNumber: '',
      phone: '',
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    try {
      // TODO: Implement booking submission logic
      console.log(data);
    } catch (error) {
      console.error('Booking submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const calculateTotal = () => {
    const package_ = packages.find(p => p.id === selectedPackage);
    return package_ ? package_.price * quantities[selectedPackage] : 0;
  };

  const handleQuantityChange = (packageId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [packageId]: Math.max(0, prev[packageId] + change),
    }));
  };

  const onSubmitPilgrim = (data: PilgrimFormValues) => {
    console.log('Pilgrim data:', data);
    setIsAddPilgrimOpen(false);
    // TODO: Handle pilgrim data submission
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdImage(file);
      pilgrimForm.setValue('idImage', file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className=" rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg">أنت</h2>
          <Button 
            variant="default" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsAddPilgrimOpen(true)}
          >
            إضافة معتمر
          </Button>
        </div>
        <div className="text-amber-600 font-semibold">
          المبلغ الكلي: {calculateTotal().toFixed(1)} ريال
        </div>
      </div>

      <Dialog open={isAddPilgrimOpen} onOpenChange={setIsAddPilgrimOpen}>
        <DialogContent className="sm:max-w-[425px]  dark:bg-slate-950 border-0">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-right text-xl font-bold">يرجاء ادخال بيانات المعتمر</DialogTitle>
          </DialogHeader>
          <Form {...pilgrimForm}>
            <form onSubmit={pilgrimForm.handleSubmit(onSubmitPilgrim)} className="space-y-6 mt-4">
              <FormField
                control={pilgrimForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block font-semibold">اسم المعتمر</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ادخل اسم المعتمر" 
                        className="text-right bg-gray-50 dark:bg-slate-900" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pilgrimForm.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block font-semibold">رقم الهوية</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="ادخل رقم الهوية" 
                          className="text-right bg-gray-50 dark:bg-slate-900" 
                          {...field} 
                        />
                      </FormControl>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
                        onClick={triggerFileUpload}
                      >
                        <ImageIcon className="w-4 h-4" />
                        {idImage ? 'تم إرفاق الصورة' : 'إرفاق صورة الهوية'}
                      </Button>
                    </div>
                    {idImage && (
                      <div className="mt-2 text-sm text-emerald-600 text-right">
                        تم إرفاق: {idImage.name}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pilgrimForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right block font-semibold">رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="50 000 0000" 
                        className="text-right bg-gray-50 dark:bg-slate-900" 
                        dir="ltr"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between mt-6 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddPilgrimOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                  إضافة
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="text-right text-gray-600">
              يرجاء اختيار الباقة التي ترغب فيها
            </div>
            
            <Form {...form}>
              <form className="space-y-6">
                <div className="space-y-4">
                  {packages.map((package_) => (
                    <div
                      key={package_.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                      onClick={() => setSelectedPackage(package_.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(package_.id, -1);
                            }}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{quantities[package_.id]}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(package_.id, 1);
                            }}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          <span>{package_.price.toFixed(1)} ريال</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{package_.name}</span>
                        <span className="text-sm text-gray-500">{package_.description}</span>
                        <RadioGroup
                          defaultValue={selectedPackage}
                          value={selectedPackage}
                          onValueChange={setSelectedPackage}
                        >
                          <RadioGroupItem value={package_.id} />
                        </RadioGroup>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="text-right">ما هي طريقة الدفع؟</div>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="cash" id="cash" />
                              <label htmlFor="cash">كاش</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="electronic" id="electronic" />
                              <label htmlFor="electronic">دفع إلكتروني</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    دفع
                  </Button>
                  <div className="text-amber-600 font-semibold">
                    المبلغ الكلي: {calculateTotal().toFixed(1)} ريال
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 