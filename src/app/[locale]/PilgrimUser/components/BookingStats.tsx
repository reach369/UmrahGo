'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatPrice } from '@/utils/formatPrice';

interface BookingStatsProps {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: string;
}

export default function BookingStats({
  totalBookings,
  pendingBookings,
  confirmedBookings,
  completedBookings,
  cancelledBookings,
  totalSpent
}: BookingStatsProps) {
  const t = useTranslations();

  // Calculate percentages for progress bars
  const pendingPercentage = totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0;
  const confirmedPercentage = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
  const completedPercentage = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
  const cancelledPercentage = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-card">
        <div className="text-sm text-muted-foreground">{t('bookings.totalBookings')}</div>
        <div className="text-2xl font-bold mt-1">{totalBookings}</div>
      </div>

      <div className="p-4 border rounded-lg bg-card">
        <div className="text-sm text-muted-foreground">{t('bookings.totalSpent')}</div>
        <div className="text-2xl font-bold mt-1">{formatPrice(parseFloat(totalSpent))}</div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-yellow-600">{t('bookings.status.pending')}</span>
            <span className="font-medium">{pendingBookings}</span>
          </div>
          <Progress value={pendingPercentage} className="h-2 bg-yellow-100">
            <div className="bg-yellow-500 h-2 rounded" style={{ width: `${pendingPercentage}%` }} />
          </Progress>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-600">{t('bookings.status.confirmed')}</span>
            <span className="font-medium">{confirmedBookings}</span>
          </div>
          <Progress value={confirmedPercentage} className="h-2 bg-green-100">
            <div className="bg-green-500 h-2 rounded" style={{ width: `${confirmedPercentage}%` }} />
          </Progress>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-600">{t('bookings.status.completed')}</span>
            <span className="font-medium">{completedBookings}</span>
          </div>
          <Progress value={completedPercentage} className="h-2 bg-blue-100" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-600">{t('bookings.status.cancelled')}</span>
            <span className="font-medium">{cancelledBookings}</span>
          </div>
          <Progress value={cancelledPercentage} className="h-2 bg-red-100">
            <div className="bg-red-500 h-2 rounded" style={{ width: `${cancelledPercentage}%` }} />
          </Progress>
        </div>
      </div>
    </div>
  );
} 