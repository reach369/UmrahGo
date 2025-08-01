'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CreditCard, Search, FileText, Eye, Calendar, DollarSign } from 'lucide-react';
  import { PaymentQueryParams, useGetPaymentsQuery } from '../../redux/api/paymentsApiSlice';
import { formatPrice } from '@/utils/formatPrice';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PaymentsPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const router = useRouter();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Get payments
  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    error: paymentsError,
    refetch: refetchPayments
  } = useGetPaymentsQuery({} as PaymentQueryParams, {
    skip: !locale,
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    // For now, we're just using client-side filtering
  };
  
  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-500">مسترد</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">فشل</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
    }
  };
  
  // Get payment method badge
  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <Badge className="bg-blue-500">بطاقة ائتمان</Badge>;
      case 'bank_transfer':
        return <Badge className="bg-green-500">تحويل بنكي</Badge>;
      case 'cash':
        return <Badge className="bg-yellow-500">نقدي</Badge>;
      default:
        return <Badge className="bg-gray-500">{method}</Badge>;
    }
  };
  
  // Filter payments
  const filteredPayments = paymentsData?.data?.data?.filter(payment => {
    // Filter by status if selected
    if (statusFilter && payment.payment_status !== statusFilter) {
      return false;
    }
    
    // Filter by search query (transaction ID or booking reference)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.transaction_id?.toLowerCase().includes(query) ||
        payment.booking?.booking_number?.toLowerCase().includes(query) ||
        false
      );
    }
    return true;
  }) || [];
  
  // Loading state
  if (isLoadingPayments) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }
  
  // Error state
  if (paymentsError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات المدفوعات. يرجى المحاولة مرة أخرى لاحقا.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchPayments()}>إعادة المحاولة</Button>
      </div>
    );
  }
  
  // No payments state
  const hasNoPayments = !paymentsData?.data?.data || paymentsData.data.data.length === 0;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">المدفوعات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة ومتابعة مدفوعات الحجوزات
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">حالة الدفع</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                  <SelectItem value="refunded">مسترد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <form onSubmit={handleSearch}>
                <Label htmlFor="search">بحث</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="ابحث برقم المعاملة أو رقم الحجز..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payments List */}
      {hasNoPayments ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد مدفوعات</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            لم يتم العثور على أي مدفوعات تطابق المعايير المحددة.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-right">رقم المعاملة</th>
                <th className="py-3 px-4 text-right">رقم الحجز</th>
                <th className="py-3 px-4 text-right">اسم العميل</th>
                <th className="py-3 px-4 text-right">الباقة</th>
                <th className="py-3 px-4 text-right">المبلغ</th>
                <th className="py-3 px-4 text-right">طريقة الدفع</th>
                <th className="py-3 px-4 text-right">حالة الدفع</th>
                <th className="py-3 px-4 text-right">تاريخ الدفع</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    {payment.transaction_id}
                  </td>
                  <td className="py-3 px-4">
                    <Link 
                      href={`/${locale}/umrahoffices/dashboard/bookings/${payment.booking?.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {payment.booking?.booking_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{payment.booking?.user?.name}</td>
                  <td className="py-3 px-4">{payment.booking?.package?.name}</td>
                  <td className="py-3 px-4">{formatPrice(payment.amount)}</td>
                  <td className="py-3 px-4">{getPaymentMethodBadge(payment.payment_method)}</td>
                  <td className="py-3 px-4">{getPaymentStatusBadge(payment.payment_status)}</td>
                  <td className="py-3 px-4">
                    {new Date(payment.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/umrahoffices/dashboard/bookings/${payment.booking?.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${locale}/umrahoffices/dashboard/bookings/${payment.booking?.id}/invoice`, '_blank')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {paymentsData && paymentsData.data && paymentsData.data.current_page && paymentsData.data.last_page && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Pagination would be implemented here
                // For now, we're just showing the UI
              }}
              disabled={paymentsData.data.current_page === 1}
            >
              السابق
            </Button>
            
            <span className="mx-2 flex items-center">
              صفحة {paymentsData.data.current_page} من {paymentsData.data.last_page}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Pagination would be implemented here
                // For now, we're just showing the UI
              }}
                  disabled={paymentsData.data.current_page === paymentsData.data.last_page}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 