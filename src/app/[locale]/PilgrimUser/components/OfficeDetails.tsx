'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Star, Bus, Calendar, Users, Home, Coffee } from 'lucide-react';
import Image from 'next/image';
import { OfficeWithPackages } from '../types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OfficeDetailsProps {
  office: OfficeWithPackages;
  onBack: () => void;
}

export function OfficeDetails({ office, onBack }: OfficeDetailsProps) {
  const router = useRouter();

  const handleBooking = () => {
    toast.success('تم اختيار المكتب بنجاح!');
    router.push('/PilgrimUser/booking');
  };

  const features = [
    {
      id: 'transportation',
      icon: <Bus className="w-5 h-5" />,
      title: "المواصلات",
      description: "باصات VIP مكيفة ومريحة"
    },
    {
      id: 'accommodation',
      icon: <Home className="w-5 h-5" />,
      title: "السكن",
      description: "فنادق فاخرة قريبة من الحرم"
    },
    {
      id: 'meals',
      icon: <Coffee className="w-5 h-5" />,
      title: "الوجبات",
      description: "وجبات متنوعة ومشروبات"
    },
    {
      id: 'guides',
      icon: <Users className="w-5 h-5" />,
      title: "المرشدين",
      description: "مرشدين ذوي خبرة"
    }
  ];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          عودة للمكاتب
        </Button>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <span className="font-semibold">{office.rating} / 5</span>
        </div>
      </div>

      {/* معلومات المكتب */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={office.logo}
              alt={office.office_name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default-office-logo.png';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{office.office_name}</h1>
            <p className="text-gray-600">{office.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span>{office.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <span dir="ltr">{office.contact_number}</span>
            </div>
          </div>
        </div>

        {/* المميزات */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <Card key={feature.id}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* الباقات المتوفرة */}
      <div>
        <h2 className="text-xl font-bold mb-4">الباقات المتوفرة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {office.packages.map((pkg) => (
            <Card key={pkg.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{pkg.name}</h3>
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{pkg.price} ريال</span>
                    <Button onClick={handleBooking}>
                      احجز الآن
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>مدة الرحلة: 7 أيام</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bus className="w-4 h-4 text-gray-500" />
                      <span>باص VIP مكيف</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Home className="w-4 h-4 text-gray-500" />
                      <span>فندق 5 نجوم</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* معلومات الباصات */}
      <div>
        <h2 className="text-xl font-bold mb-4">معلومات الباصات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">باص VIP</h3>
                    <p className="text-sm text-gray-600">50 مقعد</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• مكيف بالكامل</li>
                  <li>• مقاعد مريحة قابلة للتحكم</li>
                  <li>• نظام ترفيهي</li>
                  <li>• خدمة واي فاي</li>
                  <li>• ثلاجة للمشروبات</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">باص عائلي</h3>
                    <p className="text-sm text-gray-600">30 مقعد</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• مناسب للعائلات</li>
                  <li>• مساحة إضافية للأمتعة</li>
                  <li>• مقاعد مريحة</li>
                  <li>• نظام تكييف متطور</li>
                  <li>• سائق محترف</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* زر الحجز الرئيسي */}
      <div className="sticky bottom-0  p-4 border-t">
        <Button 
          className="w-full"
          size="lg"
          onClick={handleBooking}
        >
          احجز رحلتك الآن
        </Button>
      </div>
    </div>
  );
} 