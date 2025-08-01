'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Filter
} from 'lucide-react';

// Import Chart.js components
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
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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
  ArcElement,
  Filler
);

interface ChartData {
  labels: string[];
  bookings: number[];
  revenue: number[];
}

interface EnhancedChartsProps {
  bookingsChartData?: ChartData;
  revenueChartData?: ChartData;
  isLoading?: boolean;
  period?: 'daily' | 'weekly' | 'monthly';
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export default function EnhancedCharts({
  bookingsChartData,
  revenueChartData,
  isLoading = false,
  period = 'monthly',
  onPeriodChange
}: EnhancedChartsProps) {
  const t = useTranslations('UmrahOfficesDashboard');
  const [activeChart, setActiveChart] = useState<'bookings' | 'revenue' | 'combined'>('combined');

  // Mock data if none provided
  const mockData: ChartData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    bookings: [12, 19, 8, 15, 22, 18],
    revenue: [65000, 95000, 45000, 78000, 125000, 89000]
  };

  const displayBookingsData = bookingsChartData || mockData;
  const displayRevenueData = revenueChartData || mockData;

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        rtl: true,
        labels: {
          font: {
            family: 'Inter, Arial, sans-serif'
          },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  const bookingsLineData = {
    labels: displayBookingsData.labels,
    datasets: [
      {
        label: t('charts.bookings'),
        data: displayBookingsData.bookings,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const revenueBarData = {
    labels: displayRevenueData.labels,
    datasets: [
      {
        label: t('charts.revenue'),
        data: displayRevenueData.revenue,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const combinedData = {
    labels: displayBookingsData.labels,
    datasets: [
      {
        type: 'line' as const,
        label: t('charts.bookings'),
        data: displayBookingsData.bookings,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        type: 'bar' as const,
        label: t('charts.revenue'),
        data: displayRevenueData.revenue,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 4,
        yAxisID: 'y1'
      }
    ]
  };

  const combinedOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  // Performance metrics
  const totalBookings = displayBookingsData.bookings.reduce((a, b) => a + b, 0);
  const totalBookings = (displayBookingsData?.bookings || [])
  .reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

  const totalRevenue = displayRevenueData.revenue.reduce((a, b) => a + b, 0);
  const avgBookingsPerPeriod = Math.round(totalBookings / displayBookingsData.bookings.length);
  const avgRevenuePerPeriod = Math.round(totalRevenue / displayRevenueData.revenue.length);

  // Calculate trends
  const bookingsTrend = displayBookingsData.bookings.length > 1 
    ? ((displayBookingsData.bookings[displayBookingsData.bookings.length - 1] - displayBookingsData.bookings[0]) / displayBookingsData.bookings[0]) * 100
    : 0;
  const revenueTrend = displayRevenueData.revenue.length > 1
    ? ((displayRevenueData.revenue[displayRevenueData.revenue.length - 1] - displayRevenueData.revenue[0]) / displayRevenueData.revenue[0]) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                {t('charts.bookingsStats')}
              </CardTitle>
              <CardDescription>
                {t('charts.bookingsDescription')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('charts.periods.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('charts.periods.weekly')}</SelectItem>
                  <SelectItem value="monthly">{t('charts.periods.monthly')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs value={activeChart} onValueChange={(value) => setActiveChart(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                {t('charts.bookings')}
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('charts.revenue')}
              </TabsTrigger>
              <TabsTrigger value="combined" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                مدمج
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              {/* Performance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الحجوزات</div>
                  <div className="text-xl font-bold text-blue-600">{totalBookings}</div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    {bookingsTrend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={bookingsTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(bookingsTrend).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</div>
                  <div className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString()} ر.س</div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    {revenueTrend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={revenueTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(revenueTrend).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">متوسط الحجوزات</div>
                  <div className="text-xl font-bold text-purple-600">{avgBookingsPerPeriod}</div>
                  <div className="text-xs text-gray-500">حجز / {t(`charts.periods.${period}`)}</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">متوسط الإيرادات</div>
                  <div className="text-xl font-bold text-orange-600">{avgRevenuePerPeriod.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">ر.س / {t(`charts.periods.${period}`)}</div>
                </div>
              </div>
              
              <TabsContent value="bookings" className="space-y-4">
                <div className="h-80">
                  <Line data={bookingsLineData} options={chartOptions} />
                </div>
              </TabsContent>
              
              <TabsContent value="revenue" className="space-y-4">
                <div className="h-80">
                  <Bar data={revenueBarData} options={chartOptions} />
                </div>
              </TabsContent>
              
              <TabsContent value="combined" className="space-y-4">
                <div className="h-80">
                  <Bar data={combinedData as any} options={combinedOptions as any} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 