'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, Clipboard, Map, CreditCard, 
  User, Phone, Mail, CalendarDays, UsersRound, 
  ArrowLeft, Download, Printer, Bus, FileText, AlertTriangle
} from 'lucide-react';
import { 
  useGetBookingByIdQuery, 
  useGetPackageBookingByIdQuery, 
  useConfirmBookingMutation, 
  useCancelBookingMutation 
} from '../../../redux/api/bookingsApiSlice';
import { useGetCampaignByIdQuery } from '../../../redux/api/campaignsApiSlice';
import { useGetPaymentsQuery } from '../../../redux/api/paymentsApiSlice';
import { mockBookingsData } from '../../../utils/mockBookingsData';
import { mockCampaigns, mockPayments } from '../../../utils/mockData';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Booking } from '../../../utils/dashboardMockData';

// Get translations
// Add this utility function at the beginning of the file
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'غير محدد';
  
  // Use a fixed format that will be consistent between server and client
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    return dateString;
  }
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('Umrahoffices.bookings');
  
  let bg = '';
  let text = '';
  let icon: React.ReactNode | null | undefined   = null;
  
  switch (status) {
    case 'confirmed':
      bg = 'bg-green-100';
      text = 'text-green-800';
      icon = <CheckCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          {t('confirmed')}
        </span>
      );
    case 'pending':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      icon = <Clock className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          {t('pending')}
        </span>
      );
    case 'cancelled':
      bg = 'bg-red-100';
      text = 'text-red-800';
      icon = <XCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          {t('cancelled')}
        </span>
      );
    case 'completed':
      bg = 'bg-blue-100';
      text = 'text-blue-800';
      icon = <CheckCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          {t('completed')}
        </span>
      );
    case 'rejected':
      bg = 'bg-orange-100';
      text = 'text-orange-800';
      icon = <XCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          {t('rejected')}
        </span>
      );
    default:
      return null;
  }
}

// Payment status badge component
function PaymentBadge({ status }: { status: string }) {
  const t = useTranslations('Umrahoffices.bookings');
 
  
  let bg = '';
  let text = '';
  
  switch (status) {
    case 'paid':
      bg = 'bg-green-100';
      text = 'text-green-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {t('paid')}
        </span>
      );
    case 'pending':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {t('pending')}
        </span>
      );
    case 'refunded':
      bg = 'bg-gray-100';
      text = 'text-gray-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {t('refunded')}
        </span>
      );
    case 'failed':
      bg = 'bg-red-100';
      text = 'text-red-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {t('failed')}
        </span>
      );
    case 'partially_paid':
      bg = 'bg-blue-100';
      text = 'text-blue-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {t('partially_paid')}
        </span>
      );
    default:
      return null;
  }
}

// Add these interfaces after existing ones
interface GalleryImage {
  id: number;
  image: string | null;
  is_featured: boolean;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface OfficeDocument {
  id: number;
  type: string;
  title: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

// Add this to the Booking interface in the file

// Main component
export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const locale = params?.locale || 'ar';
  const t = useTranslations();
 
  // Fetch booking details using both endpoints for compatibility
  const { 
    data: standardBookingData, 
    isLoading: standardBookingLoading,
    error: standardBookingError
  } = useGetBookingByIdQuery(bookingId, {
    skip: false // Try both APIs for better compatibility
  });
  
  const {
    data: packageBookingData,
    isLoading: packageBookingLoading,
    error: packageBookingError
  } = useGetPackageBookingByIdQuery(bookingId, {
    skip: false // Try both APIs for better compatibility
  });
  
  // Use whichever API returns data first or fallback to mock
  const apiBookingData = standardBookingData || packageBookingData;
  const isLoadingBooking = standardBookingLoading && packageBookingLoading;
  const hasBookingApiError = !!standardBookingError && !!packageBookingError;
  
  // Determine if we should use local mock data
  const useMockData = hasBookingApiError || !apiBookingData;
  
  // Get booking data from mock data if API fails
  const bookingFromMock = useMockData ? mockBookingsData.find(b => b.id === Number(bookingId)) : null;
  
  // Combine data sources (prefer API, fallback to local mock)
  const booking = (apiBookingData || bookingFromMock) as {
    id: number;
    booking_number?: string;
    package_id?: number;
    status: string;
    payment_status: string;
    total_amount: number;
    booking_date?: string;
    created_at: string;
    commission?: number;
    bus?: { bus_number: string };
    passengers?: any[];
    notes?: string;
    user?: { name: string; email?: string; phone?: string };
    accommodation_details?: any;
    accommodation_type?: string;
    accommodation_price?: string | number;
    destination?: string;
  };
  
  // Fetch campaign details if available
  const {
    data: campaignFromApi,
    isLoading: campaignLoading
  } = useGetCampaignByIdQuery(
    booking?.package_id as unknown as string,
    { skip: !booking?.package_id }
  );
  
  // Get campaign data from mock data if API fails
    const campaignFromMock = booking?.package_id ? mockCampaigns.find(c => c.id === booking.package_id) : null;
  
  // Combine data sources for campaign
  const campaign = (campaignFromApi || campaignFromMock) as {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    description?: string;
    status?: string;
  } | undefined;
  
  // Fetch payments for this booking
  const {
    data: paymentsFromApi,
    isLoading: paymentsLoading
  } = useGetPaymentsQuery(
    { bookingId: Number(bookingId) } as unknown as void ,
    { skip: !bookingId }
  );
  
  // Get payments data from mock data if API fails
  const paymentsFromMock = mockPayments.filter(p => p.bookingId === bookingId);
  
  // Combine data sources for payments
  const payments = paymentsFromApi || paymentsFromMock;
  // Mutations for confirming/cancelling bookings
  const [confirmBooking, { isLoading: isConfirming }] = useConfirmBookingMutation();
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation();
  
  // Inside the main component, add this state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState<boolean>(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<OfficeDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  
  // Add useEffect to fetch gallery and documents on component mount
  useEffect(() => {
    // Only fetch when not using mock data
    if (!useMockData) {
      fetchGallery();
      fetchDocuments();
    }
  }, [useMockData]);
  
  // Handle confirm booking
  const handleConfirmBooking = async () => {
    try {
      if (useMockData) {
        alert('تم تأكيد الحجز بنجاح (وضع المحاكاة)');
        router.push('/ar/umrah-offices/dashboard/bookings');
        return;
      }
      
      await confirmBooking(bookingId).unwrap();
      // refetchBooking(); // This line was removed as per the new_code
    } catch (error) {
      console.error('فشل في تأكيد الحجز:', error);
      alert('حدث خطأ أثناء محاولة تأكيد الحجز');
    }
  };
  
  // Handle cancel booking
  const handleCancelBooking = async () => {
    try {
      if (useMockData) {
        alert('تم إلغاء الحجز بنجاح (وضع المحاكاة)');
        router.push('/ar/umrah-offices/dashboard/bookings');
        return;
      }
      
      await cancelBooking({ id: bookingId }).unwrap();
      // refetchBooking(); // This line was removed as per the new_code
    } catch (error) {
      console.error('فشل في إلغاء الحجز:', error);
      alert('حدث خطأ أثناء محاولة إلغاء الحجز');
    }
  };
  
  // Print booking details
  const handlePrintBooking = () => {
    window.print();
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

  // Show loading state
  if (isLoadingBooking && !bookingFromMock) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // Show error state if no booking data available at all
  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">{t('loadingError')}</h2>
          <p className="text-red-700 dark:text-red-300">{t('notFound')}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline-block ml-1 h-4 w-4" />
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }
  
  // From here, booking data is available (either from API or mock)
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* API Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="font-bold text-yellow-800">{t('apiStatus')}</h3>
          <p className="text-yellow-700">
            {useMockData 
              ? t('apiDisconnected')
              : t('apiConnected')}
          </p>
        </div>
      </div>
      
      {useMockData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>{t('Common.note')}:</strong> {t('mockDataNote')}
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link 
              href={`/${locale}/umrahoffices/dashboard/bookings`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2"
            >
              <ArrowLeft className="inline-block h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{t('title')} #{booking.id}</h1>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.payment_status} />
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={handleConfirmBooking}
                disabled={isConfirming}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="ml-1 h-5 w-5" />
                {t('confirmBooking')}
              </button>
              
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="ml-1 h-5 w-5" />
                {t('cancelBooking')}
              </button>
            </>
          )}
          
          <button
            onClick={handlePrintBooking}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
          >
            <Printer className="ml-1 h-5 w-5" />
            {t('print')}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking and pilgrim details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Booking overview card */}
          <div className=" dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('bookingInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CalendarDays className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookingDate')}</p>
                  <p className="font-medium">{formatDate(booking.booking_date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('registrationDate')}</p>
                  <p className="font-medium">{formatDate(booking.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CreditCard className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalAmount')}</p>
                  <p className="font-medium">{booking.total_amount.toLocaleString('ar-SA')} {t('currency')}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CreditCard className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('commission')}</p>
                  <p className="font-medium">{booking.commission?.toLocaleString('ar-SA')} {t('currency')}</p>
                </div>
              </div>
              
                {booking.bus && (
                <div className="flex items-start">
                  <Bus className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('busNumber')}</p>
                      <p className="font-medium">{booking.bus?.bus_number}</p>
                  </div>
                </div>
              )}
              
              {booking.passengers && booking.passengers.length && (
                <div className="flex items-start">
                  <UsersRound className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('pilgrimsCount')}</p>
                    <p className="font-medium">{booking.passengers.length}</p>
                  </div>
                </div>
              )}
              
              {booking.destination && (
                <div className="flex items-start">
                  <Map className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('destination')}</p>
                    <p className="font-medium">{booking.destination}</p>
                  </div>
                </div>
              )}
              
              {booking.accommodation_type && (
                <div className="flex items-start">
                  <User className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('accommodationType')}</p>
                    <p className="font-medium">
                      {booking.accommodation_details?.name || booking.accommodation_type}
                      {booking.accommodation_details?.type && ` (${booking.accommodation_details.type})`}
                    </p>
                  </div>
                </div>
              )}
              
              {booking.accommodation_price && (
                <div className="flex items-start">
                  <CreditCard className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('accommodationPrice')}</p>
                    <p className="font-medium">
                      {(typeof booking.accommodation_price === 'string' 
                        ? parseFloat(booking.accommodation_price) 
                        : booking.accommodation_price).toLocaleString('ar-SA')} {t('currency')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-2 flex items-center">
                  <Clipboard className="text-gray-400 h-5 w-5 ml-2" />
                  {t('notes')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}
          </div>
          
          {/* Pilgrim details */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div className=" dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('pilgrimDetails')}</h2>
              <div className="space-y-4">
                {booking.passengers.map((passenger, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{passenger.name}</h3>
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {t('passport')}: {passenger.passport_number}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('nationality')}</p>
                        <p>{passenger.nationality}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('birthDate')}</p>
                        <p>{formatDate(passenger.date_of_birth)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('passportExpiry')}</p>
                        <p>{formatDate(passenger.passport_expiry_date)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
         

        
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* User/Booker info */}
          <div className=" dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('userInfo')}</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('userName')}</p>
                  <p className="font-medium">{booking.user?.name || 'غير محدد'}</p>
                </div>
              </div>
              
              {booking.user?.email && (
                <div className="flex items-start">
                  <Mail className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('userEmail')}</p>
                    <p className="font-medium">{booking.user.email}</p>
                  </div>
                </div>
              )}
              
              {booking.user?.phone && (
                <div className="flex items-start">
                  <Phone className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('userPhone')}</p>
                    <p className="font-medium" dir="ltr">{booking.user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Campaign info if available */}
          {booking.package_id && (
            <div className=" dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t('campaignInfo')}</h2>
              {campaignLoading ? (
                <p className="text-center py-4 text-gray-500">{t('loadingCampaign')}</p>
              ) : campaign ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('campaignName')}</p>
                    <p className="font-medium">{campaign.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('startDate')}</p>
                      <p className="font-medium">{formatDate(campaign.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('endDate')}</p>
                      <p className="font-medium">{formatDate(campaign.end_date)}</p>
                    </div>
                  </div>
                  <div>
                    <Link 
                      href={`/${locale}/umrahoffices/dashboard/campaigns/${campaign.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
                    >
                      {t('viewCampaign')}
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">{t('noCampaign')}</p>
              )}
            </div>
          )}
          
          {/* Payment info */}
          <div className=" dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('payments')}</h2>
            {paymentsLoading ? (
              <p className="text-center py-4 text-gray-500">{t('loadingPayments')}</p>
            ) : payments ? (
              <div className="space-y-4">
                {(Array.isArray(payments) ? payments : []).map((payment: any) => (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{payment.amount.toLocaleString('ar-SA')} {t('currency')}</span>
                      <PaymentBadge status={payment.status || payment.payment_status} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>{t('paymentMethod')}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {payment.method === 'credit_card' ? t('credit_card') : 
                           payment.method === 'bank_transfer' ? t('bank_transfer') : 
                           payment.method === 'cash' ? t('cash') : payment.method || payment.payment_method}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>{t('paymentDate')}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(payment.date || payment.payment_date || payment.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">{t('noPayments')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 