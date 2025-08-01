'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, Eye, Edit, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchBookings, updateBookingStatus, cancelBooking, setBookingFilters } from '../redux/busOperatorSlice';
import { BookingFilters } from '../types';

export default function BusOperatorBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<BookingFilters>({});
  
  const dispatch = useAppDispatch();
  const { bookings, bookingFilters, bookingsPagination, loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    dispatch(fetchBookings(bookingFilters));
  }, [dispatch, bookingFilters]);

  const handleApplyFilters = () => {
    dispatch(setBookingFilters(tempFilters));
    dispatch(fetchBookings(tempFilters));
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {};
    setTempFilters(resetFilters);
    dispatch(setBookingFilters(resetFilters));
    dispatch(fetchBookings(resetFilters));
    setIsFilterOpen(false);
  };

  const handleStatusUpdate = async (bookingId: number, status: string, notes?: string) => {
    try {
      await dispatch(updateBookingStatus({ 
        id: bookingId, 
        statusData: { status: status as any, notes } 
      })).unwrap();
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      booking.id.toString().includes(searchLower) ||
      booking.user?.name?.toLowerCase().includes(searchLower) ||
      booking.user?.email?.toLowerCase().includes(searchLower) ||
      booking.bus?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('bookings.title')}</h1>
          <p className="text-muted-foreground">
            {t('bookings.list')}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('bookings.create')}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('bookings.filters.status')}</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('common.filter')}</DialogTitle>
                    <DialogDescription>
                      {t('bookings.filters.dateRange')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('bookings.filters.status')}</Label>
                        <Select
                          value={tempFilters.status || 'all'}
                          onValueChange={(value) => setTempFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('bookings.filters.all')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('bookings.filters.all')}</SelectItem>
                            <SelectItem value="pending">{t('bookings.status.pending')}</SelectItem>
                            <SelectItem value="confirmed">{t('bookings.status.confirmed')}</SelectItem>
                            <SelectItem value="cancelled">{t('bookings.status.cancelled')}</SelectItem>
                            <SelectItem value="completed">{t('bookings.status.completed')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('bookings.filters.paymentStatus')}</Label>
                        <Select
                          value={tempFilters.payment_status || 'all'}
                          onValueChange={(value) => setTempFilters(prev => ({ ...prev, payment_status: value === 'all' ? '' : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('bookings.filters.all')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('bookings.filters.all')}</SelectItem>
                            <SelectItem value="pending">{t('bookings.paymentStatus.pending')}</SelectItem>
                            <SelectItem value="partially_paid">{t('bookings.paymentStatus.partially_paid')}</SelectItem>
                            <SelectItem value="paid">{t('bookings.paymentStatus.paid')}</SelectItem>
                            <SelectItem value="refunded">{t('bookings.paymentStatus.refunded')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleResetFilters}>
                      {t('bookings.filters.reset')}
                    </Button>
                    <Button onClick={handleApplyFilters}>
                      {t('bookings.filters.apply')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading.bookings ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('bookings.table.id')}</TableHead>
                    <TableHead>{t('bookings.table.customer')}</TableHead>
                    <TableHead>{t('bookings.table.bus')}</TableHead>
                    <TableHead>{t('bookings.table.travelDate')}</TableHead>
                    <TableHead>{t('bookings.table.passengers')}</TableHead>
                    <TableHead>{t('bookings.table.totalPrice')}</TableHead>
                    <TableHead>{t('bookings.table.status')}</TableHead>
                    <TableHead>{t('bookings.table.paymentStatus')}</TableHead>
                    <TableHead className="text-right">{t('bookings.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.user?.name}</div>
                            <div className="text-sm text-muted-foreground">{booking.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.bus?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(booking.travel_start).toLocaleDateString('ar-SA')}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(booking.travel_end).toLocaleDateString('ar-SA')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{booking.number_of_persons}</TableCell>
                        <TableCell className="font-medium">{booking.total_price} ريال</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {t(`bookings.status.${booking.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.payment_status)}>
                            {t(`bookings.paymentStatus.${booking.payment_status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {booking.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}