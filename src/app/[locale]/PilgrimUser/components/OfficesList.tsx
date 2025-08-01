'use client';

import { useState } from 'react';
import { useGetOfficesQuery } from '../redux/officesApi';
import { MapPin, Phone, Star, Search } from 'lucide-react';
import Image from 'next/image';
import { OfficeWithPackages } from '../types';
import { OfficeDetails } from './OfficeDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Sample data for testing
const sampleOffices: OfficeWithPackages[] = [
  {
    id: "1",
    office_name: "مكتب النور للخدمات اللوجستية",
    description: "نقل - تخليص جمركي - تسويق - تأجير سيارات",
    address: "مكة المكرمة",
    contact_number: "0555555555",
    logo: "/images/alnoor-logo.png",
    rating: 4.8,
    packages: [
      {
        id: "1",
        name: "الباقة الفردية",
        price: 600,
        description: "تشمل السكن والمواصلات"
      },
      {
        id: "2",
        name: "الباقة العائلية",
        price: 2400,
        description: "تشمل السكن والمواصلات لأربعة أشخاص"
      }
    ]
  },
  {
    id: "2",
    office_name: "مكتب السلام للعمرة",
    description: "خدمات عمرة متكاملة مع أفضل الفنادق والمواصلات",
    address: "المدينة المنورة",
    contact_number: "0566666666",
    logo: "/images/alsalam-logo.png",
    rating: 4.9,
    packages: [
      {
        id: "3",
        name: "باقة VIP",
        price: 1500,
        description: "خدمات فاخرة مع سكن خمس نجوم"
      }
    ]
  }
];

export const OfficesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: offices = sampleOffices, isLoading, error } = useGetOfficesQuery();
  const [selectedOffice, setSelectedOffice] = useState<OfficeWithPackages | null>(null);

  const filteredOffices = offices?.filter(office =>
    office.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedOffice) {
    return <OfficeDetails office={selectedOffice} onBack={() => setSelectedOffice(null)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">جاري تحميل المكاتب...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="rounded-full h-12 w-12 bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-center text-primary mb-6">مكاتب العمرة</h1>
      
      {/* حقل البحث */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن مكتب عمرة..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* قائمة المكاتب */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffices?.map((office) => (
          <Card key={office.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{office.office_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <p className="text-muted-foreground line-clamp-2">{office.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{office.rating || 0}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedOffice(office)}
                >
                  عرض التفاصيل
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{office.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{office.contact_number}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 