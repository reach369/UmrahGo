'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Bus, Star, Building2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

// Mock data for demonstration (should be replaced with API call in real app)
const operators = [
  {
    id: 1,
    name: 'شركة النقل السريع',
    contact: '+966 50 123 4567',
    email: 'info@fasttransport.com',
    location: 'الرياض',
    buses: 15,
    status: 'active',
    rating: 4.8,
    license: 'TR-2024-001',
    availableBuses: 8,
    pricePerKm: 2.5,
    specialties: ['رحلات العمرة', 'رحلات الحج', 'رحلات سياحية'],
    workingHours: '24/7',
    lastActive: 'منذ 5 دقائق',
    fleetDetails: {
      luxury: 5,
      standard: 8,
      economy: 2
    },
    description: 'شركة متخصصة في نقل الحجاج والمعتمرين بأحدث الباصات وأعلى معايير السلامة.',
    services: 'نقل جماعي، نقل VIP، جولات سياحية، خدمات خاصة للشركات',
    gallery: [
      '/public/images/nor.jpeg',
      '/public/images/rahme.jpeg',
    ]
  },
  {
    id: 2,
    name: 'مؤسسة الرحلات المميزة',
    contact: '+966 50 987 6543',
    email: 'contact@luxurytrips.com',
    location: 'جدة',
    buses: 10,
    status: 'active',
    rating: 4.5,
    license: 'TR-2024-002',
    availableBuses: 6,
    pricePerKm: 3.0,
    specialties: ['رحلات VIP', 'رحلات العمرة', 'رحلات سياحية'],
    workingHours: '24/7',
    lastActive: 'منذ ساعة',
    fleetDetails: {
      luxury: 8,
      standard: 2,
      economy: 0
    },
    description: 'نقدم خدمات نقل فاخرة ومريحة لجميع المناسبات والرحلات.',
    services: 'نقل VIP، جولات سياحية، خدمات خاصة للشركات',
    gallery: [
      '/public/images/nor.jpeg',
      '/public/images/rahme.jpeg',
    ]
  },
  {
    id: 3,
    name: 'شركة النقل الآمن',
    contact: '+966 50 456 7890',
    email: 'support@safetransport.com',
    location: 'مكة المكرمة',
    buses: 20,
    status: 'inactive',
    rating: 4.2,
    license: 'TR-2024-003',
    availableBuses: 0,
    pricePerKm: 2.0,
    specialties: ['رحلات العمرة', 'رحلات الحج', 'رحلات جماعية'],
    workingHours: '24/7',
    lastActive: 'منذ 3 ساعات',
    fleetDetails: {
      luxury: 3,
      standard: 12,
      economy: 5
    },
    description: 'نلتزم بتوفير أعلى معايير الأمان والراحة في جميع رحلاتنا.',
    services: 'نقل جماعي، نقل خاص، خدمات للشركات',
    gallery: [
      '/public/images/nor.jpeg',
      '/public/images/rahme.jpeg',
    ]
  },
];

export default function BusOperatorProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Expecting ?id=1 or similar in the URL
  let id: number | null = null;
  if (searchParams) {
    const idParam = searchParams.get('id');
    id = idParam ? Number(idParam) : null;
  }
  const operator = (id && operators.find(op => op.id === id)) || operators[0];

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <Button
        variant="outline"
        className="mb-6 flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowRight className="h-5 w-5 rtl:rotate-180" />
        العودة لقائمة المشغلين
      </Button>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">{operator.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{operator.contact}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{operator.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{operator.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span>رخصة: {operator.license}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>{operator.rating} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-blue-500" />
                <span>عدد الباصات: {operator.buses}</span>
                <Badge className={operator.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}>
                  {operator.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>الباصات المتاحة: {operator.availableBuses}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>سعر الكيلومتر: {operator.pricePerKm} ريال</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span>التخصصات:</span>
                {operator.specialties.map((spec, i) => (
                  <Badge key={i} className="bg-blue-100 text-blue-700 mx-1">{spec}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span>ساعات العمل: {operator.workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>آخر تواجد: {operator.lastActive}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="font-semibold mb-2">تفاصيل الأسطول:</div>
              <div className="flex gap-4">
                <Badge className="bg-yellow-100 text-yellow-700">فاخر: {operator.fleetDetails.luxury}</Badge>
                <Badge className="bg-gray-100 text-gray-700">عادي: {operator.fleetDetails.standard}</Badge>
                <Badge className="bg-green-100 text-green-700">اقتصادي: {operator.fleetDetails.economy}</Badge>
              </div>
              <div className="mt-6">
                <div className="font-semibold mb-2">وصف الشركة:</div>
                <p className="text-muted-foreground mb-2">{operator.description}</p>
                <div className="font-semibold mb-2">الخدمات المقدمة:</div>
                <p className="text-muted-foreground mb-2">{operator.services}</p>
              </div>
              <div className="mt-6">
                <div className="font-semibold mb-2">معرض الصور:</div>
                <div className="flex gap-4 flex-wrap">
                  {operator.gallery.map((img, i) => (
                    <div key={i} className="w-32 h-24 rounded-lg overflow-hidden border">
                      <Image src={img.replace('/public', '')} alt={operator.name} width={128} height={96} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 