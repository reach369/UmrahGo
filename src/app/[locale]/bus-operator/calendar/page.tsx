'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchCalendar } from '../redux/busOperatorSlice';

export default function BusOperatorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  
  const dispatch = useAppDispatch();
  const { calendar, loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    dispatch(fetchCalendar({ year, month }));
  }, [dispatch, currentDate]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    if (!calendar || !date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return calendar.bookings?.filter((booking: any) => 
      booking.travel_start.startsWith(dateStr)
    ) || [];
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedBookings(getBookingsForDate(date));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('calendar.title')}</h1>
          <p className="text-muted-foreground">
            {t('calendar.overview')}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('bookings.create')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading.calendar ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="p-2 h-20"></div>;
                    }
                    
                    const bookings = getBookingsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`p-1 h-20 border rounded cursor-pointer hover:bg-gray-50 ${
                          isToday ? 'bg-blue-50 border-blue-200' : ''
                        } ${isSelected ? 'bg-blue-100 border-blue-300' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="text-sm font-medium mb-1">
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {bookings.slice(0, 2).map((booking: any, idx: number) => (
                            <div
                              key={idx}
                              className={`w-full h-1.5 rounded ${getStatusColor(booking.status)}`}
                              title={`حجز #${booking.id}`}
                            />
                          ))}
                          {bookings.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{bookings.length - 2} المزيد
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">حالة الحجوزات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">{t('bookings.status.confirmed')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-sm">{t('bookings.status.pending')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">{t('bookings.status.cancelled')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">{t('bookings.status.completed')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Today's Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إحصائيات اليوم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>إجمالي الحجوزات</span>
                <span className="font-medium">{calendar?.today_stats?.total_bookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>حجوزات مؤكدة</span>
                <span className="font-medium">{calendar?.today_stats?.confirmed_bookings || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الإيرادات</span>
                <span className="font-medium">{calendar?.today_stats?.total_revenue || 0} ريال</span>
              </div>
              <div className="flex justify-between">
                <span>عدد الركاب</span>
                <span className="font-medium">{calendar?.today_stats?.total_passengers || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  تفاصيل {selectedDate.toLocaleDateString('ar-SA')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد حجوزات في هذا اليوم
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedBookings.map((booking: any) => (
                      <div key={booking.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">حجز #{booking.id}</span>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {t(`bookings.status.${booking.status}`)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{booking.user?.name}</p>
                          <p>{booking.number_of_persons} ركاب</p>
                          <p>{booking.total_price} ريال</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <Eye className="w-4 h-4 mr-1" />
                          عرض التفاصيل
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 