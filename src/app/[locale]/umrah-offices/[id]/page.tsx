'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

// Icons
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  ChevronLeft,
  ArrowLeft,
  Building,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
} from 'lucide-react';

// Services and Types
import { fetchOfficeById, Office } from '@/services/officesService';

// API storage base URL - should be in .env file
const API_STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE_URL || 'https://umrahgo.reach369.com/storage/';

// Function to validate and format image URLs
const getValidImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/office-placeholder.jpg';
  
  // If it's already a valid URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path with a leading slash
  if (url.startsWith('/')) {
    return url;
  }
  
  // If it's a storage path from the API without a leading slash
  if (url.includes('umrah_offices/') || url.includes('packages/') || url.includes('users/')) {
    return `${API_STORAGE_URL}${url}`;
  }
  
  // Add a leading slash for other relative paths
  return `/${url}`;
};

export default function OfficeDetailsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const officeId = params?.id as string;
  
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch office details
  useEffect(() => {
    const fetchOfficeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchOfficeById(officeId);
        if (response.status && response.data) {
          setOffice(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching office details:', error);
        setLoading(false);
      }
    };

    if (officeId) {
      fetchOfficeDetails();
    }
  }, [officeId]);

  // Helper function to get a numeric rating
  const getNumericRating = (rating?: number): number => {
    return rating || 0;
  };

  // Rating stars renderer
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        size={18}
        className={`${index < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Gallery navigation
  const nextImage = () => {
    if (!office?.gallery?.length) return;
    setActiveImageIndex((prev) => (prev + 1) % office.gallery.length);
  };

  const prevImage = () => {
    if (!office || !office.gallery) return;
    setActiveImageIndex((prev) => (prev - 1 + office.gallery.length) % office.gallery.length);
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
  };

  return (
    <div className="min-h-screen py-20">
      {loading ? (
        // Loading state
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-6 w-32 bg-primary/10 rounded"></div>
              <div className="h-6 w-60 bg-primary/10 rounded"></div>
            </div>
            <div className="h-80 bg-primary/10 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-10 bg-primary/10 rounded w-3/4"></div>
                <div className="h-4 bg-primary/5 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-primary/5 rounded w-full"></div>
                  <div className="h-4 bg-primary/5 rounded w-full"></div>
                  <div className="h-4 bg-primary/5 rounded w-2/3"></div>
                </div>
                <div className="h-10 bg-primary/10 rounded-lg w-32"></div>
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-primary/10 rounded-xl"></div>
                <div className="h-40 bg-primary/10 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      ) : office ? (
        <>
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 mb-8">
            <div className="flex items-center text-sm text-muted-foreground">
              <Link href={`/${locale}`} className="hover:text-primary">
                {t('common.home') || 'الرئيسية'}
              </Link>
              <ChevronLeft className="h-4 w-4 mx-2" />
              <Link href={`/${locale}/umrah-offices`} className="hover:text-primary">
                {t('offices.title') || 'مكاتب العمرة'}
              </Link>
              <ChevronLeft className="h-4 w-4 mx-2" />
              <span className="text-primary">{office.office_name}</span>
            </div>
          </div>
          
          {/* Office Header */}
          <div className="container mx-auto px-4 mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-primary/10">
                  <Image
                    src={getValidImageUrl(office.logo)}
                    alt={office.office_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary">
                    {office.office_name}
                  </h1>
                  <div className="flex items-center mt-1">
                    <div className="flex mr-2">
                      {renderRatingStars(getNumericRating(office.rating))}
                    </div>
                    <span className="text-sm font-medium">
                      {getNumericRating(office.rating).toFixed(1)} ({office.reviews_count} {t('offices.reviews') || 'تقييم'})
                    </span>
                    
                    {office.verification_status === 'verified' && (
                      <Badge className="ml-3 bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('offices.verified') || 'معتمد'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="border-primary/30">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('offices.contact') || 'تواصل معنا'}
                </Button>
                
                <Link href={`/${locale}/packages?office_id=${office.id}`}>
                  <Button className="bg-primary">
                    {t('offices.viewPackages') || 'عرض باقات المكتب'}
                    <ArrowLeft className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Office Content */}
          <div className="container mx-auto px-4 mb-16">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-primary/10">
              <h2 className="text-2xl font-bold mb-4">{t('office.about') || 'عن المكتب'}</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {office.description || t('office.noDescription') || 'لا يوجد وصف متاح لهذا المكتب.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                  <span className="text-sm text-muted-foreground mb-1">{t('office.address') || 'العنوان'}</span>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">{office.address || t('office.notAvailable') || 'غير متوفر'}</span>
                  </div>
                </div>
                <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                  <span className="text-sm text-muted-foreground mb-1">{t('office.contact') || 'معلومات الاتصال'}</span>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">{office.contact_number || t('office.notAvailable') || 'غير متوفر'}</span>
                  </div>
                </div>
                <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                  <span className="text-sm text-muted-foreground mb-1">{t('office.email') || 'البريد الإلكتروني'}</span>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">{office.email || t('office.notAvailable') || 'غير متوفر'}</span>
                  </div>
                </div>
                <div className="flex flex-col bg-primary/5 rounded-lg p-4">
                  <span className="text-sm text-muted-foreground mb-1">{t('office.license') || 'رقم الترخيص'}</span>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">{office.license_number || t('office.notAvailable') || 'غير متوفر'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">{t('office.packages') || 'باقات المكتب'}</h3>
                <Link href={`/${locale}/packages?office_id=${office.id}`}>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                    {t('office.viewPackages') || 'عرض جميع باقات المكتب'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('office.error.title') || 'حدث خطأ'}</h3>
            <p className="text-muted-foreground mb-6">{t('office.error.description') || 'لم نتمكن من العثور على تفاصيل المكتب المطلوب'}</p>
            <Link href={`/${locale}/umrah-offices`}>
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('office.backToOffices') || 'العودة إلى مكاتب العمرة'}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 