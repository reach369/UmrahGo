'use client';

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Building, CalendarDays, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UmrahOfficeCard } from './components/UmrahOfficeCard';
import { 
  fetchFeaturedOffices, 
  fetchTopRatedOffices, 
  Office 
} from './services/officesService';

export default function PilgrimUserPage() {
  const [featuredOffices, setFeaturedOffices] = useState<Office[]>([]);
  const [topRatedOffices, setTopRatedOffices] = useState<Office[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isTopRatedLoading, setIsTopRatedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'top-rated'>('featured');

  // Fetch featured offices on component mount
  useEffect(() => {
    const getFeaturedOffices = async () => {
      try {
        setIsFeaturedLoading(true);
        const response = await fetchFeaturedOffices();
        
        if (response.status && response.data) {
          setFeaturedOffices(response.data);
        }
      } catch (err) {
        console.error('Error fetching featured offices:', err);
      } finally {
        setIsFeaturedLoading(false);
      }
    };

    getFeaturedOffices();
  }, []);

  // Fetch top rated offices on component mount
  useEffect(() => {
    const getTopRatedOffices = async () => {
      try {
        setIsTopRatedLoading(true);
        const response = await fetchTopRatedOffices();
        
        if (response.status && response.data) {
          setTopRatedOffices(response.data);
        }
      } catch (err) {
        console.error('Error fetching top rated offices:', err);
      } finally {
        setIsTopRatedLoading(false);
      }
    };

    getTopRatedOffices();
  }, []);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold text-primary">
              مكاتب وحملات العمرة
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              اختر من بين أفضل مكاتب العمرة المعتمدة واحجز رحلتك بكل سهولة ويسر
            </p>
          </div>

          {/* Quick access cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  مكاتب العمرة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">استعرض مكاتب العمرة المعتمدة وتعرف على خدماتها وتقييمات العملاء</p>
              </CardContent>
              <CardFooter>
                <Link href="/PilgrimUser/offices" className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    <span>استعراض المكاتب</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  الحجوزات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">إدارة حجوزاتك الحالية والسابقة واستعرض تفاصيل الرحلات القادمة</p>
              </CardContent>
              <CardFooter>
                <Link href="/PilgrimUser/booking" className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    <span>حجوزاتي</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  المواقع المقدسة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">معلومات عن المواقع المقدسة، أوقات الصلاة، والإرشادات الهامة للمعتمرين</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full justify-between">
                  <span>استعراض المواقع</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-6 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
            
            {/* Tabs for switching between featured and top-rated */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-md border overflow-hidden">
                <button 
                  className={`px-4 py-2 ${activeTab === 'featured' 
                    ? 'bg-primary text-white' 
                    : 'bg-background hover:bg-muted/50'}`}
                  onClick={() => setActiveTab('featured')}
                >
                  مكاتب مميزة
                </button>
                <button 
                  className={`px-4 py-2 ${activeTab === 'top-rated' 
                    ? 'bg-primary text-white' 
                    : 'bg-background hover:bg-muted/50'}`}
                  onClick={() => setActiveTab('top-rated')}
                >
                  الأعلى تقييماً
                </button>
              </div>
            </div>
            
            {/* Main content */}
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {activeTab === 'featured' ? (
                    <>
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">مميز</span>
                      مكاتب عمرة مميزة
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      أعلى المكاتب تقييماً
                    </>
                  )}
                </h2>
              </div>
              
              {activeTab === 'featured' ? (
                isFeaturedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
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
                ) : featuredOffices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredOffices.slice(0, 3).map((office) => (
                      <UmrahOfficeCard
                        key={office.id}
                        office={office}
                        onViewDetails={() => {
                          window.location.href = `/PilgrimUser/offices?office=${office.id}`;
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">لا توجد مكاتب مميزة حالياً</p>
                  </div>
                )
              ) : (
                isTopRatedLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, index) => (
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
                ) : topRatedOffices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topRatedOffices.slice(0, 3).map((office) => (
                      <UmrahOfficeCard
                        key={office.id}
                        office={office}
                        onViewDetails={() => {
                          window.location.href = `/PilgrimUser/offices?office=${office.id}`;
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">لا توجد مكاتب مقيمة حالياً</p>
                  </div>
                )
              )}
              
              <div className="text-center mt-8">
                <Link href="/PilgrimUser/offices">
                  <Button size="lg">
                    عرض جميع المكاتب
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </div>
    </Provider>
  );
} 