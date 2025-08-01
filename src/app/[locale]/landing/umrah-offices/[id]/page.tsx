'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import {
  ArrowLeft, 
  MapPin,
  Phone,
  Mail,
  Globe,
  Star, 
  CheckCircle,
  Building2,
  Calendar,
  Award,
  Users,
  Package,
  Loader2,
  Clock,
  Shield,
  Navigation,
  Heart,
  Share2,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  MessageSquare,
  Sparkles
} from 'lucide-react';

// Services
import { fetchOfficeById, Office } from '@/services/offices.service';
import { fetchOfficePackages } from '@/services/officesService';
import { getValidImageUrl } from '@/utils/image-helpers';

// Utility function to validate Google Maps API key
const validateGoogleMapsApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=1&size=1x1&key=${apiKey}`);
    return response.ok;
  } catch (error) {
    console.error('Error validating Google Maps API key:', error);
    return false;
  }
};

// Types
interface OfficePackage {
  id: string;
  name: string;
  description?: string;
  price?: number;
  discount_price?: number;
  duration_days?: number;
  featured_image_url?: string;
  is_featured?: boolean;
  rating?: number;
  start_location?: string;
  end_location?: string;
  has_discount?: boolean;
  discount_percentage?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

// Google Maps Component with better error handling
const OfficeMap = ({ office, userLocation, apiKeyValid }: { office: Office; userLocation?: UserLocation; apiKeyValid?: boolean | null }) => {
  const t = useTranslations('offices');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [distance, setDistance] = useState<string | null>(null);
  const [useStaticMap, setUseStaticMap] = useState(false);
  
  useEffect(() => {
    if (office.latitude && office.longitude) {
      setMapLoaded(true);
      
      // Calculate distance if user location is available
      if (userLocation) {
        const officeLatLng = { lat: parseFloat(office.latitude), lng: parseFloat(office.longitude) };
        const distanceInKm = calculateDistance(userLocation, officeLatLng);
        setDistance(`${distanceInKm.toFixed(1)} ${t('km')}`);
      }
    }
  }, [office, userLocation, t]);

  const calculateDistance = (pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (!office.latitude || !office.longitude) {
    return (
      <div className="h-96 bg-gradient-to-br from-primary/5 to-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">{t('locationNotAvailable')}</p>
        </div>
      </div>
    );
  }

  // Get API key with multiple fallbacks
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                 process.env.GOOGLE_MAPS_API_KEY || 
                 'AIzaSyCnC7l1pta1ayhlCrTtQBJV-o5n0_s61IU';
  
  // Safely parse coordinates
  const lat = parseFloat(office.latitude);
  const lng = parseFloat(office.longitude);
  
  // Check if coordinates are valid numbers
  const hasValidCoordinates = !isNaN(lat) && !isNaN(lng);
  
  if (!hasValidCoordinates) {
    return (
      <div className="h-96 bg-gradient-to-br from-primary/5 to-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">{t('locationNotAvailable')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Invalid coordinates: {office.latitude}, {office.longitude}
          </p>
        </div>
      </div>
    );
  }
  
  // Different map URLs
  const embedMapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15&maptype=roadmap`;
  const staticMapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x400&markers=color:red%7Clabel:M%7C${lat},${lng}&key=${apiKey}&maptype=roadmap`;
  const openStreetMapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;

  const handleMapError = () => {
    console.log('Google Maps embed failed, trying static map');
    setUseStaticMap(true);
  };

  const handleStaticMapError = () => {
    console.log('Static map also failed, showing OpenStreetMap');
    setMapError(true);
  };

  return (
    <div className="space-y-4">
      {apiKeyValid === false && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{t('mapWarning')}</span>
          </div>
        </div>
      )}
      
      {distance && (
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('distanceFromYou')}</span>
          </div>
          <span className="text-primary font-bold text-lg">{distance}</span>
        </div>
      )}
      
      <div className="h-96 rounded-xl overflow-hidden shadow-lg border border-primary/20">
        {mapError ? (
          // Fallback to OpenStreetMap
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={openStreetMapSrc}
            title={`${t('location')} - OpenStreetMap`}
          ></iframe>
        ) : useStaticMap ? (
          // Static Google Map fallback
          <div className="h-full flex items-center justify-center bg-gray-50">
            <img 
              src={staticMapSrc} 
              alt={`${t('location')}`}
              className="w-full h-full object-cover"
              onError={handleStaticMapError}
            />
          </div>
        ) : (
          // Primary Google Maps embed
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={embedMapSrc}
            allowFullScreen
            loading="lazy"
            title={t('location')}
            onError={handleMapError}
          ></iframe>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')}
          className="bg-background hover:bg-background/80 border-primary/20 hover:border-primary/40"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {t('getDirections')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(`https://www.google.com/maps/place/${lat},${lng}`, '_blank')}
          className="bg-background hover:bg-background/80 border-primary/20 hover:border-primary/40"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('viewOnGoogleMaps')}
        </Button>
        {(useStaticMap || mapError) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setUseStaticMap(false);
              setMapError(false);
            }}
            className="bg-background hover:bg-background/80 border-primary/20 hover:border-primary/40"
          >
            {t('reloadMap')}
          </Button>
        )}
      </div>
    </div>
  );
};

// PackageCard component with updated colors
const PackageCard = ({ pkg }: { pkg: OfficePackage }) => {
  const t = useTranslations('offices');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const isRtl = locale === 'ar';
  
  // Format price with currency
  const formatPrice = (price?: number) => {
    if (!price) return t('priceNotSpecified');
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Get package image URL
  const getPackageImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '/images/package-placeholder.jpg';
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return getValidImageUrl(imageUrl, '/images/package-placeholder.jpg');
  };
  
  return (
    <Card className="overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300 bg-card hover:shadow-xl group h-full">
      <div className="relative h-48 overflow-hidden">
        <Image 
          src={getPackageImageUrl(pkg.featured_image_url)}
          alt={pkg.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/package-placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        
        {pkg.is_featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary hover:bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="h-3 w-3 me-1" />
              {t('featured')}
            </Badge>
          </div>
        )}
        
        {pkg.has_discount && pkg.discount_percentage && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-secondary hover:bg-secondary text-secondary-foreground shadow-lg">
              {t('discountPercentage', { percentage: pkg.discount_percentage })}
            </Badge>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4">
          <div className="flex flex-col">
            {pkg.duration_days && (
              <Badge variant="outline" className="mb-2 bg-background/80 backdrop-blur-sm text-foreground border-primary/20">
                <Calendar className="h-3 w-3 me-1" />
                {pkg.duration_days} {t('days')}
              </Badge>
            )}
            
            {pkg.start_location && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-foreground border-primary/20">
                <MapPin className="h-3 w-3 me-1" />
                {pkg.start_location}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-4 right-4">
          {pkg.price && (
            <div className="flex flex-col items-end">
              {pkg.discount_price && (
                <span className="text-sm font-medium line-through text-muted mb-1 bg-background/80 px-2 py-0.5 rounded-full">
                  {formatPrice(pkg.price)}
                </span>
              )}
              <span className="font-bold text-lg bg-primary/90 text-primary-foreground px-3 py-1 rounded-full shadow-lg">
                {formatPrice(pkg.discount_price || pkg.price)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 flex flex-col h-[calc(100%-12rem)]">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {pkg.name}
        </h3>
        
        {pkg.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {pkg.description}
          </p>
        )}
        
        <div className="flex justify-end mt-auto pt-3 border-t border-primary/10">
          <Button size="sm" className="rounded-full bg-gradient-gold hover:bg-primary text-primary-foreground shadow-lg">
            {t('packageDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Add this helper function to get tab icons and labels for mobile screens
const getMobileTabLabel = (tabName: string, t: any) => {
  switch (tabName) {
    case 'about':
      return {
        icon: <Building2 className="h-4 w-4" />,
        label: t('tabs.about')
      };
    case 'location':
      return {
        icon: <MapPin className="h-4 w-4" />,
        label: t('tabs.location')
      };
    case 'packages':
      return {
        icon: <Package className="h-4 w-4" />,
        label: t('tabs.packages')
      };
    case 'services':
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        label: t('tabs.services')
      };
    default:
      return {
        icon: <Building2 className="h-4 w-4" />,
        label: tabName
      };
  }
};

export default function OfficeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'ar';
  const officeId = params?.id as string;
  const t = useTranslations();
  
  // States
  const [office, setOffice] = useState<Office | null>(null);
  const [packages, setPackages] = useState<OfficePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  // Helper function for translations with fallback
  const getTranslation = (key: string, fallback: string) => {
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };

  // Test Google Maps API key
  useEffect(() => {
    const testApiKey = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 
                     process.env.GOOGLE_MAPS_API_KEY || 
                     'AIzaSyCnC7l1pta1ayhlCrTtQBJV-o5n0_s61IU';
      
      console.log('Testing Google Maps API key...');
      console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'Not found');
      
      const isValid = await validateGoogleMapsApiKey(apiKey);
      setApiKeyValid(isValid);
      
      if (!isValid) {
        console.warn('Google Maps API key validation failed. Maps may not work properly.');
        console.log('Possible issues:');
        console.log('1. API key is invalid');
        console.log('2. Maps Embed API is not enabled');
        console.log('3. Domain restrictions are blocking the request');
        console.log('4. Billing is not set up for the Google Cloud project');
      } else {
        console.log('Google Maps API key is valid');
      }
    };

    testApiKey();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }
  }, []);

  // Fetch office details
  useEffect(() => {
    const fetchOfficeDetails = async () => {
      if (!officeId) return;
      
      try {
        setLoading(true);
        const data = await fetchOfficeById(officeId);
        setOffice(data);
      } catch (error) {
        console.error('Error fetching office:', error);
        setError('Failed to load office details');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeDetails();
  }, [officeId]);

  // Fetch office packages
  useEffect(() => {
    const fetchPackages = async () => {
      if (!officeId) return;
      
      try {
        setPackagesLoading(true);
        const data = await fetchOfficePackages(officeId, { per_page: 6, sort: 'created_at' });
        // Handle the case where data might not be an array
        if (Array.isArray(data)) {
          setPackages(data);
        } else {
          console.warn('Packages data is not an array:', data);
          setPackages([]);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackages([]);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, [officeId]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-primary/10 to-background rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                <Skeleton className="h-32 w-32 rounded-xl" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !office) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {getTranslation('offices.notFound.title', 'لم يتم العثور على المكتب')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {getTranslation('offices.notFound.description', 'آسف، المكتب الذي تبحث عنه غير موجود أو تمت إزالته')}
          </p>
          <Link href={`/${locale}/landing/umrah-offices`}>
            <Button>
              {getTranslation('offices.backToOffices', 'العودة إلى صفحة المكاتب')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 mb-8">
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {getTranslation('nav.home', 'الرئيسية')}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/landing/umrah-offices`} className="hover:text-primary transition-colors">
            {getTranslation('nav.offices', 'مكاتب العمرة')}
          </Link>
          <span>/</span>
          <span className="text-foreground">{office.name}</span>
        </nav>
      </div>
      
      {/* Office Header */}
      <section className="container mx-auto px-4 mb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative bg-gradient-to-br from-primary/10 to-background rounded-2xl p-8 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Office Logo */}
            <div className="relative h-32 w-32 rounded-xl overflow-hidden  shadow-lg">
              <Image
                src={getValidImageUrl(office.logo)}
                alt={office.name}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            
            {/* Office Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-primary">{office.name}</h1>
                {office.verification_status === 'verified' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {getTranslation('offices.verified', 'موثق')}
                  </Badge>
                )}
                {office.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    مميز
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{office.city}, {office.country}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                  <span>{office.rating || 'غير مقيم'} ({office.reviews_count || 0} تقييم)</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{getTranslation('offices.established', 'تأسس')}: {office.established_year || 'غير محدد'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>رخصة رقم: {office.license_number || 'غير محدد'}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6 max-w-2xl">
                {office.description || getTranslation('offices.noDescription', 'لا يوجد وصف متاح')}
              </p>
              
              {/* Social Media Links */}
              {(office.facebook_url || office.twitter_url || office.instagram_url || office.whatsapp) && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm text-muted-foreground">تابعنا:</span>
                  {office.facebook_url && (
                    <a href={office.facebook_url} target="_blank" rel="noopener noreferrer" 
                       className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {office.twitter_url && (
                    <a href={office.twitter_url} target="_blank" rel="noopener noreferrer" 
                       className="p-2 bg-sky-100 text-sky-600 rounded-full hover:bg-sky-200 transition-colors">
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {office.instagram_url && (
                    <a href={office.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className="p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors">
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {office.whatsapp && (
                    <a href={`https://wa.me/${office.whatsapp}`} target="_blank" rel="noopener noreferrer" 
                       className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap gap-4">
                <Link href={`/${locale}/landing/packages?office=${office.id}`}>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Package className="h-4 w-4 mr-2" />
                    {getTranslation('offices.viewPackages', 'عرض حزم المكتب')}
                  </Button>
                </Link>
                {office.contact_number && (
                  <a href={`tel:${office.contact_number}`}>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      {office.contact_number}
                    </Button>
                  </a>
                )}
                {office.whatsapp && (
                  <a href={`https://wa.me/${office.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="bg-green-50 text-green-600 hover:bg-green-100">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t('whatsapp')}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 opacity-10">
            <Building2 className="h-24 w-24" />
          </div>
        </motion.div>
      </section>
      
      {/* Office Details Tabs */}
      <section className="container mx-auto px-4">
        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-2 p-1">
              {['about', 'location', 'packages', 'services'].map((tab) => {
                const { icon, label } = getMobileTabLabel(tab, t);
                return (
                  <TabsTrigger 
                    key={tab} 
                    value={tab}
                    className="flex items-center gap-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {icon}
                    <span className="truncate">{label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <TabsContent value="about" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Contact Information */}
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader className="bg-card pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      {t('contactInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {office.address && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('address')}</div>
                          <div className="text-sm text-muted-foreground">{office.address}</div>
                        </div>
                      </div>
                    )}
                    {office.contact_number && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('phone')}</div>
                          <a href={`tel:${office.contact_number}`} className="text-sm text-primary hover:underline">
                            {office.contact_number}
                          </a>
                        </div>
                      </div>
                    )}
                    {office.email && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('email')}</div>
                          <a href={`mailto:${office.email}`} className="text-sm text-primary hover:underline">
                            {office.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {office.website && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('website')}</div>
                          <a href={office.website} target="_blank" rel="noopener noreferrer" 
                             className="text-sm text-primary hover:underline">
                            {office.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Office Statistics */}
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader className="bg-card pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-primary" />
                      {t('statistics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{office.rating || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('rating')}</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{office.reviews_count || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('reviewsCount')}</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{packages.length}</div>
                        <div className="text-sm text-muted-foreground">{t('packagesCount')}</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{office.established_year || '-'}</div>
                        <div className="text-sm text-muted-foreground">{t('establishmentYear')}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('licenseNumber')}:</span>
                        <span className="font-medium">{office.license_number || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('commercialRegister')}:</span>
                        <span className="font-medium">{office.commercial_register || office.commercial_register_number || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('verificationStatus')}:</span>
                        <Badge className={office.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {office.verification_status === 'verified' ? t('verified') : t('pending')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-6">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-card pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('location')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <OfficeMap office={office} userLocation={userLocation || undefined} apiKeyValid={apiKeyValid} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="packages" className="mt-6">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-card pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-primary" />
                    {t('latestPackages')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {packagesLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-4">
                          <Skeleton className="h-48 w-full rounded-xl" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : packages.length > 0 ? (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={stagger}
                      className="grid grid-cols-1 gap-6"
                    >
                      {packages.slice(0, 3).map((pkg) => (
                        <motion.div key={pkg.id} variants={fadeIn}>
                          <Link href={`/${locale}/landing/packages/${pkg.id}`}>
                            <PackageCard pkg={pkg} />
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('noPackagesAvailable')}</h3>
                      <p className="text-muted-foreground">
                        {t('noPackagesFound')}
                      </p>
                    </div>
                  )}
                  
                  {packages.length > 0 && (
                    <div className="text-center mt-8">
                      <Link href={`/${locale}/landing/packages?office=${office.id}`}>
                        <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10">
                          {t('viewAllPackages')} ({packages.length}+)
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services" className="mt-6">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-card pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {t('servicesTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {office.services && office.services.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {office.services.map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="font-medium">{service}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('noServices')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-primary/5 p-1">
              <TabsTrigger 
                value="about" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4" />
                {t('tabs.about')}
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <MapPin className="h-4 w-4" />
                {t('tabs.location')}
              </TabsTrigger>
              <TabsTrigger 
                value="packages" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Package className="h-4 w-4" />
                {t('tabs.packages')}
              </TabsTrigger>
              <TabsTrigger 
                value="services" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <CheckCircle className="h-4 w-4" />
                {t('tabs.services')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Information */}
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader className="bg-card pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      {t('contactInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {office.address && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('address')}</div>
                          <div className="text-sm text-muted-foreground">{office.address}</div>
                        </div>
                      </div>
                    )}
                    {office.contact_number && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('phone')}</div>
                          <a href={`tel:${office.contact_number}`} className="text-sm text-primary hover:underline">
                            {office.contact_number}
                          </a>
                        </div>
                      </div>
                    )}
                    {office.email && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('email')}</div>
                          <a href={`mailto:${office.email}`} className="text-sm text-primary hover:underline">
                            {office.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {office.website && (
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{t('website')}</div>
                          <a href={office.website} target="_blank" rel="noopener noreferrer" 
                             className="text-sm text-primary hover:underline">
                            {office.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Office Statistics */}
                <Card className="border-primary/10 shadow-sm">
                  <CardHeader className="bg-card pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {t('statistics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{office.rating || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('rating')}</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{office.reviews_count || 0}</div>
                        <div className="text-sm text-muted-foreground">{t('reviewsCount')}</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{packages.length}</div>
                        <div className="text-sm text-muted-foreground">{t('packagesCount')}</div>
                      </div>
                      <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="text-2xl font-bold text-primary">{office.established_year || '-'}</div>
                        <div className="text-sm text-muted-foreground">{t('establishmentYear')}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('licenseNumber')}:</span>
                        <span className="font-medium">{office.license_number || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('commercialRegister')}:</span>
                        <span className="font-medium">{office.commercial_register || office.commercial_register_number || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('verificationStatus')}:</span>
                        <Badge className={office.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {office.verification_status === 'verified' ? t('verified') : t('pending')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="location" className="mt-8">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-card pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t('location')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <OfficeMap office={office} userLocation={userLocation || undefined} apiKeyValid={apiKeyValid} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="packages" className="mt-8">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-card pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {t('latestPackages')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {packagesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-4">
                          <Skeleton className="h-48 w-full rounded-xl" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : packages.length > 0 ? (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={stagger}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {packages.map((pkg) => (
                        <motion.div key={pkg.id} variants={fadeIn}>
                          <Link href={`/${locale}/landing/packages/${pkg.id}`}>
                            <PackageCard pkg={pkg} />
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('noPackagesAvailable')}</h3>
                      <p className="text-muted-foreground">
                        {t('noPackagesFound')}
                      </p>
                    </div>
                  )}
                  
                  {packages.length > 0 && (
                    <div className="text-center mt-8">
                      <Link href={`/${locale}/landing/packages?office=${office.id}`}>
                        <Button variant="outline" size="lg" className="border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10">
                          {t('viewAllPackages')} ({packages.length}+)
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services" className="mt-8">
              <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-card pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    {t('servicesTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {office.services && office.services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {office.services.map((service, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="font-medium">{service}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('noServices')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 mt-12 mb-8">
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-gold opacity-90"></div>
            <CardContent className="p-8 md:p-12 text-center relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                {t('readyToBook')}
              </h2>
              <p className="mb-6 text-white/90 max-w-2xl mx-auto">
                {t('subtitle')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`/${locale}/landing/packages?office=${office.id}`}>
                  <Button size="lg" variant="secondary" className="rounded-full shadow-lg">
                    <Package className="h-5 w-5 mr-2" />
                    {t('viewPackages')}
                  </Button>
                </Link>
                {office.contact_number && (
                  <a href={`tel:${office.contact_number}`}>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="rounded-full bg-white/10 border-white hover:bg-white/20 text-white shadow-lg"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      {t('contactOffice')}
                    </Button>
                  </a>
                )}
                {office.whatsapp && (
                  <a href={`https://wa.me/${office.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="rounded-full bg-white/10 border-white hover:bg-white/20 text-white shadow-lg"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {t('whatsappContact')}
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </section>
    </div>
  );
} 