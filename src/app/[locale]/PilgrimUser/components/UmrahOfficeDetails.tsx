import { ArrowRight, Clock, Mail, MapPin, Phone, Star, Globe, Instagram, Facebook, Twitter } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Office } from '../services/officesService';
import { OfficePackages } from '@/app/[locale]/PilgrimUser/components/OfficePackages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getImageUrl } from '../utils/imageUtils';

interface UmrahOfficeDetailsProps {
  office: Office;
  onBack: () => void;
}

export const UmrahOfficeDetails = ({ office, onBack }: UmrahOfficeDetailsProps) => {
  // Get gallery images
  const galleryImages = office.gallery || [];
  const featuredGalleryImage = galleryImages.find(item => item.is_featured);
  const coverImagePath = featuredGalleryImage?.image_path || office.logo;
  const coverImage = getImageUrl(coverImagePath);
  const defaultImage = '/images/default-office-cover.png';
  
  // Format verification status
  const getVerificationStatus = () => {
    switch (office.verification_status) {
      case 'verified':
        return {
          label: 'موثق',
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'pending':
        return {
          label: 'قيد المراجعة',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'rejected':
        return {
          label: 'مرفوض',
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          label: 'غير معروف',
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };
  
  const verificationStatus = getVerificationStatus();
  
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى المكاتب</span>
        </Button>
      </div>
      
      <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden">
        <Image
          src={coverImage}
          alt={office.office_name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultImage;
          }}
        />
        
        {office.is_featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber-500 hover:bg-amber-600">مكتب مميز</Badge>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{office.office_name}</h1>
          <Badge variant="outline" className={verificationStatus.className}>
            {verificationStatus.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <span className="font-bold">{office.rating}</span>
          <span className="text-muted-foreground">({office.reviews_count} تقييم)</span>
        </div>
      </div>
      
      {office.license_number && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            رقم الترخيص: {office.license_number}
          </Badge>
          {office.license_expiry_date && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              تاريخ انتهاء الترخيص: {new Date(office.license_expiry_date).toLocaleDateString('ar-SA')}
            </Badge>
          )}
        </div>
      )}
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="info">معلومات المكتب</TabsTrigger>
          <TabsTrigger value="packages">باقات العمرة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-6 flex-1">
              {(office.description || office.services_offered) && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-2">نبذة عن المكتب</h2>
                    <p className="text-muted-foreground">{office.description || "لا يوجد وصف متاح"}</p>
                    
                    {office.services_offered && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">الخدمات المقدمة</h3>
                        <p className="text-muted-foreground">{office.services_offered}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {galleryImages.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">معرض الصور</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {galleryImages.map((item, index) => (
                        <div key={item.id || index} className="aspect-square relative rounded-md overflow-hidden">
                          <Image
                            src={getImageUrl(item.image_path)}
                            alt={item.description || `صورة ${index + 1}`}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="w-full md:w-80 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h2 className="text-xl font-semibold">معلومات الاتصال</h2>
                  
                  {office.address && (
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <p>{office.address}</p>
                        {(office.city || office.state || office.country) && (
                          <p>{[office.city, office.state, office.country].filter(Boolean).join(', ')}</p>
                        )}
                        {office.postal_code && <p>الرمز البريدي: {office.postal_code}</p>}
                      </div>
                    </div>
                  )}
                  
                  {office.contact_number && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-5 h-5 shrink-0" />
                      <span dir="ltr">{office.contact_number}</span>
                    </div>
                  )}
                  
                  {office.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-5 h-5 shrink-0" />
                      <span dir="ltr">{office.email}</span>
                    </div>
                  )}
                  
                  {office.website && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Globe className="w-5 h-5 shrink-0" />
                      <a 
                        href={office.website.startsWith('http') ? office.website : `https://${office.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary truncate"
                      >
                        {office.website}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3 mt-2">
                    {office.facebook_url && (
                      <a 
                        href={office.facebook_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    
                    {office.twitter_url && (
                      <a 
                        href={office.twitter_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:text-sky-700"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    
                    {office.instagram_url && (
                      <a 
                        href={office.instagram_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-5 h-5 shrink-0" />
                    <div>
                      <p>تاريخ الانضمام</p>
                      <p className="font-medium text-foreground">{new Date(office.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {(office.whatsapp || office.contact_number) && (
                <Button size="lg" className="w-full" asChild>
                  <a href={`https://wa.me/${office.whatsapp || office.contact_number}`} target="_blank" rel="noopener noreferrer">
                    تواصل مع المكتب
                  </a>
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="packages">
          <OfficePackages officeId={office.id} officeName={office.office_name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 