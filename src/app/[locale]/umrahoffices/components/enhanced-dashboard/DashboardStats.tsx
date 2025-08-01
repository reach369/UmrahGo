'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  CreditCard, 
  Calendar,
  DollarSign,
  Activity,
  Award,
  CheckCircle
} from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';

interface StatItem {
  id: string;
  value: number | string;
  label: string;
  icon: any;
  trend?: number;
  color: string;
  bgColor: string;
  description?: string;
}

interface DashboardStatsProps {
  stats: {
    total_bookings: number;
    total_revenue: number;
    pending_bookings: number;
    confirmed_bookings: number;
    canceled_bookings: number;
    today_bookings: number;
    monthly_bookings: number;
    average_booking_value: number;
    popular_packages: any[];
  };
  isLoading?: boolean;
}

export default function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  const t = useTranslations('UmrahOfficesDashboard');

  // Calculate trends (mock calculation - in real app would come from API)
  const calculateTrend = (current: number, previous: number = 0): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const statItems: StatItem[] = [
    {
      id: 'total_bookings',
      value: stats.total_bookings,
      label: t('stats.totalBookings'),
      icon: Calendar,
      trend: calculateTrend(stats.total_bookings, stats.total_bookings * 0.85),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: t('stats.positiveActivity')
    },
    {
      id: 'total_revenue',
      value: formatPrice(stats.total_revenue),
      label: t('stats.totalRevenue'),
      icon: DollarSign,
      trend: calculateTrend(stats.total_revenue, stats.total_revenue * 0.9),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: t('stats.goodFinancial')
    },
    {
      id: 'confirmed_bookings',
      value: stats.confirmed_bookings,
      label: t('stats.confirmedBookings'),
      icon: CheckCircle,
      trend: calculateTrend(stats.confirmed_bookings, stats.confirmed_bookings * 0.8),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      description: `${Math.round((stats.confirmed_bookings / Math.max(stats.total_bookings, 1)) * 100)}% ${t('stats.ofTotal')}`
    },
    {
      id: 'pending_bookings',
      value: stats.pending_bookings,
      label: t('stats.pendingBookings'),
      icon: Activity,
      trend: stats.pending_bookings > 5 ? 0 : calculateTrend(stats.pending_bookings, 3),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: stats.pending_bookings > 5 ? t('stats.needsReview') : t('stats.noActivity')
    },
    {
      id: 'today_bookings',
      value: stats.today_bookings,
      label: t('stats.todayBookings'),
      icon: Calendar,
      trend: calculateTrend(stats.today_bookings, 2),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: stats.today_bookings > 0 ? t('stats.positiveActivity') : t('stats.noActivity')
    },
    {
      id: 'average_booking_value',
      value: formatPrice(stats.average_booking_value),
      label: t('stats.averageBookingValue'),
      icon: Award,
      trend: calculateTrend(stats.average_booking_value, stats.average_booking_value * 0.95),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: t('stats.goodFinancial')
    }
  ];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendBadge = (trend: number) => {
    if (trend > 0) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          +{trend.toFixed(1)}%
        </Badge>
      );
    }
    if (trend < 0) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {trend.toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        0%
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        
        return (
          <Card 
            key={item.id} 
            className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {item.label}
              </CardTitle>
              <div className={`${item.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className={`h-5 w-5 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-3xl transition-all duration-300">
                  {item.value}
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(item.trend || 0)}
                  {getTrendBadge(item.trend || 0)}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 