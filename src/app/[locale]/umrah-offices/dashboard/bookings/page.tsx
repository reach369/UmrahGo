'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, ClockIcon, Filter, Search, ChevronLeft, ChevronRight,
  Download, Eye, MoreHorizontal, RefreshCcw, AlertTriangle, Plus, Heart
} from 'lucide-react';
import { useGetBookingsQuery, useConfirmBookingMutation, useCancelBookingMutation, useExportBookingsQuery, type Booking as ApiBooking } from '../../redux/api/bookingsApiSlice';
import { useGetCampaignsQuery } from '../../redux/api/campaignsApiSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setFilterStatus, setSearchQuery } from '../../redux/slices/bookingSlice';
import { mockBookingsData } from '../../utils/mockBookingsData';
import { mockCampaigns } from '../../utils/mockData';
import Link from 'next/link';
import DataTable from '../../components/DataTable';
import { ReactNode } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import BookingStatistics from './components/BookingStatistics';
import BookingCalendar from './components/BookingCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

// Define the Column interface
interface Column<T> {
  header: string;
  accessor: ((item: T) => ReactNode) | keyof T;
  className?: string;
}

// Add this utility function at the beginning of the file
function formatDate(dateString: string): string {
  // Use a fixed format that will be consistent between server and client
  // We'll use ISO format (YYYY-MM-DD) which is consistent
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    return dateString;
  }
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
    case 'cancelled':
      bg = 'bg-red-100';
      text = 'text-red-800';
      icon = <XCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          ملغي
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
    case 'pending':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          في الانتظار
        </span>
      );
    case 'refunded':
      bg = 'bg-gray-100';
      text = 'text-gray-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          مسترد
        </span>
      );
    default:
      return null;
  }
}

// Image Gallery Item
interface GalleryImage {
  id: number;
  image: string | null;
  is_featured: boolean;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Document Item
interface OfficeDocument {
  id: number;
  type: string;
  title: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

// Update the Booking interface to match the API response
interface Booking extends ApiBooking {
  campaignId?: string;
  userName?: string;
  numberOfPilgrims?: number;
  totalPrice: number;
}

// Update the Campaign interface
interface Campaign {
  id: number;
  office_id: number;
  package_id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  available_seats: number;
  status: string;
}

// Main bookings page component
export default function BookingsPage() {
  // Get URL params
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status') || 'all';
  
  // Redux state
  const dispatch = useAppDispatch();
  const { filterStatus, searchQuery } = useAppSelector(state => state.booking);
  
  // Local state for UI
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  
  // Gallery and Documents State
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [documents, setDocuments] = useState<OfficeDocument[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState<boolean>(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  
  // Get office ID (would usually come from auth state)
  const officeId = 1; // Changed from string to number
  
  // Get bookings data with filters
  const {
    data: bookingsFromApi,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings
  } = useGetBookingsQuery({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    search: searchQuery || undefined,
    page: currentPage,
    per_page: itemsPerPage,
  });
  
  // Determine if we should use local mock data
  const useMockData = !!bookingsError || !bookingsFromApi;
  
  // Get campaigns for displaying campaign names
  const {
    data: campaignsFromApi,
    isLoading: campaignsLoading
  } = useGetCampaignsQuery({ officeId });
  
  // Get campaign data from mock data if API fails
  const campaignsFromMock = mockCampaigns.filter(c => c.officeId === officeId);
  
  // Combine data sources
  const campaignsData = campaignsFromApi || campaignsFromMock;
  
  // Filter mock bookings data based on status
  const getFilteredMockBookings = () => {
    let result = [...mockBookingsData];
    
    if (filterStatus && filterStatus !== 'all') {
      result = result.filter(booking => booking.status === filterStatus);
    }
    
    // Filter by office (using campaigns associated with the office)
    if (officeId) {
      const campaignIds = mockCampaigns
        .filter(c => c.officeId === officeId)
        .map(c => c.id);
      
      result = result.filter(booking => 
        booking.campaignId && campaignIds.includes(booking.campaignId)
      );
    }
    
    return result;
  };
  
  // Use API data or mock data
  const bookingsData = bookingsFromApi || getFilteredMockBookings();
  
  // Mutations for confirmation/cancellation
  const [confirmBooking, { isLoading: isConfirming }] = useConfirmBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  
  // Update status filter when URL param changes
  useEffect(() => {
    if (statusParam) {
      dispatch(setFilterStatus(statusParam));
    } else if (!filterStatus) {
      dispatch(setFilterStatus('all'));
    }
  }, [statusParam, filterStatus, dispatch]);
  
  // Get campaign names map
  const campaignMap = campaignsData ? campaignsData.reduce((acc, campaign: Campaign) => {
    acc[campaign.id.toString()] = campaign.name || campaign.description || '';
    return acc;
  }, {} as Record<string, string>) : {};
  
  // Filter bookings based on search
  const filteredBookings = bookingsData?.data ? bookingsData.data.filter((booking: Booking) => {
    const userName = booking.userName || '';
    const campaignName = booking.campaignId ? campaignMap[booking.campaignId] || '' : '';
    
    const matchesSearch = searchQuery === '' ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaignName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) : [];
  
  // Table columns configuration
  const columns: Column<Booking>[] = [
    {
      header: 'رقم الحجز',
      accessor: 'id',
    },
    {
      header: 'اسم العميل',
      accessor: (booking) => booking.user.name,
    },
    {
      header: 'الباقة',
      accessor: (booking) => booking.package.name,
    },
    {
      header: 'تاريخ الحجز',
      accessor: (booking) => formatDate(booking.created_at),
    },
    {
      header: 'السعر',
      accessor: (booking) => `${booking.package.price} ريال`,
    },
    {
      header: 'الحالة',
      accessor: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      header: 'حالة الدفع',
      accessor: (booking) => <PaymentBadge status={booking.payment_status} />,
    },
    {
      header: 'الإجراءات',
      accessor: (booking) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/ar/umrah-offices/dashboard/bookings/${booking.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                عرض التفاصيل
              </Link>
            </DropdownMenuItem>
            {booking.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  تأكيد الحجز
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCancelBooking(booking.id)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  إلغاء الحجز
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  
  // Handle confirm booking
  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId).unwrap();
      toast({
        title: "تم التأكيد",
        description: "تم تأكيد الحجز بنجاح",
        variant: "default"
      });
      refetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تأكيد الحجز",
        variant: "destructive"
      });
    }
  };
  
  // Handle cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId).unwrap();
      toast({
        title: "تم الإلغاء",
        description: "تم إلغاء الحجز بنجاح",
        variant: "default"
      });
      refetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إلغاء الحجز",
        variant: "destructive"
      });
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = (bookingId: string) => {
    setIsDropdownOpen(isDropdownOpen === bookingId ? null : bookingId);
  };
  
  // Fetch gallery images
  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    setGalleryError(null);
    
    try {
      const response = await axiosInstance.get('/office/gallery');
      
      if (response.status && response.data) {
        setGalleryImages(response.data);
        console.log('تم جلب معرض الصور بنجاح:', response.data);
      } else {
        setGalleryError('لم يتم العثور على صور في معرض المكتب');
      }
    } catch (err: any) {
      console.error('خطأ في جلب معرض الصور:', err);
      
      if (err.response?.data?.message) {
        setGalleryError(err.response.data.message);
      } else {
        setGalleryError('حدث خطأ أثناء جلب معرض الصور. يرجى المحاولة مرة أخرى');
      }
      
      console.error(`فشل في جلب معرض الصور: ${err.response?.data?.message || err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError(null);
    
    try {
      const response = await axiosInstance.get('/office/documents');
      
      if (response.status && response.data) {
        setDocuments(response.data);
        console.log('تم جلب مستندات المكتب بنجاح:', response.data);
      } else {
        setDocumentsError('لم يتم العثور على مستندات');
      }
    } catch (err: any) {
      console.error('خطأ في جلب مستندات المكتب:', err);
      
      if (err.response?.data?.message) {
        setDocumentsError(err.response.data.message);
      } else {
        setDocumentsError('حدث خطأ أثناء جلب المستندات. يرجى المحاولة مرة أخرى');
      }
      
      console.error(`فشل في جلب المستندات: ${err.response?.data?.message || err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Set featured image
  const handleSetFeatured = async (imageId: number) => {
    try {
      setIsLoadingGallery(true);
      
      const response = await axiosInstance.put(`/office/gallery/${imageId}/featured`);
      
      if (response.status && response.data) {
        console.log('تم تعيين الصورة كمميزة بنجاح:', response.data);
        toast({
          title: "تم التعيين",
          description: "تم تعيين الصورة كصورة مميزة بنجاح",
          variant: "default"
        });
        // تحديث معرض الصور لعرض التغييرات
        fetchGallery();
      } else {
        throw new Error('فشل في تعيين الصورة كمميزة');
      }
    } catch (err: any) {
      console.error('خطأ في تعيين الصورة كمميزة:', err);
      
      const errorMsg = err.response?.data?.message || err.message || 'خطأ غير معروف';
      console.error(`فشل في تعيين الصورة كمميزة: ${errorMsg}`);
      
      toast({
        title: "خطأ",
        description: `فشل في تعيين الصورة كمميزة: ${errorMsg}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingGallery(false);
    }
  };
  
  // Paginate bookings
  const getPaginatedBookings = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredBookings.length);
    return filteredBookings.slice(startIndex, endIndex);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Add export query
  const { data: exportData, refetch: exportBookings } = useExportBookingsQuery({
    format: 'excel',
    from_date: format(new Date().setMonth(new Date().getMonth() - 1), 'yyyy-MM-dd'),
    to_date: format(new Date(), 'yyyy-MM-dd'),
  }, {
    skip: true // Skip the initial query
  });

  // Handle export
  const handleExport = async () => {
    try {
      const result = await exportBookings();
      if ('data' in result && result.data instanceof Blob) {
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting bookings:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تصدير الحجوزات",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">الحجوزات</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchBookings()}
            disabled={bookingsLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={bookingsLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      <BookingStatistics />

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">قائمة الحجوزات</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="space-y-4">
            {/* Existing filters and search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => dispatch(setFilterStatus('all'))}
                >
                  الكل
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => dispatch(setFilterStatus('pending'))}
                >
                  معلق
                </Button>
                <Button
                  variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                  onClick={() => dispatch(setFilterStatus('confirmed'))}
                >
                  مؤكد
                </Button>
                <Button
                  variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => dispatch(setFilterStatus('cancelled'))}
                >
                  ملغي
                </Button>
              </div>
            </div>

            {/* Existing table */}
            <DataTable<Booking>
              columns={columns}
              data={getPaginatedBookings()}
              isLoading={bookingsLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
            />

            {/* Existing pagination */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                عرض {getPaginatedBookings().length} من {filteredBookings.length} حجز
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * itemsPerPage >= filteredBookings.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <BookingCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
} 