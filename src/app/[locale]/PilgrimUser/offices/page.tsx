'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { UmrahOfficeCard } from '../components/UmrahOfficeCard';
import { UmrahOfficeDetails } from '@/app/[locale]/PilgrimUser/components/UmrahOfficeDetails';
import { 
  fetchOffices, 
  fetchFeaturedOffices, 
  fetchTopRatedOffices,
  fetchOfficeById,
  Office 
} from '@/services/officesService';

export default function UmrahOfficesPage() {
  const searchParams = useSearchParams();
  const officeIdParam = searchParams ? searchParams.get('office') : null;
  
  const [offices, setOffices] = useState<Office[]>([]);
  const [featuredOffices, setFeaturedOffices] = useState<Office[]>([]);
  const [topRatedOffices, setTopRatedOffices] = useState<Office[]>([]);
  const [filteredOffices, setFilteredOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortOption, setSortOption] = useState<string>('rating_desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isTopRatedLoading, setIsTopRatedLoading] = useState(true);
  const [isSingleOfficeLoading, setIsSingleOfficeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredScrollIndex, setFeaturedScrollIndex] = useState(0);
  const [topRatedScrollIndex, setTopRatedScrollIndex] = useState(0);

  // Fetch office by ID if specified in URL
  useEffect(() => {
    const getOfficeById = async () => {
      if (!officeIdParam) return;
      
      try {
        setIsSingleOfficeLoading(true);
        const response = await fetchOfficeById(officeIdParam);
        
        if (response.status && response.data) {
          setSelectedOffice(response.data);
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Error fetching office by ID:', err);
        // We don't set an error since we'll try to find the office in other lists
      } finally {
        setIsSingleOfficeLoading(false);
      }
    };

    getOfficeById();
  }, [officeIdParam]);

  // Fetch featured offices on component mount
  useEffect(() => {
    const getFeaturedOffices = async () => {
      try {
        setIsFeaturedLoading(true);
        const response = await fetchFeaturedOffices();
        
        if (response && response.data) {
          setFeaturedOffices(response.data);
          
          // If there's an office ID in the query parameters and we haven't loaded it yet,
          // check if it's in the featured offices
          if (officeIdParam && !selectedOffice && !isSingleOfficeLoading) {
            const officeId = parseInt(officeIdParam);
            const office = response.data.find((o: Office) => o.id === officeId);
            if (office) {
              setSelectedOffice(office);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching featured offices:', err);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    getFeaturedOffices();
  }, [officeIdParam, selectedOffice, isSingleOfficeLoading]);

  // Fetch top rated offices
  useEffect(() => {
    const getTopRatedOffices = async () => {
      try {
        setIsTopRatedLoading(true);
        const response = await fetchTopRatedOffices();
        
        if (response && response.data) {
          setTopRatedOffices(response.data);
          
          // If there's an office ID in the query parameters and we haven't loaded it yet,
          // check if it's in the top rated offices
          if (officeIdParam && !selectedOffice && !isSingleOfficeLoading) {
            const officeId = parseInt(officeIdParam);
            const office = response.data.find((o: Office) => o.id === officeId);
            if (office) {
              setSelectedOffice(office);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching top rated offices:', err);
      } finally {
        setIsTopRatedLoading(false);
      }
    };

    getTopRatedOffices();
  }, [officeIdParam, selectedOffice, isSingleOfficeLoading]);

  // Fetch offices on component mount
  useEffect(() => {
    const getOffices = async () => {
      try {
        setIsLoading(true);
        const response = await fetchOffices();
        
        if (response && response.offices) {
          setOffices(response.offices);
          setFilteredOffices(response.offices);
          
          // If there's an office ID in the query parameters and we haven't loaded it yet,
          // check if it's in all offices
          if (officeIdParam && !selectedOffice && !isSingleOfficeLoading) {
            const officeId = parseInt(officeIdParam);
            const office = response.offices.find((o: Office) => o.id === officeId);
            if (office) {
              setSelectedOffice(office);
            }
          }
        } else {
          setError('فشل في تحميل البيانات');
        }
      } catch (err) {
        console.error('Error fetching offices:', err);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    getOffices();
  }, [sortOption, minRating, officeIdParam, selectedOffice, isSingleOfficeLoading]);

  // Filter offices based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOffices(offices);
    } else {
      const filtered = offices.filter(office => 
        office.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (office.description && office.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (office.address && office.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (office.city && office.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (office.country && office.country.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOffices(filtered);
    }
  }, [searchTerm, offices]);

  // Handle office selection
  const handleViewDetails = (office: Office) => {
    setSelectedOffice(office);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update URL with office ID without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set('office', office.id.toString());
    window.history.pushState({}, '', url.toString());
  };

  // Return to office list
  const handleBackToList = () => {
    setSelectedOffice(null);
    
    // Remove office ID from URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.delete('office');
    window.history.pushState({}, '', url.toString());
  };

  // Apply filters and fetch new data
  const applyFilters = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all offices first
      const response = await fetchOffices();
            
      if (response && response.offices) {
        // Apply filters manually
        let filteredResults = [...response.offices];
        
        // Apply search filter if needed
        if (searchTerm) {
          filteredResults = filteredResults.filter(office => 
            office.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (office.description && office.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (office.address && office.address.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        // Apply rating filter if needed
        if (minRating > 0) {
          filteredResults = filteredResults.filter(office => office.rating >= minRating);
        }
        
        // Apply sorting
        if (sortOption === 'rating_desc') {
          filteredResults.sort((a, b) => b.rating - a.rating);
        } else if (sortOption === 'rating_asc') {
          filteredResults.sort((a, b) => a.rating - b.rating);
        } else if (sortOption === 'name_asc') {
          filteredResults.sort((a, b) => a.office_name.localeCompare(b.office_name));
        } else if (sortOption === 'name_desc') {
          filteredResults.sort((a, b) => b.office_name.localeCompare(a.office_name));
        }
        
        setOffices(filteredResults);
        setFilteredOffices(filteredResults);
      } else {
        setError('فشل في تحميل البيانات');
      }
    } catch (err) {
      console.error('Error fetching offices:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setMinRating(0);
    setSortOption('rating_desc');
    setShowFilters(false);
  };

  // Featured offices carousel navigation
  const scrollFeaturedLeft = () => {
    if (featuredScrollIndex > 0) {
      setFeaturedScrollIndex(featuredScrollIndex - 1);
    }
  };

  const scrollFeaturedRight = () => {
    if (featuredScrollIndex < featuredOffices.length - 3) {
      setFeaturedScrollIndex(featuredScrollIndex + 1);
    }
  };

  // Top rated offices carousel navigation
  const scrollTopRatedLeft = () => {
    if (topRatedScrollIndex > 0) {
      setTopRatedScrollIndex(topRatedScrollIndex - 1);
    }
  };

  const scrollTopRatedRight = () => {
    if (topRatedScrollIndex < topRatedOffices.length - 3) {
      setTopRatedScrollIndex(topRatedScrollIndex + 1);
    }
  };

  // Calculate visible cards based on screen size
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    }
    return 3; // Default for SSR
  };

  // Determine visible featured and top rated offices based on scroll index
  const visibleCount = getVisibleCount();
  const visibleFeaturedOffices = featuredOffices.slice(
    featuredScrollIndex,
    featuredScrollIndex + visibleCount
  );
  
  const visibleTopRatedOffices = topRatedOffices.slice(
    topRatedScrollIndex,
    topRatedScrollIndex + visibleCount
  );

  // If selected office, show details
  if (selectedOffice) {
    return (
      <div className="container mx-auto p-4">
        <UmrahOfficeDetails
          office={selectedOffice}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // If single office is loading, show skeleton for details
  if (isSingleOfficeLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" disabled className="gap-2">
              <ChevronRight className="w-4 h-4" />
              <span>العودة إلى المكاتب</span>
            </Button>
          </div>
          
          <Skeleton className="aspect-[21/9] w-full rounded-xl" />
          
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            
            <div className="w-full md:w-80 space-y-4">
              <Skeleton className="h-[250px] w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Featured Offices Section */}
      {(isFeaturedLoading || featuredOffices.length > 0) && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Badge className="bg-amber-500 hover:bg-amber-600">مميز</Badge>
              مكاتب عمرة مميزة
            </h2>
            
            {featuredOffices.length > visibleCount && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollFeaturedLeft}
                  disabled={featuredScrollIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollFeaturedRight}
                  disabled={featuredScrollIndex >= featuredOffices.length - visibleCount}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {isFeaturedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleFeaturedOffices.map((office) => (
                <UmrahOfficeCard
                  key={`featured-${office.id}`}
                  office={office}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Rated Offices Section */}
      {(isTopRatedLoading || topRatedOffices.length > 0) && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              أعلى المكاتب تقييماً
            </h2>
            
            {topRatedOffices.length > visibleCount && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollTopRatedLeft}
                  disabled={topRatedScrollIndex === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollTopRatedRight}
                  disabled={topRatedScrollIndex >= topRatedOffices.length - visibleCount}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {isTopRatedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTopRatedOffices.map((office) => (
                <UmrahOfficeCard
                  key={`top-rated-${office.id}`}
                  office={office}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Offices Section */}
      <div className="mb-8 space-y-4">
        <h1 className="text-2xl font-bold text-center">جميع مكاتب العمرة</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="ابحث عن مكتب عمرة..."
              className="pl-4 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>التصفية والترتيب</span>
          </Button>
        </div>
        
        {showFilters && (
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ترتيب حسب</label>
                <Select
                  value={sortOption}
                  onValueChange={setSortOption}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating_desc">التقييم (من الأعلى إلى الأقل)</SelectItem>
                    <SelectItem value="rating_asc">التقييم (من الأقل إلى الأعلى)</SelectItem>
                    <SelectItem value="popularity_desc">الشعبية</SelectItem>
                    <SelectItem value="name_asc">الاسم (أ-ي)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">الحد الأدنى للتقييم</label>
                  <span className="text-sm font-medium">{minRating} نجوم</span>
                </div>
                <Slider 
                  defaultValue={[minRating]} 
                  max={5}
                  step={1}
                  onValueChange={(value) => setMinRating(value[0])}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetFilters}>إعادة ضبط</Button>
              <Button onClick={applyFilters}>تطبيق</Button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          <p className="text-center">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredOffices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffices.map((office) => (
            <UmrahOfficeCard
              key={`regular-${office.id}`}
              office={office}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">لم يتم العثور على مكاتب</h3>
          <p className="text-muted-foreground">حاول تغيير معايير البحث أو التصفية</p>
        </div>
      )}
    </div>
  );
} 