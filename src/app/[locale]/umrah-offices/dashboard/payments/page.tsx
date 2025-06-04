'use client';

import { useState } from 'react';
import { 
  CreditCard, Download, Search, Filter, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, Clock, RefreshCcw, AlertTriangle
} from 'lucide-react';
import { useGetPaymentsQuery, useProcessRefundMutation, useGetPaymentSummaryQuery } from '../../redux/api/paymentsApiSlice';
import { useGetBookingsQuery } from '../../redux/api/bookingsApiSlice';
import { useGetCampaignsQuery } from '../../redux/api/campaignsApiSlice';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setFilterStatus, setSearchQuery } from '../../redux/slices/paymentSlice';
import Link from 'next/link';

// Payment status badge component
function PaymentStatusBadge({ status }: { status: string }) {
  let bg = '';
  let text = '';
  let icon = null;
  
  switch (status) {
    case 'completed':
      bg = 'bg-green-100';
      text = 'text-green-800';
      icon = <CheckCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          مكتمل
        </span>
      );
    case 'pending':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      icon = <Clock className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          معلق
        </span>
      );
    case 'failed':
      bg = 'bg-red-100';
      text = 'text-red-800';
      icon = <XCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          فشل
        </span>
      );
    case 'refunded':
      bg = 'bg-gray-100';
      text = 'text-gray-800';
      icon = <RefreshCcw className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          مسترد
        </span>
      );
    default:
      return null;
  }
}

export default function PaymentsPage() {
  // Get office ID from auth state
  const { user } = useAppSelector(state => state.auth);
  const officeId = user?.officeId;

  // Redux state for filtering
  const dispatch = useAppDispatch();
  const { filterStatus, searchQuery } = useAppSelector((state) => state.payment as {
    filterStatus: string | null;
    searchQuery: string;
  });
  
  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Fetch payments using RTK Query
  const { data: paymentsData, isLoading: paymentsLoading, refetch: refetchPayments, error: paymentsError } = useGetPaymentsQuery(
    { /* تم إزالة المعلمات للحصول على جميع البيانات */ }
  );
  
  // تحديد إذا كانت الصفحة تستخدم بيانات افتراضية
  const useMockData = !!paymentsError;
  
  // Get payment summary
  const { data: paymentSummary, isLoading: summaryLoading } = useGetPaymentSummaryQuery(officeId);
  
  // Fetch bookings and campaigns for reference
  const { data: bookingsData } = useGetBookingsQuery({ officeId: officeId || '' });
  const { data: campaignsData } = useGetCampaignsQuery({ officeId: officeId || '' });
  
  // Mutation for processing refunds
  const [processRefund] = useProcessRefundMutation();
  
  // Get booking and campaign info
  const bookingMap = bookingsData ? bookingsData.reduce((acc, booking) => {
    acc[booking.id] = booking;
    return acc;
  }, {} as Record<string, any>) : {};
  
  const campaignMap = campaignsData ? campaignsData.reduce((acc, campaign) => {
    acc[campaign.id] = campaign;
    return acc;
  }, {} as Record<string, any>) : {};
  
  // Filter payments based on search
  const filteredPayments = paymentsData ? paymentsData.filter(payment => {
    const booking = bookingMap[payment.bookingId];
    const campaignId = booking?.campaignId;
    const campaign = campaignId ? campaignMap[campaignId] : null;
    
    const matchesSearch = searchQuery === '' ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking?.userName && booking.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (campaign?.name && campaign.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  }) : [];
  
  // Calculate totals from summary or calculate if not available
  const totalRevenue = paymentSummary?.totalRevenue || 
    (filteredPayments ? filteredPayments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0) : 0);
  
  const totalSystemFees = paymentSummary?.totalSystemFees || 
    (filteredPayments ? filteredPayments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.systemFee, 0) : 0);
  
  const totalNetAmount = paymentSummary?.totalNetAmount || 
    (filteredPayments ? filteredPayments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.netAmount, 0) : 0);
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  
  return (
    <div className="container mx-auto px-4">
      {/* API Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="font-bold text-yellow-800">حالة الاتصال بـ API</h3>
          <p className="text-yellow-700">
            {useMockData 
              ? "❌ هذه الصفحة تستخدم بيانات افتراضية وليست متصلة بـ API حقيقي" 
              : "✅ هذه الصفحة متصلة بـ API حقيقي"}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">إدارة المدفوعات</h1>
        <p className="text-gray-600 dark:text-gray-300">متابعة جميع المدفوعات والإيرادات المستحقة</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="mr-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold">{totalRevenue.toLocaleString('ar-SA')} ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="mr-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">عمولة النظام</p>
              <p className="text-2xl font-bold">{totalSystemFees.toLocaleString('ar-SA')} ر.س</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="mr-4 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-300">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">صافي المستحق</p>
              <p className="text-2xl font-bold">{totalNetAmount.toLocaleString('ar-SA')} ر.س</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="بحث في المدفوعات..."
                className="block w-full pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
            </div>
            
            <div className="relative">
              <select
                value={filterStatus || 'all'}
                onChange={(e) => dispatch(setFilterStatus(e.target.value))}
                className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
              >
                <option value="all">جميع المدفوعات</option>
                <option value="completed">مكتملة</option>
                <option value="pending">معلقة</option>
                <option value="failed">فاشلة</option>
                <option value="refunded">مستردة</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <button
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              onClick={() => {
                // In a real app, this would export payments to a CSV file
                alert('تم تصدير البيانات بنجاح');
              }}
            >
              <Download className="ml-2 h-5 w-5" />
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>
      
      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  رقم العملية
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الحجز
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  التاريخ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المبلغ
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  العمولة
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الصافي
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paymentsLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="sr-only">جاري التحميل...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((payment) => {
                  const booking = bookingMap[payment.bookingId];
                  const campaignId = booking?.campaignId;
                  const campaign = campaignId ? campaignMap[campaignId] : null;
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div>
                          <div>{payment.referenceNumber}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{payment.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking ? (
                          <div>
                            <div className="font-medium">{booking.userName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {campaign ? campaign.name : 'غير معروفة'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(payment.date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.amount.toLocaleString('ar-SA')} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                        {payment.systemFee.toLocaleString('ar-SA')} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        {payment.netAmount.toLocaleString('ar-SA')} {payment.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.method === 'credit_card' && 'بطاقة ائتمان'}
                        {payment.method === 'bank_transfer' && 'تحويل بنكي'}
                        {payment.method === 'cash' && 'نقدي'}
                        {payment.method === 'paypal' && 'باي بال'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <PaymentStatusBadge status={payment.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد مدفوعات متطابقة مع معايير البحث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  عرض <span className="font-medium">{indexOfFirstItem + 1}</span> إلى{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredPayments.length)}
                  </span>{' '}
                  من <span className="font-medium">{filteredPayments.length}</span> عملية
                </p>
              </div>
              <div>
                <nav className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span className="sr-only">السابق</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers - simplified for brevity */}
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentPage} من {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span className="sr-only">التالي</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Commission Information */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">معلومات العمولة</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          يتم احتساب عمولة النظام بنسبة 5% من إجمالي المدفوعات. يتم تحويل المبالغ المستحقة إلى حسابك البنكي خلال 3 أيام عمل من تاريخ اكتمال الدفع.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="ml-4 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">التفاصيل البنكية</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                الرجاء التأكد من صحة التفاصيل البنكية في 
                <Link href="/umrah-offices/dashboard/settings" className="text-blue-600 dark:text-blue-400 hover:underline mr-1">
                  إعدادات الحساب
                </Link>
                لضمان استلام المدفوعات بدون تأخير.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 