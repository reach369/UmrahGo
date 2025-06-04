'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Icons
import { Clock, Calendar, MapPin, ExternalLink, Search, Filter, X } from 'lucide-react';

// Services and Types
import { fetchPackages, Package } from '@/services/officesService';

// Helper component for formatting dates
const FormatDate = ({ dateString, locale }: { dateString: string | null, locale: string }) => {
  if (!dateString) return <span>-</span>;
  
  try {
    const date = new Date(dateString);
    return (
      <span>
        {date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
      </span>
    );
  } catch (error) {
    return <span>-</span>;
  }
};

export default function PackagesPage() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || 'ar';
  
  // State
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [durationRange, setDurationRange] = useState([0, 30]);
  const [sortBy, setSortBy] = useState('price_asc');
  
  // Handle filter toggle
  const toggleFilter = () => setFilterOpen(!filterOpen);

  // Apply filters
  const applyFilters = async () => {
    setLoading(true);
    try {
      const filters = {
        min_price: priceRange[0],
        max_price: priceRange[1],
        per_page: 50,
        page: 1
      };
      
      const response = await fetchPackages();
      if (response && response.packages) {
        const filteredPackages = response.packages.filter((pkg: Package) => {
          // Filtrar por preço
          const price = typeof pkg.price === 'number' ? pkg.price : 0;
          if (price < priceRange[0] || price > priceRange[1]) return false;
          
          // Filtrar por duração
          const duration = pkg.duration_days || pkg.duration || 0;
          if (duration < durationRange[0] || duration > durationRange[1]) return false;
          
          // Filtrar por palavra-chave
          if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
              (!pkg.description || !pkg.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
          }
          
          return true;
        });
        
        // Ordenar
        let sortedPackages = [...filteredPackages];
        if (sortBy === 'price_asc') {
          sortedPackages.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_desc') {
          sortedPackages.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortBy === 'duration_asc') {
          sortedPackages.sort((a, b) => (a.duration_days || a.duration || 0) - (b.duration_days || b.duration || 0));
        } else if (sortBy === 'duration_desc') {
          sortedPackages.sort((a, b) => (b.duration_days || b.duration || 0) - (a.duration_days || a.duration || 0));
        }
        
        setPackages(sortedPackages);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 10000]);
    setDurationRange([0, 30]);
    setSortBy('price_asc');
    fetchInitialPackages();
  };

  // Fetch packages on initial load
  const fetchInitialPackages = async () => {
    setLoading(true);
    try {
      const initialSearch = searchParams?.get('search') || '';
      if (initialSearch) {
        setSearchQuery(initialSearch);
      }
      
      const response = await fetchPackages();
      
      if (response && response.packages) {
        let filteredPackages = response.packages;
        
        // Aplicar filtro de pesquisa inicial se houver
        if (initialSearch) {
          filteredPackages = filteredPackages.filter((pkg: Package) => 
            pkg.name.toLowerCase().includes(initialSearch.toLowerCase()) || 
            (pkg.description && pkg.description.toLowerCase().includes(initialSearch.toLowerCase()))
          );
        }
        
        setPackages(filteredPackages);
        
        // Definir os intervalos de preço e duração baseados nos dados
        if (filteredPackages.length > 0) {
          const prices = filteredPackages.map((pkg: Package) => typeof pkg.price === 'number' ? pkg.price : 0);
          const durations = filteredPackages.map((pkg: Package) => pkg.duration_days || pkg.duration || 0);
          
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const minDuration = Math.min(...durations);
          const maxDuration = Math.max(...durations);
          
          setPriceRange([minPrice, maxPrice]);
          setDurationRange([minDuration, maxDuration]);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize page
  useEffect(() => {
    fetchInitialPackages();
  }, [searchParams]);

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-primary-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('packages.title') || 'باقات العمرة'}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              {t('packages.subtitle') || 'اختر من بين مجموعة متنوعة من باقات العمرة المقدمة من مكاتب عمرة معتمدة'}
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-full p-1 max-w-xl mx-auto">
                <Input
                  type="text"
                placeholder={t('packages.searchPlaceholder') || 'ابحث عن باقات العمرة...'}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="button" 
                className="rounded-full bg-primary hover:bg-primary/90 text-white"
                onClick={applyFilters}
              >
                <Search className="h-4 w-4 mr-2" />
                {t('packages.search') || 'بحث'}
              </Button>
            </div>
        </div>
        </div>
      </section>
      
      {/* Packages Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-1/4 lg:block ${filterOpen ? 'block' : 'hidden'}`}>
              <div className="bg-card rounded-xl shadow-sm border border-primary/10 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary">
                    {t('packages.filters') || 'الفلاتر'}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetFilters}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t('packages.resetFilters') || 'إعادة ضبط'}
                  </Button>
                </div>
                
                <div className="space-y-6">
                {/* Price Range */}
                  <div className="space-y-2">
                    <Label>{t('packages.priceRange') || 'نطاق السعر'}</Label>
                    <div className="pt-4">
                  <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={10000}
                        step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                        className="my-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{priceRange[0]} {t('common.currency') || 'ريال'}</span>
                        <span>{priceRange[1]} {t('common.currency') || 'ريال'}</span>
                      </div>
                  </div>
                </div>
                
                  {/* Duration Range */}
                  <div className="space-y-2">
                    <Label>{t('packages.durationRange') || 'المدة'}</Label>
                    <div className="pt-4">
                      <Slider
                        defaultValue={durationRange}
                        min={0}
                        max={30}
                        step={1}
                        value={durationRange}
                        onValueChange={setDurationRange}
                        className="my-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{durationRange[0]} {t('packages.days') || 'يوم'}</span>
                        <span>{durationRange[1]} {t('packages.days') || 'يوم'}</span>
                      </div>
                  </div>
                </div>
                
                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>{t('packages.sortBy') || 'ترتيب حسب'}</Label>
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('packages.selectSort') || 'اختر الترتيب'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price_asc">{t('packages.priceLowToHigh') || 'السعر: من الأقل إلى الأعلى'}</SelectItem>
                        <SelectItem value="price_desc">{t('packages.priceHighToLow') || 'السعر: من الأعلى إلى الأقل'}</SelectItem>
                        <SelectItem value="duration_asc">{t('packages.durationShortToLong') || 'المدة: من الأقصر إلى الأطول'}</SelectItem>
                        <SelectItem value="duration_desc">{t('packages.durationLongToShort') || 'المدة: من الأطول إلى الأقصر'}</SelectItem>
                        <SelectItem value="rating_desc">{t('packages.highestRated') || 'أعلى تقييم'}</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                
                  {/* Apply Filters Button */}
                <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white mt-4"
                  onClick={applyFilters}
                >
                  {t('packages.applyFilters') || 'تطبيق الفلاتر'}
                </Button>
              </div>
              </div>
            </div>
            
            {/* Packages List */}
            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {t('packages.availablePackages') || 'الباقات المتاحة'}
                  {packages.length > 0 && (
                    <span className="text-muted-foreground text-sm font-normal"> ({packages.length})</span>
                  )}
                </h2>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="lg:hidden"
                  onClick={toggleFilter}
                >
                  {filterOpen ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      {t('packages.hideFilters') || 'إخفاء الفلاتر'}
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      {t('packages.showFilters') || 'عرض الفلاتر'}
                    </>
                  )}
                </Button>
              </div>
              
              {loading ? (
                // Loading state
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, index) => (
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
              ) : packages.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {packages.map((pkg) => (
                    <motion.div 
                      key={pkg.id}
                      className="bg-card rounded-xl shadow-md border border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
                      variants={itemVariants}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image 
                          src={pkg.featured_image_url || '/images/package-placeholder.jpg'} 
                          alt={pkg.name}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                        
                        {pkg.is_featured && (
                          <div className="absolute top-4 right-4">
                          <Badge className="bg-secondary hover:bg-secondary text-white">
                            {t('packages.featured') || 'مميز'}
                          </Badge>
                        </div>
                        )}
                        
                            <div className="absolute bottom-4 left-4">
                          <div className="bg-white/90 px-3 py-1 rounded-full">
                            <span className="text-sm font-bold text-primary">
                              {typeof pkg.price === 'string' ? parseFloat(pkg.price).toLocaleString() : (pkg.price || 0).toLocaleString()} {t('common.currency') || 'ريال'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{pkg.name}</h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-primary mr-2" />
                            <span>{pkg.duration_days} {t('packages.days') || 'أيام'}</span>
                          </div>
                          
                              <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <FormatDate dateString={pkg.start_date || null} locale={locale} />
                              </div>
                          
                              <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-primary mr-2" />
                            <span className="line-clamp-1">{pkg.start_location || '-'}</span>
                              </div>
                            </div>
                        
                        {/* Office info */}
                        <div className="mb-4 pb-4 border-b border-primary/10">
                          <Link href={`/${locale}/umrah-offices/${pkg.office_id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                            {pkg.office?.office_name || t('packages.unknownOffice') || 'مكتب غير معروف'}
                          </Link>
                        </div>
                        
                        <Link href={`/${locale}/packages/${pkg.id}`}>
                          <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary mt-2">
                                {t('packages.viewDetails') || 'عرض التفاصيل'}
                            <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                </motion.div>
              ) : (
                // Empty state
                <div className="text-center py-12 bg-card rounded-xl shadow-sm border border-primary/10 p-8">
                  <div className="mb-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                    {t('packages.noPackagesFound') || 'لم يتم العثور على باقات'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                    {t('packages.tryDifferentFilters') || 'حاول تغيير الفلاتر أو البحث بمصطلحات مختلفة'}
                      </p>
                      <Button 
                        variant="outline"
                    onClick={resetFilters}
                  >
                    {t('packages.resetFilters') || 'إعادة ضبط الفلاتر'}
                      </Button>
                    </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 