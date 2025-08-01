'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PilgrimBookingForm } from '../components/PilgrimBookingForm';
import BookingHistory from '../components/BookingHistory';
import BookingDetails from '../components/BookingDetails';
import { Toaster, toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ListIcon, PlusIcon, RefreshCcw, AlertCircle } from 'lucide-react';
import { BookingFilter } from '@/models/booking.model';
import { fetchUserBookings } from '../services/bookingService';
import BookingList from '../components/BookingList';
import BookingStats from '../components/BookingStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BookingPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: '0.00'
  });

  // Fetch booking statistics
  const loadBookingStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchUserBookings();
      
      if (response.status) {
        // Ensure response.data is an array, if not, check if it's nested
        // Ensure response.data is an array, if not, check if it's nested and has a 'data' property
        const bookingsData = Array.isArray(response.data)
          ? response.data
          : (response.data && Array.isArray((response.data as any).data) ? (response.data as any).data : []);

        if (Array.isArray(bookingsData)) {
          // Calculate statistics
          const total = bookingsData.length;
          const pending = bookingsData.filter(b => b.status === 'pending').length;
          const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
          const completed = bookingsData.filter(b => b.status === 'completed').length;
          const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
          
          // Calculate total spent
          const totalSpent = bookingsData
            .filter(b => b.payment_status === 'paid')
            .reduce((sum, booking) => sum + parseFloat(booking.total_price || '0'), 0)
            .toFixed(2);
          
          setBookingStats({
            total,
            pending,
            confirmed,
            completed,
            cancelled,
            totalSpent: totalSpent.toString()
          });
          
          console.log('Booking statistics loaded:', {
            total,
            pending,
            confirmed,
            completed,
            cancelled,
            totalSpent
          });
        } else {
          console.error('Invalid booking data format:', response);
          setError(t('bookings.errorLoadingStats'));
        }
      } else {
        console.error('Invalid booking data format:', response);
        setError(t('bookings.errorLoadingStats'));
      }
    } catch (error) {
      console.error('Error loading booking statistics:', error);
      setError(t('bookings.errorLoadingStats'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookingStats();
  }, [t]);

  // Handle success parameter in URL to show success message or details
  useEffect(() => {
    const success = searchParams?.get('success');
    const bookingId = searchParams?.get('booking_id');
    
    if (success === 'true' && bookingId) {
      setSelectedBookingId(bookingId);
      setActiveTab('details');
      toast.success(t('bookings.bookingCreatedSuccess'));
    }
  }, [searchParams, t]);

  const handleViewBooking = (id: string | number) => {
    setSelectedBookingId(String(id));
    setActiveTab('details');
  };

  const handleCreateBooking = () => {
    setSelectedBookingId(null);
    setActiveTab('create');
  };

  const handleBackToList = () => {
    setSelectedBookingId(null);
    setActiveTab('list');
  };

  const handleRefresh = () => {
    loadBookingStats();
    toast.info(t('bookings.refreshingData'));
  };

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('bookings.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('bookings.subtitle')}
            </p>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="mt-4 sm:mt-0"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t('bookings.refreshing') : t('bookings.refresh')}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('bookings.error')}</AlertTitle>
            <AlertDescription>
              {error}
              <Button 
                variant="link" 
                onClick={handleRefresh} 
                className="p-0 h-auto font-normal underline ml-2"
              >
                {t('bookings.tryAgain')}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with statistics */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('bookings.statistics')}</CardTitle>
                <CardDescription>{t('bookings.bookingOverview')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </>
                ) : (
                  <BookingStats 
                    totalBookings={bookingStats.total} 
                    pendingBookings={bookingStats.pending}
                    confirmedBookings={bookingStats.confirmed}
                    completedBookings={bookingStats.completed}
                    cancelledBookings={bookingStats.cancelled}
                    totalSpent={bookingStats.totalSpent}
                  />
                )}

                <div className="mt-6">
                  <Button 
                    onClick={handleCreateBooking}
                    className="w-full"
                    size="sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('bookings.createNew')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="list">
                  <ListIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('bookings.allBookings')}
                </TabsTrigger>
                <TabsTrigger value="create">
                  <PlusIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('bookings.newBooking')}
                </TabsTrigger>
                {selectedBookingId && (
                  <TabsTrigger value="details">
                    <CalendarIcon className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('bookings.bookingDetails')}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="list" className="mt-0">
                <BookingList onViewBooking={handleViewBooking} />
              </TabsContent>

              <TabsContent value="create" className="mt-0">
                <PilgrimBookingForm />
              </TabsContent>

              {selectedBookingId && (
                <TabsContent value="details" className="mt-0">
                  <BookingDetails 
                    bookingId={selectedBookingId} 
                    onBack={handleBackToList}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
} 