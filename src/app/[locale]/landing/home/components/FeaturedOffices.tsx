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

// Icons
import { Star, MapPin, ExternalLink } from 'lucide-react';

// Services and Types
import { fetchFeaturedOffices, Office } from '@/services/officesService';
import { Office as LegacyOffice } from '@/types/office.types';

// API storage base URL
const API_STORAGE_URL = 'https://umrahgo.reach369.com/storage/';

// Function to format image URLs from the API
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

export default function FeaturedOffices() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured offices
  useEffect(() => {
    const getFeaturedOffices = async () => {
      try {
        setLoading(true);
        const response = await fetchFeaturedOffices();
        if (response.status && response.data) {
          // Log the first office logo URL to help with debugging
          if (response.data.length > 0) {
            console.log('First office logo URL:', response.data[0].logo);
          }
          setOffices(response.data.slice(0, 6)); // Limit to 6 offices
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured offices:', error);
        setLoading(false);
        setOffices([]);
      }
    };

    getFeaturedOffices();
  }, []);

  // Helper function to get a numeric rating
  const getNumericRating = (rating: number | undefined): number => {
    return rating || 0;
  };

  // Rating stars renderer
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        size={16}
        className={`${index < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            {t('home.featuredOffices.title') || 'مكاتب العمرة المميزة'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.featuredOffices.subtitle') || 'تعرف على أفضل مكاتب العمرة المعتمدة في المملكة لتجربة روحانية لا تُنسى'}
          </p>
        </div>

        {loading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-card rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-primary/10"></div>
                <div className="p-6">
                  <div className="h-6 bg-primary/10 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-primary/5 rounded mb-4 w-1/2"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-4 w-24 bg-primary/5 rounded"></div>
                  </div>
                  <div className="h-10 bg-primary/10 rounded-lg w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {offices.map((office) => (
              <motion.div 
                key={office.id}
                className="bg-card rounded-xl shadow-md border border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
                variants={itemVariants}
              >
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={getValidImageUrl(office.logo)} 
                    alt={office.office_name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                  
                  {office.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-secondary hover:bg-secondary text-white">
                        {t('offices.featured') || 'مميز'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                      <div className="flex">
                        {renderRatingStars(getNumericRating(office.rating))}
                      </div>
                      <span className="text-sm font-medium ml-1">
                        {getNumericRating(office.rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{office.office_name}</h3>
                  
                  {office.address && (
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 text-primary mr-2 shrink-0" />
                      <span className="line-clamp-1">{office.address}</span>
                    </div>
                  )}
                  
                  <Link href={`/${locale}/umrah-offices/${office.id}`}>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary mt-2">
                      {t('home.featuredOffices.viewDetails') || 'عرض التفاصيل'}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {offices.length > 0 && (
          <div className="text-center mt-10">
            <Link href={`/${locale}/umrah-offices`}>
              <Button 
                variant="outline" 
                className="rounded-full px-6 border-primary/30 hover:bg-primary/5"
              >
                {t('home.featuredOffices.viewAll') || 'عرض جميع المكاتب'}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 