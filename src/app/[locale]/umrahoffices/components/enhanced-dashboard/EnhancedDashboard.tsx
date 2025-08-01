'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  useGetBookingsStatisticsQuery,
  useGetPackageBookingsStatisticsQuery,
  useGetPackageBookingsQuery,
  useGetBookingsCalendarQuery,
  useGetGalleryQuery,
  useGetPackagesQuery,
  useGetBookingsChartDataQuery,
  useGetRevenueChartDataQuery
} from '../../redux/api/dashboardApiSlice';

// Enhanced Components
import DashboardStats from './DashboardStats';
import RecentNotifications from './RecentNotifications';
import EnhancedCharts from './EnhancedCharts';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  AlertTriangle, 
  Calendar, 
  Package, 
  Users,
  TrendingUp,
  Settings,
  Bell,
  ChevronRight,
  Plus,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { formatPrice } from '@/utils/formatPrice';
import { getValidImageUrl } from '@/utils/image-helpers';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function EnhancedDashboard() {
  const t = useTranslations('UmrahOfficesDashboard');
  const locale = useLocale();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Chart period state
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  
  // Date filtering state
  const [dateRange, setDateRange] = useState<{from?: Date, to?: Date}>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  // RTK Query hooks
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
    start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  });

  const {
    data: revenueChartData,
    isLoading: isLoadingRevenueChart,
  } = useGetRevenueChartDataQuery({ 
    period: chartPeriod,
    start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  });

  const {
    data: packageBookingsData,
    isLoading: isLoadingPackageBookings,
  } = useGetPackageBookingsQuery({
    per_page: 5,
    from_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    to_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
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

  // Compute combined stats
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

  // Handle refetch all data
  const handleRefresh = () => {
    refetchBookingsStats();
    refetchPackageBookingsStats();
  };

  // Loading state for main stats
  const isLoadingMainStats = isLoadingBookingsStats || isLoadingPackageBookingsStatistics;

  // Error state
  const hasError = bookingsStatsError || packageBookingsStatsError;

  // Welcome message with user name
  const getWelcomeMessage = () => {
    const userName = user?.name || 'مدير المكتب';
    const currentHour = new Date().getHours();
    
    if (currentHour < 12) {
      return `صباح الخير، ${userName}`;
    } else if (currentHour < 18) {
      return `مساء الخير، ${userName}`;
    } else {
      return `مساء الخير، ${userName}`;
    }
  };

  if (hasError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('errors.dashboardLoadError')}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('actions.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getWelcomeMessage()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('subtitle')}
          </p>
          {user?.lastLogin && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {t('lastLogin', { date: format(new Date(user.lastLogin), 'PPp', { locale: locale === 'ar' ? ar : undefined }) })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoadingMainStats}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMainStats ? 'animate-spin' : ''}`} />
            {t('actions.refresh')}
          </Button>
          <Button asChild>
            <Link href={`/${locale}/umrahoffices/dashboard/packages/create`}>
              <Plus className="h-4 w-4 mr-2" />
              إنشاء باقة جديدة
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Statistics */}
      <DashboardStats 
        stats={stats} 
        isLoading={isLoadingMainStats} 
      />

      {/* Charts and Notifications Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts - Takes 2 columns */}
        <div className="lg:col-span-2">
          <EnhancedCharts
            bookingsChartData={bookingsChartData?.data}
            revenueChartData={revenueChartData?.data}
            isLoading={isLoadingBookingsChart || isLoadingRevenueChart}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
          />
        </div>
        
        {/* Notifications - Takes 1 column */}
        <div>
          <RecentNotifications 
            isLoading={false} // You can connect this to actual notifications API
          />
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {t('bookings.recentBookings')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/bookings`}>
                {t('bookings.viewAllBookings')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingPackageBookings ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : packageBookingsData?.data?.data?.length ? (
              <div className="space-y-3">
                {packageBookingsData.data.data.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{booking.user?.name || 'عميل'}</p>
                        <p className="text-xs text-gray-500">{booking.package?.name || 'باقة'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatPrice(parseFloat(booking.total_amount))}</p>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('bookings.noRecentBookings')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gallery Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              {t('gallery.title')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/gallery`}>
                {t('gallery.manageGallery')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingGallery ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : galleryData?.data?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryData.data.slice(0, 6).map((image) => (
                  <div key={image.id} className="aspect-square rounded-lg overflow-hidden group">
                    <img 
                      src={getValidImageUrl(image.image_url)} 
                      alt={image.title || t('gallery.imageAlt')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('gallery.noImages')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('quickLinks.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/packages/create`}>
                <Plus className="h-6 w-6" />
                <span className="text-sm">{t('quickLinks.createPackage')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/bookings`}>
                <Calendar className="h-6 w-6" />
                <span className="text-sm">{t('quickLinks.manageCampaigns')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/documents`}>
                <FileText className="h-6 w-6" />
                <span className="text-sm">{t('quickLinks.manageDocuments')}</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" asChild>
              <Link href={`/${locale}/umrahoffices/dashboard/gallery`}>
                <ImageIcon className="h-6 w-6" />
                <span className="text-sm">{t('quickLinks.manageGallery')}</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 