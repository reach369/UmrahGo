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
import { Office as LegacyOffice } from '@/types/office.types';

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
    if (!office || !office.gallery) return;
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
                    src={office.logo || '/images/office-placeholder.jpg'}
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
          
          {/* Main Content */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Content - Details & Tabs */}
              <div className="md:col-span-2">
                {/* Gallery */}
                {office.gallery && office.gallery.length > 0 && (
                  <div className="mb-12 relative rounded-xl overflow-hidden">
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={office.gallery[activeImageIndex]?.image_path || '/images/office-placeholder.jpg'}
                        alt={office.gallery[activeImageIndex]?.title || office.office_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Gallery Controls */}
                    <div className="absolute inset-0 flex justify-between items-center px-4">
                      <button
                        onClick={prevImage}
                        className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4">
                      {office.gallery.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeImageIndex 
                              ? 'bg-white w-4' 
                              : 'bg-white/50'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tabs */}
                <Tabs defaultValue="about" className="mb-12">
                  <TabsList className="mb-6">
                    <TabsTrigger value="about">{t('offices.tabs.about') || 'عن المكتب'}</TabsTrigger>
                    <TabsTrigger value="services">{t('offices.tabs.services') || 'الخدمات'}</TabsTrigger>
                    <TabsTrigger value="licenses">{t('offices.tabs.licenses') || 'التراخيص'}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-4">
                    <h2 className="text-xl font-bold text-primary">{t('offices.aboutTitle') || 'نبذة عن المكتب'}</h2>
                    <div className="text-muted-foreground leading-relaxed">
                      {office.description || t('offices.noDescription') || 'لا يوجد وصف متاح للمكتب.'}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="services" className="space-y-4">
                    <h2 className="text-xl font-bold text-primary">{t('offices.servicesTitle') || 'الخدمات المقدمة'}</h2>
                    <div className="text-muted-foreground leading-relaxed">
                      {office.services_offered ? (
                        <ul className="space-y-2">
                          {office.services_offered.split(',').map((service, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                              <span>{service.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{t('offices.noServices') || 'لا توجد معلومات عن الخدمات المقدمة.'}</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="licenses" className="space-y-4">
                    <h2 className="text-xl font-bold text-primary">{t('offices.licensesTitle') || 'التراخيص والاعتمادات'}</h2>
                    <div className="text-muted-foreground leading-relaxed space-y-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{t('offices.licenseNumber') || 'رقم الترخيص'}:</span>
                        <span>{office.license_number || '---'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{t('offices.commercialRegister') || 'السجل التجاري'}:</span>
                        <span>{office.commercial_register_number || '---'}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{t('offices.licenseExpiry') || 'تاريخ انتهاء الترخيص'}:</span>
                        <span>{formatDate(office.license_expiry_date)}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{t('offices.verificationStatus') || 'حالة التحقق'}:</span>
                        <div className="flex items-center mt-1">
                          {office.verification_status === 'verified' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t('offices.verified') || 'معتمد'}
                            </Badge>
                          ) : office.verification_status === 'pending' ? (
                            <Badge variant="outline">
                              {t('offices.pending') || 'قيد المراجعة'}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              {t('offices.rejected') || 'مرفوض'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Right Content - Contact Info */}
              <div className="space-y-6">
                {/* Contact Card */}
                <Card className="overflow-hidden">
                  <div className="bg-primary/10 p-4">
                    <h3 className="font-semibold text-primary">
                      {t('offices.contactInfo') || 'معلومات التواصل'}
                    </h3>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    {office.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t('offices.address') || 'العنوان'}</p>
                          <p className="text-sm text-muted-foreground">{office.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {[office.city, office.state, office.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {office.contact_number && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t('offices.phone') || 'الهاتف'}</p>
                          <p className="text-sm text-muted-foreground">{office.contact_number}</p>
                          {office.whatsapp && (
                            <p className="text-sm text-muted-foreground">WhatsApp: {office.whatsapp}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {office.email && (
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t('offices.email') || 'البريد الإلكتروني'}</p>
                          <p className="text-sm text-muted-foreground">{office.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {office.website && (
                      <div className="flex items-start">
                        <Globe className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t('offices.website') || 'الموقع الإلكتروني'}</p>
                          <a 
                            href={office.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {office.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Social Media Links */}
                    {(office.facebook_url || office.twitter_url || office.instagram_url) && (
                      <div className="pt-2 border-t flex items-center gap-3">
                        {office.facebook_url && (
                          <a 
                            href={office.facebook_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-primary/10 hover:bg-primary/20 p-2 rounded-full transition-colors"
                            aria-label="Facebook"
                          >
                            <Facebook className="h-5 w-5 text-primary" />
                          </a>
                        )}
                        
                        {office.twitter_url && (
                          <a 
                            href={office.twitter_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-primary/10 hover:bg-primary/20 p-2 rounded-full transition-colors"
                            aria-label="Twitter"
                          >
                            <Twitter className="h-5 w-5 text-primary" />
                          </a>
                        )}
                        
                        {office.instagram_url && (
                          <a 
                            href={office.instagram_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-primary/10 hover:bg-primary/20 p-2 rounded-full transition-colors"
                            aria-label="Instagram"
                          >
                            <Instagram className="h-5 w-5 text-primary" />
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Office Information Card */}
                <Card>
                  <div className="bg-primary/10 p-4">
                    <h3 className="font-semibold text-primary">
                      {t('offices.quickInfo') || 'معلومات سريعة'}
                    </h3>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{t('offices.established') || 'تأسس'}</span>
                      </div>
                      <span className="text-sm font-medium">{new Date(office.created_at).getFullYear()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{t('offices.rating') || 'التقييم'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-1">{getNumericRating(office.rating).toFixed(1)}</span>
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{t('offices.reviews') || 'التقييمات'}</span>
                      </div>
                      <span className="text-sm font-medium">{office.reviews_count}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{t('offices.licenseValid') || 'الترخيص ساري حتى'}</span>
                      </div>
                      <span className="text-sm font-medium">{formatDate(office.license_expiry_date)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* CTA */}
                <Link href={`/${locale}/packages?office_id=${office.id}`}>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                    {t('offices.browsePackages') || 'تصفح باقات المكتب'}
                    <ArrowLeft className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Office not found
        <div className="container mx-auto px-4 text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">
            {t('offices.notFound.title') || 'المكتب غير موجود'}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {t('offices.notFound.description') || 'عذراً، المكتب الذي تبحث عنه غير موجود أو تم حذفه'}
          </p>
          <Link href={`/${locale}/landing/umrah-offices`}>
            <Button variant="outline" className="rounded-full border-primary/30 hover:bg-primary/5">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('offices.backToOffices') || 'العودة إلى صفحة المكاتب'}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 