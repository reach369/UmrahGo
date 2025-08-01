import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from '../services/officesService';
import { Calendar, Check, Clock, Users, X } from 'lucide-react';
import Image from 'next/image';

// Custom ScrollArea component
interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollArea = ({ children, className }: ScrollAreaProps) => (
  <div className={`overflow-auto pr-4 -mr-4 max-h-[60vh] ${className || ''}`}>
    {children}
  </div>
);

interface PackageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
  onBookNow: (pkg: Package) => void;
  officeName: string;
}

export function PackageDetailsModal({ 
  isOpen, 
  onClose, 
  package: pkg, 
  onBookNow,
  officeName
}: PackageDetailsModalProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('ar-SA')} ${currency === 'SAR' ? 'ريال' : currency}`;
  };

  const getAvailabilityColor = (status: Package['availability_status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'limited':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'sold_out':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const getAvailabilityText = (status: Package['availability_status'], slots?: number | null) => {
    switch (status) {
      case 'available':
        return 'متاح';
      case 'limited':
        return slots ? `متبقي ${slots} مقعد` : 'متبقي عدد محدود';
      case 'sold_out':
        return 'نفذت';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{pkg.name}</DialogTitle>
              <DialogDescription>
                {officeName} - {formatCurrency(pkg.price, pkg.currency)}
              </DialogDescription>
            </div>
            <Badge variant="outline" className={getAvailabilityColor(pkg.availability_status)}>
              {getAvailabilityText(pkg.availability_status, pkg.available_slots)}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1">
          <div className="space-y-6">
            {/* Package Image */}
            {pkg.cover_image && (
              <div className="relative h-60 w-full rounded-md overflow-hidden">
                <Image 
                  src={pkg.cover_image} 
                  alt={pkg.name} 
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-package-cover.png';
                  }}
                />
              </div>
            )}

            {/* Gallery Images */}
            {pkg.gallery_images && pkg.gallery_images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">معرض الصور</h3>
                <div className="grid grid-cols-3 gap-2">
                  {pkg.gallery_images.map((image, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden">
                      <Image
                        src={image}
                        alt={`صورة ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description */}
            {pkg.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">وصف الباقة</h3>
                <p className="text-muted-foreground">{pkg.description}</p>
              </div>
            )}
            
            {/* Package Details */}
            <div className="flex flex-wrap gap-4">
              {pkg.duration_days && (
                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <Calendar className="w-4 h-4" />
                  <span>{pkg.duration_days} أيام</span>
                </div>
              )}
              
              {pkg.max_persons && (
                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <Users className="w-4 h-4" />
                  <span>{pkg.max_persons} أشخاص</span>
                </div>
              )}
              
              {pkg.available_slots !== null && (
                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.available_slots} مقعد متاح</span>
                </div>
              )}
            </div>
            
            {/* Includes */}
            {pkg.includes && pkg.includes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">تشمل الباقة</h3>
                <ul className="space-y-1.5">
                  {pkg.includes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Excludes */}
            {pkg.excludes && pkg.excludes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">لا تشمل الباقة</h3>
                <ul className="space-y-1.5">
                  {pkg.excludes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6 pt-4 border-t">
          <div className="flex-1 text-lg font-bold">
            {formatCurrency(pkg.price, pkg.currency)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>إغلاق</Button>
            <Button 
              disabled={pkg.availability_status === 'sold_out'}
              onClick={() => onBookNow(pkg)}
            >
              {pkg.availability_status === 'sold_out' ? 'نفذت المقاعد' : 'حجز الباقة'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 