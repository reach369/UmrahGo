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

// Services and Types
import { fetchFeaturedPackages, Package } from '@/services/officesService';
import { Package as LegacyPackage } from '@/types/package';

export default function FeaturedPackages() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured packages
  useEffect(() => {
    const getFeaturedPackages = async () => {
      try {
        setLoading(true);
        const response = await fetchFeaturedPackages();
        if (response.status && response.data) {
          setPackages(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured packages:', error);
        setLoading(false);
        setPackages([]);
      }
    };

    getFeaturedPackages();
  }, []);

  // Convert Package from officesService to format expected by PackageCard
  const convertToLegacyPackage = (pkg: Package): LegacyPackage => {
    return {
      id: parseInt(pkg.id) || 0,
      office_id: pkg.office_id ? parseInt(pkg.office_id) : 0,
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price !== undefined ? pkg.price.toString() : '0',
      discount_price: pkg.discount_price !== undefined ? pkg.discount_price.toString() : null,
      duration_days: pkg.duration_days || pkg.duration || 0,
      features: pkg.features || {},
      status: pkg.status || 'available',
      is_featured: pkg.is_featured || false,
      views_count: pkg.views_count || 0,
      max_persons: pkg.max_persons || 0,
      includes_transport: pkg.includes_transport || false,
      includes_accommodation: pkg.includes_accommodation || false,
      includes_meals: pkg.includes_meals || false,
      includes_guide: pkg.includes_guide || false,
      includes_insurance: pkg.includes_insurance || false,
      includes_activities: pkg.includes_activities || false,
      start_location: pkg.start_location || null,
      end_location: pkg.end_location || null,
      start_date: pkg.start_date || null,
      end_date: pkg.end_date || null,
      location_coordinates: pkg.location_coordinates || { location: null },
      created_at: pkg.created_at || '',
      updated_at: pkg.updated_at || '',
      deleted_at: pkg.deleted_at || null,
      featured_image_url: pkg.featured_image_url || pkg.cover_image || '',
      thumbnail_url: pkg.thumbnail_url || pkg.cover_image || '',
      has_discount: pkg.has_discount || !!pkg.discount_price || false,
      discount_percentage: pkg.discount_percentage || 0,
      images: (pkg.images || []).map(img => ({
        ...img,
        is_main: typeof img.is_main === 'number' ? Boolean(img.is_main) : img.is_main
      })),
      office: pkg.office || {
        id: pkg.office_id ? parseInt(pkg.office_id) : 0,
        user_id: 0,
        office_name: pkg.office_name || '',
        address: '',
        contact_number: '',
        logo: pkg.office_logo || null,
        license_doc: null,
        verification_status: '',
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
        created_at: pkg.created_at || '',
        updated_at: pkg.updated_at || ''
      },
      hotels: []
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
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
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
            {packages.map((pkg) => (
              <motion.div 
                key={pkg.id}
                variants={itemVariants}
              >
                <PackageCard 
                  pkg={convertToLegacyPackage(pkg)}
                  locale={locale}
                  isPilgrimDashboard={false}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {packages.length > 0 && (
          <div className="text-center mt-10">
            <Link href={`/${locale}/packages`}>
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
  );
} 