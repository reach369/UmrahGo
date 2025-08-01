'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { fetchPackages, Package } from '@/services/packages.service';
import { fetchOffices } from '@/services/officesService';
import { getLocaleFromParams, type NextParams } from '@/utils/params';
import { useDebounce } from '@/hooks/useDebounce';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Clock, 
  Building,
  Loader2,
  ChevronDown,
  X,
  SortAsc,
  SortDesc,
  Heart,
  Eye,
  Award,
  Verified,
  Gift,
  Plane,
  BedDouble,
  ChevronLeft,
  Package2,
  ChevronRight
} from 'lucide-react';

import { getValidImageUrl } from '@/utils/image-helpers';

interface PackagesPageProps {
  params: NextParams;
}

function PackagesPageContent({ params }: PackagesPageProps) {
  const locale = getLocaleFromParams(params, 'ar');
  const t = useTranslations();
  const tPackages = useTranslations('packages');
  const searchParams = useSearchParams();
  
  // State
  const [allPackages, setAllPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRangeInternal, setPriceRangeInternal] = useState([0, 10000]);
  const [durationRangeInternal, setDurationRangeInternal] = useState([0, 30]);
  
  // Use debounced values for filtering to prevent too many updates
  const priceRange = useDebounce(priceRangeInternal, 300);
  const durationRange = useDebounce(durationRangeInternal, 300);
  
  const [sortBy, setSortBy] = useState('price_asc');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Currency symbol - using a stable default value to avoid translation issues
  const currencySymbol = locale === 'ar' ? 'ر.س' : 'SAR';
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);

  // Fetch all packages from API
  const fetchAllPackages = async () => {
    setLoading(true);
    try {
      const response = await fetchPackages({ per_page: 9999 }); // Get all packages
      
      if (response && response.packages) {
        setAllPackages(response.packages);
        
        // Set dynamic price and duration ranges based on actual data
        if (response.packages.length > 0) {
          const prices = response.packages.map((pkg: Package) => typeof pkg.price === 'number' ? pkg.price : 0).filter(p => p > 0);
          const durations = response.packages.map((pkg: Package) => pkg.duration_days || 0).filter(d => d > 0);
          
          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRangeInternal([minPrice, maxPrice]);
          }
          
          if (durations.length > 0) {
            const minDuration = Math.min(...durations);
            const maxDuration = Math.max(...durations);
            setDurationRangeInternal([minDuration, maxDuration]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setAllPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting to the packages
  const applyFiltersAndSort = useCallback(() => {
    if (!allPackages.length) return;

    let filtered = [...allPackages];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((pkg: Package) => 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkg.description && pkg.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pkg.office?.office_name && pkg.office.office_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply price filter
    filtered = filtered.filter((pkg: Package) => {
      const price = typeof pkg.price === 'number' ? pkg.price : 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply duration filter
    filtered = filtered.filter((pkg: Package) => {
      const duration = pkg.duration_days || 0;
      return duration >= durationRange[0] && duration <= durationRange[1];
    });

    // Apply rating filter
    if (ratingFilter) {
      filtered = filtered.filter((pkg: Package) => {
        const rating = pkg.rating || 0;
        return rating >= ratingFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'duration_asc':
          return (a.duration_days || 0) - (b.duration_days || 0);
        case 'duration_desc':
          return (b.duration_days || 0) - (a.duration_days || 0);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    setFilteredPackages(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allPackages, priceRange, durationRange, searchQuery, ratingFilter, sortBy]);

  // Apply filters function
  const applyFilters = () => {
    setIsFilterOpen(false); // Close mobile filter panel
    applyFiltersAndSort();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setRatingFilter(null);
    setCurrentPage(1);
    setSortBy('price_asc');
    setIsFilterOpen(false);
    
    // Reset price and duration ranges to original values
    if (allPackages.length > 0) {
      const prices = allPackages.map((pkg: Package) => typeof pkg.price === 'number' ? pkg.price : 0).filter(p => p > 0);
      const durations = allPackages.map((pkg: Package) => pkg.duration_days || 0).filter(d => d > 0);
      
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRangeInternal([minPrice, maxPrice]);
      } else {
        setPriceRangeInternal([0, 10000]);
      }
      
      if (durations.length > 0) {
        const minDuration = Math.min(...durations);
          const maxDuration = Math.max(...durations);
          setDurationRangeInternal([minDuration, maxDuration]);
      } else {
        setDurationRangeInternal([0, 30]);
      }
    } else {
      setPriceRangeInternal([0, 10000]);
      setDurationRangeInternal([0, 30]);
    }
    applyFiltersAndSort();
  };

  // Get paginated packages
  const getPaginatedPackages = () => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredPackages.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredPackages.length / perPage);

  // Initialize page
  useEffect(() => {
    const initialSearch = searchParams?.get('search') || '';
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
    fetchAllPackages();
  }, [searchParams]);

  // Apply filters when any filter state changes
  useEffect(() => {
    if (allPackages.length > 0) {
      applyFiltersAndSort();
    } else if (!loading) {
      // If no packages and not loading, show empty filtered list
      setFilteredPackages([]);
    }
  }, [allPackages, loading, applyFiltersAndSort]);

  // Apply filters and sorting to the packages
  useEffect(() => {
    if (allPackages.length > 0) {
      applyFiltersAndSort();
    }
  }, [priceRange, durationRange, searchQuery, ratingFilter, sortBy, applyFiltersAndSort, allPackages]);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Rating stars renderer
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  const paginatedPackages = getPaginatedPackages();

  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t('packages.title') || 'باقات العمرة'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('packages.subtitle') || 'اختر من بين مجموعة متنوعة من باقات العمرة المقدمة من مكاتب عمرة معتمدة'}
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 transform -translate-y-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('packages.search') || 'ابحث عن باقات العمرة...'}
                  className="pl-10 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyFilters();
                    }
                  }}
              />
              </div>
              <Button 
                className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white ml-2"
                onClick={applyFilters}
              >
                {t('packages.searchButton') || 'بحث'}
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 hidden lg:block">
          <div className="h-32 w-32 rounded-full bg-primary/10 backdrop-blur-sm"></div>
        </div>
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <div className="h-20 w-20 rounded-full bg-primary/15 backdrop-blur-sm"></div>
        </div>
      </section>
      
      {/* Filters and Packages */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap md:flex-nowrap gap-8">
            {/* Filters - Desktop */}
            <div className="w-full md:w-1/4 hidden md:block">
              <div className="bg-card rounded-xl p-6 border border-primary/10 shadow-md sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">{t('packages.filters') || 'الفلاتر'}</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('packages.clearFilters') || 'مسح الفلاتر'}
                  </button>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('packages.priceRange') || 'نطاق السعر'}</h4>
                    <div className="pt-4">
                  <Slider
                        min={0}
                      max={allPackages.length > 0 ? Math.max(...allPackages.map(p => p.price || 0)) : 10000}
                        step={100}
                    value={priceRangeInternal}
                    onValueChange={setPriceRangeInternal}
                        className="my-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{priceRangeInternal[0]} {currencySymbol}</span>
                        <span>{priceRangeInternal[1]} {currencySymbol}</span>
                      </div>
                  </div>
                </div>
                
                  {/* Duration Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-foreground">{t('packages.durationRange') || 'المدة'}</h4>
                    <div className="pt-4">
                      <Slider
                        min={0}
                      max={allPackages.length > 0 ? Math.max(...allPackages.map(p => p.duration_days || 0)) : 30}
                        step={1}
                        value={durationRangeInternal}
                        onValueChange={setDurationRangeInternal}
                        className="my-4"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{durationRangeInternal[0]} {t('packages.days') || 'يوم'}</span>
                        <span>{durationRangeInternal[1]} {t('packages.days') || 'يوم'}</span>
                      </div>
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('packages.ratingFilter') || 'التقييم'}</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={ratingFilter === rating}
                          onCheckedChange={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`rating-${rating}`}
                          className="ml-2 text-sm font-normal cursor-pointer flex items-center"
                        >
                          <div className="flex mr-2">
                            {renderRatingStars(rating)}
                          </div>
                          <span>فأعلى</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary mt-2"
                  onClick={applyFilters}
                >
                  {t('packages.applyFilters') || 'تطبيق الفلاتر'}
                </Button>
              </div>
            </div>
            
            {/* Mobile Filter Button */}
            <div className="md:hidden sticky top-20 z-30 w-full">
              <div className="bg-background/80 backdrop-blur-sm pb-4 pt-2">
                <button
                  className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 rounded-full px-4 py-2 w-full transition-colors duration-200"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">{t('packages.filters') || 'الفلاتر'}</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Filter Panel */}
            {isFilterOpen && (
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="absolute inset-y-0 right-0 w-4/5 bg-background p-4 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">{t('packages.filters') || 'الفلاتر'}</h3>
                    <button
                      className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/10"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Mobile Filters Content */}
                  <div className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium mb-3">{t('packages.priceRange') || 'نطاق السعر'}</h4>
                      <div className="pt-4">
                        <Slider
                          min={0}
                          max={allPackages.length > 0 ? Math.max(...allPackages.map(p => p.price || 0)) : 10000}
                          step={100}
                          value={priceRangeInternal}
                          onValueChange={setPriceRangeInternal}
                          className="my-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{priceRangeInternal[0]} {currencySymbol}</span>
                          <span>{priceRangeInternal[1]} {currencySymbol}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Duration Range */}
                    <div>
                      <h4 className="font-medium mb-3">{t('packages.durationRange') || 'المدة'}</h4>
                      <div className="pt-4">
                        <Slider
                          min={0}
                          max={allPackages.length > 0 ? Math.max(...allPackages.map(p => p.duration_days || 0)) : 30}
                          step={1}
                          value={durationRangeInternal}
                          onValueChange={setDurationRangeInternal}
                          className="my-4"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{durationRangeInternal[0]} {t('packages.days') || 'يوم'}</span>
                          <span>{durationRangeInternal[1]} {t('packages.days') || 'يوم'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <h4 className="font-medium mb-3">{t('packages.ratingFilter') || 'التقييم'}</h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center">
                            <Checkbox
                              id={`mobile-rating-${rating}`}
                              checked={ratingFilter === rating}
                              onCheckedChange={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor={`mobile-rating-${rating}`}
                              className="ml-2 text-sm font-normal cursor-pointer flex items-center"
                            >
                              <div className="flex mr-2">
                                {renderRatingStars(rating)}
                              </div>
                              <span>فأعلى</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-2">
                    <button
                      className="flex-1 bg-gray-200 rounded-lg py-2"
                      onClick={resetFilters}
                    >
                      {t('packages.clearFilters') || 'مسح'}
                    </button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                      onClick={applyFilters}
                    >
                      {t('packages.applyFilters') || 'تطبيق'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
            
            {/* Packages List */}
            <div className="w-full md:w-3/4">
              {/* Sorting Options */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t('packages.sort') || 'ترتيب حسب'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">{t('packages.priceLowToHigh') || 'السعر: من الأقل إلى الأعلى'}</SelectItem>
                      <SelectItem value="price_desc">{t('packages.priceHighToLow') || 'السعر: من الأعلى إلى الأقل'}</SelectItem>
                      <SelectItem value="duration_asc">{t('packages.durationShortToLong') || 'المدة: من الأقصر إلى الأطول'}</SelectItem>
                      <SelectItem value="duration_desc">{t('packages.durationLongToShort') || 'المدة: من الأطول إلى الأقصر'}</SelectItem>
                      <SelectItem value="name_asc">الاسم: أ-ي</SelectItem>
                      <SelectItem value="name_desc">الاسم: ي-أ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {loading ? '...' : `${filteredPackages.length} ${t('packages.results') || 'نتيجة'} من ${allPackages.length}`}
                </div>
              </div>
              
              {loading ? (
                // Loading state
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-card rounded-xl overflow-hidden shadow-md animate-pulse">
                      <div className="h-48 bg-primary/10"></div>
                      <div className="p-6">
                        <div className="h-6 bg-primary/10 rounded mb-3 w-3/4"></div>
                        <div className="h-4 bg-primary/5 rounded mb-4 w-1/2"></div>
                        <div className="flex gap-2 mb-4">
                          <div className="h-4 w-24 bg-primary/5 rounded"></div>
                          <div className="h-4 w-32 bg-primary/5 rounded"></div>
                        </div>
                        <div className="h-10 bg-primary/10 rounded-lg w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Packages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedPackages.map((pkg, index) => (
                    <motion.div 
                      key={pkg.id}
                      className="bg-card rounded-xl shadow-md border border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image 
                          src={getValidImageUrl(pkg.featured_image_url) || '/images/package-placeholder.jpg'} 
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
                              {typeof pkg.price === 'string' ? parseFloat(pkg.price).toLocaleString() : (pkg.price || 0).toLocaleString()} {currencySymbol}
                                </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 line-clamp-1">{pkg.name}</h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                            {pkg.description || t('packages.noDescription') || 'لا يوجد وصف متاح'}
                          </p>
                        
                          <div className="flex flex-col space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-primary mr-2" />
                            <span>{pkg.duration_days} {t('packages.days') || 'أيام'}</span>
                          </div>
                          
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-primary mr-2" />
                                <span>
                                  {pkg.start_date
                                    ? new Date(pkg.start_date).toLocaleDateString(locale)
                                    : '-'}
                                </span>
                              </div>
                          
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 text-primary mr-2" />
                            <span className="line-clamp-1">{pkg.start_location || '-'}</span>
                              </div>
                            </div>
                        
                        <div className="mb-4 pb-4 border-b border-primary/10">
                            <Link href={`/${locale}/landing/umrah-offices/${pkg.office_id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                            {pkg.office?.office_name || t('packages.unknownOffice') || 'مكتب غير معروف'}
                          </Link>
                        </div>
                        
                          <Link href={`/${locale}/landing/packages/${pkg.id}`}>
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                                {t('packages.viewDetails') || 'عرض التفاصيل'}
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  
                  {/* Empty State */}
                  {filteredPackages.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Package2 className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t('packages.noResults.title') || 'لم يتم العثور على نتائج'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {t('packages.noResults.description') || 'حاول تغيير معايير البحث أو الفلترة الخاصة بك'}
                      </p>
                      <Button 
                        variant="outline"
                        className="rounded-full border-primary/30 hover:bg-primary/5"
                    onClick={resetFilters}
                  >
                        {t('packages.clearFilters') || 'مسح الفلاتر'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {filteredPackages.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 rounded-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else {
                          const start = Math.max(1, currentPage - 2);
                          const end = Math.min(totalPages, start + 4);
                          pageNumber = start + i;
                          if (pageNumber > end) return null;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`h-9 w-9 rounded-md ${
                              currentPage === pageNumber 
                                ? "bg-primary text-white" 
                                : "hover:bg-primary/10"
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-9 w-9 rounded-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PackagesPage({ params }: PackagesPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PackagesPageContent params={params} />
    </Suspense>
  );
} 