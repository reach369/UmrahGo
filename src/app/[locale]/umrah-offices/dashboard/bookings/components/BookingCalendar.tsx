import { useState, useEffect } from 'react';
import { useGetCalendarEventsQuery } from '../../../redux/api/bookingsApiSlice';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

export default function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Get start and end dates for the current month
  const startDate = date ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date();
  const endDate = date ? new Date(date.getFullYear(), date.getMonth() + 1, 0) : new Date();

  const { data: events, isLoading, error } = useGetCalendarEventsQuery({
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل التقويم",
        variant: "destructive"
      });
    }
  }, [error]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        حدث خطأ أثناء تحميل التقويم
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تقويم الحجوزات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={ar}
            className="rounded-md border"
          />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">الحجوزات في {date ? format(date, 'MMMM yyyy', { locale: ar }) : ''}</h3>
            
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border"
                    style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.start), 'HH:mm', { locale: ar })} - 
                      {format(new Date(event.end), 'HH:mm', { locale: ar })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                لا توجد حجوزات في هذا الشهر
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 