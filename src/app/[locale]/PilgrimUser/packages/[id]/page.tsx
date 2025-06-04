'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPackageById, Package } from '../../services/officesService';
import { createBooking, CreateBookingRequest } from '../../services/bookingService';
import { getImageUrl } from '../../utils/imageUtils';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Calendar, MapPin, Users, Clock, Star, Check, X, Globe, Building, Plus, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

export default function PackageDetailsPage() {
  const t = useTranslations('PilgrimUser');
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id as string;
  
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Add state to handle loading stability
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // Add a fallback to handle missing translations
  const tWithFallback = (key: string, fallback?: string) => {
    try {
      return t(key);
    } catch (error) {
      console.warn(`Translation key missing: PilgrimUser.${key}`);
      return fallback || key;
    }
  };
  
  // Define validation schema
  const passengerSchema = z.object({
    name: z.string().min(3, { message: tWithFallback('nameRequired') }),
    passport_number: z.string().min(3, { message: tWithFallback('passportNumberRequired') }),
    nationality: z.string().min(2, { message: tWithFallback('nationalityRequired') }),
    gender: z.enum(['male', 'female']),
    age: z.coerce.number().min(1).max(120),
    phone: z.string().min(9, { message: tWithFallback('validPhoneRequired') }),
  });
  
  const bookingSchema = z.object({
    booking_date: z.string(),
    number_of_persons: z.coerce.number().min(1),
    payment_method_id: z.coerce.number(),
    coupon_code: z.string().optional(),
    transaction_id: z.string().optional(),
    passengers: z.array(passengerSchema).min(1),
  });
  
  type BookingFormValues = z.infer<typeof bookingSchema>;
  
  // Initialize form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booking_date: new Date().toISOString().split('T')[0],
      number_of_persons: 1,
      payment_method_id: 1,
      coupon_code: '',
      transaction_id: '',
      passengers: [{ name: '', passport_number: '', nationality: '', gender: 'male', age: 30, phone: '' }],
    },
  });
  
  // Add passenger field
  const addPassenger = () => {
    const passengers = form.getValues('passengers');
    form.setValue('passengers', [
      ...passengers,
      { name: '', passport_number: '', nationality: '', gender: 'male', age: 30, phone: '' }
    ]);
    form.setValue('number_of_persons', passengers.length + 1);
  };
  
  // Remove passenger field
  const removePassenger = (index: number) => {
    const passengers = form.getValues('passengers');
    if (passengers.length > 1) {
      const updated = [...passengers];
      updated.splice(index, 1);
      form.setValue('passengers', updated);
      form.setValue('number_of_persons', updated.length);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: BookingFormValues) => {
    if (!packageData) return;
    
    try {
      setIsSubmitting(true);
      
      const bookingRequest: CreateBookingRequest = {
        package_id: parseInt(packageId),
        booking_date: values.booking_date,
        number_of_persons: values.number_of_persons,
        booking_type: 'package',
        payment_method_id: values.payment_method_id,
        coupon_code: values.coupon_code,
        transaction_id: values.transaction_id,
        passengers: values.passengers,
      };
      
      const response = await createBooking(bookingRequest);
      
      if (response.status) {
        toast.success(tWithFallback('bookingSuccess'));
        setShowBookingForm(false);
        // Redirect to booking confirmation page or show success
        router.push(`/PilgrimUser/booking/${response.data.id}`);
      } else {
        toast.error(response.message || tWithFallback('bookingError'));
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(tWithFallback('bookingError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Debounced fetch with retry mechanism
  const fetchPackageWithRetry = useCallback(async () => {
    if (retryCount > 3) {
      // If we've retried too many times, stop and show a message
      setError(tWithFallback('tooManyRetries', 'Too many retries. Please try again later.'));
      setIsLoading(false);
      setHasAttemptedLoad(true);
      return;
    }

    try {
      if (!hasAttemptedLoad) {
        setIsLoading(true);
      }
      setError(null);
      
      console.log(`Attempting to fetch package ${packageId}, attempt ${retryCount + 1}`);
      const response = await fetchPackageById(packageId);
      
      if (response.status && response.data) {
        console.log('Package details:', response.data);
        setPackageData(response.data);
        setIsRateLimited(false); // Reset rate limit flag on success
      } else {
        console.error('API returned success=false or no data:', response);
        setError(tWithFallback('errorLoadingPackage', 'Error loading package details.'));
      }
    } catch (err) {
      console.error('Error fetching package details:', err);
      
      // Check for rate limit error
      if (err instanceof Error && err.message.includes('Too many requests')) {
        setIsRateLimited(true);
        setError(tWithFallback('rateLimitError', 'Too many requests. Please wait a moment and try again.'));
        
        // Retry after exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
        
        return;
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError(tWithFallback('packageNotFound', 'Package not found.'));
      } else {
        setError(tWithFallback('errorOccurred', 'An error occurred.'));
      }
    } finally {
      setIsLoading(false);
      setHasAttemptedLoad(true);
      setIsInitialLoad(false);
    }
  }, [packageId, retryCount, tWithFallback, hasAttemptedLoad]);
  
  // Fetch package details
  useEffect(() => {
    if (packageId) {
      // Set flags to ensure we show loading state only on first load
      setHasAttemptedLoad(false);
      fetchPackageWithRetry();
    }
  }, [packageId, fetchPackageWithRetry]);
  
  // Reset retry count if packageId changes
  useEffect(() => {
    setRetryCount(0);
    setIsInitialLoad(true);
  }, [packageId]);
  
  // Helper function to format currency
  const formatCurrency = (price: number | string) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${numericPrice.toLocaleString()} SAR`;
  };
  
  // Handle image gallery navigation
  const nextImage = () => {
    if (!packageData?.images) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === packageData.images!.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    if (!packageData?.images) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? packageData.images!.length - 1 : prevIndex - 1
    );
  };
  
  // Handle booking
  const handleBookNow = () => {
    console.log('handleBookNow clicked - opening booking form');
    setShowBookingForm(true);
    
    // استخدم setTimeout للتأكد من أن النموذج يظهر حتى لو كانت هناك مشكلة في التحديث الفوري
    setTimeout(() => {
      console.log('showBookingForm value after timeout:', showBookingForm);
    }, 100);
  };
  
  // Watch for changes in showBookingForm
  useEffect(() => {
    console.log('showBookingForm state changed to:', showBookingForm);
    if (showBookingForm) {
      console.log('Booking form should be visible now');
    }
  }, [showBookingForm]);
  
  // Check if we had any translation errors and notify the user only if needed
  const [hadTranslationError, setHadTranslationError] = useState(false);
  
  useEffect(() => {
    // Override the original t function to detect errors
    const originalT = t;
    try {
      // Try to access a key that should definitely exist
      originalT('bookNow');
    } catch (error) {
      // If there's an error, we have a translation issue
      setHadTranslationError(true);
    }
  }, [t]);
  
  // Show notification for translation issues only if there was an error
  useEffect(() => {
    if (!isLoading && packageData && hadTranslationError) {
      toast.info(
        'If you see missing text or translation errors, please refresh the page (F5) to reload all translations.',
        { duration: 7000 }
      );
    }
  }, [isLoading, packageData, hadTranslationError]);
  
  // Modified loading state to be more stable - only show loading on initial fetch
  if (isInitialLoad && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          
          <Skeleton className="aspect-[16/9] w-full rounded-lg mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              
              <Skeleton className="h-6 w-1/2 mb-3" />
              <div className="flex gap-2 mb-1">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-6" />
              
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (hasAttemptedLoad && (error || !packageData)) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">{tWithFallback('errorLoadingPackage')}</h1>
          <p className="text-gray-500 mb-6">{error || tWithFallback('packageNotFound')}</p>
          
          {/* Add retry button */}
          <Button 
            onClick={() => {
              setRetryCount(0);
              fetchPackageWithRetry();
            }}
            className="mx-auto mb-4"
          >
            {tWithFallback('retryLoading', 'Retry')}
          </Button>
          
          <Button 
            onClick={() => router.back()}
            className="mx-auto ml-4"
          >
            {tWithFallback('backToPackages')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <Link href="/PilgrimUser/packages" className="hover:underline">{tWithFallback('packages')}</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-gray-900 font-medium">{packageData.name}</span>
        </div>
        
        {/* Package Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{packageData.name}</h1>
          <div className="flex flex-wrap items-center gap-4">
            {packageData.office && (
              <Link 
                href={`/PilgrimUser/offices/${packageData.office_id}`}
                className="flex items-center text-blue-600 hover:underline"
              >
                <Building className="h-4 w-4 mr-1" />
                {packageData.office.office_name}
              </Link>
            )}
            
            {packageData.is_featured && (
              <Badge className="bg-amber-500">{tWithFallback('featured')}</Badge>
            )}
            
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 mr-1" />
              <span>{packageData.office?.rating || 0} ({packageData.office?.reviews_count || 0} {tWithFallback('reviews')})</span>
            </div>
          </div>
        </div>
        
        {/* Image Gallery */}
        <div className="relative mb-8">
          <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
            {packageData.images && packageData.images.length > 0 ? (
              <Image
                src={getImageUrl(packageData.images[currentImageIndex].url)}
                alt={packageData.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={(e) => {
                  console.error('Image failed to load');
                  (e.target as HTMLImageElement).src = '/images/default-office-cover.png';
                }}
              />
            ) : packageData.featured_image_url ? (
              <Image
                src={getImageUrl(packageData.featured_image_url)}
                alt={packageData.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                onError={(e) => {
                  console.error('Image failed to load');
                  (e.target as HTMLImageElement).src = '/images/default-office-cover.png';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">{tWithFallback('noImage')}</span>
              </div>
            )}
            
            {packageData.images && packageData.images.length > 1 && (
              <>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5 transform rotate-180" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {packageData.images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {packageData.images && packageData.images.length > 0 && (
            <div className="flex mt-4 overflow-x-auto space-x-2 pb-2">
              {packageData.images.map((image, index) => (
                <button 
                  key={index}
                  className={`relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                    index === currentImageIndex ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={getImageUrl(image.url)}
                    alt={`Gallery image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100px, 96px"
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-office-cover.png';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Package Details */}
          <div className="md:col-span-2">
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">{tWithFallback('description')}</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {packageData.description || tWithFallback('noDescription')}
                </p>
              </div>
              
              {/* Package Details */}
              <div>
                <h2 className="text-xl font-semibold mb-3">{tWithFallback('packageDetails')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">{tWithFallback('duration')}</div>
                      <div>{packageData.duration_days} {tWithFallback('days')}</div>
                    </div>
                  </div>
                  
                  {packageData.max_persons && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">{tWithFallback('maxPersons')}</div>
                        <div>{packageData.max_persons} {tWithFallback('persons')}</div>
                      </div>
                    </div>
                  )}
                  
                  {(packageData.start_location || packageData.end_location) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">{tWithFallback('location')}</div>
                        <div>
                          {packageData.start_location && packageData.end_location 
                            ? `${packageData.start_location} → ${packageData.end_location}` 
                            : packageData.start_location || packageData.end_location}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {packageData.views_count !== undefined && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">{tWithFallback('views')}</div>
                        <div>{packageData.views_count} {tWithFallback('views')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Features */}
              {packageData.features && Object.keys(packageData.features).length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">{tWithFallback('features')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(packageData.features).map(([key, value]) => {
                      // Skip if value is false
                      if (value === false) return null;
                      
                      // Get translated feature name if available
                      const translation = packageData.translations?.find(t => 
                        t.locale === 'ar'
                      )?.features?.[key];
                      
                      return (
                        <div key={key} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 mt-0.5" />
                          <span>{translation || key.replace(/_/g, ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Includes/Excludes - if available */}
              {packageData.includes && packageData.includes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">{tWithFallback('includes')}</h2>
                  <ul className="space-y-2">
                    {packageData.includes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {packageData.excludes && packageData.excludes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">{tWithFallback('excludes')}</h2>
                  <ul className="space-y-2">
                    {packageData.excludes.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="h-5 w-5 text-red-500 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Booking Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border shadow-sm p-5 sticky top-4">
              <div className="text-2xl font-bold mb-1">
                {formatCurrency(packageData.price)}
              </div>
              
              {packageData.discount_price && (
                <div className="text-gray-500 line-through mb-4">
                  {formatCurrency(packageData.discount_price)}
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{tWithFallback('duration')}</span>
                  <span>{packageData.duration_days} {tWithFallback('days')}</span>
                </div>
                
                {packageData.max_persons && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">{tWithFallback('maxPersons')}</span>
                    <span>{packageData.max_persons} {tWithFallback('persons')}</span>
                  </div>
                )}
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{tWithFallback('availability')}</span>
                  <Badge variant="outline" className="capitalize">
                    {packageData.availability_status || 'available'}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  id="bookNowButton"
                  className="w-full" 
                  size="lg" 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Book Now button clicked');
                    handleBookNow();
                  }}
                  variant="default"
                  style={{ 
                    backgroundColor: '#10b981', 
                    color: 'white',
                    fontSize: '1.1rem',
                    padding: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {tWithFallback('bookNow') || 'احجز الآن'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Packages or Office Info */}
        {/* This section can be implemented later */}
      </div>
      
      {/* Inline booking form modal */}
      {showBookingForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[100]" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{tWithFallback('bookPackage') || 'حجز الباقة'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowBookingForm(false)}>×</Button>
              </div>
              <CardDescription>{packageData?.name}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="booking_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tWithFallback('bookingDate') || 'تاريخ الحجز'}</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="payment_method_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tWithFallback('paymentMethod') || 'طريقة الدفع'}</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={tWithFallback('selectPaymentMethod') || 'اختر طريقة الدفع'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">{tWithFallback('creditCard') || 'بطاقة ائتمان'}</SelectItem>
                              <SelectItem value="2">{tWithFallback('bankTransfer') || 'تحويل بنكي'}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Coupon Code Field */}
                    <FormField
                      control={form.control}
                      name="coupon_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tWithFallback('couponCode') || 'رمز القسيمة'}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="RAMADAN2024" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Transaction ID Field */}
                    {form.watch('payment_method_id') === 2 && (
                      <FormField
                        control={form.control}
                        name="transaction_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{tWithFallback('transactionId') || 'رقم المعاملة'}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="txn_123456789" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {/* Passengers Section */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">{tWithFallback('passengers') || 'المسافرون'}</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addPassenger}>
                        <Plus className="h-4 w-4 mr-2" />
                        {tWithFallback('addPassenger') || 'إضافة مسافر'}
                      </Button>
                    </div>
                    
                    <Accordion type="multiple" className="w-full">
                      {form.watch('passengers').map((passenger, index) => (
                        <AccordionItem key={index} value={`passenger-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex justify-between w-full mr-4">
                              <span>
                                {passenger.name || tWithFallback('passenger') || 'مسافر'} {index + 1}
                              </span>
                              <div
                                role="button"
                                tabIndex={0}
                                className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${form.watch('passengers').length <= 1 ? 'invisible' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePassenger(index);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    removePassenger(index);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              <FormField
                                control={form.control}
                                name={`passengers.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tWithFallback('fullName') || 'الاسم الكامل'}</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`passengers.${index}.passport_number`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tWithFallback('passportNumber') || 'رقم جواز السفر'}</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`passengers.${index}.nationality`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tWithFallback('nationality') || 'الجنسية'}</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`passengers.${index}.age`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tWithFallback('age') || 'العمر'}</FormLabel>
                                    <FormControl>
                                      <Input type="number" min="1" max="120" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`passengers.${index}.gender`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tWithFallback('gender') || 'الجنس'}</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4 gap-4"
                                      >
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                          <RadioGroupItem value="male" id={`male-${index}`} />
                                          <Label htmlFor={`male-${index}`}>{tWithFallback('male') || 'ذكر'}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                          <RadioGroupItem value="female" id={`female-${index}`} />
                                          <Label htmlFor={`female-${index}`}>{tWithFallback('female') || 'أنثى'}</Label>
                                        </div>
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`passengers.${index}.phone`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tWithFallback('phoneNumber') || 'رقم الهاتف'}</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="+966501234567" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-lg font-semibold mb-2">
                      <span>{tWithFallback('totalPrice') || 'السعر الإجمالي'}:</span>
                      <span>
                        {packageData 
                          ? `${formatCurrency(Number(packageData.price) * form.watch('number_of_persons'))}` 
                          : '0 SAR'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 gap-4">
                    <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                      {tWithFallback('cancel') || 'إلغاء'}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (tWithFallback('submitting') || 'جاري التقديم...') : (tWithFallback('confirmBooking') || 'تأكيد الحجز')}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 