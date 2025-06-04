'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  Users, Calendar, CreditCard, Clock, AlertCircle, CheckCircle, BarChart3, User,
  AlertTriangle
} from 'lucide-react';
import { useGetCampaignsQuery } from '../redux/api/campaignsApiSlice';
import { useGetBookingsQuery, useApproveBookingMutation, useRejectBookingMutation } from '../redux/api/bookingsApiSlice';
import { useGetPaymentSummaryQuery } from '../redux/api/paymentsApiSlice';
import { useAppSelector } from '../hooks/reduxHooks';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

// إضافة وسيلة توضيحية لمعرفة حالة البيانات
function ApiStatus() {
  const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useGetCampaignsQuery({});
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useGetBookingsQuery({});
  const { data: paymentSummary, isLoading: paymentLoading, error: paymentError } = useGetPaymentSummaryQuery();
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 className="font-bold text-lg mb-2">حالة البيانات الافتراضية:</h2>
      <div>
        <div>الحملات: {campaignsLoading ? 'جاري التحميل...' : campaignsError ? 'خطأ' : `تم تحميل ${campaignsData?.length || 0} حملة`}</div>
        <div>الحجوزات: {bookingsLoading ? 'جاري التحميل...' : bookingsError ? 'خطأ' : `تم تحميل ${bookingsData?.length || 0} حجز`}</div>
        <div>ملخص المدفوعات: {paymentLoading ? 'جاري التحميل...' : paymentError ? 'خطأ' : 'تم التحميل'}</div>
      </div>
    </div>
  );
}

// Card component for the stat cards
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  link?: string;
}

function StatCard({ title, value, icon, change, trend, link }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
          {icon}
        </div>
      </div>
      {link && (
        <div className="mt-4 text-right">
          <Link href={link} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            عرض التفاصيل
          </Link>
        </div>
      )}
    </div>
  );
}

// Booking approval card component
interface BookingApprovalCardProps {
  booking: {
    id: string;
    userName?: string;
    campaignId: string | null;
    numberOfPilgrims?: number;
    totalPrice: number;
    status: string;
  };
  campaignName: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function BookingApprovalCard({ booking, campaignName, onApprove, onReject }: BookingApprovalCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{booking.userName || 'مستخدم'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">حجز في {campaignName}</p>
          <div className="mt-2">
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded mr-2">
              {booking.numberOfPilgrims || 1} مسافر
            </span>
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded">
              {booking.totalPrice} ر.س
            </span>
          </div>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button 
            onClick={() => onReject(booking.id)}
            className="p-2 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
          >
            <AlertCircle className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onApprove(booking.id)}
            className="p-2 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800 mr-2"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Use 'Common' namespace or fallback to hardcoded strings
  const t = useTranslations('Common');
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  // Get office ID from auth state
  const { user } = useAppSelector(state => state.auth);
  const officeId = user?.officeId;

  // Fetch data using RTK Query
  const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useGetCampaignsQuery({ officeId: officeId || '' });
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useGetBookingsQuery({ 
    officeId: officeId || '',
    status: 'pending'
  });
  const { data: paymentSummary, isLoading: paymentLoading, error: paymentError } = useGetPaymentSummaryQuery(officeId);
  
  // Check if we're using mock data
  const usingMockData = !!(campaignsError || bookingsError || paymentError);
  
  // Add logging for debugging
  useEffect(() => {
    console.log('User:', user);
    console.log('Office ID:', officeId);
    console.log('Campaigns data:', campaignsData);
    console.log('Bookings data:', bookingsData);
    console.log('Payment summary:', paymentSummary);
  }, [user, officeId, campaignsData, bookingsData, paymentSummary]);
  
  // Mutations for approving/rejecting bookings
  const [approveBooking, { isLoading: isApproving }] = useApproveBookingMutation();
  const [rejectBooking, { isLoading: isRejecting }] = useRejectBookingMutation();
  
  // Handle approving a booking
  const handleApproveBooking = async (bookingId: string) => {
    try {
      await approveBooking(bookingId).unwrap();
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على الحجز بنجاح",
        variant: "default"
      });
    } catch (error) {
      console.error('Error approving booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة على الحجز",
        variant: "destructive"
      });
    }
  };
  
  // Handle rejecting a booking
  const handleRejectBooking = async (bookingId: string, reason: string) => {
    try {
      await rejectBooking({ id: bookingId, reason }).unwrap();
      toast({
        title: "تم الرفض",
        description: "تم رفض الحجز بنجاح",
        variant: "default"
      });
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض الحجز",
        variant: "destructive"
      });
    }
  };
  
  // Get campaign names map
  const campaignMap = campaignsData ? campaignsData.reduce((acc, campaign) => {
    acc[campaign.id] = campaign.name;
    return acc;
  }, {} as Record<string, string>) : {};
  
  // Count active campaigns
  const activeCampaigns = campaignsData ? campaignsData.filter(c => c.status === 'active').length : 0;
  
  // Compute stats from fetched data
  const stats = {
    totalBookings: bookingsData ? bookingsData.length : 0,
    pendingApprovals: bookingsData ? bookingsData.filter(b => b.status === 'pending').length : 0,
    activeCampaigns,
    totalRevenue: paymentSummary ? paymentSummary.totalRevenue : 0,
    // Mock data for monthly bookings and revenue breakdown until we have the actual API
    monthlyBookings: [
      { month: 'يناير', count: 32 },
      { month: 'فبراير', count: 48 },
      { month: 'مارس', count: 65 },
      { month: 'أبريل', count: 42 },
      { month: 'مايو', count: 35 },
      { month: 'يونيو', count: 28 }
    ],
    revenueBreakdown: [
      { category: 'حملات رمضان', amount: paymentSummary ? paymentSummary.totalRevenue * 0.5 : 0 },
      { category: 'حملات شعبان', amount: paymentSummary ? paymentSummary.totalRevenue * 0.25 : 0 },
      { category: 'حملات رجب', amount: paymentSummary ? paymentSummary.totalRevenue * 0.15 : 0 },
      { category: 'حملات اخرى', amount: paymentSummary ? paymentSummary.totalRevenue * 0.1 : 0 }
    ]
  };

  const pendingBookings = bookingsData ? bookingsData.filter(booking => booking.status === 'pending') : [];
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* API Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="font-bold text-yellow-800">حالة الاتصال بـ API</h3>
          <p className="text-yellow-700">
            {usingMockData 
              ? "❌ هذه الصفحة تستخدم بيانات افتراضية وليست متصلة بـ API حقيقي" 
              : "✅ هذه الصفحة متصلة بـ API حقيقي"}
          </p>
        </div>
      </div>
      
      {/* زر الملف الشخصي للمكتب */}
      <div className="flex justify-end mb-6">
        <Link href={`/${locale}/umrah-offices/dashboard/profile`}>
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition">
            <User className="h-5 w-5" />
            الملف الشخصي للمكتب
          </button>
        </Link>
      </div>
      {/* إضافة معلومات حالة API */}
      <ApiStatus />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-600 dark:text-gray-300">هنا يمكنك إدارة حملات العمرة والتحكم في الحجوزات والمدفوعات</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="إجمالي الحجوزات"
          value={stats.totalBookings}
          icon={<Users className="h-6 w-6" />}
          change="زيادة 12% عن الشهر الماضي"
          trend="up"
          link="/umrah-offices/dashboard/bookings"
        />
        <StatCard 
          title="حجوزات تنتظر الموافقة"
          value={stats.pendingApprovals}
          icon={<Clock className="h-6 w-6" />}
          link="/umrah-offices/dashboard/bookings?status=pending"
        />
        <StatCard 
          title="حملات نشطة"
          value={stats.activeCampaigns}
          icon={<Calendar className="h-6 w-6" />}
          link="/umrah-offices/dashboard/campaigns"
        />
        <StatCard 
          title="إجمالي الإيرادات"
          value={`${((stats.totalRevenue || 0) / 1000).toFixed(0)}K ر.س`}
          icon={<CreditCard className="h-6 w-6" />}
          change="زيادة 8% عن الشهر الماضي"
          trend="up"
          link="/umrah-offices/dashboard/payments"
        />
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">حجوزات بانتظار الموافقة</h2>
            <Link href="/umrah-offices/dashboard/bookings?status=pending" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              عرض الكل
            </Link>
          </div>
          
          {bookingsLoading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.slice(0, 5).map(booking => (
                <BookingApprovalCard 
                  key={booking.id}
                  booking={booking}
                  campaignName={booking.campaignId && campaignMap[booking.campaignId] ? campaignMap[booking.campaignId] : 'حملة غير معروفة'}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              لا يوجد حجوزات بانتظار الموافقة
            </div>
          )}
        </div>
        
        {/* Quick Stats */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">الحجوزات الشهرية</h2>
            
            <div className="flex flex-col space-y-4">
              {stats.monthlyBookings.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.month}</span>
                  <div className="w-full mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, (item.count / Math.max(...stats.monthlyBookings.map(b => b.count))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">توزيع الإيرادات</h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            
            {paymentLoading ? (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="sr-only">جاري التحميل...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.revenueBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{item.category}</span>
                      <span className="text-sm font-medium">
                        {(item.amount / 1000).toFixed(0)}K ر.س
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          index === 0 ? 'bg-blue-600' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 
                          'bg-purple-500'
                        }`}
                        style={{ 
                          width: `${(item.amount / (stats.totalRevenue || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 