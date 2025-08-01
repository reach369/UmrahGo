import { useState, useEffect } from 'react';
import { Package, fetchOfficePackages } from '../services/officesService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Check, Clock, Eye, Users } from 'lucide-react';
import Image from 'next/image';
import { BookingModal } from './BookingModal';
import { PackageDetailsModal } from './PackageDetailsModal';
import { getImageUrl } from '../utils/imageUtils';

interface OfficePackagesProps {
  officeId: number | string;
  officeName?: string;
}

export function OfficePackages({ officeId, officeName }: OfficePackagesProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const getPackages = async () => {
      try {
        setIsLoading(true);
        const response = await fetchOfficePackages(officeId);
        
        if (response.status && response.data) {
          setPackages(response.data);
        } else {
          setError('فشل في تحميل الباقات');
        }
      } catch (err) {
        console.error('Error fetching office packages:', err);
        setError('حدث خطأ أثناء تحميل باقات المكتب');
      } finally {
        setIsLoading(false);
      }
    };

    getPackages();
  }, [officeId]);

  const handleBookPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDetailsModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPackage(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">باقات المكتب</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="bg-muted/50 p-6 rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-2">لا توجد باقات متاحة</h2>
        <p className="text-muted-foreground">
          لم يقم هذا المكتب بإضافة أي باقات عمرة حتى الآن، يرجى التحقق لاحقاً أو التواصل مع المكتب مباشرة.
        </p>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {officeName ? `باقات ${officeName}` : 'باقات المكتب'}
        </h2>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 mb-6">
        <p className="text-sm">
          <strong>ملاحظة:</strong> يمكنك مشاهدة تفاصيل الباقات والحجز مباشرة. في حال وجود أي استفسارات يمكنك التواصل مع المكتب.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="overflow-hidden">
            {/* Conditional image display */}
            {pkg.cover_image && (
              <div className="relative h-48 w-full cursor-pointer" onClick={() => handleViewDetails(pkg)}>
                <Image 
                  src={getImageUrl(pkg.cover_image)} 
                  alt={pkg.name} 
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-package-cover.png';
                  }}
                />
                {pkg.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500 hover:bg-amber-600">مميز</Badge>
                  </div>
                )}
              </div>
            )}
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl cursor-pointer hover:text-primary" onClick={() => handleViewDetails(pkg)}>
                  {pkg.name}
                </CardTitle>
                <Badge variant="outline" className={getAvailabilityColor(pkg.availability_status)}>
                  {getAvailabilityText(pkg.availability_status, pkg.available_slots)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {pkg.description && (
                <p className="text-muted-foreground line-clamp-2">{pkg.description}</p>
              )}
              
              <div className="flex flex-wrap gap-3">
                {pkg.duration_days && (
                  <div className="inline-flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{pkg.duration_days} أيام</span>
                  </div>
                )}
                
                {pkg.max_persons && (
                  <div className="inline-flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md text-sm">
                    <Users className="w-4 h-4" />
                    <span>{pkg.max_persons} أشخاص</span>
                  </div>
                )}
              </div>
              
              {/* Package includes - showing only first 3 */}
              {pkg.includes && pkg.includes.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-medium text-sm">تشمل الباقة:</h4>
                  <ul className="space-y-1">
                    {pkg.includes.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                    {pkg.includes.length > 3 && (
                      <li className="text-sm text-muted-foreground text-center">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto" 
                          onClick={() => handleViewDetails(pkg)}
                        >
                          عرض المزيد...
                        </Button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="font-bold text-xl">{formatCurrency(pkg.price, pkg.currency)}</div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(pkg)}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>التفاصيل</span>
                </Button>
                <Button 
                  disabled={pkg.availability_status === 'sold_out'}
                  onClick={() => handleBookPackage(pkg)}
                  size="sm"
                >
                  {pkg.availability_status === 'sold_out' ? 'نفذت المقاعد' : 'حجز الباقة'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <>
          <PackageDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            package={selectedPackage}
            onBookNow={handleBookPackage}
            officeName={officeName || ''}
          />

          <BookingModal
            isOpen={isBookingModalOpen}
            onClose={handleCloseBookingModal}
            package={selectedPackage}
            officeName={officeName || ''}
          />
        </>
      )}
    </div>
  );
} 