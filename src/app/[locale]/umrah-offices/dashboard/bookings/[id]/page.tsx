'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, Clipboard, Map, CreditCard, 
  User, Phone, Mail, CalendarDays, UsersRound, 
  ArrowLeft, Download, Printer, Bus, FileText, AlertTriangle
} from 'lucide-react';
import { useGetBookingByIdQuery, useConfirmBookingMutation, useCancelBookingMutation } from '../../../redux/api/bookingsApiSlice';
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
      icon = <Clock className="ml-1 h-4 w-4" />;
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

// Main component
export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  // Fetch booking details using RTK Query
  const { 
    data: bookingFromApi, 
    isLoading: bookingLoading,
    error: bookingError,
    refetch: refetchBooking
  } = useGetBookingByIdQuery(bookingId);
  
  // Determine if we should use local mock data
  const useMockData = !!bookingError || !bookingFromApi;
  
  // Get booking data from mock data if API fails
  const bookingFromMock = useMockData ? mockBookingsData.find(b => b.id === bookingId) : null;
  
  // Combine data sources (prefer API, fallback to local mock)
  const booking = bookingFromApi || bookingFromMock;
  
  // Fetch campaign details if available
  const {
    data: campaignFromApi,
    isLoading: campaignLoading
  } = useGetCampaignByIdQuery(
    booking?.campaignId as string,
    { skip: !booking?.campaignId }
  );
  
  // Get campaign data from mock data if API fails
  const campaignFromMock = booking?.campaignId ? mockCampaigns.find(c => c.id === booking.campaignId) : null;
  
  // Combine data sources for campaign
  const campaign = campaignFromApi || campaignFromMock;
  
  // Fetch payments for this booking
  const {
    data: paymentsFromApi,
    isLoading: paymentsLoading
  } = useGetPaymentsQuery(
    { bookingId },
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
  
  // Handle confirm booking
  const handleConfirmBooking = async () => {
    try {
      if (useMockData) {
        alert('تم تأكيد الحجز بنجاح (وضع المحاكاة)');
        router.push('/ar/umrah-offices/dashboard/bookings');
        return;
      }
      
      await confirmBooking(bookingId).unwrap();
      refetchBooking();
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
      refetchBooking();
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
  if (bookingLoading && !bookingFromMock) {
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
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-red-700 dark:text-red-300">لم يتم العثور على الحجز. يرجى التحقق من الرابط أو المعرف.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="inline-block ml-1 h-4 w-4" />
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }
  
  // From here, booking data is available (either from API or mock)
  
  // Add this section at the end of the JSX return, after all existing sections
  <div className="mt-10 grid grid-cols-1 gap-6">
    {/* Gallery Section */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">معرض الصور</h3>
      </div>
      <div className="p-6">
        {isLoadingGallery ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : galleryError ? (
          <div className="text-center py-6">
            <p className="text-red-500">{galleryError}</p>
            <button 
              onClick={fetchGallery} 
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">لا توجد صور متاحة في المعرض</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="rounded-lg overflow-hidden border bg-white shadow-sm relative group">
                <div className="aspect-square relative">
                  {image.image ? (
                    <img
                      src={image.image.startsWith('http') ? image.image : `/${image.image}`}
                      alt={image.description}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <span className="text-sm">بدون صورة</span>
                    </div>
                  )}
                  {image.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-primary">مميزة</Badge>
                  )}
                  
                  {!image.is_featured && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 h-auto"
                      onClick={() => handleSetFeatured(image.id)}
                      title="تعيين كصورة مميزة"
                    >
                      <Heart className="h-4 w-4 text-primary" />
                    </Button>
                  )}
                </div>
                <div className="p-2 text-right">
                  <p className="text-sm text-gray-700">{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Documents Section */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">المستندات</h3>
      </div>
      <div className="p-6">
        {isLoadingDocuments ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        ) : documentsError ? (
          <div className="text-center py-6">
            <p className="text-red-500">{documentsError}</p>
            <button 
              onClick={fetchDocuments} 
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">لا توجد مستندات متاحة</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-lg overflow-hidden border bg-white shadow-sm">
                <div className="p-4 text-right">
                  <h3 className="font-semibold mb-2">{doc.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    النوع: {doc.type === 'license' ? 'ترخيص' : 
                           doc.type === 'registration' ? 'تسجيل تجاري' : 
                           doc.type === 'insurance' ? 'تأمين' : 'مستند آخر'}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    تاريخ الإضافة: {new Date(doc.created_at).toLocaleDateString('ar-SA')}
                  </p>
                  <a 
                    href={doc.file_path.startsWith('http') ? doc.file_path : `/${doc.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    عرض المستند
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>

  return (
    <div className="container mx-auto px-4 py-6">
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
      
      {useMockData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>ملاحظة:</strong> تستخدم الصفحة حاليًا البيانات الافتراضية المحلية بدلاً من البيانات من API.
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link 
              href="/ar/umrah-offices/dashboard/bookings"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mr-2"
            >
              <ArrowLeft className="inline-block h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">تفاصيل الحجز #{booking.id}</h1>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <StatusBadge status={booking.status} />
            <PaymentBadge status={booking.paymentStatus} />
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
                تأكيد الحجز
              </button>
              
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="ml-1 h-5 w-5" />
                إلغاء الحجز
              </button>
            </>
          )}
          
          <button
            onClick={handlePrintBooking}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
          >
            <Printer className="ml-1 h-5 w-5" />
            طباعة
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking and pilgrim details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Booking overview card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">معلومات الحجز</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CalendarDays className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الحجز</p>
                  <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ التسجيل</p>
                  <p className="font-medium">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CreditCard className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">المبلغ الإجمالي</p>
                  <p className="font-medium">{booking.totalPrice.toLocaleString('ar-SA')} ر.س</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <CreditCard className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">العمولة</p>
                  <p className="font-medium">{booking.commission.toLocaleString('ar-SA')} ر.س</p>
                </div>
              </div>
              
              {booking.busId && (
                <div className="flex items-start">
                  <Bus className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">رقم الحافلة</p>
                    <p className="font-medium">{booking.busId}</p>
                  </div>
                </div>
              )}
              
              {booking.numberOfPilgrims && (
                <div className="flex items-start">
                  <UsersRound className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">عدد المعتمرين</p>
                    <p className="font-medium">{booking.numberOfPilgrims}</p>
                  </div>
                </div>
              )}
            </div>
            
            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-2 flex items-center">
                  <Clipboard className="text-gray-400 h-5 w-5 ml-2" />
                  ملاحظات
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}
          </div>
          
          {/* Pilgrim details */}
          {booking.passportDetails && booking.passportDetails.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">معلومات المعتمرين</h2>
              <div className="space-y-4">
                {booking.passportDetails.map((passport, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg">{passport.name}</h3>
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        جواز سفر: {passport.passportNumber}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">الجنسية</p>
                        <p>{passport.nationality}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الميلاد</p>
                        <p>{formatDate(passport.birthDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ انتهاء الجواز</p>
                        <p>{formatDate(passport.expiryDate)}</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">معلومات المستخدم</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">اسم المستخدم</p>
                  <p className="font-medium">{booking.userName || 'غير محدد'}</p>
                </div>
              </div>
              
              {booking.userEmail && (
                <div className="flex items-start">
                  <Mail className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">البريد الإلكتروني</p>
                    <p className="font-medium">{booking.userEmail}</p>
                  </div>
                </div>
              )}
              
              {booking.userPhone && (
                <div className="flex items-start">
                  <Phone className="text-gray-400 h-5 w-5 mt-1 ml-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</p>
                    <p className="font-medium" dir="ltr">{booking.userPhone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Campaign info if available */}
          {booking.campaignId && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">معلومات الحملة</h2>
              {campaignLoading ? (
                <p className="text-center py-4 text-gray-500">جاري تحميل بيانات الحملة...</p>
              ) : campaign ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">اسم الحملة</p>
                    <p className="font-medium">{campaign.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ البداية</p>
                      <p className="font-medium">{formatDate(campaign.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ النهاية</p>
                      <p className="font-medium">{formatDate(campaign.endDate)}</p>
                    </div>
                  </div>
                  <div>
                    <Link 
                      href={`/ar/umrah-offices/dashboard/campaigns/${campaign.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center"
                    >
                      عرض تفاصيل الحملة
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">لم يتم العثور على بيانات الحملة</p>
              )}
            </div>
          )}
          
          {/* Payment info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">المدفوعات</h2>
            {paymentsLoading ? (
              <p className="text-center py-4 text-gray-500">جاري تحميل بيانات المدفوعات...</p>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map(payment => (
                  <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{payment.amount.toLocaleString('ar-SA')} ر.س</span>
                      <PaymentBadge status={payment.status} />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex justify-between">
                        <span>طريقة الدفع:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {payment.method === 'credit_card' ? 'بطاقة ائتمان' : 
                           payment.method === 'bank_transfer' ? 'تحويل بنكي' : 
                           payment.method === 'cash' ? 'نقداً' : payment.method}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>التاريخ:</span>
                        <span className="text-gray-700 dark:text-gray-300">{formatDate(payment.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">لا توجد مدفوعات مسجلة لهذا الحجز</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 