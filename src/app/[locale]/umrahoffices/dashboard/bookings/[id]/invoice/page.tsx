'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGetBookingByIdQuery } from '../../../../redux/api/bookingsApiSlice';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { mockBookingsData } from '../../../../utils/mockBookingsData';
import { useTranslations } from 'next-intl';

// Utility for formatting date in Arabic
const formatDateArabic = (dateStr: string | undefined): string => {
  if (!dateStr) return 'غير محدد';
  
  try {
    const date = new Date(dateStr);
    return format(date, 'dd MMMM yyyy', { locale: ar });
  } catch (error) {
    return dateStr;
  }
};

// Main component
export default function BookingInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || 'ar';
  const bookingId = params?.id as string;
  const t = useTranslations('Umrahoffices.invoice');
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Fetch booking data
  const { 
    data: bookingData, 
    isLoading: bookingLoading,
    error: bookingError
  } = useGetBookingByIdQuery(bookingId);
  
  // Fallback to mock data if API fails
  const useMockData = !!bookingError || !bookingData;
  const bookingFromMock = useMockData ? mockBookingsData.find(b => b.id.toString() === bookingId) : null;
  const booking = bookingData || bookingFromMock;
  
  // Handle print invoice
  const handlePrint = () => {
    window.print();
  };
  
  // Handle download PDF
  const handleDownload = async () => {
    // In a real implementation, this would call an API endpoint to generate a PDF
    setIsGeneratingPdf(true);
    
    try {
      // Mock download implementation
      setTimeout(() => {
        setIsGeneratingPdf(false);
        alert('تحميل الفاتورة كملف PDF غير متاح حاليًا في الواجهة التجريبية');
      }, 1500);
      
      // In a real implementation:
      // const response = await fetch(`/api/bookings/${bookingId}/invoice/download`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `invoice-${bookingId}.pdf`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setIsGeneratingPdf(false);
    }
  };
  
  // Show loading state
  if (bookingLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // Show error state if no booking data available
  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-red-700">لم يتم العثور على بيانات الحجز. يرجى التحقق من الرابط.</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            <ArrowLeft className="inline-block ml-1 h-4 w-4" />
            العودة للخلف
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Non-printable actions */}
      <div className="print:hidden mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            href={`/${locale}/umrahoffices/dashboard/bookings/${bookingId}`}
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{t('title')} #{bookingId}</h1>
        </div>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button variant="outline" onClick={handlePrint} disabled={isGeneratingPdf}>
            <Printer className="ml-1 h-4 w-4" />
            {t('printInvoice')}
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleDownload}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent ml-1"></div>
                {t('downloading')}
              </div>
            ) : (
              <>
                <Download className="ml-1 h-4 w-4" />
                {t('downloadPdf')}
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Invoice content */}
      <div className=" rounded-lg shadow-lg p-8 mb-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div className="text-right">
            <h2 className="text-xl font-bold">{t('invoiceTitle')}</h2>
            <p className="text-gray-600">{t('invoiceNumber')}: INV-{bookingId}</p>
            <p className="text-gray-600">
              {t('issueDate')}: {formatDateArabic(booking.created_at)}
            </p>
          </div>
          
          <div>
            <img 
              src="/images/logo.png" 
              alt="شعار الشركة" 
              className="h-16 w-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/200x80?text=LOGO';
              }} 
            />
            <p className="mt-2 font-semibold text-lg">شركة عمرة جو</p>
          </div>
        </div>
        
        {/* Client and Booking Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Client Info */}
          <div>
            <h3 className="text-lg font-bold mb-3">{t('clientInfo')}</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                <span className="font-semibold">{t('bookings.userName')}:</span>{' '}
                {booking.user?.name || 'غير محدد'}
              </p>
              <p>
                <span className="font-semibold">{t('bookings.userEmail')}:</span>{' '}
                {booking.user?.email || 'غير محدد'}
              </p>
              <p>
                <span className="font-semibold">{t('bookings.userPhone')}:</span>{' '}
                {booking.user?.phone || 'غير محدد'}
              </p>
            </div>
          </div>
          
          {/* Booking Info */}
          <div>
            <h3 className="text-lg font-bold mb-3">{t('bookingInfo')}</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                <span className="font-semibold">{t('bookingNumber')}:</span>{' '}
                {booking.id}
              </p>
              <p>
                <span className="font-semibold">{t('bookingDate')}:</span>{' '}
                {formatDateArabic(booking.booking_date)}
              </p>
              <p>
                <span className="font-semibold">{t('bookingStatus')}:</span>{' '}
                <span className={`
                  ${booking.status === 'confirmed' ? 'text-green-600' : 
                    booking.status === 'pending' ? 'text-yellow-600' : 
                    booking.status === 'cancelled' ? 'text-red-600' : 
                    booking.status === 'completed' ? 'text-blue-600' : 'text-gray-600'}
                `}>
                  {booking.status === 'confirmed' ? t('bookings.confirmed') : 
                   booking.status === 'pending' ? t('bookings.pending') : 
                   booking.status === 'cancelled' ? t('bookings.cancelled') : 
                   booking.status === 'completed' ? t('bookings.completed') : 
                   booking.status === 'rejected' ? t('bookings.rejected') : booking.status}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Invoice Details */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-3">{t('invoiceDetails')}</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-right">{t('description')}</th>
                  <th className="py-3 px-4 text-center">{t('quantity')}</th>
                  <th className="py-3 px-4 text-left">{t('price')}</th>
                  <th className="py-3 px-4 text-left">{t('total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold">
                        {booking.package?.name || 'باقة عمرة'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.start_date && booking.end_date ? 
                          `${formatDateArabic(booking.start_date)} - ${formatDateArabic(booking.end_date)}` : 
                          'تاريخ الباقة غير محدد'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(booking.passengers?.length || 1)}
                  </td>
                  <td className="py-3 px-4">
                    {((booking.total_amount || 0) / 
                      (booking.passengers?.length || 1)).toLocaleString('ar-SA')}{' '}
                    ر.س
                  </td>
                  <td className="py-3 px-4">
                    {(booking.total_amount || 0).toLocaleString('ar-SA')}{' '}
                    ر.س
                  </td>
                </tr>
                
                {/* Additional services can be added here if needed */}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Payment Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/2 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">{t('subtotal')}:</span>
              <span>{(booking.total_amount || 0).toLocaleString('ar-SA')} ر.س</span>
            </div>
            
            {(booking.commission !== undefined && booking.commission > 0) && (
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{t('commission')}:</span>
                <span>{(booking.commission || 0).toLocaleString('ar-SA')} ر.س</span>
              </div>
            )}
            
            <div className="border-t my-2 pt-2 flex justify-between font-bold">
              <span>{t('totalAmount')}:</span>
              <span>{(booking.total_amount || 0).toLocaleString('ar-SA')} ر.س</span>
            </div>
            
            <div className="flex justify-between text-green-600">
              <span className="font-semibold">{t('paidAmount')}:</span>
              <span>{(booking.paid_amount || 0).toLocaleString('ar-SA')} ر.س</span>
            </div>
            
            {(booking.due_amount !== undefined && booking.due_amount > 0 || 
              booking.total_amount !== undefined && booking.paid_amount !== undefined && 
              booking.total_amount > (booking.paid_amount || 0)) && (
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">{t('dueAmount')}:</span>
                <span>
                  {(booking.due_amount || 
                    (booking.total_amount || 0) - (booking.paid_amount || 0)).toLocaleString('ar-SA')} ر.س
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Terms and Notes */}
        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">{t('termsTitle')}:</h3>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>{t('terms1')}</li>
            <li>{t('terms2')}</li>
            <li>{t('terms3')}</li>
          </ul>
          
          {booking.notes && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">{t('notes')}:</h3>
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>{t('footer1')}</p>
            <p>{t('footer2')}</p>
            <p>{t('footer3')}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 