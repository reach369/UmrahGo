'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { 
  PackageCard, 
  CardWithHover 
} from '@/components/ui/card-with-hover';
import { 
  AnimatedSection, 
  SectionTitle, 
  HeroTitle, 
  HeroSubtitle 
} from '@/components/ui/animated-section';
import { 
  GradientButton,
  PrimaryButton, 
  OutlineButton 
} from '@/components/ui/gradient-button';
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  CheckCircle2, 
  Filter,
  MapPin 
} from 'lucide-react';

// Sample package data
const packages = [
  {
    id: 1,
    title: 'باكج عمرة فاخر - فندق 5 نجوم',
    image: '/images/kaaba.jpg',
    price: 'من $1,299',
    duration: '7 أيام',
    location: 'مكة والمدينة',
    rating: 4.9,
    featured: true,
    amenities: ['إقامة فندقية 5 نجوم', 'وجبات كاملة', 'مرشد ديني', 'نقل من وإلى المطار'],
  },
  {
    id: 2,
    title: 'باكج عمرة اقتصادي',
    image: '/images/kaaba.jpg',
    price: 'من $799',
    duration: '5 أيام',
    location: 'مكة والمدينة',
    rating: 4.5,
    amenities: ['إقامة فندقية 3 نجوم', 'وجبة إفطار', 'نقل من وإلى المطار'],
  },
  {
    id: 3,
    title: 'باكج عمرة عائلي',
    image: '/images/kaaba.jpg',
    price: 'من $999',
    duration: '10 أيام',
    location: 'مكة والمدينة',
    rating: 4.7,
    amenities: ['إقامة فندقية 4 نجوم', 'وجبات كاملة', 'أنشطة عائلية', 'نقل من وإلى المطار'],
  },
  {
    id: 4,
    title: 'باكج عمرة VIP',
    image: '/images/kaaba.jpg',
    price: 'من $1,999',
    duration: '12 أيام',
    location: 'مكة والمدينة',
    rating: 5.0,
    featured: true,
    amenities: ['إقامة فندقية 5 نجوم ديلوكس', 'وجبات فاخرة', 'مرشد خاص', 'نقل خاص', 'زيارة للمعالم'],
  },
  {
    id: 5,
    title: 'باكج عمرة رمضان',
    image: '/images/kaaba.jpg',
    price: 'من $1,499',
    duration: '14 أيام',
    location: 'مكة والمدينة',
    rating: 4.8,
    amenities: ['إقامة فندقية 4 نجوم', 'وجبات إفطار وسحور', 'مرشد ديني', 'نقل من وإلى المطار'],
  },
  {
    id: 6,
    title: 'باكج عمرة الخريف',
    image: '/images/kaaba.jpg',
    price: 'من $899',
    duration: '7 أيام',
    location: 'مكة والمدينة',
    rating: 4.6,
    amenities: ['إقامة فندقية 4 نجوم', 'وجبات كاملة', 'نقل من وإلى المطار'],
  },
];

export default function PackagesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([500, 2000]);
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('recommended');
  const [view, setView] = useState('grid');
  
  const toggleDuration = (value: string) => {
    if (selectedDuration.includes(value)) {
      setSelectedDuration(selectedDuration.filter(item => item !== value));
    } else {
      setSelectedDuration([...selectedDuration, value]);
    }
  };
  
  const toggleAmenity = (value: string) => {
    if (selectedAmenities.includes(value)) {
      setSelectedAmenities(selectedAmenities.filter(item => item !== value));
    } else {
      setSelectedAmenities([...selectedAmenities, value]);
    }
  };
  
  const durations = [
    { value: 'short', label: '5-7 أيام' },
    { value: 'medium', label: '8-14 أيام' },
    { value: 'long', label: '15+ يوم' },
  ];
  
  const amenities = [
    { value: 'hotel5', label: 'فنادق 5 نجوم' },
    { value: 'hotel4', label: 'فنادق 4 نجوم' },
    { value: 'hotel3', label: 'فنادق 3 نجوم' },
    { value: 'meals', label: 'وجبات كاملة' },
    { value: 'transport', label: 'نقل من وإلى المطار' },
    { value: 'guide', label: 'مرشد ديني' },
  ];
  
  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    return pkg.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Sort packages
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (sortOption === 'price-low') {
      return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
    } else if (sortOption === 'price-high') {
      return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''));
    } else if (sortOption === 'rating') {
      return b.rating - a.rating;
    } else if (sortOption === 'duration') {
      return parseInt(b.duration.replace(/\D/g, '')) - parseInt(a.duration.replace(/\D/g, ''));
    } else {
      // recommended - featured first, then by rating
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    }
  });
  
  return (
    <div className="min-h-screen py-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background py-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <HeroTitle>
              {t('packages.title') || 'باقات العمرة'}
            </HeroTitle>
            <HeroSubtitle className="mt-4 mb-8">
              {t('packages.subtitle') || 'اختر الباقة المناسبة لك من بين مجموعة متنوعة من الخيارات المميزة'}
            </HeroSubtitle>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg flex items-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 transform -translate-y-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('packages.search') || 'ابحث عن باقات العمرة...'}
                  className="pl-10 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <GradientButton
                gradient="primary"
                rounded="full"
                className="ml-2"
                onClick={() => {}}
              >
                {t('packages.searchButton') || 'بحث'}
              </GradientButton>
            </div>
          </AnimatedSection>
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
              <CardWithHover className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary">{t('packages.filters') || 'الفلاتر'}</h3>
                  <button
                    onClick={() => {
                      setPriceRange([500, 2000]);
                      setSelectedDuration([]);
                      setSelectedAmenities([]);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('packages.clearFilters') || 'مسح الفلاتر'}
                  </button>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('packages.priceRange') || 'نطاق السعر'}</h4>
                  <Slider
                    value={priceRange}
                    min={100}
                    max={3000}
                    step={100}
                    onValueChange={setPriceRange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
                
                {/* Duration */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('packages.duration') || 'المدة'}</h4>
                  <div className="space-y-2">
                    {durations.map((duration) => (
                      <div key={duration.value} className="flex items-center">
                        <Checkbox
                          id={`duration-${duration.value}`}
                          checked={selectedDuration.includes(duration.value)}
                          onCheckedChange={() => toggleDuration(duration.value)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`duration-${duration.value}`}
                          className="ml-2 text-sm font-normal cursor-pointer"
                        >
                          {duration.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Amenities */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t('packages.amenities') || 'المميزات'}</h4>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.value} className="flex items-center">
                        <Checkbox
                          id={`amenity-${amenity.value}`}
                          checked={selectedAmenities.includes(amenity.value)}
                          onCheckedChange={() => toggleAmenity(amenity.value)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`amenity-${amenity.value}`}
                          className="ml-2 text-sm font-normal cursor-pointer"
                        >
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <GradientButton
                  gradient="primary"
                  fullWidth
                  className="mt-2"
                  onClick={() => {}}
                >
                  {t('packages.applyFilters') || 'تطبيق الفلاتر'}
                </GradientButton>
              </CardWithHover>
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
                  {/* ... Repeat the same filter sections as desktop ... */}
                  
                  <div className="mt-8 flex gap-2">
                    <button
                      className="flex-1 bg-gray-200 rounded-lg py-2"
                      onClick={() => {
                        setPriceRange([500, 2000]);
                        setSelectedDuration([]);
                        setSelectedAmenities([]);
                      }}
                    >
                      {t('packages.clearFilters') || 'مسح'}
                    </button>
                    <GradientButton
                      gradient="primary"
                      className="flex-1"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      {t('packages.applyFilters') || 'تطبيق'}
                    </GradientButton>
                  </div>
                </motion.div>
              </div>
            )}
            
            {/* Packages List */}
            <div className="w-full md:w-3/4">
              {/* Sorting and View Options */}
              <div className="flex flex-wrap justify-between items-center mb-6">
                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={sortOption}
                    onValueChange={setSortOption}
                  >
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder={t('packages.sort') || 'ترتيب حسب'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">{t('packages.sortOptions.recommended') || 'الموصى بها'}</SelectItem>
                      <SelectItem value="price-low">{t('packages.sortOptions.priceLow') || 'السعر: من الأقل للأعلى'}</SelectItem>
                      <SelectItem value="price-high">{t('packages.sortOptions.priceHigh') || 'السعر: من الأعلى للأقل'}</SelectItem>
                      <SelectItem value="rating">{t('packages.sortOptions.rating') || 'التقييم'}</SelectItem>
                      <SelectItem value="duration">{t('packages.sortOptions.duration') || 'المدة'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <span className="text-sm text-muted-foreground">
                    {filteredPackages.length} {t('packages.results') || 'نتيجة'}
                  </span>
                  
                  <div className="border rounded-md p-1">
                    <button
                      className={`px-2 py-1 rounded ${view === 'grid' ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => setView('grid')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      className={`px-2 py-1 rounded ${view === 'list' ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => setView('list')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Featured Package */}
              {sortedPackages.findIndex(pkg => pkg.featured) !== -1 && (
                <AnimatedSection className="mb-8" delay={0.1}>
                  <CardWithHover className="relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-secondary hover:bg-secondary text-white">
                        {t('packages.featured') || 'مميز'}
                      </Badge>
                    </div>
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-64 md:h-auto md:w-2/5 overflow-hidden">
                        <motion.div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${sortedPackages.find(pkg => pkg.featured)?.image})` }}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium ml-1">
                              {sortedPackages.find(pkg => pkg.featured)?.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 md:w-3/5">
                        <h3 className="text-2xl font-bold mb-3">
                          {sortedPackages.find(pkg => pkg.featured)?.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                            <span>{sortedPackages.find(pkg => pkg.featured)?.duration}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                            <span>{sortedPackages.find(pkg => pkg.featured)?.location}</span>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h4 className="font-medium mb-2">{t('packages.amenities') || 'المميزات'}:</h4>
                          <div className="flex flex-wrap gap-2">
                            {sortedPackages.find(pkg => pkg.featured)?.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-primary mr-1 rtl:ml-1 rtl:mr-0" />
                                <span>{amenity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-muted-foreground">{t('packages.startingFrom') || 'يبدأ من'}</span>
                            <div className="text-2xl font-bold text-primary">
                              {sortedPackages.find(pkg => pkg.featured)?.price.replace('من ', '')}
                            </div>
                          </div>
                          <PrimaryButton>
                            {t('packages.viewDetails') || 'عرض التفاصيل'}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  </CardWithHover>
                </AnimatedSection>
              )}
              
              {/* Packages Grid/List */}
              {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedPackages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id}
                      image={pkg.image}
                      title={pkg.title}
                      price={pkg.price}
                      duration={pkg.duration}
                      location={pkg.location}
                      rating={pkg.rating}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedPackages.map((pkg, index) => (
                    <AnimatedSection key={pkg.id} delay={index * 0.1}>
                      <CardWithHover className="flex flex-col md:flex-row overflow-hidden">
                        <div className="relative h-48 md:h-auto md:w-1/3 overflow-hidden">
                          <motion.div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${pkg.image})` }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium ml-1">{pkg.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          {pkg.featured && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-secondary hover:bg-secondary text-white">
                                {t('packages.featured') || 'مميز'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold mb-3">{pkg.title}</h3>
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                              <span>{pkg.duration}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                              <span>{pkg.location}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm text-muted-foreground">{t('packages.startingFrom') || 'يبدأ من'}</span>
                              <div className="text-xl font-bold text-primary">{pkg.price.replace('من ', '')}</div>
                            </div>
                            <PrimaryButton>
                              {t('packages.viewDetails') || 'عرض التفاصيل'}
                            </PrimaryButton>
                          </div>
                        </div>
                      </CardWithHover>
                    </AnimatedSection>
                  ))}
                </div>
              )}
              
              {/* Empty State */}
              {sortedPackages.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t('packages.noResults.title') || 'لم يتم العثور على نتائج'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t('packages.noResults.description') || 'حاول تغيير مصطلحات البحث أو معايير التصفية الخاصة بك'}
                  </p>
                  <OutlineButton
                    onClick={() => {
                      setSearchTerm('');
                      setPriceRange([500, 2000]);
                      setSelectedDuration([]);
                      setSelectedAmenities([]);
                    }}
                  >
                    {t('packages.clearFilters') || 'مسح الفلاتر'}
                  </OutlineButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Subscribe Section */}
      <section className="py-16 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">
              {t('packages.subscribe.title') || 'اشترك للحصول على أحدث الباقات والعروض'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('packages.subscribe.description') || 'ادخل بريدك الإلكتروني للحصول على إشعارات عن العروض الجديدة وأحدث الباقات المتاحة'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t('packages.subscribe.emailPlaceholder') || 'أدخل بريدك الإلكتروني'}
                className="rounded-full"
              />
              <GradientButton
                gradient="primary"
                rounded="full"
              >
                {t('packages.subscribe.button') || 'اشترك'}
              </GradientButton>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
} 