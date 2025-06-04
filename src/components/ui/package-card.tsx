"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Link } from "@/i18n/navigation";
import { Package } from '@/types/package';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Heart,
  Star,
  Building2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from "next-intl";

// API storage base URL
const API_STORAGE_URL = 'https://umrahgo.reach369.com/storage/';

// Function to format image URLs from the API
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

interface PackageCardProps {
  pkg: Package;
  locale: string;
  isPilgrimDashboard?: boolean;
  className?: string;
}

export default function PackageCard({ pkg, locale, isPilgrimDashboard = false, className }: PackageCardProps) {
  const t = useTranslations();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // هنا يمكن إضافة منطق لحفظ المفضلة في API
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US');
    } catch (error) {
      return "-";
    }
  };

  // استخراج المميزات الرئيسية (أول 3)
  const getMainFeatures = (): string[] => {
    if (!pkg.features) return [];
    
    let features: string[] = [];
    if (Array.isArray(pkg.features)) {
      features = pkg.features.filter(f => typeof f === 'string') as string[];
    } else if (typeof pkg.features === 'object') {
      features = Object.values(pkg.features).filter(f => typeof f === 'string') as string[];
    }
    
    return features.slice(0, 3);
  };
  
  const mainFeatures = getMainFeatures();
  
  return (
    <motion.div 
      className={cn(
        "bg-card rounded-xl shadow-md border border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden h-full flex flex-col",
        className
      )}
      whileHover={{ y: -5 }}
    >
      <div className="relative h-52 overflow-hidden">
        <Image 
          src={getValidImageUrl(pkg.featured_image_url)} 
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        
        {/* شارة الباقة المميزة */}
        {pkg.is_featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-secondary hover:bg-secondary text-white">
              {t('packages.featured') || 'مميز'}
            </Badge>
          </div>
        )}
        
        {/* زر المفضلة */}
        {isPilgrimDashboard && (
          <button 
            onClick={toggleFavorite}
            className="absolute top-4 left-4 bg-background/80 p-2 rounded-full hover:bg-background transition-colors"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors", 
                isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
              )} 
            />
          </button>
        )}
        
        {/* السعر */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 px-3 py-1 rounded-full flex items-center">
            <span className="text-sm font-bold text-primary">
              {parseFloat(pkg.price).toLocaleString()} {t('common.currency') || 'ريال'}
            </span>
            
            {pkg.has_discount && pkg.discount_price && (
              <>
                <span className="mx-1 text-muted-foreground">|</span>
                <span className="text-xs line-through text-muted-foreground">
                  {parseFloat(pkg.discount_price).toLocaleString()} {t('common.currency') || 'ريال'}
                </span>
                <Badge className="ml-2 bg-red-500 hover:bg-red-600 text-[10px]">
                  {pkg.discount_percentage}%
                </Badge>
              </>
            )}
          </div>
        </div>
        
        {/* تقييم المكتب */}
        {pkg.office?.rating && (
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
              <span className="text-xs font-medium">
                {typeof pkg.office.rating === 'string' 
                  ? parseFloat(pkg.office.rating).toFixed(1)
                  : typeof pkg.office.rating === 'number'
                    ? pkg.office.rating
                    : '0.0'
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{pkg.name}</h3>
        
        {/* معلومات المكتب */}
        <div className="mb-3">
          <Link href={`/${locale}/umrah-offices/${pkg.office_id}`} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors truncate">
            <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{pkg.office?.office_name || t('packages.unknownOffice') || 'مكتب غير معروف'}</span>
          </Link>
        </div>
        
        {/* تفاصيل أساسية */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 text-primary mr-1" />
            <span>{pkg.duration_days} {t('packages.days') || 'أيام'}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 text-primary mr-1" />
            <span>{formatDate(pkg.start_date)}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 text-primary mr-1" />
            <span className="line-clamp-1">{pkg.start_location || '-'}</span>
          </div>
        </div>
        
        {/* المميزات الرئيسية */}
        {mainFeatures.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {mainFeatures.map((feature, index) => (
              <div key={index} className="flex items-start text-xs">
                <Check className="h-3.5 w-3.5 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{feature}</span>
              </div>
            ))}
          </div>
        )}
        
        {/* وصف مختصر */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {pkg.description}
        </p>
        
        {/* أزرار */}
        <div className="mt-auto pt-3 border-t border-border">
          <Link href={`/${locale}/${isPilgrimDashboard ? 'PilgrimUser/packages/' : 'packages/'}${pkg.id}`}>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
              size="sm"
            >
              {t('packages.viewDetails') || 'عرض التفاصيل'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          
          {isPilgrimDashboard && (
            <Link href={`/${locale}/PilgrimUser/booking/new?package=${pkg.id}`}>
              <Button 
                variant="outline"
                className="w-full mt-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
                size="sm"
              >
                {t('packages.bookNow') || 'احجز الآن'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
} 