'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  FileText,
  Search,
  Calendar,
  Filter,
  X,
  MessageCircle,
  Clock
} from 'lucide-react';
import { BookingFilter, Booking } from '@/models/booking.model';
import { fetchUserBookings } from '../services/bookingService';
import { formatPrice } from '@/utils/formatPrice';

interface BookingListProps {
  onViewBooking: (id: string | number) => void;
}

export default function BookingList({ onViewBooking }: BookingListProps) {
  const t = useTranslations();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<BookingFilter>({
    status: undefined,
    payment_status: undefined,
    start_date: undefined,
    end_date: undefined,
    per_page: 10,
    page: 1
  });

  // Load bookings based on filters
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        console.log('Loading bookings with filter:', { ...filter, page: currentPage, search: debouncedSearch });
        
        const response = await fetchUserBookings({
          ...filter,
          page: currentPage
        });
        
        console.log('BookingList API response:', {
          status: response.status,
          dataLength: response.data?.length || 0,
          pagination: response.pagination
        });
        
        if (response.status && response.data) {
          // Ensure response.data is an array, if not, check if it's nested
          // Ensure response.data is an array, if not, check if it's nested and exists
          let bookingsData: any[] = [];
          if (Array.isArray(response.data)) {
            bookingsData = response.data;
          } else if (response.data && Array.isArray((response.data as any).data)) {
            bookingsData = (response.data as any).data;
          } else {
            bookingsData = [];
          }
          
          // Map booking_type to correct union type if needed
          const mappedBookings = bookingsData.map((booking: any) => {
            const mappedType = 
              booking.booking_type === 'package' ||
              booking.booking_type === 'bus' ||
              booking.booking_type === 'custom'
                ? booking.booking_type
                : 'package'; // fallback
            
            return {
              ...booking,
              booking_type: mappedType,
            };
          });
          
          console.log(`Processed ${mappedBookings.length} bookings`);
          setBookings(mappedBookings);
          setTotalItems(response.pagination?.total ?? bookingsData.length ?? 0);
        } else {
          console.error('Invalid booking response format:', response);
          setBookings([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        setBookings([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [filter, currentPage, debouncedSearch]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof BookingFilter, value: any) => {
    // Convert "all" value to undefined for filter reset
    const filterValue = value === "all" ? undefined : value;
    setFilter(prev => ({ ...prev, [key]: filterValue }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilter({
      status: undefined,
      payment_status: undefined,
      start_date: undefined,
      end_date: undefined,
      per_page: 10,
      page: 1
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Get payment status badge styling
  const getPaymentStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'failed': return 'bg-rose-100 text-rose-800 hover:bg-rose-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Render loading skeletons
  const renderSkeletons = () => (
    Array(3).fill(0).map((_, i) => (
      <tr key={`skeleton-${i}`}>
        <td colSpan={7} className="py-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </td>
      </tr>
    ))
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>{t('bookings.yourBookings')}</CardTitle>
          <CardDescription>
            {t('bookings.manageYourBookings')}
          </CardDescription>
        </div>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="w-4 h-4 mr-2" /> : <Filter className="w-4 h-4 mr-2" />}
            {showFilters ? t('bookings.hideFilters') : t('bookings.showFilters')}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and filters */}
        <div className={`mb-4 ${showFilters ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Input
                placeholder={t('bookings.searchPlaceholder')}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full"
                style={{ paddingLeft: '2rem' }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
            </div>
            
            <div>
              <Select
                value={filter.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('bookings.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('bookings.allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('bookings.status.pending')}</SelectItem>
                  <SelectItem value="confirmed">{t('bookings.status.confirmed')}</SelectItem>
                  <SelectItem value="completed">{t('bookings.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('bookings.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={filter.payment_status || 'all'}
                onValueChange={(value) => handleFilterChange('payment_status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('bookings.filterByPaymentStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('bookings.allPaymentStatuses')}</SelectItem>
                  <SelectItem value="paid">{t('bookings.paymentStatus.paid')}</SelectItem>
                  <SelectItem value="pending">{t('bookings.paymentStatus.pending')}</SelectItem>
                  <SelectItem value="refunded">{t('bookings.paymentStatus.refunded')}</SelectItem>
                  <SelectItem value="failed">{t('bookings.paymentStatus.failed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <DatePicker
                date={filter.start_date ? new Date(filter.start_date) : undefined}
                setDate={(date) => handleFilterChange('start_date', date?.toISOString().split('T')[0])}
              />
            </div>
            
            <div>
              <DatePicker
                date={filter.end_date ? new Date(filter.end_date) : undefined}
                setDate={(date) => handleFilterChange('end_date', date?.toISOString().split('T')[0])}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                {t('bookings.clearFilters')}
              </Button>
            </div>
          </div>
        </div>

        {/* Booking status tabs */}
        <Tabs defaultValue="all" className="w-full mb-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">{t('bookings.all')}</TabsTrigger>
            <TabsTrigger value="pending">{t('bookings.status.pending')}</TabsTrigger>
            <TabsTrigger value="confirmed">{t('bookings.status.confirmed')}</TabsTrigger>
            <TabsTrigger value="completed">{t('bookings.status.completed')}</TabsTrigger>
            <TabsTrigger value="cancelled">{t('bookings.status.cancelled')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bookings table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-start py-3 px-2 font-medium">{t('bookings.bookingNumber')}</th>
                <th className="text-start py-3 px-2 font-medium">{t('bookings.date')}</th>
                <th className="text-start py-3 px-2 font-medium">{t('bookings.packageName')}</th>
                <th className="text-start py-3 px-2 font-medium">{t('bookings.statusLabel')}</th>
                <th className="text-start py-3 px-2 font-medium">{t('bookings.paymentLabel')}</th>
                <th className="text-start py-3 px-2 font-medium">{t('bookings.amount')}</th>
                <th className="text-start py-3 px-2 font-medium">{t('bookings.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? renderSkeletons() : (
                bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery || filter.status || filter.payment_status ? 
                        t('bookings.noMatchingBookings') : 
                        t('bookings.noBookings')}
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-4 px-2">
                        <div className="font-medium">#{`BK${booking.id}`}</div>
                        <div className="text-xs text-muted-foreground">{t('bookings.persons')}: {booking.number_of_persons}</div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        {booking.package ? (
                          <div>
                            <div className="font-medium line-clamp-1">{booking.package.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {booking.package.office?.office_name}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">{t('bookings.packageUnavailable')}</div>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <Badge className={getStatusBadgeStyle(booking.status)}>
                          {t(`bookings.status.${booking.status}`)}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Badge className={getPaymentStatusBadgeStyle(booking.payment_status)}>
                          {t(`bookings.paymentStatus.${booking.payment_status}`)}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 font-medium">
                        {formatPrice(parseFloat(booking.total_price))}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => onViewBooking(booking.id)}
                            className="h-8 px-2"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                            {t('bookings.view')}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title={t('bookings.downloadInvoice')}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && bookings.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {t('bookings.showing')} {((currentPage - 1) * filter.per_page!) + 1} - {Math.min(currentPage * filter.per_page!, totalItems)} {t('bookings.of')} {totalItems} {t('bookings.items')}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / (filter.per_page || 10))}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 