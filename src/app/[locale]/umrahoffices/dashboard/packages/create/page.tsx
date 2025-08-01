'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft, Save, Calendar,
  Plus, Trash2, Image as ImageIcon,
  DollarSign, X, Loader2,
  Package as PackageIcon
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import LocationPicker from '@/components/maps/LocationPicker';
import { MapLocation } from '@/lib/google-maps';

// Types
interface PackageFormData {
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  discount_price?: number;
  starting_date?: string;
  ending_date?: string;
  max_people?: number;
  unlimited_persons: boolean;
  is_featured: boolean;
  destination?: string;
  destination_location?: string;
  meeting_location?: string;
  start_location?: string;
  end_location?: string;
  includes_accommodation: boolean;
  includes_transport: boolean;
  includes_meals: boolean;
  includes_guide: boolean;
  includes_insurance: boolean;
  includes_activities: boolean;
  features: string[];
  accommodation_pricing: Array<{
    key: string;
    name: string;
    type: 'عائلي' | 'عزابي';
    price: number;
  }>;
  hotels: Array<{
    id: number;
    nights: number;
    room_type?: string;
  }>;
  images: File[];
}

// Validation Schema
const packageSchema = z.object({
  name: z.string().min(1, 'اسم الباقة مطلوب'),
  description: z.string().optional(),
  duration: z.number().min(1, 'مدة الرحلة مطلوبة').nonnegative('يجب أن تكون المدة رقماً موجباً').nullable()
    .refine(val => val !== null && val > 0, 'يجب أن تكون المدة أكبر من صفر'),
  price: z.number().min(0, 'السعر مطلوب').nonnegative('يجب أن يكون السعر رقماً موجباً').nullable()
    .refine(val => val !== null && val >= 0, 'يجب أن يكون السعر صفراً أو أكثر'),
  discount_price: z.number().min(0).nullable().optional(),
  starting_date: z.string().optional(),
  ending_date: z.string().optional(),
  max_people: z.number().min(1, 'عدد الأشخاص مطلوب').nonnegative('يجب أن يكون عدد الأشخاص رقماً موجباً').nullable().optional(),
  unlimited_persons: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  destination: z.string().optional(),
  destination_location: z.string().optional(),
  meeting_location: z.string().optional(),
  start_location: z.string().optional(),
  end_location: z.string().optional(),
  includes_accommodation: z.boolean().default(false),
  includes_transport: z.boolean().default(false),
  includes_meals: z.boolean().default(false),
  includes_guide: z.boolean().default(false),
  includes_insurance: z.boolean().default(false),
  includes_activities: z.boolean().default(false),
  features: z.array(z.string()).default([]),
  accommodation_pricing: z.array(z.object({
    key: z.string(),
    name: z.string(),
    type: z.enum(['عائلي', 'عزابي']),
    price: z.number().min(0)
  })).default([]),
  hotels: z.array(z.object({
    id: z.number(),
    nights: z.number().min(1),
    room_type: z.string().optional()
  })).default([]),
  images: z.array(z.any()).default([])
}).refine((data) => {
  // If unlimited_persons is false, max_people is required
  if (!data.unlimited_persons && (!data.max_people || data.max_people <= 0)) {
    return false;
  }
  return true;
}, {
  message: "عدد الأشخاص مطلوب عندما لا يكون العدد غير محدود",
  path: ["max_people"]
});

// Temporary Services - Mock implementations
const packagesService = {
  async createPackage(formData: FormData) {
    // This is a mock implementation
    console.log('Creating package with data:', formData);
    return {
      data: { id: Math.random().toString(36).substring(2, 11) },
      message: 'Package created successfully'
    };
  }
};

const hotelsService = {
  async getHotels(_params: { per_page: number }) {
    // This is a mock implementation
    return {
      data: [
        { id: 1, name: 'فندق الحرم' },
        { id: 2, name: 'فندق المدينة' },
        { id: 3, name: 'فندق الإيمان' }
      ]
    };
  }
};


export default function CreatePackagePage() {
    const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();

  // States
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [hotels, setHotels] = useState<any[]>([]);

  const [isCreating, setIsCreating] = useState(false);

  // Form
  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      duration: undefined,
      price: undefined,
      discount_price: undefined,
      starting_date: '',
      ending_date: '',
        max_people: undefined,
      is_featured: false,
      unlimited_persons: false,
      includes_accommodation: false,
      includes_transport: false,
      includes_meals: false,
      includes_guide: false,
      includes_insurance: false,
      includes_activities: false,
      features: [],
      accommodation_pricing: [],
      hotels: [],
      images: []
    },
    mode: 'onChange' // إضافة وضع التحقق عند تغيير القيمة
  });

  const {
    fields: featuresFields,
    append: appendFeature,
    remove: removeFeature
  } = useFieldArray({
    control: form.control,
    name: 'features' as any
  });

  const { 
    fields: accommodationFields, 
    append: appendAccommodation, 
    remove: removeAccommodation 
  } = useFieldArray({
    control: form.control,
    name: 'accommodation_pricing'
  });

  const { 
    fields: hotelsFields, 
    append: appendHotel, 
    remove: removeHotel 
  } = useFieldArray({
    control: form.control,
    name: 'hotels'
  });

  // Load hotels on mount
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const response = await hotelsService.getHotels({ per_page: 100 });
        if (response.data) {
          setHotels(response.data);
        }
      } catch (error) {
        console.error('Error loading hotels:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحميل قائمة الفنادق"
        });
      }
    };

    loadHotels();
  }, [toast]);

  // Automatic duration calculation based on start and end dates
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'starting_date' || name === 'ending_date') {
        const startDate = value.starting_date;
        const endDate = value.ending_date;

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (start <= end) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Only update if the calculated duration is different from current value
            if (form.getValues('duration') !== diffDays) {
              form.setValue('duration', diffDays);
            }
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // لتحديث عنوان التبويب عند وجود أخطاء
  useEffect(() => {
    const tabsWithErrors = {
      basic: ['name', 'duration', 'max_people', 'price'],
      details: ['ending_date'],
      pricing: ['price', 'discount_price'],
      media: ['images']
    };
    
    if (form.formState.isSubmitted) {
      const formErrors = form.formState.errors;
      
      // التحقق من وجود أخطاء في التبويب الحالي
      if (Object.keys(formErrors).some(field => tabsWithErrors[activeTab]?.includes(field))) {
        // البقاء في التبويب الحالي إذا كان يحتوي على أخطاء
        return;
      }
      
      // الانتقال إلى التبويب الذي يحتوي على أخطاء
      for (const [tab, fields] of Object.entries(tabsWithErrors)) {
        if (fields.some(field => formErrors[field])) {
          setActiveTab(tab);
          break;
        }
      }
    }
  }, [form.formState.errors, form.formState.isSubmitted]);

  // Handlers
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (location: MapLocation) => {
    form.setValue('destination_location', `${location.lat},${location.lng}`);
    form.setValue('destination', location.address || '');
  };

  const handleAddressChange = (address: string) => {
    form.setValue('destination', address);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      appendFeature(newFeature.trim());
      setNewFeature('');
    }
  };



  const handleAddAccommodation = () => {
    appendAccommodation({
      key: `acc_${Date.now()}`,
      name: '',
      type: 'عائلي',
      price: 0
    });
  };

  const handleAddHotel = () => {
    appendHotel({
      id: 0,
      nights: 1,
      room_type: 'standard'
    });
  };

  // تحسين تقديم النموذج مع التحقق من الأخطاء
  const onSubmit = async (data: PackageFormData) => {
    // التأكد من عدم وجود أخطاء في النموذج
    const formErrors = form.formState.errors;
    
    if (Object.keys(formErrors).length > 0) {
      // عرض رسالة خطأ
      toast({
        variant: "destructive",
        title: "تعذر إنشاء الباقة",
        description: "يرجى التأكد من إدخال جميع البيانات المطلوبة بشكل صحيح"
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'images') return; // Handle separately
        if (key === 'features' || key === 'accommodation_pricing' || key === 'hotels') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const result = await packagesService.createPackage(formData);
      
      toast({
        title: "تم إنشاء الباقة بنجاح",
        description: "تم إنشاء الباقة الجديدة بنجاح"
      });
      
      router.push(`/${locale}/umrahoffices/dashboard/packages/${result.data?.id || ''}`);
    } catch (error: any) {
      console.error('Error creating package:', error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الباقة", 
        description: error?.message || "فشل في إنشاء الباقة. يرجى المحاولة مرة أخرى"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" onClick={handleBack} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">إضافة باقة جديدة</h1>
              <p className="text-gray-600 dark:text-gray-400">أنشئ باقة عمرة جديدة لمكتبك</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-xl">
              <PackageIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
              <TabsTrigger
                value="basic"
                className="relative data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <PackageIcon className="w-4 h-4 mr-2" />
                المعلومات الأساسية
                {form.formState.isSubmitted &&
                  (form.formState.errors.name || form.formState.errors.duration || form.formState.errors.max_people) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="relative data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <Calendar className="w-4 h-4 mr-2" />
                التفاصيل
                {form.formState.isSubmitted && form.formState.errors.ending_date && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="pricing"
                className="relative data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                الأسعار
                {form.formState.isSubmitted &&
                  (form.formState.errors.price || form.formState.errors.discount_price) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 rounded-lg transition-all duration-200"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                الوسائط
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-foreground dark:text-gray-100 text-xl font-semibold flex items-center">
                    <PackageIcon className="w-5 h-5 mr-3 text-blue-500" />
                    المعلومات الأساسية
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">أدخل المعلومات الأساسية للباقة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-foreground dark:text-gray-200">
                          اسم الباقة <span className="text-red-500 mr-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل اسم الباقة"
                            className="bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground dark:text-gray-200">الوصف</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل وصف الباقة"
                            className="min-h-[100px] bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-foreground dark:text-gray-200">
                            {t('packages.duration')} <span className="text-red-500 mr-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder={t('packages.durationAutoCalculatedPlaceholder')}
                                readOnly
                                {...field}
                                value={field.value || ''}
                                className={`bg-gray-50 dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-gray-100 ${form.formState.errors.duration ? "border-red-500" : ""}`}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-xs text-muted-foreground dark:text-gray-400">{t('packages.durationAutoLabel')}</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                          <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                            {t('packages.durationAutoCalculated')}
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_people"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-foreground dark:text-gray-200">
                            {t('packages.maxPeople')} {!form.watch('unlimited_persons') && <span className="text-red-500 mr-1">*</span>}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder={form.watch('unlimited_persons') ? t('packages.unlimited') : t('packages.maxPeople')}
                                disabled={form.watch('unlimited_persons')}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                                value={form.watch('unlimited_persons') ? '' : (field.value || '')}
                                className={`bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-400 ${form.formState.errors.max_people ? "border-red-500" : ""} ${form.watch('unlimited_persons') ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                              />
                              {form.watch('unlimited_persons') && (
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">∞ {t('packages.unlimited')}</span>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500" />
                          {form.watch('unlimited_persons') && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              {t('packages.unlimitedPersonsEnabled')}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unlimited_persons"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border dark:border-gray-600 bg-card dark:bg-gray-800 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base text-foreground dark:text-gray-100">{t('packages.unlimitedPersons')}</FormLabel>
                            <FormDescription className="text-muted-foreground dark:text-gray-400">{t('packages.unlimitedPersonsDescription')}</FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                // Clear max_people when unlimited is enabled
                                if (checked) {
                                  form.setValue('max_people', undefined);
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">باقة مميزة</FormLabel>
                          <FormDescription>إظهار هذه الباقة كباقة مميزة</FormDescription>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">معلومات الموقع</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">حدد موقع وتفاصيل الرحلة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوجهة</FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل الوجهة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location Picker */}
                  <div>
                    <Label>اختر الموقع على الخريطة</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        onAddressChange={handleAddressChange}
                        height="300px"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>موقع البداية</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل موقع البداية" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>موقع النهاية</FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل موقع النهاية" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              {/* Dates */}
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">التواريخ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="starting_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ البداية</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ending_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ النهاية</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Inclusions */}
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">المشمولات</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">اختر ما تشمله الباقة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="includes_accommodation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel className="text-base">الإقامة</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includes_transport"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel className="text-base">النقل</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includes_meals"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel className="text-base">الوجبات</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includes_guide"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel className="text-base">المرشد السياحي</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includes_insurance"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel className="text-base">التأمين</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="includes_activities"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <FormLabel className="text-base">الأنشطة</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">الميزات</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">أضف ميزات إضافية للباقة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* English Features */}
                  <div>
                    <Label>الميزات باللغة الإنجليزية</Label>
                    <div className="space-y-2 mt-2">
                      {featuresFields.map((field, index) => (
                        <div key={field.id} className="flex items-center space-x-2 space-x-reverse">
                          <Input
                            value={form.watch(`features.${index}`) || ''}
                            onChange={(e) => form.setValue(`features.${index}`, e.target.value)}
                            placeholder="أدخل الميزة"
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="أدخل ميزة جديدة"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                        />
                        <Button type="button" onClick={handleAddFeature}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>


                </CardContent>
              </Card>

              {/* Hotels */}
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">الفنادق</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">اختر الفنادق المتضمنة في الباقة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hotelsFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-4 space-x-reverse p-4 border rounded-lg">
                      <div className="flex-1">
                        <Select
                          value={String(form.watch(`hotels.${index}.id`))}
                          onValueChange={(value) => form.setValue(`hotels.${index}.id`, parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفندق" />
                          </SelectTrigger>
                          <SelectContent>
                            {hotels.map((hotel) => (
                              <SelectItem key={hotel.id} value={String(hotel.id)}>
                                {hotel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="الليالي"
                          value={form.watch(`hotels.${index}.nights`)}
                          onChange={(e) => form.setValue(`hotels.${index}.nights`, parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          placeholder="نوع الغرفة"
                          value={form.watch(`hotels.${index}.room_type`) || ''}
                          onChange={(e) => form.setValue(`hotels.${index}.room_type`, e.target.value)}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeHotel(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={handleAddHotel} variant="outline">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة فندق
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              {/* Basic Pricing */}
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">الأسعار الأساسية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price */}
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            السعر الأساسي <span className="text-red-500 mr-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              value={field.value || ''}
                              className={form.formState.errors.price ? "border-red-500" : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    {/* Discount Price */}
                    <FormField
                      control={form.control}
                      name="discount_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر الخصم</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              value={field.value || ''}
                              className={form.formState.errors.discount_price ? "border-red-500" : ""}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                          <FormDescription>
                            يجب أن يكون سعر الخصم أقل من السعر الأساسي
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Accommodation Pricing */}
                  <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-foreground dark:text-gray-100">أسعار الإقامة</CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-gray-400">حدد أسعار مختلفة لأنواع الإقامة</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {accommodationFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                          <Input
                            placeholder="اسم الإقامة"
                            value={form.watch(`accommodation_pricing.${index}.name`)}
                            onChange={(e) => form.setValue(`accommodation_pricing.${index}.name`, e.target.value)}
                          />
                          <Select
                            value={form.watch(`accommodation_pricing.${index}.type`)}
                            onValueChange={(value) => form.setValue(`accommodation_pricing.${index}.type`, value as 'عائلي' | 'عزابي')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="عائلي">عائلي</SelectItem>
                              <SelectItem value="عزابي">عزابي</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="السعر"
                            value={form.watch(`accommodation_pricing.${index}.price`)}
                            onChange={(e) => form.setValue(`accommodation_pricing.${index}.price`, parseFloat(e.target.value) || 0)}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeAccommodation(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" onClick={handleAddAccommodation} variant="outline">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة خيار إقامة
                      </Button>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-gray-100">صور الباقة</CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-400">أضف صوراً للباقة لجذب المزيد من العملاء</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <Label htmlFor="images">رفع الصور</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="mt-2"
                    />
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div>
                      <Label>الصور المختارة</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`معاينة ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Buttons */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 shadow-lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    إنشاء الباقة
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* عرض الأخطاء العامة */}
          {form.formState.isSubmitted && Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                يرجى التحقق من الحقول المطلوبة والمشار إليها باللون الأحمر
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
      </div>
    </div>
  );
}