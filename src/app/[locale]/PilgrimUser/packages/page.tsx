'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import PackageCard from '@/components/ui/package-card';
import { Separator } from '@/components/ui/separator';

// Icons
import { Search, Filter, Building2, CalendarDays, Check, Loader2 } from 'lucide-react';

// Services and Types
import { fetchPackages, Package } from '@/services/officesService';
import { Package as LegacyPackage } from '@/types/package';

export default function PilgrimPackagesPage() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || 'ar';
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [includesOptions, setIncludesOptions] = useState({
    transport: false,
    accommodation: false,
    meals: false,
    guide: false,
  });
  
  // Convert Package from officesService to format expected by UI
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
  
  // فلترة الباقات
  useEffect(() => {
    if (!packages.length) return;
    
    let filtered = [...packages];
    
    // البحث بالاسم
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.description && pkg.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // فلترة حسب نطاق السعر
    filtered = filtered.filter(pkg => {
      const price = typeof pkg.price === 'string' ? parseFloat(pkg.price) : (pkg.price || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // فلترة حسب المدة
    if (selectedDuration) {
      if (selectedDuration === '1-7') {
        filtered = filtered.filter(pkg => pkg.duration_days && pkg.duration_days >= 1 && pkg.duration_days <= 7);
      } else if (selectedDuration === '8-14') {
        filtered = filtered.filter(pkg => pkg.duration_days && pkg.duration_days >= 8 && pkg.duration_days <= 14);
      } else if (selectedDuration === '15+') {
        filtered = filtered.filter(pkg => pkg.duration_days && pkg.duration_days >= 15);
      }
    }
    
    // فلترة حسب ما تتضمنه الباقة
    if (includesOptions.transport) {
      filtered = filtered.filter(pkg => pkg.includes_transport);
    }
    if (includesOptions.accommodation) {
      filtered = filtered.filter(pkg => pkg.includes_accommodation);
    }
    if (includesOptions.meals) {
      filtered = filtered.filter(pkg => pkg.includes_meals);
    }
    if (includesOptions.guide) {
      filtered = filtered.filter(pkg => pkg.includes_guide);
    }
    
    setFilteredPackages(filtered);
  }, [packages, searchTerm, priceRange, selectedDuration, includesOptions]);

  // جلب الباقات
  useEffect(() => {
    const getPackages = async () => {
      try {
        setLoading(true);
        const response = await fetchPackages();
        if (response && response.packages) {
          setPackages(response.packages);
          setFilteredPackages(response.packages);
          
          // تحديد نطاق السعر المتاح
          if (response.packages.length > 0) {
            const prices = response.packages.map((pkg: { price: string; }) => 
              typeof pkg.price === 'string' ? parseFloat(pkg.price) : (pkg.price || 0)
            );
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange([minPrice, maxPrice]);
          }
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getPackages();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('pilgrim.packages.title') || 'باقات العمرة'}</h1>
        <p className="text-muted-foreground">
          {t('pilgrim.packages.subtitle') || 'اكتشف أفضل باقات العمرة المناسبة لاحتياجاتك'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* فلاتر البحث */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            {t('pilgrim.packages.filters') || 'تصفية النتائج'}
          </h2>
          
          {/* البحث بالكلمات */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('pilgrim.packages.searchPlaceholder') || 'ابحث عن باقات...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Separator className="my-5" />
          
          {/* نطاق السعر */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-4">{t('pilgrim.packages.priceRange') || 'نطاق السعر'}</h3>
            <Slider
              defaultValue={priceRange}
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mb-2"
            />
            <div className="flex justify-between text-sm">
              <span>{priceRange[0]} {t('common.currency') || 'ريال'}</span>
              <span>{priceRange[1]} {t('common.currency') || 'ريال'}</span>
            </div>
          </div>
          
          <Separator className="my-5" />
          
          {/* مدة الباقة */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">{t('pilgrim.packages.duration') || 'مدة الباقة'}</h3>
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger>
                <SelectValue placeholder={t('pilgrim.packages.selectDuration') || 'اختر المدة'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {t('pilgrim.packages.allDurations') || 'كل المدد'}
                </SelectItem>
                <SelectItem value="1-7">
                  1-7 {t('packages.days') || 'أيام'}
                </SelectItem>
                <SelectItem value="8-14">
                  8-14 {t('packages.days') || 'أيام'}
                </SelectItem>
                <SelectItem value="15+">
                  15+ {t('packages.days') || 'أيام'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-5" />
          
          {/* مميزات الباقة */}
          <div>
            <h3 className="text-sm font-medium mb-3">{t('pilgrim.packages.includes') || 'الباقة تشمل'}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox 
                  id="transport" 
                  checked={includesOptions.transport}
                  onCheckedChange={(checked) => 
                    setIncludesOptions(prev => ({ ...prev, transport: !!checked }))
                  }
                />
                <Label htmlFor="transport">{t('pilgrim.packages.includesTransport') || 'المواصلات'}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox 
                  id="accommodation" 
                  checked={includesOptions.accommodation}
                  onCheckedChange={(checked) => 
                    setIncludesOptions(prev => ({ ...prev, accommodation: !!checked }))
                  }
                />
                <Label htmlFor="accommodation">{t('pilgrim.packages.includesAccommodation') || 'الإقامة'}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox 
                  id="meals" 
                  checked={includesOptions.meals}
                  onCheckedChange={(checked) => 
                    setIncludesOptions(prev => ({ ...prev, meals: !!checked }))
                  }
                />
                <Label htmlFor="meals">{t('pilgrim.packages.includesMeals') || 'الوجبات'}</Label>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Checkbox 
                  id="guide" 
                  checked={includesOptions.guide}
                  onCheckedChange={(checked) => 
                    setIncludesOptions(prev => ({ ...prev, guide: !!checked }))
                  }
                />
                <Label htmlFor="guide">{t('pilgrim.packages.includesGuide') || 'المرشد'}</Label>
              </div>
            </div>
          </div>
          
          <Separator className="my-5" />
          
          {/* إعادة ضبط الفلاتر */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSearchTerm('');
              setPriceRange([0, 10000]);
              setSelectedDuration('');
              setIncludesOptions({
                transport: false,
                accommodation: false,
                meals: false,
                guide: false,
              });
            }}
          >
            {t('pilgrim.packages.resetFilters') || 'إعادة ضبط'}
          </Button>
        </div>
        
        {/* قائمة الباقات */}
        <div className="lg:col-span-3">
          {loading ? (
            // حالة التحميل
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : filteredPackages.length === 0 ? (
            // لا توجد نتائج
            <div className="bg-card p-12 rounded-xl border text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                {t('pilgrim.packages.noResults') || 'لا توجد باقات متاحة'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('pilgrim.packages.tryDifferentFilters') || 'جرب معايير بحث مختلفة أو تواصل معنا للحصول على المساعدة'}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange([0, 10000]);
                  setSelectedDuration('');
                  setIncludesOptions({
                    transport: false,
                    accommodation: false,
                    meals: false,
                    guide: false,
                  });
                }}
              >
                {t('pilgrim.packages.clearFilters') || 'مسح الفلاتر'}
              </Button>
            </div>
          ) : (
            // قائمة الباقات
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-muted-foreground">
                  {t('pilgrim.packages.showingResults', { count: filteredPackages.length }) || 
                   `عرض ${filteredPackages.length} باقة`}
                </p>
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('pilgrim.packages.sortBy') || 'ترتيب حسب'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('pilgrim.packages.sortNewest') || 'الأحدث'}</SelectItem>
                    <SelectItem value="price-asc">{t('pilgrim.packages.sortPriceAsc') || 'السعر: من الأقل للأعلى'}</SelectItem>
                    <SelectItem value="price-desc">{t('pilgrim.packages.sortPriceDesc') || 'السعر: من الأعلى للأقل'}</SelectItem>
                    <SelectItem value="duration">{t('pilgrim.packages.sortDuration') || 'المدة'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPackages.map((pkg) => (
                  <motion.div 
                    key={pkg.id}
                    variants={itemVariants}
                  >
                    <PackageCard 
                      pkg={convertToLegacyPackage(pkg)}
                      locale={locale}
                      isPilgrimDashboard={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 