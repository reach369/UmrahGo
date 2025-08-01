'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, Users, Bus, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchStatistics } from '../redux/busOperatorSlice';

export default function BusOperatorStatisticsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const dispatch = useAppDispatch();
  const { statistics, loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch, timeRange]);

  const StatCard = ({ title, value, icon: Icon, change, isLoading }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : value}
        </div>
        {change && (
          <div className="flex items-center space-x-1 mt-1">
            <Badge variant={change >= 0 ? 'default' : 'destructive'} className="text-xs">
              {change >= 0 ? '+' : ''}{change}%
            </Badge>
            <p className="text-xs text-muted-foreground">
              من الشهر الماضي
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('statistics.title')}</h1>
          <p className="text-muted-foreground">
            {t('statistics.overview')}
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="quarter">هذا الربع</SelectItem>
            <SelectItem value="year">هذا العام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title={t('stats.totalBookings')}
          value={statistics?.total_bookings || 0}
          icon={Calendar}
          change={statistics?.bookings_change}
          isLoading={loading.statistics}
        />
        <StatCard
          title={t('stats.totalRevenue')}
          value={`${statistics?.total_revenue || 0} ريال`}
          icon={DollarSign}
          change={statistics?.revenue_change}
          isLoading={loading.statistics}
        />
        <StatCard
          title={t('stats.totalPassengers')}
          value={statistics?.total_passengers || 0}
          icon={Users}
          change={statistics?.passengers_change}
          isLoading={loading.statistics}
        />
        <StatCard
          title={t('stats.activeBuses')}
          value={statistics?.active_buses || 0}
          icon={Bus}
          isLoading={loading.statistics}
        />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics.bookingStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{t('bookings.status.confirmed')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.confirmed_bookings || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.total_bookings ? 
                      Math.round((statistics.confirmed_bookings / statistics.total_bookings) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>{t('bookings.status.pending')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.pending_bookings || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.total_bookings ? 
                      Math.round((statistics.pending_bookings / statistics.total_bookings) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{t('bookings.status.cancelled')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.cancelled_bookings || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.total_bookings ? 
                      Math.round((statistics.cancelled_bookings / statistics.total_bookings) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{t('bookings.status.completed')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.completed_bookings || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.total_bookings ? 
                      Math.round((statistics.completed_bookings / statistics.total_bookings) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics.paymentStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{t('bookings.paymentStatus.paid')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.paid_amount || 0} ريال</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.paid_bookings || 0} حجز
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>{t('bookings.paymentStatus.partially_paid')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.partially_paid_amount || 0} ريال</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.partially_paid_bookings || 0} حجز
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{t('bookings.paymentStatus.pending')}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{statistics?.pending_amount || 0} ريال</div>
                  <div className="text-sm text-muted-foreground">
                    {statistics?.pending_payment_bookings || 0} حجز
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics.busPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>متوسط الحجوزات لكل باص</span>
                <div className="font-medium">
                  {statistics?.active_buses ? 
                    Math.round((statistics.total_bookings || 0) / statistics.active_buses) : 0}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>متوسط الإيرادات لكل باص</span>
                <div className="font-medium">
                  {statistics?.active_buses ? 
                    Math.round((statistics.total_revenue || 0) / statistics.active_buses) : 0} ريال
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>معدل الإشغال</span>
                <div className="font-medium">
                  {statistics?.occupancy_rate || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('statistics.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">حجز جديد تم تأكيده</p>
                  <p className="text-xs text-muted-foreground">منذ 5 دقائق</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">تم إضافة باص جديد</p>
                  <p className="text-xs text-muted-foreground">منذ ساعة</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">دفعة جديدة مستلمة</p>
                  <p className="text-xs text-muted-foreground">منذ 3 ساعات</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statistics.monthlyPerformance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">رسم بياني للأداء الشهري</h3>
              <p className="mt-1 text-sm text-gray-500">
                سيتم إضافة مخطط بياني تفاعلي هنا
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 