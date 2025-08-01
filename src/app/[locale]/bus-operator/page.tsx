'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, TrendingUp, Users, Bus, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from './redux/store';
import { fetchStatistics, fetchBookings, fetchBuses } from './redux/busOperatorSlice';

export default function BusOperatorDashboard() {
  const dispatch = useAppDispatch();
  const { statistics, bookings, buses, loading, user } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    // Fetch dashboard data
    dispatch(fetchStatistics());
    dispatch(fetchBookings({ per_page: 5 })); // Get recent bookings
    dispatch(fetchBuses());
  }, [dispatch]);

  const recentBookings = bookings.slice(0, 5);
  const activeBuses = buses.filter(bus => bus.status === 'active');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t('welcome')} {user?.name}!
        </h1>
        <p className="text-blue-100">
          {t('overview')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalBookings')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.statistics ? '...' : statistics?.total_bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.thisMonth')}
            </p>
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.pendingBookings')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.statistics ? '...' : statistics?.pending_bookings || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('bookings.status.pending')}
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.totalRevenue')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.statistics ? '...' : `${statistics?.total_revenue || 0} ريال`}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.thisMonth')}
            </p>
          </CardContent>
        </Card>

        {/* Active Buses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.activeBuses')}
            </CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading.buses ? '...' : activeBuses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('stats.totalBuses')}: {buses.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('bookings.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.bookings ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{booking.id}</span>
                        <Badge 
                          variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' : 'outline'
                          }
                        >
                          {t(`bookings.status.${booking.status}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.user?.name} - {booking.number_of_persons} {t('bookings.table.passengers')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.travel_start).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{booking.total_price} ريال</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  {t('bookings.list')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Buses */}
        <Card>
          <CardHeader>
            <CardTitle>{t('buses.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.buses ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : activeBuses.length > 0 ? (
              <div className="space-y-4">
                {activeBuses.slice(0, 5).map((bus) => (
                  <div key={bus.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{bus.name}</span>
                        <Badge variant="outline">
                          {t(`buses.types.${bus.type}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bus.plate_number} - {bus.capacity} مقعد
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{bus.price_per_km} ريال/كم</p>
                      <Badge 
                        variant={bus.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {t(`buses.form.${bus.status}`)}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  {t('buses.list')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              {t('bookings.create')}
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Bus className="h-6 w-6 mb-2" />
              {t('buses.add')}
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              {t('calendar.title')}
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <MapPin className="h-6 w-6 mb-2" />
              {t('chat.title')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 