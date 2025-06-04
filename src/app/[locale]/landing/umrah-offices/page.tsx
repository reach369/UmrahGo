'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Icons
import { 
  StarIcon, 
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

import { 
  Search, 
  Filter, 
  X, 
  Star, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  Building2,
  Phone,
  Mail
} from 'lucide-react';

// Services and Types
import { fetchOffices, Office } from '@/services/officesService';
import { Office as LegacyOffice } from '@/types/office.types';

export default function UmrahOfficesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  // States
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState('rating_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOffices, setTotalOffices] = useState(0);
  const [perPage, setPerPage] = useState(12);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch offices with pagination
        const result = await fetchOffices(currentPage, perPage);
        
        if (result && result.offices) {
          // Aplicar filtros manualmente
          let filteredOffices = [...result.offices];
          
          // Filtrar por termo de busca
          if (searchTerm) {
            filteredOffices = filteredOffices.filter(office => 
              office.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (office.description && office.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (office.address && office.address.toLowerCase().includes(searchTerm.toLowerCase()))
            );
          }
          
          // Filtrar por avaliação
          if (ratingFilter) {
            filteredOffices = filteredOffices.filter(office => 
              office.rating >= ratingFilter
            );
          }
          
          // Filtrar por cidade
          if (cityFilter) {
            filteredOffices = filteredOffices.filter(office => 
              office.city && office.city.toLowerCase() === cityFilter.toLowerCase()
            );
          }
          
          // Ordenação
          if (sortOption === 'rating_desc') {
            filteredOffices.sort((a, b) => b.rating - a.rating);
          } else if (sortOption === 'rating_asc') {
            filteredOffices.sort((a, b) => a.rating - b.rating);
          } else if (sortOption === 'name_asc') {
            filteredOffices.sort((a, b) => a.office_name.localeCompare(b.office_name));
          } else if (sortOption === 'name_desc') {
            filteredOffices.sort((a, b) => b.office_name.localeCompare(a.office_name));
          }
          
          setOffices(filteredOffices);
          setTotalOffices(result.pagination.total || filteredOffices.length);
        } else {
          setOffices([]);
          setTotalOffices(0);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching offices data:', error);
        setLoading(false);
        setOffices([]);
      }
    };

    fetchData();
  }, [searchTerm, ratingFilter, cityFilter, sortOption, currentPage, perPage]);
  
  // Apply filters function
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    setIsFilterOpen(false); // Close mobile filter panel
  };

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
  
  // Helper function to get a numeric rating
  const getNumericRating = (rating: number | undefined): number => {
    return rating || 0;
  };
  
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
              {t('offices.title') || 'مكاتب العمرة المعتمدة'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t('offices.subtitle') || 'استكشف أفضل مكاتب العمرة المعتمدة في المملكة واختر المكتب المناسب لرحلتك الروحانية'}
            </p>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 transform -translate-y-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('offices.search') || 'ابحث عن مكاتب العمرة...'}
                  className="pl-10 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                {t('offices.searchButton') || 'بحث'}
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
      
      {/* Filters and Offices */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap md:flex-nowrap gap-8">
            {/* Filters - Desktop */}
            <div className="w-full md:w-1/4 hidden md:block">
              <div className="bg-card rounded-xl p-6 border border-primary/10 shadow-md sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">{t('offices.filters') || 'الفلاتر'}</h3>
                  <button
                    onClick={() => {
                      setRatingFilter(null);
                      setCityFilter('');
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('offices.clearFilters') || 'مسح الفلاتر'}
                  </button>
                </div>
                
                {/* Rating Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('offices.ratingFilter') || 'التقييم'}</h4>
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
                          <span>{rating === 5 ? 'فأعلى' : 'فأعلى'}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* City Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('offices.cityFilter') || 'المدينة'}</h4>
                  <Select
                    value={cityFilter}
                    onValueChange={setCityFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('offices.selectCity') || 'اختر المدينة'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
                      <SelectItem value="المدينة المنورة">المدينة المنورة</SelectItem>
                      <SelectItem value="جدة">جدة</SelectItem>
                      <SelectItem value="الرياض">الرياض</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary mt-2"
                  onClick={applyFilters}
                >
                  {t('offices.applyFilters') || 'تطبيق الفلاتر'}
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
                  <span className="font-medium">{t('offices.filters') || 'الفلاتر'}</span>
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
                    <h3 className="text-lg font-semibold">{t('offices.filters') || 'الفلاتر'}</h3>
                    <button
                      className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/10"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Mobile Filters Content */}
                  {/* Rating Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">{t('offices.ratingFilter') || 'التقييم'}</h4>
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
                            <span>{rating === 5 ? 'فأعلى' : 'فأعلى'}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* City Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">{t('offices.cityFilter') || 'المدينة'}</h4>
                    <Select
                      value={cityFilter}
                      onValueChange={setCityFilter}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('offices.selectCity') || 'اختر المدينة'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="مكة المكرمة">مكة المكرمة</SelectItem>
                        <SelectItem value="المدينة المنورة">المدينة المنورة</SelectItem>
                        <SelectItem value="جدة">جدة</SelectItem>
                        <SelectItem value="الرياض">الرياض</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-8 flex gap-2">
                    <button
                      className="flex-1 bg-gray-200 rounded-lg py-2"
                      onClick={() => {
                        setRatingFilter(null);
                        setCityFilter('');
                      }}
                    >
                      {t('offices.clearFilters') || 'مسح'}
                    </button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                      onClick={applyFilters}
                    >
                      {t('offices.applyFilters') || 'تطبيق'}
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
            
            {/* Offices List */}
            <div className="w-full md:w-3/4">
              {/* Sorting Options */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={sortOption}
                    onValueChange={setSortOption}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t('offices.sort') || 'ترتيب حسب'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating_desc">{t('offices.sortOptions.rating') || 'التقييم'}</SelectItem>
                      <SelectItem value="office_name_asc">{t('offices.sortOptions.nameAsc') || 'الاسم: أ-ي'}</SelectItem>
                      <SelectItem value="office_name_desc">{t('offices.sortOptions.nameDesc') || 'الاسم: ي-أ'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {offices.length} {t('offices.results') || 'نتيجة'}
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
                  {/* Offices Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offices.map((office, index) => (
                      <motion.div 
                        key={office.id}
                        className="bg-card rounded-xl shadow-md border border-primary/10 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <Image 
                            src={office.logo || '/images/office-placeholder.jpg'} 
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
                                {renderRatingStars(office.rating)}
                              </div>
                              <span className="text-sm font-medium ml-1">{office.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2">{office.office_name}</h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {office.description || t('offices.noDescription') || 'لا يوجد وصف متاح'}
                          </p>
                          
                          <div className="flex flex-col space-y-2 text-sm text-muted-foreground mb-4">
                            {office.address && (
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 text-primary mr-2" />
                                <span>{office.address}</span>
                              </div>
                            )}
                            
                            {office.contact_number && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 text-primary mr-2" />
                                <span>{office.contact_number}</span>
                              </div>
                            )}
                            
                            {office.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 text-primary mr-2" />
                                <span>{office.email}</span>
                              </div>
                            )}
                          </div>
                          
                          <Link href={`/${locale}/landing/umrah-offices/${office.id}`}>
                            <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                              {t('offices.viewDetails') || 'عرض التفاصيل'}
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Empty State */}
                  {offices.length === 0 && (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {t('offices.noResults.title') || 'لم يتم العثور على نتائج'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {t('offices.noResults.description') || 'حاول تغيير معايير البحث أو الفلترة الخاصة بك'}
                      </p>
                      <Button 
                        variant="outline"
                        className="rounded-full border-primary/30 hover:bg-primary/5"
                        onClick={() => {
                          setSearchTerm('');
                          setRatingFilter(null);
                          setCityFilter('');
                        }}
                      >
                        {t('offices.clearFilters') || 'مسح الفلاتر'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {offices.length > 0 && (
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
                      {Array.from({ length: Math.min(5, Math.ceil(totalOffices / perPage)) }, (_, i) => {
                        const pageNumber = i + 1;
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
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalOffices / perPage)}
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