import { MapPin, Phone, Star } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Office } from '../services/officesService';
import { getImageUrl } from '../utils/imageUtils';

interface UmrahOfficeCardProps {
  office: Office;
  onViewDetails: (office: Office) => void;
}

export const UmrahOfficeCard = ({ office, onViewDetails }: UmrahOfficeCardProps) => {
  // Get featured image from gallery or use logo as fallback
  const featuredImagePath = office.gallery?.find(item => item.is_featured)?.image_path || office.logo;
  const featuredImage = getImageUrl(featuredImagePath);
  const defaultImage = '/images/default-office-cover.png';
  
  // Get verification status badge
  const getVerificationBadge = () => {
    switch (office.verification_status) {
      case 'verified':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            موثق
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            قيد المراجعة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200">
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <div className="aspect-video bg-muted relative">
        <Image
          src={featuredImage}
          alt={office.office_name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        {office.is_featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500 hover:bg-amber-600">مميز</Badge>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl line-clamp-1">{office.office_name}</CardTitle>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span>{office.rating}</span>
            <span className="text-muted-foreground text-xs">({office.reviews_count})</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-2 min-h-[48px]">
          {office.description || office.services_offered || "لا يوجد وصف متاح"}
        </p>
        
        {office.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">
              {[office.address, office.city, office.state, office.country].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
        
        {office.contact_number && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span dir="ltr">{office.contact_number}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          {getVerificationBadge()}
          
          <Button 
            onClick={() => onViewDetails(office)}
            variant="default"
          >
            عرض التفاصيل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 