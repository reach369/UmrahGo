'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Users, Package, CreditCard,  TrendingUp, 
  TrendingDown, Activity, CheckCircle, XCircle, Clock, 
  ChevronRight, Loader2, BarChart, LineChart, PieChart, Plus, FileText, PictureInPicture, BookOpen,
  Filter, CalendarIcon, Search, ArrowRight, ArrowLeft
} from 'lucide-react';    
import { getValidImageUrl } from '@/utils/image-helpers';
// Import the new hooks
import { 
  useGetBookingsStatisticsQuery,
  useGetPackageBookingsStatisticsQuery,
  useGetPackageBookingsQuery,
  useGetBookingsCalendarQuery,
  useGetGalleryQuery,
  useGetPackagesQuery,
  useGetBookingsChartDataQuery,
  useGetRevenueChartDataQuery
} from '../redux/api/dashboardApiSlice';
import { useGetBookingsQuery } from '../redux/api/bookingsApiSlice';
import { formatPrice } from '@/utils/formatPrice';
import { useLocale, useTranslations } from 'next-intl';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/[locale]/umrahoffices/redux/store';
import { format, addMonths, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

// Import necessary chart libraries
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const locale = useLocale();
  const { user } = useSelector((state: RootState) => state.auth);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  // Set up translation function
 // import { useLocale, useTranslations } from 'next-intl';

  const t = useTranslations('UmrahOfficesDashboard');
  
  // Date filtering state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date() // Today
  });
  
  // Format date strings for API calls
  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;
  
  // RTK Query hooks with date range filtering
  const { 
    data: bookingsStats, 
    isLoading: isLoadingBookingsStats, 
    error: bookingsStatsError,
    refetch: refetchBookingsStats
  } = useGetBookingsStatisticsQuery();
  
  const {
    data: packageBookingsStatistics,
    isLoading: isLoadingPackageBookingsStatistics,
    error: packageBookingsStatsError,
    refetch: refetchPackageBookingsStats
  } = useGetPackageBookingsStatisticsQuery();
  
  const {
    data: bookingsChartData,
    isLoading: isLoadingBookingsChart,
  } = useGetBookingsChartDataQuery({ 
    period: chartPeriod,
    start_date: startDate,
    end_date: endDate
  });

  const {
    data: revenueChartData,
    isLoading: isLoadingRevenueChart,
  } = useGetRevenueChartDataQuery({ 
    period: chartPeriod,
    start_date: startDate,
    end_date: endDate
  });

  const {
    data: packageBookingsData,
    isLoading: isLoadingPackageBookings,
  } = useGetPackageBookingsQuery({
    per_page: 5,
    from_date: startDate,
    to_date: endDate
  });

  const {
    data: bookingsCalendarData,
    isLoading: isLoadingBookingsCalendar,
  } = useGetBookingsCalendarQuery({
    start_date: startDate || format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    end_date: endDate || format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd')
  });

  const {
    data: galleryData,
    isLoading: isLoadingGallery,
  } = useGetGalleryQuery();
  
  const { 
    data: packagesData,
    isLoading: isLoadingPackages,
  } = useGetPackagesQuery({
    status: 'active',
    is_featured: true
  });
  
  // Get recent bookings from packageBookingsData
  const recentBookings = packageBookingsData?.data?.data?.slice(0, 5) || [];
  
  // Handle date filter change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };
  
  // Handle refetch all data
  const handleRefetch = () => {
    refetchBookingsStats();
    refetchPackageBookingsStats();
  };
  
  // Loading state
  if (isLoadingBookingsStats || isLoadingPackageBookingsStatistics || 
      isLoadingBookingsChart || isLoadingRevenueChart || 
      isLoadingPackageBookings || isLoadingBookingsCalendar || 
      isLoadingGallery || isLoadingPackages) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }
  
  // Error state
  if (bookingsStatsError || packageBookingsStatsError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {t('errors.dashboardLoadError')}
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefetch}>{t('actions.retry')}</Button>
      </div>
    );
  }
  
  // Get stats from API response or use defaults
  // First try to use package bookings statistics which has more data
  const stats = {
    total_bookings: packageBookingsStatistics?.data?.total_bookings || bookingsStats?.data?.total_bookings || 0,
    total_revenue: packageBookingsStatistics?.data?.total_revenue || parseFloat(bookingsStats?.data?.total_revenue || '0'),
    pending_bookings: packageBookingsStatistics?.data?.pending_bookings || bookingsStats?.data?.pending_bookings || 0,
    confirmed_bookings: packageBookingsStatistics?.data?.confirmed_bookings || bookingsStats?.data?.confirmed_bookings || 0,
    canceled_bookings: packageBookingsStatistics?.data?.canceled_bookings || bookingsStats?.data?.canceled_bookings || 0,
    today_bookings: packageBookingsStatistics?.data?.today_bookings || bookingsStats?.data?.today_bookings || 0,
    monthly_bookings: packageBookingsStatistics?.data?.monthly_bookings || 0,
    average_booking_value: packageBookingsStatistics?.data?.average_booking_value || 0,
    popular_packages: packageBookingsStatistics?.data?.popular_packages || []
  };
  
  // Get booking status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">{t('statusBadges.confirmed')}</Badge>;
      case 'cancelled':
      case 'canceled':
        return <Badge className="bg-red-500">{t('statusBadges.canceled')}</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">{t('statusBadges.completed')}</Badge>;
      case 'rejected':
        return <Badge className="bg-orange-500">{t('statusBadges.rejected')}</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">{t('statusBadges.pending')}</Badge>;
    }
  };
  
  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">{t('paymentStatusBadges.paid')}</Badge>;
      case 'partially_paid':
        return <Badge className="bg-blue-500">{t('paymentStatusBadges.partiallyPaid')}</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-500">{t('paymentStatusBadges.refunded')}</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">{t('paymentStatusBadges.failed')}</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">{t('paymentStatusBadges.pending')}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Enhanced Date Range Picker component with more options
  const DateRangePickerWithButton = () => {
    // Predefined date ranges
    const handlePresetRange = (preset: string) => {
      const today = new Date();
      
      switch (preset) {
        case 'today':
          setDateRange({ from: today, to: today });
          break;
        case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          setDateRange({ from: yesterday, to: yesterday });
          break;
        }
        case 'thisWeek': {
          const firstDayOfWeek = new Date(today);
          firstDayOfWeek.setDate(today.getDate() - today.getDay());
          setDateRange({ from: firstDayOfWeek, to: today });
          break;
        }
        case 'lastWeek': {
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
          const lastWeekEnd = new Date(today);
          lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
          setDateRange({ from: lastWeekStart, to: lastWeekEnd });
          break;
        }
        case 'thisMonth': {
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          setDateRange({ from: firstDayOfMonth, to: today });
          break;
        }
        case 'lastMonth': {
          const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          setDateRange({ from: firstDayOfLastMonth, to: lastDayOfLastMonth });
          break;
        }
        case 'thisYear': {
          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
          setDateRange({ from: firstDayOfYear, to: today });
          break;
        }
        case 'lastYear': {
          const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
          const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
          setDateRange({ from: firstDayOfLastYear, to: lastDayOfLastYear });
          break;
        }
      }
    };

    return (
      <div className="flex flex-col md:flex-row items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-sm w-full md:w-auto justify-between"
            >
              <CalendarIcon className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'P', { locale: locale === 'ar' ? ar : undefined })} -{' '}
                    {format(dateRange.to, 'P', { locale: locale === 'ar' ? ar : undefined })}
                  </>
                ) : (
                  format(dateRange.from, 'P', { locale: locale === 'ar' ? ar : undefined })
                )
              ) : (
                t('filter.selectDateRange')
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('today')}
                >
                  {t('filter.today')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('yesterday')}
                >
                  {t('filter.yesterday')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('thisWeek')}
                >
                  {t('filter.thisWeek')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('lastWeek')}
                >
                  {t('filter.lastWeek')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('thisMonth')}
                >
                  {t('filter.thisMonth')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('lastMonth')}
                >
                  {t('filter.lastMonth')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('thisYear')}
                >
                  {t('filter.thisYear')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePresetRange('lastYear')}
                >
                  {t('filter.lastYear')}
                </Button>
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              locale={locale === 'ar' ? ar : undefined}
            />
          </PopoverContent>
        </Popover>
        <Button variant="default" onClick={handleRefetch} className="w-full md:w-auto">
          {t('filter.apply')}
        </Button>
      </div>
    );
  };

  // Chart rendering helper function
  const renderBookingsChart = () => {
    const chartData = bookingsChartData?.data || [];
    
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <BarChart className="h-16 w-16 text-gray-300" />
          <p className="text-gray-500 mt-4">{t('charts.noBookingsData')}</p>
        </div>
      );
    }

    // Prepare data for Chart.js
    const labels = chartData.map(item => item.date);
    const data = chartData.map(item => item.count);
    
    const chartConfig = {
      labels,
      datasets: [
        {
          label: t('charts.bookings'),
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: t('charts.bookingsStats'),
        },
        tooltip: {
          callbacks: {
            label: (context: any) => `${context.parsed.y} ${t('charts.bookings')}`,
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    };
    
    return (
      <div className="h-[300px] w-full">
        <Bar data={chartConfig} options={options} />
      </div>
    );
  };

  const renderRevenueChart = () => {
    const chartData = revenueChartData?.data || [];
    
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <LineChart className="h-16 w-16 text-gray-300" />
          <p className="text-gray-500 mt-4">{t('charts.noRevenueData')}</p>
        </div>
      );
    }

    // Prepare data for Chart.js
    const labels = chartData.map(item => item.date);
    const data = chartData.map(item => item.amount);
    
    const chartConfig = {
      labels,
      datasets: [
        {
          label: t('charts.revenue'),
          data,
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: t('charts.revenueStats'),
        },
        tooltip: {
          callbacks: {
            label: (context: any) => formatPrice(context.parsed.y),
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => formatPrice(value),
          }
        }
      }
    };
    
    return (
      <div className="h-[300px] w-full">
        <Line data={chartConfig} options={options} />
      </div>
    );
  };

  const RecentGallery = () => {
    const locale = useLocale();
    const recentGalleryImages = galleryData?.data?.slice(0, 4) || [];
    const totalGalleryImages = galleryData?.data?.length || 0;
    const featuredImages = galleryData?.data?.filter(img => img.is_featured)?.length || 0;

    return (
      <Card className="col-span-1 lg:col-span-2 xl:col-span-1 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-lg font-medium">{t('gallery.title')}</CardTitle>
          <PictureInPicture className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">{t('gallery.totalImages')}: {totalGalleryImages}</div>
            <div className="text-sm text-muted-foreground">{t('gallery.featuredImages')}: {featuredImages}</div>
          </div>
          {recentGalleryImages && recentGalleryImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {recentGalleryImages.map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
                  <img
                    src={getValidImageUrl(image.image_path)}
                    alt={image.title || t('gallery.imageAlt')}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                  {image.is_featured && (
                    <div className="absolute top-1 right-1">
                      <Badge className="bg-yellow-500">{t('gallery.featured')}</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <PictureInPicture className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('gallery.noImages')}</p>
            </div>
          )}
          <Link href={`/${locale}/umrahoffices/dashboard/gallery`}>
            <Button variant="outline" className="w-full">
              {t('gallery.manageGallery')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  // Popular packages component
  const PopularPackages = () => {
    const popularPackages = packageBookingsStatistics?.data?.popular_packages || [];
    
    return (
      <Card className="col-span-1 lg:col-span-2 xl:col-span-3 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-medium">{t('packages.popularPackages')}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2">
          {popularPackages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularPackages.map(pkg => (
                <Card key={pkg.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={getValidImageUrl(pkg.featured_image_url) || '/images/placeholder.jpg'}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold line-clamp-2">{pkg.name}</h3>
                      {pkg.has_discount && (
                        <Badge className="bg-red-500">{pkg.discount_percentage}% {t('packages.discount')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{pkg.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">{t('packages.price')}</div>
                        <div className="font-bold">
                          {formatPrice(pkg.price)}
                          {pkg.has_discount && (
                            <span className="text-sm line-through text-gray-400 mr-1">
                              {formatPrice(pkg.discount_price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">{t('packages.bookings')}</div>
                        <div className="font-bold text-center">{pkg.bookings_count}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('packages.noPopularPackages')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-right">{t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-center sm:text-right">
            {t('subtitle')}
          </p>
        </div>
        <DateRangePickerWithButton />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('stats.totalBookings')}</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.total_bookings}</h3>
              <p className="text-xs text-green-500 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {stats.total_bookings > 0 ? t('stats.positiveActivity') : t('stats.noActivity')}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('stats.totalRevenue')}</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{formatPrice(stats.total_revenue)}</h3>
              <p className="text-xs text-green-500 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {stats.total_revenue > 0 ? t('stats.goodFinancial') : t('stats.noRevenue')}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('stats.confirmedBookings')}</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.confirmed_bookings}</h3>
              <p className="text-xs text-green-500 mt-1">
                <CheckCircle className="inline h-3 w-3 mr-1" />
                {Math.round((stats.confirmed_bookings / (stats.total_bookings || 1)) * 100)}% {t('stats.ofTotal')}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('stats.pendingBookings')}</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.pending_bookings}</h3>
              <p className="text-xs text-yellow-500 mt-1">
                <Clock className="inline h-3 w-3 mr-1" />
                {t('stats.needsReview')}
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle className="text-lg sm:text-xl">{t('charts.bookingsStats')}</CardTitle>
              <div>
                <select 
                  className="border rounded px-2 py-1 text-sm"
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value as any)}
                >
                  <option value="daily">{t('charts.periods.daily')}</option>
                  <option value="weekly">{t('charts.periods.weekly')}</option>
                  <option value="monthly">{t('charts.periods.monthly')}</option>
                </select>
              </div>
            </div>
            <CardDescription className="mt-1">{t('charts.bookingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
            {isLoadingBookingsChart ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              renderBookingsChart()
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle className="text-lg sm:text-xl">{t('charts.revenueStats')}</CardTitle>
              <div>
                <select 
                  className="border rounded px-2 py-1 text-sm"
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value as any)}
                >
                  <option value="daily">{t('charts.periods.daily')}</option>
                  <option value="weekly">{t('charts.periods.weekly')}</option>
                  <option value="monthly">{t('charts.periods.monthly')}</option>
                </select>
              </div>
            </div>
            <CardDescription className="mt-1">{t('charts.revenueDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-4">
            {isLoadingRevenueChart ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              renderRevenueChart()
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Popular packages section */}
      <div className="mb-8">
        <PopularPackages />
      </div>
      
      {/* Recent Bookings and Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent bookings card */}
        <Card className="col-span-1 lg:col-span-2 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-lg font-medium">{t('bookings.recentBookings')}</CardTitle>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-muted-foreground mr-2" />
              <Link href={`/${locale}/umrahoffices/dashboard/bookings`}>
                <Button variant="outline" size="sm">
                  {t('bookings.viewAllBookings')}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">{t('bookings.noRecentBookings')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.bookingNumber')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.customerName')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.package')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.amount')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.status')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.paymentStatus')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.bookingDate')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <Link 
                            href={`/${locale}/umrahoffices/dashboard/bookings/${booking.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {booking.booking_number}
                          </Link>
                        </td>
                        <td className="py-3 px-4">{booking.user?.name}</td>
                        <td className="py-3 px-4">{booking.package?.name}</td>
                        <td className="py-3 px-4">{formatPrice(Number(booking.total_price) || 0 )}</td>
                        <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                        <td className="py-3 px-4">{getPaymentStatusBadge(booking.payment_status)}</td>
                        <td className="py-3 px-4" dir="ltr">{formatDate(booking.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Gallery card */}
        <RecentGallery />
      </div>

      {/* Calendar section */}
      <div className="mt-8">
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>{t('calendar.title')}</CardTitle>
            <CardDescription>{t('calendar.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {bookingsCalendarData?.data?.length && bookingsCalendarData?.data?.length > 0 ? (
              <div className="min-w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="py-3 px-4 text-right font-medium">{t('calendar.packageName')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('calendar.customerName')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('calendar.startDate')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('calendar.endDate')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('calendar.persons')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.status')}</th>
                      <th className="py-3 px-4 text-right font-medium">{t('bookings.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsCalendarData?.data?.slice(0, 5).map((event) => (
                      <tr key={event.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">{event.package}</td>
                        <td className="py-3 px-4">{event.customer}</td>
                        <td className="py-3 px-4" dir="ltr">{format(new Date(event.start), 'P', { locale: locale === 'ar' ? ar : undefined })}</td>
                        <td className="py-3 px-4" dir="ltr">{format(new Date(event.end), 'P', { locale: locale === 'ar' ? ar : undefined })}</td>
                        <td className="py-3 px-4 text-center">{event.persons}</td>
                        <td className="py-3 px-4">{getStatusBadge(event.status)}</td>
                          <td className="py-3 px-4">{formatPrice(Number(event.total_price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('calendar.noEvents')}</p>
              </div>
            )}
            <div className="mt-4 text-right p-4">
              <Link href={`/${locale}/umrahoffices/dashboard/bookings`}>
                <Button variant="outline" size="sm">
                  {t('calendar.viewAll')} <ChevronRight className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats and links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>{t('packages.stats')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('stats.monthlyBookings')}</span>
                <span className="font-bold">{stats.monthly_bookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('stats.todayBookings')}</span>
                <span className="font-bold">{stats.today_bookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('stats.averageBookingValue')}</span>
                <span className="font-bold">{formatPrice(stats.average_booking_value)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/packages`}>
                {t('packages.manage')}
                <Package className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>{t('bookings.stats')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('bookings.confirmed')}</span>
                <span className="font-bold">{stats.confirmed_bookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('bookings.canceled')}</span>
                <span className="font-bold">{stats.canceled_bookings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('bookings.completionRate')}</span>
                <span className="font-bold">
                  {stats.total_bookings > 0 ? 
                    Math.round((stats.confirmed_bookings / stats.total_bookings) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/bookings`}>
                {t('bookings.manage')}
                <Calendar className="h-4 w-4 mr-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>{t('quickLinks.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-2">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/packages/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('quickLinks.createPackage')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/campaigns`}>
                  <Activity className="h-4 w-4 mr-2" />
                  {t('quickLinks.manageCampaigns')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/documents`}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('quickLinks.manageDocuments')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/gallery`}>
                  <PictureInPicture className="h-4 w-4 mr-2" />
                  {t('quickLinks.manageGallery')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}