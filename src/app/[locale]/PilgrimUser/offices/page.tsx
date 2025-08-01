'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
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
  StarIcon
} from 'lucide-react';

// Services
import { officeService, Office } from '@/services/offices.service';
import { getValidImageUrl } from '@/utils/image-helpers';

export default function UmrahOfficesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  // States
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch offices
  const fetchOfficesData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedRating && selectedRating !== 'all') params.append('rating', selectedRating);
      if (sortBy) params.append('sort', sortBy);
      
      const data = await officeService.fetchOffices(params.toString());
      
      // Apply client-side sorting and filtering if needed
      let filteredData = data || [];

    // Apply rating filter
      if (selectedRating !== 'all') {
        const minRating = parseFloat(selectedRating);
        filteredData = filteredData.filter(office => (office.rating || 0) >= minRating);
    }

    // Apply sorting
      filteredData.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'nameAsc':
            return (a.name || '').localeCompare(b.name || '', 'ar');
          case 'nameDesc':
            return (b.name || '').localeCompare(a.name || '', 'ar');
        default:
          return 0;
      }
    });

      setOffices(filteredData);
    } catch (error) {
      console.error('Error fetching offices:', error);
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCity, selectedRating, sortBy]);
  
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
            <CheckCircle className="h-3 w-3 mr-1" />
            موثق
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            قيد المراجعة
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
      
      // Use the helper function to construct proper URL
      return getValidImageUrl(imageUrl, '/images/office-placeholder.jpg');
    }
    
    return '/images/office-placeholder.jpg';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      {/* <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-20 overflow-hidden">
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
              <div className="p-4 bg-primary/10 rounded-full backdrop-blur-sm">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('offices.title') || 'مكاتب العمرة المعتمدة'}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('offices.subtitle') || 'استكشف أفضل مكاتب العمرة المعتمدة في المملكة واختر المكتب المناسب لرحلتك الروحية'}
            </p>
            
            <motion.div
              className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>مكاتب معتمدة</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>جودة مضمونة</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>خدمة عملاء ممتازة</span>
            </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
       */}
      {/* Search and Filters */}
      <section className="py-12 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <motion.div 
              className="flex flex-col lg:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder={t('offices.search') || 'ابحث في مكاتب العمرة ...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-primary/20 focus:border-primary/50 rounded-xl bg-white/50 backdrop-blur-sm"
                />
                          </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 h-12 px-6 border-2 border-primary/20 hover:border-primary/50 rounded-xl bg-white/50 backdrop-blur-sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t('offices.filters') || 'المرشحات'}
                  {showFilters && <X className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="h-12 px-4 border-2 border-primary/20 hover:border-primary/50 rounded-xl bg-white/50 backdrop-blur-sm"
                >
                  {viewMode === 'grid' ? '☰' : '⊞'}
                </Button>
              </div>
            </motion.div>
            
            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-primary/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-muted-foreground mb-2 block">
                        {t('offices.cityFilter') || 'المدينة'}
                          </Label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="h-10 border-primary/20 rounded-lg bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder={t('offices.selectCity') || 'حدد المدينة'} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">{t('common.all') || 'الكل'}</SelectItem>
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
                        {t('offices.ratingFilter') || 'التقييم'}
                      </Label>
                      <Select value={selectedRating} onValueChange={setSelectedRating}>
                        <SelectTrigger className="h-10 border-primary/20 rounded-lg bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder={t('common.all') || 'الكل'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('common.all') || 'الكل'}</SelectItem>
                          <SelectItem value="4">4+ نجوم</SelectItem>
                          <SelectItem value="3">3+ نجوم</SelectItem>
                          <SelectItem value="2">2+ نجوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="sort" className="text-sm font-medium text-muted-foreground mb-2 block">
                        {t('offices.sort') || 'الترتيب'}
                      </Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-10 border-primary/20 rounded-lg bg-white/50 backdrop-blur-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">{t('offices.sortOptions.rating') || 'التقييم'}</SelectItem>
                          <SelectItem value="nameAsc">{t('offices.sortOptions.nameAsc') || 'الاسم: أ-ي'}</SelectItem>
                          <SelectItem value="nameDesc">{t('offices.sortOptions.nameDesc') || 'الاسم: ي-أ'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                    <Button
                        variant="outline" 
                        onClick={clearFilters}
                        className="w-full h-10 border-primary/20 hover:border-primary/50 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white/70"
                    >
                        {t('offices.clearFilters') || 'مسح المرشحات'}
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
                  <span>{offices.length} {t('offices.results') || 'نتيجة'}</span>
                )}
              </div>
              {offices.length > 0 && (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">مرتبة حسب الأفضل</span>
                </div>
              )}
            </motion.div>
                </div>
              </div>
      </section>
              
      {/* Offices Grid */}
      <section className="py-12">
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
            ) : offices.length === 0 ? (
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
                    {t('offices.noResults.title') || 'لم يتم العثور على نتائج'}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {t('offices.noResults.description') || 'حاول تغيير معايير البحث أو التصفية'}
                  </p>
                  <Button onClick={clearFilters} className="rounded-full">
                    مسح المرشحات والبحث مرة أخرى
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
                {offices.map((office) => (
                  <motion.div key={office.id} variants={staggerItem}>
                      <motion.div 
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Card className={`h-full group cursor-pointer overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-300 bg-card hover:shadow-xl ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                        <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-80 h-48' : 'h-56'}`}>
                          <Image 
                            src={getOfficeImageUrl(office)}
                            alt={office.name || office.office_name || 'Office Logo'}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE1MCIgeT0iMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjEwIiBmaWxsPSIjOEI1Q0Y2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjEzMCIgcj0iMTUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xODAgMTUwSDE5MFYxNzBIMTgwVjE1MFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMTAgMTUwSDIyMFYxNzBIMjEwVjE1MFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOTUgMTc1SDIwNVYxODVIMTk1VjE3NVoiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPtmF2YPYqtioINin2YTYudmF2LHYqTwvdGV4dD4KPC9zdmc+';
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
                              <Badge className="bg-secondary hover:bg-secondary text-white shadow-lg">
                                <Sparkles className="h-3 w-3 mr-1" />
                                {t('offices.featured') || 'مميز'}
                              </Badge>
                            </motion.div>
                          )}
                          
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                              <div className="flex">
                                {renderRatingStars(office.rating || 0)}
                              </div>
                              <span className="text-sm font-semibold ml-2 text-gray-800">
                                {(office.rating || 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="secondary" className="rounded-full shadow-lg border-white/20 bg-white/90 hover: text-gray-800">
                              <Eye className="h-4 w-4 mr-1" />
                              عرض
                            </Button>
                          </div>
                        </div>
                        
                        <div className={`flex-1 ${viewMode === 'list' ? 'p-6' : ''}`}>
                          <CardHeader className={viewMode === 'list' ? 'p-0 pb-4' : ''}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                                  {office.name || office.office_name}
                                </CardTitle>
                                <div className="flex items-center text-muted-foreground mb-2">
                                  <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                  <span className="text-sm line-clamp-1">{office.city}</span>
                                </div>
                              </div>
                              {getVerificationBadge(office.verification_status || 'pending')}
                            </div>
                          </CardHeader>
                          
                          <CardContent className={`space-y-4 ${viewMode === 'list' ? 'p-0' : ''}`}>
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {office.description || office.services_offered || t('offices.noDescription') || 'لا يوجد وصف متاح'}
                            </p>
                            
                            {/* Contact Info */}
                            <div className="space-y-2">
                              {(office.phone || office.contact_number) && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                  <span dir="ltr" className="line-clamp-1">{office.phone || office.contact_number}</span>
                                </div>
                              )}
                              {office.email && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                                  <span className="line-clamp-1">{office.email}</span>
                              </div>
                            )}
                            </div>
                            
                            {/* Services */}
                            {office.services && office.services.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {office.services.slice(0, 3).map((service, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                                {office.services.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{office.services.length - 3} المزيد
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="rounded-full border-primary/20 hover:border-primary/50">
                                  <Heart className="h-4 w-4 mr-1" />
                                  حفظ
                                </Button>
                              </div>
                          <Link href={`/${locale}/landing/umrah-offices/${office.id}`}>
                                <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                              {t('offices.viewDetails') || 'عرض التفاصيل'}
                                  <ArrowRight className="h-4 w-4 ml-1" />
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
          </div>
                  </div>
      </section>
      
      {/* CTA Section */}
      {/* <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
              هل تريد إضافة مكتبك إلى منصتنا؟
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              انضم إلى شبكة مكاتب العمرة المعتمدة واوصل خدماتك لآلاف العملاء
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                <Building2 className="h-5 w-5 mr-2" />
                تسجيل مكتب جديد
                      </Button>
              <Button size="lg" variant="outline" className="rounded-full border-2 border-primary/20 hover:border-primary/50">
                <Phone className="h-5 w-5 mr-2" />
                تواصل معنا
                      </Button>
            </div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
} 