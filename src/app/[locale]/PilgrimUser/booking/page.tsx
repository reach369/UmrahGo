'use client';

import { PilgrimBookingForm } from '@/app/[locale]/PilgrimUser/components/PilgrimBookingForm';
import { Toaster } from 'sonner';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-primary">
            حجز رحلة العمرة
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            قم بإكمال النموذج التالي لحجز رحلتك للعمرة
          </p>
        </div>

        <PilgrimBookingForm />
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
} 