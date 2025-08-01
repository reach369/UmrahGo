'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  MapPin, 
  Search, 
  Filter, 
  X, 
  Star, 
  Building2,
  Phone,
  Mail,
  Globe,
  Award,
  Users,
  CheckCircle,
  ExternalLink,
  Clock,
  Shield,
  Heart,
  Eye,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  StarIcon,
  MapIcon,
  ListFilter,
  Grid,
  List,
  AlertCircle,
  Navigation,
  Share2
} from 'lucide-react';

// Services
import { officeService, Office } from '@/services/offices.service';
import { getValidImageUrl } from '@/utils/image-helpers';

export default function UmrahOfficesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations('offices');
  const tCommon = useTranslations('common');
  const isRtl = locale === 'ar';
  
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  
  // States
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  
  // Fetch user's location
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
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);
  
  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Fetch offices
  const fetchOfficesData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedRating && selectedRating !== 'all') params.append('rating', selectedRating);
      if (sortBy === 'rating') params.append('sort_by', 'rating');
      if (sortBy === 'nameAsc') params.append('sort_by', 'name');
      if (sortBy === 'nameDesc') {
        params.append('sort_by', 'name');
        params.append('sort_direction', 'desc');
      }
      
      // Add pagination parameters
      params.append('page', currentPage.toString());
      params.append('per_page', '12');
      
      const result = await officeService.fetchOffices(params.toString(), locale);
      console.log("Fetched offices data:", result);
      
      // Check if we have pagination data in the API response
      let totalItems = 0;
      let totalPagesCount = 1;
      let currentData: Office[] = [];
      
      if (Array.isArray(result)) {
        // Simple array response
        currentData = result;
        totalItems = result.length;
        totalPagesCount = Math.ceil(totalItems / 12);
      } 
      else if (result && typeof result === 'object') {
        // Check if this is a paginated response
        if (result.data && result.data.data && Array.isArray(result.data.data)) {
          // This is the new pagination structure
          currentData = result.data.data;
          totalItems = result.data.total || currentData.length;
          totalPagesCount = result.data.last_page || Math.ceil(totalItems / 12);
        }
        else if (result.data && Array.isArray(result.data)) {
          // Direct data array
          currentData = result.data;
          totalItems = result.data.length;
          totalPagesCount = Math.ceil(totalItems / 12);
        }
      }
      
      // If no data returned, set empty arrays
      if (!currentData || currentData.length === 0) {
        setOffices([]);
        setFilteredOffices([]);
        setTotalResults(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      
      // Process the office data for display
      let processedData = [...currentData];

      // Ensure translations are properly applied
      processedData = processedData.map(office => {
        // Try to get translation in current locale
        let officeName = office.name || office.office_name || '';
        let officeDescription = office.description || '';
        let officeAddress = office.address || '';
        let officeCity = office.city || '';
        
        // Check if we have translations and use them
        if (office.translations && Array.isArray(office.translations) && office.translations.length > 0) {
          // Try to find translation for current locale
          const translation = office.translations.find(t => t.locale === locale);
          
          if (translation) {
            officeName = translation.office_name || officeName;
            officeDescription = translation.description || officeDescription;
            officeAddress = translation.address || officeAddress;
            officeCity = translation.city || officeCity;
          }
        }
        
        // Make sure we have valid coordinates
        const latitude = office.latitude ? String(office.latitude) : '';
        const longitude = office.longitude ? String(office.longitude) : '';
        
        // Process services for better display
        let services = office.services || [];
        if (services.length === 0 && office.services_offered) {
          // Try to split the services string if not already processed
          if (typeof office.services_offered === 'string') {
            services = office.services_offered
              .split(/[,;\-\n]/) // Split by common separators
              .map(s => s.trim())
              .filter(Boolean);
          }
        }
        
        return { 
          ...office, 
          name: officeName,
          description: officeDescription,
          address: officeAddress,
          city: officeCity,
          services,
          latitude,
          longitude
        };
      });

      // Apply client-side distance sorting if needed
      if (sortBy === 'distance' && userLocation) {
        processedData.sort((a, b) => {
          const distA = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            parseFloat(a.latitude || '0'), 
            parseFloat(a.longitude || '0')
          );
          
          const distB = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            parseFloat(b.latitude || '0'), 
            parseFloat(b.longitude || '0')
          );
          
          return distA - distB;
        });
      }

      setOffices(currentData);
      setFilteredOffices(processedData);
      setTotalResults(totalItems);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error('Error fetching offices:', error);
      setOffices([]);
      setFilteredOffices([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCity, selectedRating, sortBy, currentPage, locale, userLocation]);
  
  useEffect(() => {
    fetchOfficesData();
  }, [fetchOfficesData]);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedRating('all');
    setSortBy('rating');
  };
  
  // Get unique cities
  const cities = [...new Set(offices.map(office => office.city).filter(Boolean))];
  
  // Render rating stars
  const renderRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        size={14}
        className={`${index < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  // Get verification badge
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="h-3 w-3 me-1" />
            {t('verified')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
            <Clock className="h-3 w-3 me-1" />
            {t('pending')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <AlertCircle className="h-3 w-3 me-1" />
            {t('rejected')}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get office image URL with better fallback
  const getOfficeImageUrl = (office: Office): string => {
    // Try different possible image fields
    const imageUrl = office.logo;
    
    if (imageUrl && imageUrl.trim() !== '') {
      // If it's already a full URL, use it
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // If it includes umrah_office path, it's likely from the API
      if (imageUrl.includes('umrah_office')) {
        // Construct the full URL with the API base URL
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';
        const storageUrl = baseApiUrl.replace('/api/v1', '/storage/');
        return `${storageUrl}${imageUrl}`;
      }
      
      // Use the helper function to construct proper URL
      return getValidImageUrl(imageUrl, '/images/office-placeholder.jpg');
    }
    
    return '/images/office-placeholder.jpg';
  };

  // Get distance display text
  const getDistanceText = (office: Office) => {
    if (!userLocation || !office.latitude || !office.longitude) return null;
    
    const officeLat = parseFloat(office.latitude);
    const officeLng = parseFloat(office.longitude);
    
    // Validate coordinates
    if (isNaN(officeLat) || isNaN(officeLng)) {
      return null;
    }
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      officeLat,
      officeLng
    );
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)} ${t('m')}`;
    }
    
    return `${distance.toFixed(1)} ${t('km')}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-4 bg-primary/20 rounded-full backdrop-blur-sm">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient-gold">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>{tCommon('certified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>{tCommon('qualityGuaranteed')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>{tCommon('excellentService')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Search and Filters */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-background via-background sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <motion.div 
              className="flex flex-col lg:flex-row gap-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-1 relative">
                <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5`} />
                <Input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${isRtl ? 'pr-12' : 'pl-12'} h-12 text-lg border-2 border-primary/20 focus:border-primary/50 rounded-xl bg-background/50 backdrop-blur-sm`}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 h-12 px-6 border-2 border-primary/20 hover:border-primary/50 rounded-xl bg-background/50 backdrop-blur-sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('filters')}
                  {showFilters && <X className="h-4 w-4" />}
                </Button>
                <div className="flex rounded-xl border-2 border-primary/20 overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="h-12 rounded-none"
                    title={tCommon('gridView')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="h-12 rounded-none"
                    title={tCommon('listView')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Mobile View Tab Navigation */}
            <div className="md:hidden mb-4">
              <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as 'grid' | 'list')} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="grid">
                    <Grid className="h-4 w-4 me-2" />
                    {tCommon('gridView')}
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 me-2" />
                    {tCommon('listView')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-primary/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-muted-foreground mb-2 block">
                        {t('cityFilter')}
                      </Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-10 border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm">
                          <SelectValue placeholder={t('selectCity')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{tCommon('all')}</SelectItem>
                          {cities
                            .filter((city): city is string => typeof city === 'string')
                            .map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  
                    <div>
                      <Label htmlFor="rating" className="text-sm font-medium text-muted-foreground mb-2 block">
                        {t('ratingFilter')}
                      </Label>
                      <Select value={selectedRating} onValueChange={setSelectedRating}>
                        <SelectTrigger className="h-10 border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm">
                          <SelectValue placeholder={tCommon('all')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{tCommon('all')}</SelectItem>
                          <SelectItem value="4">4+ {tCommon('stars')}</SelectItem>
                          <SelectItem value="3">3+ {tCommon('stars')}</SelectItem>
                          <SelectItem value="2">2+ {tCommon('stars')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sort" className="text-sm font-medium text-muted-foreground mb-2 block">
                        {t('sort')}
                      </Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-10 border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">{t('sortOptions.rating')}</SelectItem>
                          <SelectItem value="nameAsc">{t('sortOptions.nameAsc')}</SelectItem>
                          <SelectItem value="nameDesc">{t('sortOptions.nameDesc')}</SelectItem>
                          {userLocation && (
                            <SelectItem value="distance">{t('sortOptions.distance')}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        variant="outline" 
                        onClick={clearFilters}
                        className="w-full h-10 border-primary/20 hover:border-primary/50 rounded-lg bg-card/50 backdrop-blur-sm hover:bg-card/70"
                      >
                        {t('clearFilters')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Results Summary */}
            <motion.div
              className="flex justify-between items-center mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <span>{filteredOffices.length} {t('results')}</span>
                )}
              </div>
              {filteredOffices.length > 0 && (
                <div className="flex items-center gap-2">
                  {sortBy === 'rating' && (
                    <>
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t('sortOptions.rating')}</span>
                    </>
                  )}
                  {sortBy === 'distance' && (
                    <>
                      <Navigation className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{t('sortOptions.distance')}</span>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
              
      {/* Offices Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse overflow-hidden">
                    <div className="h-48 bg-muted"></div>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between items-center pt-4">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-10 w-28" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOffices.length === 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <Building2 className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-muted-foreground">
                    {t('noResults.title')}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {t('noResults.description')}
                  </p>
                  <Button onClick={clearFilters} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t('clearFilters')}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}
              >
                {filteredOffices.map((office) => (
                  <motion.div key={office.id} variants={staggerItem}>
                    <motion.div 
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Card className={`h-full group cursor-pointer overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300 bg-card hover:shadow-xl ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                        <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-60 h-40 md:w-80 md:h-48' : 'h-56'}`}>
                          <Image 
                            src={getOfficeImageUrl(office)}
                            alt={office.name || t('title')}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/office-placeholder.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                          
                          {office.is_featured && (
                            <motion.div 
                              className="absolute top-4 right-4"
                              initial={{ scale: 0, rotate: -10 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <Badge className="bg-primary hover:bg-primary text-primary-foreground shadow-lg">
                                <Sparkles className="h-3 w-3 me-1" />
                                {t('featured')}
                              </Badge>
                            </motion.div>
                          )}
                          
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-primary/20">
                              <div className="flex">
                                {renderRatingStars(parseFloat(office.rating?.toString() || "0"))}
                              </div>
                              <span className="text-sm font-semibold ms-2 text-foreground">
                                {(parseFloat(office.rating?.toString() || "0")).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          
                          {userLocation && office.latitude && office.longitude && (
                            <div className="absolute bottom-4 right-4">
                              <div className="flex items-center bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-primary/20">
                                <Navigation className="h-3 w-3 me-1 text-primary" />
                                <span className="text-sm font-semibold text-foreground">
                                  {getDistanceText(office)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="secondary" className="rounded-full shadow-lg border-primary/20 bg-background/90 hover:bg-background text-foreground">
                              <Eye className="h-4 w-4 me-1" />
                              {t('view')}
                            </Button>
                          </div>
                        </div>
                        
                        <div className={`flex-1 flex flex-col ${viewMode === 'list' ? 'p-6' : ''}`}>
                          <CardHeader className={`${viewMode === 'list' ? 'p-0 pb-4' : ''} flex-initial`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                                  {office.name}
                                </CardTitle>
                                <div className="flex items-center text-muted-foreground mb-2">
                                  <MapPin className="h-4 w-4 me-2 text-primary flex-shrink-0" />
                                  <span className="text-sm line-clamp-1">{office.city || office.address}</span>
                                </div>
                              </div>
                              {getVerificationBadge(office.verification_status || 'pending')}
                            </div>
                          </CardHeader>
                          
                          <CardContent className={`space-y-4 flex-1 flex flex-col ${viewMode === 'list' ? 'p-0' : ''}`}>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-initial">
                              {office.description || t('noDescription')}
                            </p>
                            
                            {/* Contact Info */}
                            <div className="space-y-2 flex-initial">
                              {(office.phone || office.contact_number) && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4 me-2 text-primary flex-shrink-0" />
                                  <span dir="ltr" className="line-clamp-1">{office.phone || office.contact_number}</span>
                                </div>
                              )}
                              {office.email && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4 me-2 text-primary flex-shrink-0" />
                                  <span className="line-clamp-1">{office.email}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Services */}
                            {office.services && office.services.length > 0 && (
                              <div className="flex flex-wrap gap-1 flex-initial">
                                {office.services.slice(0, 3).map((service, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                                    {service}
                                  </Badge>
                                ))}
                                {office.services.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{office.services.length - 3} {tCommon('more')}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto flex-initial">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="rounded-full border-primary/20 hover:border-primary/50">
                                  <Heart className="h-4 w-4 me-1" />
                                  {t('save')}
                                </Button>
                              </div>
                              <Link href={`/${locale}/landing/umrah-offices/${office.id}`}>
                                <Button size="sm" className="rounded-full bg-gradient-gold hover:bg-primary text-primary-foreground shadow-lg">
                                  {t('viewDetails')}
                                  <ArrowRight className="h-4 w-4 ms-1" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Pagination */}
            {!loading && filteredOffices.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {tCommon('previous')}
                  </Button>
                  
                  {/* Display pagination with ellipsis for many pages */}
                  {totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    Array.from({ length: totalPages }).map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 ${currentPage === i + 1 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'}`}
                      >
                        {i + 1}
                      </Button>
                    ))
                  ) : (
                    // Show pagination with ellipsis
                    <>
                      {/* First page */}
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(1)}
                        className={`w-10 ${currentPage === 1 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'}`}
                      >
                        1
                      </Button>
                      
                      {/* Show ellipsis for pages before current */}
                      {currentPage > 3 && (
                        <Button
                          variant="outline"
                          disabled
                          className="w-10 border-primary/20"
                        >
                          ...
                        </Button>
                      )}
                      
                      {/* Pages around current */}
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        // Show current page and one page before/after
                        if (
                          pageNum !== 1 && 
                          pageNum !== totalPages && 
                          (pageNum === currentPage || 
                           pageNum === currentPage - 1 || 
                           pageNum === currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 ${currentPage === pageNum ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Show ellipsis for pages after current */}
                      {currentPage < totalPages - 2 && (
                        <Button
                          variant="outline"
                          disabled
                          className="w-10 border-primary/20"
                        >
                          ...
                        </Button>
                      )}
                      
                      {/* Last page */}
                      {totalPages > 1 && (
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-10 ${currentPage === totalPages ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary/20 hover:border-primary/50 hover:bg-primary/5'}`}
                        >
                          {totalPages}
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {tCommon('next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-6 text-gradient-gold">
              {tCommon('registerOfficeTitle')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {tCommon('registerOfficeSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full bg-gradient-gold hover:bg-primary text-primary-foreground shadow-lg">
                <Building2 className="h-5 w-5 me-2" />
                {t('registerNewOffice')}
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-2 border-primary/20 hover:border-primary/50">
                <Phone className="h-5 w-5 me-2" />
                {tCommon('contactUs')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 