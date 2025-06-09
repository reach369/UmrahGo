'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Eye, Download } from 'lucide-react';

// واجهة لبيانات الحجز
interface Booking {
  id: string;
  date: string;
  officeName: string;
  packageName: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  pilgrims: number;
}

interface BookingHistoryProps {
  userId?: string | number;
}

export default function BookingHistory({ userId }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب بيانات الحجوزات من API
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        // قم بتأخير التنفيذ لمحاكاة طلب الشبكة
        await new Promise(resolve => setTimeout(resolve, 1000));

        // بيانات تجريبية للعرض
        const mockBookings: Booking[] = [
          {
            id: 'BK12345',
            date: '2023-12-15',
            officeName: 'مكتب السلام للعمرة',
            packageName: 'باقة رمضان الفضية',
            status: 'confirmed',
            amount: 5000,
            pilgrims: 2
          },
          {
            id: 'BK12346',
            date: '2023-11-20',
            officeName: 'شركة الإيمان للعمرة',
            packageName: 'باقة شهر رجب الذهبية',
            status: 'completed',
            amount: 7500,
            pilgrims: 3
          },
          {
            id: 'BK12347',
            date: '2024-01-10',
            officeName: 'مكتب النور للعمرة',
            packageName: 'باقة شعبان الاقتصادية',
            status: 'pending',
            amount: 3000,
            pilgrims: 1
          }
        ];

        setBookings(mockBookings);
      } catch (error) {
        console.error('فشل في جلب الحجوزات:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  // ترجمة حالة الحجز إلى العربية
  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  // لون الشارة حسب الحالة
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الحجوزات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <span className="mr-4">جاري تحميل الحجوزات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // عرض رسالة إذا لم تكن هناك حجوزات
  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تاريخ الحجوزات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد حجوزات سابقة
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>تاريخ الحجوزات</CardTitle>
        <Button variant="outline" size="sm">عرض الكل</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-2 font-medium">رقم الحجز</th>
                <th className="text-right py-3 px-2 font-medium">التاريخ</th>
                <th className="text-right py-3 px-2 font-medium">المكتب</th>
                <th className="text-right py-3 px-2 font-medium">الباقة</th>
                <th className="text-right py-3 px-2 font-medium">الحالة</th>
                <th className="text-right py-3 px-2 font-medium">المبلغ</th>
                <th className="text-right py-3 px-2 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-2">{booking.id}</td>
                  <td className="py-3 px-2">{new Date(booking.date).toLocaleDateString('ar-SA')}</td>
                  <td className="py-3 px-2">{booking.officeName}</td>
                  <td className="py-3 px-2">{booking.packageName}</td>
                  <td className="py-3 px-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">{booking.amount.toLocaleString('ar-SA')} ر.س</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button size="icon" variant="ghost" title="عرض التفاصيل">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="تنزيل التذكرة">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 