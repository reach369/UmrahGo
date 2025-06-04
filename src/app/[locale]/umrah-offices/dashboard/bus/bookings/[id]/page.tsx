'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, Calendar, CreditCard, User, Bus, Building2,
  CheckCircle, ClockIcon, Download, Printer
} from 'lucide-react';
import Link from 'next/link';

// Define the BusBooking interface
interface BusBooking {
  id: number;
  user_id: number;
  bus_id: number | null;
  campaign_id: number | null;
  booking_date: string;
  status: 'pending' | 'confirmed';
  payment_status: 'paid' | 'unpaid';
  total_price: number;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  bus_model?: string;
  bus_capacity?: number;
  campaign_name?: string;
  campaign_start_date?: string;
  campaign_end_date?: string;
  commission_amount?: number;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let bg = '';
  let text = '';
  let icon = null;
  
  switch (status) {
    case 'confirmed':
      bg = 'bg-green-100';
      text = 'text-green-800';
      icon = <CheckCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          مؤكد
        </span>
      );
    case 'pending':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      icon = <ClockIcon className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          معلق
        </span>
      );
    default:
      return null;
  }
}

// Payment status badge component
function PaymentBadge({ status }: { status: string }) {
  let bg = '';
  let text = '';
  
  switch (status) {
    case 'paid':
      bg = 'bg-green-100';
      text = 'text-green-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          مدفوع
        </span>
      );
    case 'unpaid':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          غير مدفوع
        </span>
      );
    default:
      return null;
  }
}

export default function BusBookingDetailsPage() {
  const params = useParams();
  const bookingId = params.id;
  const [booking, setBooking] = useState<BusBooking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch the booking details from an API
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setBooking({
          id: Number(bookingId),
          user_id: 1,
          bus_id: 1,
          campaign_id: 1,
          booking_date: '2024-03-26',
          status: 'pending',
          payment_status: 'unpaid',
          total_price: 500,
          user_name: 'أحمد محمد',
          user_email: 'ahmed@example.com',
          user_phone: '+966500000000',
          bus_model: 'مرسيدس بنز',
          bus_capacity: 50,
          campaign_name: 'حملة رمضان 2024',
          campaign_start_date: '2024-03-01',
          campaign_end_date: '2024-03-30',
          commission_amount: 50
        });
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('حدث خطأ أثناء تحميل تفاصيل الحجز');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">جاري تحميل تفاصيل الحجز...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error || 'لم يتم العثور على الحجز'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">تفاصيل حجز الباص</h1>
          <p className="text-gray-600">رقم الحجز: #{booking.id}</p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <Download className="ml-2 h-4 w-4" />
            تحميل
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-gray-500">حالة الحجز</h3>
                <StatusBadge status={booking.status} />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(booking.booking_date).toLocaleDateString('ar-SA')}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-gray-500">حالة الدفع</h3>
                <PaymentBadge status={booking.payment_status} />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {booking.total_price} ر.س
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="ml-2 h-5 w-5" />
            معلومات المعتمر
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">الاسم</label>
              <p className="font-medium">{booking.user_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">البريد الإلكتروني</label>
              <p className="font-medium">{booking.user_email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">رقم الهاتف</label>
              <p className="font-medium">{booking.user_phone}</p>
            </div>
          </div>
        </div>

        {/* Bus Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Bus className="ml-2 h-5 w-5" />
            معلومات الباص
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">الموديل</label>
              <p className="font-medium">{booking.bus_model}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">السعة</label>
              <p className="font-medium">{booking.bus_capacity} راكب</p>
            </div>
          </div>
        </div>

        {/* Campaign Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Building2 className="ml-2 h-5 w-5" />
            معلومات الحملة
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">اسم الحملة</label>
              <p className="font-medium">{booking.campaign_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">تاريخ البداية</label>
              <p className="font-medium">
                {new Date(booking.campaign_start_date!).toLocaleDateString('ar-SA')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">تاريخ النهاية</label>
              <p className="font-medium">
                {new Date(booking.campaign_end_date!).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="ml-2 h-5 w-5" />
            معلومات الدفع
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">المبلغ الإجمالي</label>
              <p className="font-medium">{booking.total_price} ر.س</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">مبلغ العمولة</label>
              <p className="font-medium">{booking.commission_amount} ر.س</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">صافي المبلغ</label>
              <p className="font-medium">{booking.total_price - (booking.commission_amount || 0)} ر.س</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end">
        <Link
          href="/umrah-offices/dashboard/bus/bookings"
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للحجوزات
        </Link>
      </div>
    </div>
  );
} 