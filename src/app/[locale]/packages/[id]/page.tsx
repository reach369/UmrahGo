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

// API storage base URL - should be in .env file
const API_STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE_URL || 'https://umrahgo.reach369.com/storage/';

// Function to validate and format image URLs
const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/package-placeholder.jpg';
  
  // If it's already a valid URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path with a leading slash
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a storage path from the API without a leading slash
  if (url.includes('packages/') || url.includes('umrah_offices/') || url.includes('users/')) {
    return `${API_STORAGE_URL}${url}`;
  }
  
  // Add a leading slash for other relative paths
  return `/${url}`;
};

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
              src={getValidImageUrl(packageData.imageUrl)}
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
      
      {/* Package Content */}
      <section className="container mx-auto px-4 mb-16">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-primary/10">
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
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">{t('package.booking.title') || 'حجز الباقة'}</h3>
            <Link href={`/${locale}/PilgrimUser/booking/new?package=${packageId}`}>
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                {t('package.booking.cta') || 'احجز الآن'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 