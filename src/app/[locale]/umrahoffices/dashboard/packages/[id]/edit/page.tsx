'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  MapPin,
  Hotel,
  Star,
  DollarSign,
  Calendar,
  Package as PackageIcon,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import LocationPicker from '@/components/maps/LocationPicker';
import { MapLocation } from '@/lib/google-maps';
import {
  useGetPackageQuery,
  useGetPackagesQuery,
  useUpdatePackageMutation,
  UpdatePackageRequest,
  AccommodationPricing,
  Package
} from '../../../../redux/api/packagesApiSlice';
import { useGetHotelsQuery } from '../../../../redux/api/hotelsApiSlice';
import { getValidImageUrl } from '@/utils/image-helpers';

interface FormData {
  // Basic info
  name: string;
  description: string;
  duration: number | null;
  price: number | null;
  discount_price: number | null;
  starting_date: string;
  ending_date: string;
  max_people: number | null;
  unlimited_persons: boolean;
  is_featured: boolean;
  status: 'active' | 'inactive' | 'draft' | 'suspended' | 'archived' | 'deleted' | 'pending';

  // Location info
  destination: string;
  destination_location: string;
  meeting_location: string;
  start_location: string;
  end_location: string;

  // Includes
  includes_accommodation: boolean;
  includes_transport: boolean;
  includes_meals: boolean;
  includes_guide: boolean;
  includes_insurance: boolean;
  includes_activities: boolean;

  // Features
  features: string[];

  // Accommodation pricing
  accommodation_pricing: AccommodationPricing[];

  // Hotels
  hotels: { id: number; nights: number; room_type: string }[];

  // Images
  images: File[];
  delete_images: number[];
}

export default function EditPackagePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const packageId = parseInt(params?.id as string);

  // State
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    duration: null,
    price: null,
    discount_price: null,
    starting_date: '',
    ending_date: '',
    max_people: null,
    unlimited_persons: false,
    is_featured: false,
    status: 'active',
    destination: '',
    destination_location: '',
    meeting_location: '',
    start_location: '',
    end_location: '',
    includes_accommodation: true,
    includes_transport: true,
    includes_meals: false,
    includes_guide: false,
    includes_insurance: false,
    includes_activities: false,
    features: [],
    accommodation_pricing: [],
    hotels: [],
    images: [],
    delete_images: []
  });

  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newFeature, setNewFeature] = useState('');
  const [currentTab, setCurrentTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { locale } = useParams() as { locale: string };
  // API hooks
  const {
    data: packageResponse,
    isLoading: isLoadingPackage,
    error: packageError
  } = useGetPackageQuery(packageId);
  
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  const { data: hotelsResponse } = useGetHotelsQuery({});
  const { data: packagesResponse } = useGetPackagesQuery({});

  const package_ = packageResponse?.data;
  const hotels = hotelsResponse?.data?.data || [];
  const packages = packagesResponse?.data?.data || [];
  const status = package_?.status || "active";

  // Navigation state
  const currentIndex = packages.findIndex((pkg: Package) => pkg.id === packageId);
  const previousPackage = currentIndex > 0 ? packages[currentIndex - 1] : null;
  const nextPackage = currentIndex < packages.length - 1 ? packages[currentIndex + 1] : null;

  // Initialize form data when package is loaded
  useEffect(() => {
    if (package_) {
      // Fix status type issue - only allow valid status values
      const validStatuses = ['active', 'inactive', 'draft'] as const;
      const packageStatus = validStatuses.includes(package_.status as any) 
        ? package_.status as 'active' | 'inactive' | 'draft'
        : 'active';

      setFormData({
        name: package_.name || '',
        description: package_.description || '',
        duration: package_.duration || null,
        price: package_.price || null,
        discount_price: package_.discount_price || null,
        starting_date: package_.starting_date ? package_.starting_date.split('T')[0] : '',
        ending_date: package_.ending_date ? package_.ending_date.split('T')[0] : '',
        max_people: package_.max_people || null,
        unlimited_persons: false,
        is_featured: package_.is_featured || false,
        status: packageStatus,
        destination: package_.destination || '',
        destination_location: package_.destination_location || '',
        meeting_location: package_.meeting_location || '',
        start_location: package_.start_location || '',
        end_location: package_.end_location || '',
        includes_accommodation: package_.includes_accommodation || false,
        includes_transport: package_.includes_transport || false,
        includes_meals: package_.includes_meals || false,
        includes_guide: package_.includes_guide || false,
        includes_insurance: package_.includes_insurance || false,
        includes_activities: package_.includes_activities || false,
        features: package_.features || [],
        accommodation_pricing: package_.accommodation_pricing && Array.isArray(package_.accommodation_pricing) ? package_.accommodation_pricing : [],
        hotels: package_.hotels?.map(hotel => ({
          id: hotel.id,
          nights: hotel.pivot?.nights || 1,
          room_type: hotel.pivot?.room_type || 'standard'
        })) || [],
        images: [],
        delete_images: []
      });

      // Set existing images
      setExistingImages(package_.images || []);

      // Set location if available
      if (package_.destination_location) {
        const [lat, lng] = package_.destination_location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedLocation({ lat, lng });
        }
      }
    }
  }, [package_]);

  // Automatic duration calculation based on start and end dates
  useEffect(() => {
    const startDate = formData.starting_date;
    const endDate = formData.ending_date;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start <= end) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Only update if the calculated duration is different from current value
        if (formData.duration !== diffDays) {
          setFormData(prev => ({ ...prev, duration: diffDays }));
        }
      }
    }
  }, [formData.starting_date, formData.ending_date, formData.duration]);

  // Handlers
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      destination_location: `${location.lat},${location.lng}`
    }));
  };

  const handleAddressChange = (address: string) => {
    if (!formData.destination) {
      setFormData(prev => ({ ...prev, destination: address }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ليس ملف صورة صالح`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} حجم الملف كبير جداً (الحد الأقصى 5MB)`);
        return;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      delete_images: [...prev.delete_images, imageId]
    }));
    
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addAccommodationPricing = () => {
    const newPricing: AccommodationPricing = {
      key: `accommodation_${Date.now()}`,
      name: '',
      type: 'عائلي',
      price: 0
    };
    
    setFormData(prev => {
      // Ensure accommodation_pricing is always an array before adding to it
      const pricingArray = Array.isArray(prev.accommodation_pricing) ? prev.accommodation_pricing : [];
      return {
        ...prev,
        accommodation_pricing: [...pricingArray, newPricing]
      };
    });
  };

  const updateAccommodationPricing = (index: number, field: keyof AccommodationPricing, value: any) => {
    setFormData(prev => {
      // Ensure accommodation_pricing is always an array before mapping
      const pricingArray = Array.isArray(prev.accommodation_pricing) ? prev.accommodation_pricing : [];
      return {
        ...prev,
        accommodation_pricing: pricingArray.map((pricing, i) => 
          i === index ? { ...pricing, [field]: value } : pricing
        )
      };
    });
  };

  const removeAccommodationPricing = (index: number) => {
    setFormData(prev => {
      // Ensure accommodation_pricing is always an array before filtering
      const pricingArray = Array.isArray(prev.accommodation_pricing) ? prev.accommodation_pricing : [];
      return {
        ...prev,
        accommodation_pricing: pricingArray.filter((_, i) => i !== index)
      };
    });
  };

  const addHotel = (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) return;

    if (formData.hotels.find(h => h.id === hotelId)) {
      toast.error(t('packages.hotelAlreadyAdded'));
      return;
    }

    setFormData(prev => ({
      ...prev,
      hotels: [...prev.hotels, { id: hotelId, nights: 1, room_type: 'standard' }]
    }));
  };

  const updateHotel = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      hotels: prev.hotels.map((hotel, i) => 
        i === index ? { ...hotel, [field]: value } : hotel
      )
    }));
  };

  const removeHotel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hotels: prev.hotels.filter((_, i) => i !== index)
    }));
  };

  // Validate form - تحسين عملية التحقق
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    // Basic Information Tab
    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
      hasErrors = true;
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = t('validation.durationRequired');
      hasErrors = true;
    }

    if (!formData.unlimited_persons && (!formData.max_people || formData.max_people <= 0)) {
      newErrors.max_people = t('validation.maxPeopleRequired');
      hasErrors = true;
    }

    // Pricing Tab
    if (!formData.price || formData.price <= 0) {
      newErrors.price = t('validation.priceRequired');
      hasErrors = true;
    }

    if (formData.discount_price && formData.price && formData.discount_price >= formData.price) {
      newErrors.discount_price = t('validation.discountPriceLower');
      hasErrors = true;
    }

    // Dates Tab
    if (formData.starting_date && formData.ending_date && formData.starting_date >= formData.ending_date) {
      newErrors.ending_date = t('validation.endDateAfterStart');
      hasErrors = true;
    }

    setErrors(newErrors);

    // التنقل إلى التبويب الذي يحتوي على أخطاء
    if (hasErrors) {
      // تحديد أي تبويب يحتوي على أخطاء
      const tabsWithErrors: Record<string, string[]> = {
        basic: ['name', 'duration', 'max_people'],
        details: ['ending_date', 'starting_date'],
        pricing: ['price', 'discount_price'],
        media: []
      };

      // التحقق من التبويب الحالي إذا كان يحتوي على أخطاء
      if (Object.keys(newErrors).some(field => tabsWithErrors[currentTab]?.includes(field))) {
        // البقاء في التبويب الحالي لأنه يحتوي على أخطاء
      } else {
        // الانتقال إلى أول تبويب يحتوي على أخطاء
        for (const [tab, fields] of Object.entries(tabsWithErrors)) {
          if (fields.some(field => newErrors[field])) {
            setCurrentTab(tab);
            break;
          }
        }
      }
    }

    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      toast.error(t('validation.checkErrors'));
      setIsSubmitting(false);
      return;
    }
    try {
      const requestData: UpdatePackageRequest = {
        ...formData,
        status: formData.status as "active" | "inactive" | "draft",
        price: formData.price === null ? undefined : formData.price,
        discount_price: formData.discount_price === null ? undefined : formData.discount_price,
        duration: formData.duration || undefined,
        max_people: formData.max_people || undefined,
        hotels: formData.hotels.length > 0 ? formData.hotels : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        delete_images: formData.delete_images.length > 0 ? formData.delete_images : undefined,
        accommodation_pricing: formData.accommodation_pricing.length > 0 ? formData.accommodation_pricing : undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
      };

      await updatePackage({
        id: packageId,
        data: requestData
      }).unwrap();
      
      toast.success(t('packages.packageUpdated'));
      router.push(`/${locale}/umrahoffices/dashboard/packages/${packageId}`);
    } catch (error: any) {
      console.error('Package update error:', error);
      toast.error(error?.data?.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPackage) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="w-64 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (packageError || !package_) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('packages.packageNotFound')}
          </h3>
          <p className="text-gray-500 mb-4">
            {(packageError as any)?.data?.message || t('common.error')}
          </p>
          <Button asChild>
            <Link href={`/${locale}/umrahoffices/dashboard/packages`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${locale}/umrahoffices/dashboard/packages/${packageId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-foreground dark:text-gray-100">{t('packages.editPackage')}</h1>
              {package_.is_featured && (
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
              )}
            </div>
            <p className="text-muted-foreground dark:text-gray-400 mt-1">
              {package_.name}
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!previousPackage}
            asChild={!!previousPackage}
          >
            {previousPackage ? (
              <Link href={`/${locale}/umrahoffices/dashboard/packages/${previousPackage.id}/edit`}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('packages.previous')}
              </Link>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('packages.previous')}
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground dark:text-gray-400 px-2">
            {currentIndex + 1} {t('packages.navigationOf')} {packages.length}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!nextPackage}
            asChild={!!nextPackage}
          >
            {nextPackage ? (
              <Link href={`/${locale}/umrahoffices/dashboard/packages/${nextPackage.id}/edit`}>
                {t('packages.next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <>
                {t('packages.next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="relative">
              {t('packages.basicInfo')}
              {isSubmitting && (errors.name || errors.duration || errors.max_people) && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="details" className="relative">
              {t('packages.details')}
              {isSubmitting && (errors.starting_date || errors.ending_date) && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="relative">
              {t('packages.pricing')}
              {isSubmitting && (errors.price || errors.discount_price) && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="media">
              {t('packages.media')}
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card className="shadow-sm bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground dark:text-gray-100">
                  <PackageIcon className="w-5 h-5 mr-2" />
                  {t('packages.basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    {t('packages.name')} <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('packages.name')}
                    className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t('packages.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('packages.description')}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center text-foreground dark:text-gray-200">
                      {t('packages.duration')} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="duration"
                        type="number"
                        readOnly
                        value={formData.duration || ''}
                        placeholder={t('packages.durationAutoCalculatedPlaceholder')}
                        className={`bg-gray-50 dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-gray-100 ${errors.duration ? 'border-red-500 focus:ring-red-500' : ''}`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-xs text-muted-foreground dark:text-gray-400">{t('packages.durationAutoLabel')}</span>
                      </div>
                    </div>
                    {errors.duration && (
                      <p className="text-sm text-red-600">{errors.duration}</p>
                    )}
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {t('packages.durationAutoCalculated')}
                    </p>
                  </div>

                  {/* Max People */}
                  <div className="space-y-2">
                    <Label htmlFor="max_people" className="flex items-center text-foreground dark:text-gray-200">
                      {t('packages.maxPeople')} {!formData.unlimited_persons && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="max_people"
                        type="number"
                        min="1"
                        disabled={formData.unlimited_persons}
                        value={formData.unlimited_persons ? '' : (formData.max_people || '')}
                        onChange={(e) => handleInputChange('max_people', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder={formData.unlimited_persons ? t('packages.unlimited') : t('packages.maxPeople')}
                        className={`bg-background dark:bg-gray-700 border-border dark:border-gray-600 text-foreground dark:text-gray-100 placeholder:text-muted-foreground dark:placeholder:text-gray-400 ${errors.max_people ? 'border-red-500 focus:ring-red-500' : ''} ${formData.unlimited_persons ? "bg-gray-50 dark:bg-gray-700" : ""}`}
                      />
                      {formData.unlimited_persons && (
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">∞ {t('packages.unlimited')}</span>
                        </div>
                      )}
                    </div>
                    {errors.max_people && (
                      <p className="text-sm text-red-600">{errors.max_people}</p>
                    )}
                    {formData.unlimited_persons && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {t('packages.unlimitedPersonsEnabled')}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">{t('packages.status')}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="bg-background dark:bg-gray-700 border-border dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('packages.status.active')}</SelectItem>
                        <SelectItem value="inactive">{t('packages.status.inactive')}</SelectItem>
                        <SelectItem value="draft">{t('packages.status.draft')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Unlimited Persons Switch */}
                <div className="flex flex-row items-center justify-between rounded-lg border border-border dark:border-gray-600 bg-card dark:bg-gray-800 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground dark:text-gray-100">{t('packages.unlimitedPersons')}</Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">{t('packages.unlimitedPersonsDescription')}</p>
                  </div>
                  <Switch
                    checked={formData.unlimited_persons}
                    onCheckedChange={(checked) => {
                      handleInputChange('unlimited_persons', checked);
                      // Clear max_people when unlimited is enabled
                      if (checked) {
                        handleInputChange('max_people', null);
                      }
                    }}
                  />
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                  <Label htmlFor="is_featured" className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {t('packages.featured')}
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Dates */}
            <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-gray-100">
                  <Calendar className="w-5 h-5 inline-block mr-2" />
                  {t('packages.dates')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="starting_date">{t('packages.startDate')}</Label>
                    <Input
                      id="starting_date"
                      type="date"
                      value={formData.starting_date}
                      onChange={(e) => handleInputChange('starting_date', e.target.value)}
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="ending_date">{t('packages.endDate')}</Label>
                    <Input
                      id="ending_date"
                      type="date"
                      value={formData.ending_date}
                      onChange={(e) => handleInputChange('ending_date', e.target.value)}
                      className={errors.ending_date ? 'border-red-500' : ''}
                    />
                    {errors.ending_date && (
                      <p className="text-sm text-red-600">{errors.ending_date}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground dark:text-gray-100">
                  <MapPin className="w-5 h-5 mr-2" />
                  {t('packages.locationInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination">{t('packages.destination')}</Label>
                  <Input
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    placeholder={t('packages.destination')}
                  />
                </div>

                {/* Meeting Location */}
                <div className="space-y-2">
                  <Label htmlFor="meeting_location">{t('packages.meetingLocation')}</Label>
                  <Input
                    id="meeting_location"
                    value={formData.meeting_location}
                    onChange={(e) => handleInputChange('meeting_location', e.target.value)}
                    placeholder={t('packages.meetingLocation')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Location */}
                  <div className="space-y-2">
                    <Label htmlFor="start_location">{t('packages.startLocation')}</Label>
                    <Input
                      id="start_location"
                      value={formData.start_location}
                      onChange={(e) => handleInputChange('start_location', e.target.value)}
                      placeholder={t('packages.startLocation')}
                    />
                  </div>

                  {/* End Location */}
                  <div className="space-y-2">
                    <Label htmlFor="end_location">{t('packages.endLocation')}</Label>
                    <Input
                      id="end_location"
                      value={formData.end_location}
                      onChange={(e) => handleInputChange('end_location', e.target.value)}
                      placeholder={t('packages.endLocation')}
                    />
                  </div>
                </div>

                {/* Location Picker */}
                <div>
                  <Label>{t('packages.pickLocation')}</Label>
                  <div className="mt-2">
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      onAddressChange={handleAddressChange}
                      searchPlaceholder={t('packages.searchDestination')}
                      height="300px"
                      initialLocation={selectedLocation}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inclusions */}
            <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-gray-100">{t('packages.inclusions')}</CardTitle>
                <p className="text-muted-foreground dark:text-gray-400">{t('packages.choosePackageInclusions')}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="includes_accommodation" className="text-base">
                      {t('packages.includes.accommodation')}
                    </Label>
                    <Switch
                      id="includes_accommodation"
                      checked={formData.includes_accommodation}
                      onCheckedChange={(checked) => handleInputChange('includes_accommodation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="includes_transport" className="text-base">
                      {t('packages.includes.transport')}
                    </Label>
                    <Switch
                      id="includes_transport"
                      checked={formData.includes_transport}
                      onCheckedChange={(checked) => handleInputChange('includes_transport', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="includes_meals" className="text-base">
                      {t('packages.includes.meals')}
                    </Label>
                    <Switch
                      id="includes_meals"
                      checked={formData.includes_meals}
                      onCheckedChange={(checked) => handleInputChange('includes_meals', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="includes_guide" className="text-base">
                      {t('packages.includes.guide')}
                    </Label>
                    <Switch
                      id="includes_guide"
                      checked={formData.includes_guide}
                      onCheckedChange={(checked) => handleInputChange('includes_guide', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="includes_insurance" className="text-base">
                      {t('packages.includes.insurance')}
                    </Label>
                    <Switch
                      id="includes_insurance"
                      checked={formData.includes_insurance}
                      onCheckedChange={(checked) => handleInputChange('includes_insurance', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="includes_activities" className="text-base">
                      {t('packages.includes.activities')}
                    </Label>
                    <Switch
                      id="includes_activities"
                      checked={formData.includes_activities}
                      onCheckedChange={(checked) => handleInputChange('includes_activities', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotels */}
            <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground dark:text-gray-100">
                  <Hotel className="w-5 h-5 mr-2" />
                  {t('packages.hotels')}
                </CardTitle>
                <p className="text-muted-foreground dark:text-gray-400">{t('packages.choosePackageHotels')}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Hotel */}
                <div className="space-y-2">
                  <Label>{t('packages.selectHotels')}</Label>
                  <Select onValueChange={(value) => addHotel(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('packages.selectHotels')} />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map((hotel) => (
                        <SelectItem key={hotel.id} value={hotel.id.toString()}>
                          {hotel.name} {hotel.rating && `(${hotel.rating} ⭐)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Hotels */}
                {formData.hotels.length > 0 && (
                  <div className="space-y-4">
                    <Label>{t('packages.attachedHotels')}</Label>
                    {formData.hotels.map((packageHotel, index) => {
                      const hotel = hotels.find(h => h.id === packageHotel.id);
                      if (!hotel) return null;

                      return (
                        <div key={index} className="flex items-center space-x-4 space-x-reverse p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <Hotel className="w-5 h-5 text-gray-500" />
                              <div>
                                <h3 className="font-medium">{hotel.name}</h3>
                                {hotel.rating && (
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                    {hotel.rating}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-24">
                            <Input
                              type="number"
                              min="1"
                              placeholder={t('packages.nights')}
                              value={packageHotel.nights}
                              onChange={(e) => updateHotel(index, 'nights', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div className="w-32">
                            <Input
                              placeholder={t('packages.roomType')}
                              value={packageHotel.room_type}
                              onChange={(e) => updateHotel(index, 'room_type', e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeHotel(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {formData.hotels.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Hotel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('packages.noHotels')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-gray-100">{t('packages.features')}</CardTitle>
                <p className="text-muted-foreground dark:text-gray-400">{t('packages.addPackageFeatures')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* English Features */}
                <div className="space-y-4">
                  <Label>{t('packages.englishFeatures')}</Label>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder={t('packages.addFeature')}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <Button type="button" variant="outline" onClick={addFeature}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center">
                            {feature}
                            <X 
                              className="w-3 h-3 ml-1 cursor-pointer" 
                              onClick={() => removeFeature(index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>


                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Information */}
          <TabsContent value="pricing">
            <Card className="shadow-sm bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground dark:text-gray-100">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {t('packages.pricing')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center">
                      {t('packages.price')} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder={t('packages.price')}
                      className={errors.price ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  {/* Discount Price */}
                  <div className="space-y-2">
                    <Label htmlFor="discount_price">{t('packages.discountPrice')}</Label>
                    <Input
                      id="discount_price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount_price || ''}
                      onChange={(e) => handleInputChange('discount_price', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder={t('packages.discountPrice')}
                      className={errors.discount_price ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.discount_price && (
                      <p className="text-sm text-red-600">{errors.discount_price}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {t('validation.discountPriceHint')}
                    </p>
                  </div>
                </div>

                {/* Accommodation Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{t('packages.accommodationPricing')}</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAccommodationPricing}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('packages.addAccommodationPricing')}
                    </Button>
                  </div>

                  {formData.accommodation_pricing && Array.isArray(formData.accommodation_pricing) && formData.accommodation_pricing.map((pricing, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>{t('packages.accommodationKey')}</Label>
                          <Input
                            value={pricing.key}
                            onChange={(e) => updateAccommodationPricing(index, 'key', e.target.value)}
                            placeholder={t('packages.accommodationKey')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>{t('packages.accommodationName')}</Label>
                          <Input
                            value={pricing.name}
                            onChange={(e) => updateAccommodationPricing(index, 'name', e.target.value)}
                            placeholder={t('packages.accommodationName')}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t('packages.accommodationType')}</Label>
                          <Select 
                            value={pricing.type} 
                            onValueChange={(value) => updateAccommodationPricing(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="عائلي">{t('packages.family')}</SelectItem>
                              <SelectItem value="عزابي">{t('packages.single')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{t('packages.price')}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={pricing.price}
                              onChange={(e) => updateAccommodationPricing(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder={t('packages.price')}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeAccommodationPricing(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card className="bg-card dark:bg-gray-800 border-border dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground dark:text-gray-100">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  {t('packages.imagesInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <Label className="mb-2 block">{t('packages.existingImages')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <Image
                            src={image.image_url}
                            alt={image.title || `Image ${image.id}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(image.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          {image.is_featured && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="default" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                {t('packages.featured')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload new images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="images" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{t('packages.uploadImages')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP (5MB {t('common.max')})
                    </p>
                  </Label>
                </div>

                {/* New image previews */}
                {imagePreviewUrls.length > 0 && (
                  <div>
                    <Label className="mb-2 block">{t('packages.newImages')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`New Preview ${index + 1}`}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(index)}
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

        {/* Submit Actions */}
        <Card className="mt-6 shadow-sm bg-card dark:bg-gray-800 border-border dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/packages/${packageId}`}>
                  {t('common.cancel')}
                </Link>
              </Button>
              
              <Button 
                type="submit" 
                disabled={isUpdating || isSubmitting}
                className="min-w-[150px] bg-primary hover:bg-primary/90"
              >
                {isUpdating || isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.updating')}...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('packages.save')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* عرض الأخطاء العامة */}
        {isSubmitting && Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              {t('validation.checkRequiredFields')}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
} 