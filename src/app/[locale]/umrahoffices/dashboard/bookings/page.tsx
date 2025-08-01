'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Calendar, Search, FileText, Eye, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { 
  useGetPackageBookingsQuery, 
  useGetPackageBookingsStatisticsQuery,
  useUpdatePackageBookingStatusMutation,
  BookingsQueryParams
} from '../../redux/api/bookingsApiSlice';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function BookingsPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const router = useRouter();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{from_date?: string, to_date?: string}>({});
  const [queryParams, setQueryParams] = useState<BookingsQueryParams>({
    per_page: 15,
    page: 1
  });
  
  // Dialog state for status update
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  
  // Get bookings
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings
  } = useGetPackageBookingsQuery(queryParams);

  // Get booking statistics
  const {
    data: bookingStats,
    isLoading: isLoadingStats
  } = useGetPackageBookingsStatisticsQuery(queryParams);
  
  // Mutations
  const [updateBookingStatus, { isLoading: isUpdatingStatus }] = useUpdatePackageBookingStatusMutation();
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQueryParams(prev => ({
      ...prev,
      search: searchQuery,
      page: 1 // Reset to first page on new search
    }));
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setQueryParams(prev => ({
      ...prev,
      status: statusFilter,
      payment_status: paymentStatusFilter,
      from_date: dateRange.from_date,
      to_date: dateRange.to_date,
      page: 1 // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page
    }));
  };
  
  // Open status update dialog
  const openStatusDialog = (booking: any, initialStatus: string) => {
    setSelectedBooking(booking);
    setNewStatus(initialStatus);
    setStatusNotes('');
    setStatusDialogOpen(true);
  };
  
  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;
    
    try {
      await updateBookingStatus({
        id: selectedBooking.id,
        data: {
          status: newStatus as any,
          notes: statusNotes
        }
      }).unwrap();
      
      toast.success('تم تحديث حالة الحجز بنجاح');
      setStatusDialogOpen(false);
      refetchBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast.error('حدث خطأ أثناء تحديث حالة الحجز');
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">مؤكد</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">ملغي</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">مكتمل</Badge>;
      case 'rejected':
        return <Badge className="bg-orange-500">مرفوض</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
    }
  };
  
  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">مدفوع</Badge>;
      case 'partially_paid':
        return <Badge className="bg-blue-500">مدفوع جزئيا</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-500">مسترد</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">فشل الدفع</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
    }
  };
  
  // Filter bookings
  const filteredBookings = bookingsData?.data?.data?.filter(booking => {
    // Filter by status if selected
    if (statusFilter && booking.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query (reference number or user name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.reference_number.toLowerCase().includes(query) ||
        booking.user.name.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) || [];
  
  // Loading state
  if (isLoadingBookings) {
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
  if (bookingsError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات الحجوزات. يرجى المحاولة مرة أخرى لاحقا.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchBookings()}>إعادة المحاولة</Button>
      </div>
    );
  }
  
  // No bookings state
  const hasNoBookings = !bookingsData?.data?.data || bookingsData.data.data.length === 0;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">الحجوزات</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة حجوزات العملاء
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">حالة الحجز</Label>
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
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <form onSubmit={handleSearch}>
                <Label htmlFor="search">بحث</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="ابحث برقم الحجز أو اسم العميل..."
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
      
      {/* Bookings List */}
      {hasNoBookings ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد حجوزات</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            لم يتم العثور على أي حجوزات تطابق المعايير المحددة.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-right">رقم الحجز</th>
                <th className="py-3 px-4 text-right">اسم العميل</th>
                <th className="py-3 px-4 text-right">الباقة</th>
                <th className="py-3 px-4 text-right">المبلغ</th>
                <th className="py-3 px-4 text-right">المدفوع</th>
                <th className="py-3 px-4 text-right">حالة الحجز</th>
                <th className="py-3 px-4 text-right">حالة الدفع</th>
                <th className="py-3 px-4 text-right">تاريخ الحجز</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <Link 
                      href={`/${locale}/umrahoffices/dashboard/bookings/${booking.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.reference_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{booking.user.name}</td>
                  <td className="py-3 px-4">{booking.package.name}</td>
                  <td className="py-3 px-4">{formatPrice(booking.total_amount)}</td>
                  <td className="py-3 px-4">{formatPrice(booking.paid_amount)}</td>
                  <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                  <td className="py-3 px-4">{getPaymentStatusBadge(booking.payment_status)}</td>
                  <td className="py-3 px-4">
                    {new Date(booking.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/umrahoffices/dashboard/bookings/${booking.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openStatusDialog(booking, 'confirmed')}
                            disabled={booking.status === 'confirmed'}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            تأكيد الحجز
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openStatusDialog(booking, 'completed')}
                            disabled={booking.status === 'completed'}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                            إكمال الحجز
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openStatusDialog(booking, 'cancelled')}
                            disabled={booking.status === 'cancelled'}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            إلغاء الحجز
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openStatusDialog(booking, 'rejected')}
                            disabled={booking.status === 'rejected'}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-orange-500" />
                            رفض الحجز
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${locale}/umrahoffices/dashboard/bookings/${booking.id}/invoice`, '_blank')}
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
      {bookingsData && bookingsData.data && bookingsData.data.pagination && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Pagination would be implemented here
                // For now, we're just showing the UI
              }}
              disabled={bookingsData.data.pagination.current_page === 1}
            >
              السابق
            </Button>
            
            <span className="mx-2 flex items-center">
              صفحة {bookingsData.data.pagination.current_page} من {bookingsData.data.pagination.last_page}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Pagination would be implemented here
                // For now, we're just showing the UI
              }}
              disabled={bookingsData.data.pagination.current_page === bookingsData.data.pagination.last_page}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث حالة الحجز</DialogTitle>
            <DialogDescription>
              قم بتحديث حالة الحجز وإضافة ملاحظات إذا لزم الأمر.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="booking-ref">رقم الحجز</Label>
                <Input
                  id="booking-ref"
                  value={selectedBooking.reference_number}
                  readOnly
                />
              </div>
              
              <div>
                <Label htmlFor="new-status">الحالة الجديدة</Label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة الجديدة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status-notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="status-notes"
                  placeholder="أضف ملاحظات حول سبب تغيير الحالة..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus || !newStatus}>
              {isUpdatingStatus ? 'جاري التحديث...' : 'تحديث الحالة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 