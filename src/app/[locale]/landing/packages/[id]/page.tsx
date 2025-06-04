'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  ClockIcon, 
  UsersIcon, 
  MapPinIcon, 
  CheckIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

import {
  Clock,
  Users,
  MapPin,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  ArrowLeft,
  Loader2
} from 'lucide-react';

// Services
import { landingService, Package } from '@/services/landing.service';

export default function PackageDetailsPage() {
  const params = useParams();
  const packageId = params?.id as string;
  const locale = params?.locale as string || 'ar';
  const isRtl = locale === 'ar';
  const t = useTranslations();
  
  // States
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch package data
  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await landingService.getPackageById(packageId);
        
        // No need to transform the data since we've updated the Package interface
        // to include both our frontend fields and the API response fields
        setPackageData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching package details:', error);
        setError('حدث خطأ أثناء تحميل تفاصيل الباقة. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };
    
    if (packageId) {
      fetchPackageData();
    }
  }, [packageId]);
  
  // Sample images for gallery (in real implementation, these would come from API)
  const galleryImages = [
    '/images/kaaba.jpg',
    '/images/madina.jpg',
    '/images/makkah.jpg',
    '/images/hotel.jpg',
    '/images/transport.jpg',
  ];
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg text-muted-foreground">{t('package.loading') || 'جاري تحميل تفاصيل الباقة...'}</p>
        </div>
      </div>
    );
  }
  
  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('package.error.title') || 'حدث خطأ'}</h3>
          <p className="text-muted-foreground mb-6">{error || t('package.error.description') || 'لم نتمكن من العثور على تفاصيل الباقة المطلوبة'}</p>
          <Link href={`/${locale}/packages`}>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
              {isRtl ? <ArrowLeft className="h-4 w-4 mr-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
              {t('package.backToPackages') || 'العودة إلى الباقات'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-20">
      {/* Back link */}
      <div className="container mx-auto px-4 mb-8">
        <Link href={`/${locale}/packages`} className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
          {isRtl ? <ChevronRight className="h-4 w-4 ml-1" /> : <ChevronLeft className="h-4 w-4 mr-1" />}
          <span>{t('package.backToPackages') || 'العودة إلى الباقات'}</span>
        </Link>
      </div>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 mb-12">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="relative h-[40vh] md:h-[60vh] w-full">
            <Image
              src={packageData.imageUrl}
              alt={packageData.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {packageData.featured && (
                <Badge className="bg-secondary hover:bg-secondary text-white mb-4">
                  {t('package.featured') || 'باقة مميزة'}
                </Badge>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{packageData.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{packageData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{packageData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span>{packageData.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="font-bold">${packageData.price} {packageData.currency}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8 w-full justify-start bg-primary/5 p-1 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  {t('package.tabs.overview') || 'نظرة عامة'}
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  {t('package.tabs.itinerary') || 'البرنامج'}
                </TabsTrigger>
                <TabsTrigger value="amenities" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  {t('package.tabs.amenities') || 'المميزات'}
                </TabsTrigger>
                <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  {t('package.tabs.gallery') || 'الصور'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-0">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="bg-card rounded-xl p-6 shadow-sm border border-primary/10"
                >
                  <h2 className="text-2xl font-bold mb-4">{t('package.overview.title') || 'نبذة عن الباقة'}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {packageData.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                      <span className="text-sm text-muted-foreground mb-1">{t('package.overview.duration') || 'المدة'}</span>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">{packageData.duration}</span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                      <span className="text-sm text-muted-foreground mb-1">{t('package.overview.location') || 'الموقع'}</span>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">{packageData.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                      <span className="text-sm text-muted-foreground mb-1">{t('package.overview.price') || 'السعر'}</span>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">${packageData.price} {packageData.currency}</span>
                      </div>
                    </div>
                    <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                      <span className="text-sm text-muted-foreground mb-1">{t('package.overview.rating') || 'التقييم'}</span>
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-2" />
                        <span className="font-medium">{packageData.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="itinerary" className="mt-0">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="bg-card rounded-xl p-6 shadow-sm border border-primary/10"
                >
                  <h2 className="text-2xl font-bold mb-6">{t('package.itinerary.title') || 'برنامج الرحلة'}</h2>
                  
                  <div className="space-y-8">
                    {/* Dynamically render itinerary, for now using sample data */}
                    <div className="relative pl-8 border-l-2 border-primary/30">
                      <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-primary"></div>
                      <h3 className="text-xl font-semibold mb-2">{t('package.itinerary.day', { day: 1 }) || 'اليوم الأول'}</h3>
                      <p className="text-muted-foreground mb-4">الوصول إلى مكة المكرمة وتسكين في الفندق</p>
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="bg-primary/5 rounded-lg px-3 py-2 flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          <span>فندق مكة</span>
                        </div>
                        <div className="bg-primary/5 rounded-lg px-3 py-2 flex items-center">
                          <Clock className="h-4 w-4 text-primary mr-2" />
                          <span>وصول + تسكين</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative pl-8 border-l-2 border-primary/30">
                      <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-primary"></div>
                      <h3 className="text-xl font-semibold mb-2">{t('package.itinerary.day', { day: 2 }) || 'اليوم الثاني'}</h3>
                      <p className="text-muted-foreground mb-4">أداء مناسك العمرة مع مرشد ديني</p>
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="bg-primary/5 rounded-lg px-3 py-2 flex items-center">
                          <MapPin className="h-4 w-4 text-primary mr-2" />
                          <span>الحرم المكي</span>
                        </div>
                        <div className="bg-primary/5 rounded-lg px-3 py-2 flex items-center">
                          <Clock className="h-4 w-4 text-primary mr-2" />
                          <span>مناسك العمرة</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add more days as needed */}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="amenities" className="mt-0">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="bg-card rounded-xl p-6 shadow-sm border border-primary/10"
                >
                  <h2 className="text-2xl font-bold mb-6">{t('package.amenities.title') || 'المميزات والخدمات'}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {packageData.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="gallery" className="mt-0">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="bg-card rounded-xl p-6 shadow-sm border border-primary/10"
                >
                  <h2 className="text-2xl font-bold mb-6">{t('package.gallery.title') || 'معرض الصور'}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden h-64">
                        <Image
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/3">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="sticky top-24 bg-card rounded-xl p-6 shadow-sm border border-primary/10"
            >
              <h3 className="text-xl font-bold mb-4">{t('package.booking.title') || 'حجز الباقة'}</h3>
              <div className="flex justify-between items-center mb-6">
                <span className="text-muted-foreground">{t('package.booking.price') || 'السعر'}</span>
                <span className="text-2xl font-bold text-primary">${packageData.price} <span className="text-sm">{packageData.currency}</span></span>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('package.booking.duration') || 'المدة'}</span>
                  <span>{packageData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('package.booking.location') || 'الموقع'}</span>
                  <span>{packageData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('package.booking.rating') || 'التقييم'}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{packageData.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white mb-3">
                {t('package.booking.bookNow') || 'احجز الآن'}
              </Button>
              
              <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5">
                {t('package.booking.contactUs') || 'تواصل معنا للاستفسار'}
              </Button>
              
              <div className="mt-6 pt-6 border-t border-primary/10">
                <h4 className="font-medium mb-3">{t('package.booking.assistance') || 'هل تحتاج إلى مساعدة؟'}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('package.booking.assistanceText') || 'تواصل معنا للحصول على مساعدة في اختيار الباقة المناسبة أو لأي استفسارات أخرى'}
                </p>
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="font-medium">+966 123 456 789</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Related Packages */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-primary">
              {t('package.related.title') || 'باقات أخرى قد تعجبك'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('package.related.description') || 'استكشف المزيد من باقات العمرة المميزة لدينا واختر ما يناسبك'}
            </p>
          </motion.div>
          
          {/* Related packages will be dynamically loaded here. Using placeholders for now */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-primary/10 hover:border-primary/30"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src="/images/kaaba.jpg" 
                    alt="Related package"
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                      $999 USD
                    </span>
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium ml-1">4.8</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">باقة عمرة {i} أيام</h3>
                  <div className="flex flex-col space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-primary mr-2" />
                      <span>مكة والمدينة</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-2" />
                      <span>{i + 4} أيام</span>
                    </div>
                  </div>
                  <Link href={`/${locale}/packages/${i}`}>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                      {t('package.related.viewDetails') || 'عرض التفاصيل'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 