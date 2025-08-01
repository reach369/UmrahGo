'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import PackageCard from '@/components/ui/package-card';
import LoadingFallback from '@/components/ui/loading-fallback';
import ApiErrorBoundary from '@/components/ui/api-error-boundary';

// Services and Types
import { Package } from '@/services/packages.service';
import { fetchFeaturedPackages } from '@/services/packages.service';
import { Package as LegacyPackage } from '@/types/package';

export default function FeaturedPackages() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured packages with fallback to regular packages
  useEffect(() => {
    const getFeaturedPackages = async () => {
      try {
        setLoading(true);
        let response = await fetchFeaturedPackages();
        
        // If no featured packages, try to get regular packages
        if (!response || response.length === 0) {
          console.log('No featured packages found, fetching regular packages...');
          try {
            // Import fetchPackages dynamically to avoid circular imports
            const { fetchPackages } = await import('@/services/packages.service');
            const regularPackagesResponse = await fetchPackages();
            // Take first 6 regular packages as fallback
            response = regularPackagesResponse?.packages?.slice(0, 6) || [];
          } catch (fallbackError) {
            console.error('Error fetching regular packages as fallback:', fallbackError);
            response = [];
          }
        }
        
        setPackages(response || []);
      } catch (error) {
        console.error('Error fetching featured packages:', error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    getFeaturedPackages();
  }, []);

  // Convert Package from officesService to format expected by PackageCard
  const convertToLegacyPackage = (pkg: Package): LegacyPackage => {
    return {
      id: typeof pkg.id === 'string' ? parseInt(pkg.id) : pkg.id,
      office_id: pkg.office_id || 0,
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price != null ? pkg.price.toString() : '0',
      discount_price: pkg.discount_price != null ? pkg.discount_price.toString() : null,
      duration_days: pkg.duration_days || 0,
      features: pkg.features || {},
      status: pkg.status || 'available',
      is_featured: pkg.is_featured || false,
      views_count: 0, // Default value since not available in Package type
      max_persons: pkg.max_persons || 0,
      includes_transport: pkg.includes_transport || false,
      includes_accommodation: pkg.includes_accommodation || false,
      includes_meals: pkg.includes_meals || false,
      includes_guide: pkg.includes_guide || false,
      includes_insurance: false, // Default value since not available in Package type
      includes_activities: false, // Default value since not available in Package type
      start_location: pkg.start_location || null,
      end_location: pkg.end_location || null,
      start_date: pkg.start_date || null,
      end_date: pkg.end_date || null,
      location_coordinates: pkg.location_coordinates || { location: null },
      created_at: new Date().toISOString(), // Default value since not available in Package type
      updated_at: new Date().toISOString(), // Default value since not available in Package type
      deleted_at: null,
      featured_image_url: pkg.featured_image_url || '',
      thumbnail_url: pkg.thumbnail_url || '',
      has_discount: pkg.has_discount || !!pkg.discount_price || false,
      discount_percentage: 0, // Default value since not available in Package type
      images: (pkg.images || []).map(img => ({
        id: img.id,
        package_id: typeof pkg.id === 'string' ? parseInt(pkg.id) : pkg.id,
        image_path: img.url,
        title: img.alt_text || '',
        description: img.alt_text || '',
        alt_text: img.alt_text || '',
        is_main: false,
        sort_order: 0,
        is_featured: false,
        display_order: 0,
        url: img.url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })),
      office: pkg.office ? {
        id: pkg.office.id,
        user_id: 0,
        office_name: pkg.office.office_name,
        address: pkg.office.address || '',
        contact_number: pkg.office.contact_number || '',
        logo: pkg.office.logo || null,
        license_doc: null,
        verification_status: 'verified',
        subscription_id: null,
        email: pkg.office.email || '',
        website: pkg.office.website || null,
        fax: null,
        whatsapp: null,
        city: '',
        state: null,
        country: '',
        postal_code: null,
        latitude: null,
        longitude: null,
        commercial_register_number: null,
        license_number: '',
        license_expiry_date: null,
        description: null,
        services_offered: null,
        facebook_url: null,
        twitter_url: null,
        instagram_url: null,
        is_featured: false,
        rating: '0',
        reviews_count: 0,
        rejection_reason: null,
        rejection_notes: null,
        verified_by: null,
        verified_at: null,
        is_active: true,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : {
        id: pkg.office_id || 0,
        user_id: 0,
        office_name: 'Unknown Office',
        address: '',
        contact_number: '',
        logo: null,
        license_doc: null,
        verification_status: 'verified',
        subscription_id: null,
        email: '',
        website: null,
        fax: null,
        whatsapp: null,
        city: '',
        state: null,
        country: '',
        postal_code: null,
        latitude: null,
        longitude: null,
        commercial_register_number: null,
        license_number: '',
        license_expiry_date: null,
        description: null,
        services_offered: null,
        facebook_url: null,
        twitter_url: null,
        instagram_url: null,
        is_featured: false,
        rating: '0',
        reviews_count: 0,
        rejection_reason: null,
        rejection_notes: null,
        verified_by: null,
        verified_at: null,
        is_active: true,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      hotels: (pkg.hotels || []).map(hotel => ({
        id: hotel.id,
        office_id: pkg.office_id || 0,
        name: hotel.name,
        description: '',
        is_active: true,
        featured_image_url: '', // Use '' as default instead of null
        address: hotel.address,
        latitude: 0, // Use 0 as default instead of null
        longitude: 0, // Use 0 as default instead of null
        rating: hotel.rating,
        check_in_time: null,
        check_out_time: null,
        amenities: [], // Use [] as default instead of null
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      }))
    };
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
    <ApiErrorBoundary errorMessage="فشل في تحميل الباقات المميزة">
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
              {t('home.featuredPackages.title') || 'باقات العمرة المميزة'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.featuredPackages.subtitle') || 'اختر من بين أفضل باقات العمرة المميزة لدينا والتي توفر لك تجربة روحانية متكاملة'}
            </p>
          </div>

          {loading ? (
            <LoadingFallback type="cards" count={3} />
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {t('home.featuredPackages.noPackages') || 'لا توجد باقات متاحة في الوقت الحالي'}
              </p>
              <Link href={`/${locale}/landing/packages`}>
                <Button className="mt-4">
                  {t('home.featuredPackages.browseAll') || 'تصفح جميع الباقات'}
                </Button>
              </Link>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {packages.map((pkg) => (
                <motion.div 
                  key={pkg.id}
                  variants={itemVariants}
                >
                  <PackageCard 
                    pkg={convertToLegacyPackage(pkg)}
                    isPilgrimDashboard={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {packages.length > 0 && (
            <div className="text-center mt-10">
              <Link href={`/${locale}/landing/packages`}>
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 border-primary/30 hover:bg-primary/5"
                >
                  {t('home.featuredPackages.viewAll') || 'عرض جميع الباقات'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </ApiErrorBoundary>
  );
} 