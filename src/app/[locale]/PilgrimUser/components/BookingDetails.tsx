'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Download,
  MessageCircle,
  Truck,
  User,
  Users,
  MapPin,
  X,
  Check,
  AlertTriangle,
  FileText,
  Printer
} from 'lucide-react';
import { Booking } from '@/models/booking.model';
import { fetchBookingById, cancelBooking, getBookingInvoice } from '../services/bookingService';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getValidImageUrl } from '@/utils/image-helpers';


interface BookingDetailsProps {
  bookingId: string | number;
  onBack: () => void;
}

export default function BookingDetails({ bookingId, onBack }: BookingDetailsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Load booking details
  useEffect(() => {
    const loadBookingDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetchBookingById(bookingId);
        if (response.status && response.data) {
          setBooking(response.data as Booking);
        } else {
          toast.error(t('bookings.errors.loadingFailed'));
        }
      } catch (error) {
        console.error('Failed to load booking details:', error);
        toast.error(t('bookings.errors.loadingFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBookingDetails();
  }, [bookingId, t]);

  const handleCancel = async () => {
    if (!cancelReason) {
      toast.error(t('bookings.errors.reasonRequired'));
      return;
    }
    
    setIsCancelling(true);
    try {
      const response = await cancelBooking(bookingId, { reason: cancelReason });
      if (response.status) {
        toast.success(t('bookings.cancelSuccess'));
        setShowCancelDialog(false);
        // Update booking with new status
        if (response.data) {
          setBooking(response.data as Booking);
        }
      } else {
        toast.error(response.message || t('bookings.errors.cancelFailed'));
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error(t('bookings.errors.cancelFailed'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const invoiceResponse = await getBookingInvoice(bookingId);
        if (invoiceResponse && typeof invoiceResponse.data.invoice_url === 'string') {
        window.open(invoiceResponse.data.invoice_url, '_blank');
      } else {
        toast.error(t('bookings.errors.invoiceNotAvailable'));
      }
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error(t('bookings.errors.invoiceDownloadFailed'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'failed': return 'bg-rose-100 text-rose-800 hover:bg-rose-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <Check className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('bookings.notFound')}</CardTitle>
          <CardDescription>{t('bookings.notFoundDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">{t('bookings.bookingMayBeDeleted')}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mb-2" 
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('bookings.backToList')}
              </Button>
              <div>
                <CardTitle className="text-2xl flex items-center">
                  {t('bookings.booking')} #{booking.id}
                  <Badge className={`ml-4 ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{t(`bookings.status.${booking.status}`)}</span>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t('bookings.createdAt')}: {new Date(booking.created_at).toLocaleDateString()} {new Date(booking.created_at).toLocaleTimeString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex mt-4 sm:mt-0">
              {booking.status === 'pending' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <X className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('bookings.cancel')}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadInvoice}
              >
                <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('bookings.invoice')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="ml-2"
                onClick={handleDownloadInvoice}
              >
                <Printer className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('bookings.print')}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('bookings.details')}
              </TabsTrigger>
              <TabsTrigger value="passengers">
                <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('bookings.passengers')}
              </TabsTrigger>
              <TabsTrigger value="payments">
                <CreditCard className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('bookings.payments')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Booking Summary */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>{t('bookings.bookingSummary')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Package Information */}
                      {booking.package && (
                        <div>
                          <h3 className="font-semibold text-lg mb-3">{t('bookings.packageInfo')}</h3>
                          <div className="flex flex-col sm:flex-row gap-4">
                            {booking.package.thumbnail_url && (
                              <div className="w-full sm:w-1/3"> 
                                <div className="relative h-32 w-full rounded-md overflow-hidden">
                                  <Image 
                                    src={getValidImageUrl(booking.package.thumbnail_url) || '' } 
                                    alt={booking.package.name} 
                                    fill
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="w-full sm:w-2/3">
                              <h4 className="font-medium text-lg">{booking.package.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{booking.package.description}</p>
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('bookings.duration')}</p>
                                  <p className="font-medium">{booking.package.duration_days} {t('bookings.days')}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('bookings.price')}</p>
                                  <p className="font-medium">{formatPrice(booking.package.price)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('bookings.startLocation')}</p>
                                  <p className="font-medium">{booking.package.start_location}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">{t('bookings.endLocation')}</p>
                                  <p className="font-medium">{booking.package.end_location}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Travel Information */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3">{t('bookings.travelInfo')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">{t('bookings.travelDates')}</p>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <p className="font-medium">
                                {new Date(booking.travel_start).toLocaleDateString()} - {new Date(booking.travel_end).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('bookings.bookingDate')}</p>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('bookings.persons')}</p>
                            <div className="flex items-center mt-1">
                              <Users className="h-4 w-4 mr-2" />
                              <p className="font-medium">{booking.number_of_persons} {t('bookings.personsCount')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.special_requests && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{t('bookings.specialRequests')}</h3>
                            <p className="text-sm bg-muted p-3 rounded-md">{booking.special_requests}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('bookings.paymentInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {t(`bookings.paymentStatus.${booking.payment_status}`)}
                        </Badge>
                      </div>
                      
                      <div className="border rounded-md p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('bookings.subtotal')}</span>
                          <span>{formatPrice(parseFloat(booking.original_price || booking.total_price))}</span>
                        </div>
                        
                        {parseFloat(booking.discount_amount || '0') > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>{t('bookings.discount')}</span>
                            <span>-{formatPrice(parseFloat(booking.discount_amount || '0'))}</span>
                          </div>
                        )}
                        
                        {parseFloat(booking.tax_amount || '0') > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('bookings.tax')} ({booking.tax_rate}%)</span>
                            <span>{formatPrice(parseFloat(booking.tax_amount || '0'))}</span>
                          </div>
                        )}
                        
                        <Separator />
                        
                        <div className="flex justify-between font-bold">
                          <span>{t('bookings.total')}</span>
                          <span>{formatPrice(parseFloat(booking.total_price))}</span>
                        </div>
                        
                        <div className="flex justify-between text-muted-foreground text-sm">
                          <span>{t('bookings.paid')}</span>
                          <span>{formatPrice(parseFloat(booking.paid_amount || '0'))}</span>
                        </div>
                        
                        <div className="flex justify-between font-medium">
                          <span>{t('bookings.remaining')}</span>
                          <span>{formatPrice(parseFloat(booking.remaining_amount || '0'))}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>{t('bookings.paymentMethod')}: {booking.payment_method?.name || t('bookings.notSpecified')}</p>
                      </div>

                      {/* Contact Office Section */}
                      {booking.package?.office && (
                        <div className="mt-6 border-t pt-4">
                          <h3 className="font-medium mb-2">{t('bookings.contactOffice')}</h3>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={getValidImageUrl(booking.package.office.logo) || ''} alt={booking.package.office.office_name || ''} />
                              <AvatarFallback>{booking.package.office.office_name?.substring(0, 2) || ''}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{booking.package.office.office_name}</p>
                              <p className="text-sm text-muted-foreground">{booking.package.office.contact_number}</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-3"
                              onClick={() => router.push(`/PilgrimUser/chat?office=${booking.package?.office?.id}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {t('bookings.chat')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="passengers">
              <Card>
                <CardHeader>
                  <CardTitle>{t('bookings.passengers')}</CardTitle>
                  <CardDescription>{t('bookings.passengersInfo')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {booking.passengers && booking.passengers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.passengers.map((passenger, index) => (
                        <Card key={passenger.id || index}>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-3">
                              <User className="h-5 w-5 text-primary mr-2" />
                              <h3 className="font-medium">
                                {passenger.name} {index === 0 && <span className="text-sm text-muted-foreground">({t('bookings.mainPassenger')})</span>}
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-sm text-muted-foreground">{t('bookings.passportNumber')}</p>
                                <p className="font-medium">{passenger.passport_number}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t('bookings.nationality')}</p>
                                <p className="font-medium">{passenger.nationality}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t('bookings.gender')}</p>
                                <p className="font-medium">
                                  {passenger.gender === 'male' 
                                    ? t('bookings.male') 
                                    : passenger.gender === 'female' 
                                      ? t('bookings.female') 
                                      : passenger.gender}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">{t('bookings.age')}</p>
                                <p className="font-medium">{passenger.age}</p>
                              </div>
                              {passenger.phone && (
                                <div className="col-span-2">
                                  <p className="text-sm text-muted-foreground">{t('bookings.phone')}</p>
                                  <p className="font-medium">{passenger.phone}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('bookings.noPassengersFound')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>{t('bookings.paymentHistory')}</CardTitle>
                  <CardDescription>{t('bookings.paymentDetails')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {booking.payments && booking.payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-start py-3 px-4 font-medium">{t('bookings.date')}</th>
                            <th className="text-start py-3 px-4 font-medium">{t('bookings.amount')}</th>
                            <th className="text-start py-3 px-4 font-medium">{t('bookings.method')}</th>
                            <th className="text-start py-3 px-4 font-medium">{t('bookings.reference')}</th>
                            <th className="text-start py-3 px-4 font-medium">{t('bookings.status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {booking.payments.map((payment, index) => (
                            <tr key={payment.id || index} className="border-b">
                              <td className="py-3 px-4">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 font-medium">{formatPrice(parseFloat(payment.amount))}</td>
                              <td className="py-3 px-4">{payment.payment_method}</td>
                              <td className="py-3 px-4 text-xs">
                                {payment.transaction_id || t('bookings.noReference')}
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={getPaymentStatusColor(payment.status)}>
                                  {t(`bookings.paymentStatus.${payment.status}`) || payment.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('bookings.noPaymentsFound')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('bookings.cancelBooking')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('bookings.cancelConfirmation')}
              <textarea
                className="w-full mt-4 p-2 border rounded-md"
                rows={3}
                placeholder={t('bookings.cancelReasonPlaceholder')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              ></textarea>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel} 
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? t('common.processing') : t('bookings.confirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 