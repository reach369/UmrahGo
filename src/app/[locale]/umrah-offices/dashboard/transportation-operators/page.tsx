'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Bus, Clock, User, MessageSquare, Calendar, Star, Building2, Filter, Search, MessageCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Mock data for transportation operators with more realistic details
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
    }
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
    }
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
    }
  },
];

export default function TransportationOperatorsPage() {
  const [selectedOperator, setSelectedOperator] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [messageType, setMessageType] = useState<'general' | 'booking' | 'complaint'>('general');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!selectedOperator || !subject || !message) return;

    const operator = operators.find(op => op.id === selectedOperator);
    if (!operator) return;

    // Simulate sending message
    toast({
      title: "تم إرسال الرسالة بنجاح",
      description: `تم إرسال رسالتك إلى ${operator.name}`,
    });

    // Reset form
    setMessage('');
    setSubject('');
    setMessageType('general');
    setUrgency('low');
  };

  const getSelectedOperator = () => {
    return operators.find(op => op.id === selectedOperator);
  };

  // Filter operators based on search and filters
  const filteredOperators = operators.filter(operator => {
    const matchesSearch = operator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         operator.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || operator.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || operator.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter
  const locations = Array.from(new Set(operators.map(op => op.location)));

  const handleWhatsAppClick = (phone: string) => {
    // Remove any non-numeric characters from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    // Open WhatsApp with the phone number
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* API Status Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <div>
          <h3 className="font-bold text-red-800">حالة الاتصال بـ API</h3>
          <p className="text-red-700">
            ❌ هذه الصفحة تستخدم بيانات افتراضية ثابتة داخل الكود وليست متصلة بـ API حقيقي
          </p>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">إدارة مشغلي الباصات</h1>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن شركة أو موقع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="حالة النشاط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الموقع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operators List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary mb-4">مشغلو الباصات المتاحون</h2>
          {filteredOperators.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4" />
                <p>لم يتم العثور على نتائج تطابق معايير البحث</p>
              </CardContent>
            </Card>
          ) : (
            filteredOperators.map((operator) => (
              <Card 
                key={operator.id}
                className={`cursor-pointer transition-all ${
                  selectedOperator === operator.id ? 'border-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedOperator(operator.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{operator.name}</h3>
                      <div className="flex items-center text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4 ml-1" />
                        <span>{operator.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={operator.status === 'active' ? 'default' : 'secondary'}>
                        {operator.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppClick(operator.contact);
                        }}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 ml-1" />
                      <span>{operator.contact}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 ml-1" />
                      <span>{operator.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Bus className="h-4 w-4 ml-1" />
                      <span>{operator.availableBuses} باص متاح</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 ml-1" />
                      <span>{operator.rating} ⭐</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 ml-1" />
                      <span>الترخيص: {operator.license}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4 ml-1" />
                      <span>آخر نشاط: {operator.lastActive}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">تفاصيل الأسطول:</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">VIP: {operator.fleetDetails.luxury}</Badge>
                      <Badge variant="outline">عادي: {operator.fleetDetails.standard}</Badge>
                      <Badge variant="outline">اقتصادي: {operator.fleetDetails.economy}</Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">التخصصات:</h4>
                    <div className="flex flex-wrap gap-2">
                      {operator.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Communication Form */}
        <Card>
          <CardHeader>
            <CardTitle>إرسال رسالة</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedOperator ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">نوع الرسالة</label>
                  <Select value={messageType} onValueChange={(value: 'general' | 'booking' | 'complaint') => setMessageType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر نوع الرسالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">رسالة عامة</SelectItem>
                      <SelectItem value="booking">طلب حجز</SelectItem>
                      <SelectItem value="complaint">شكوى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">مستوى الأولوية</label>
                  <Select value={urgency} onValueChange={(value: 'low' | 'medium' | 'high') => setUrgency(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر مستوى الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">عالٍ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">الموضوع</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="أدخل موضوع الرسالة"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">الرسالة</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="mt-1 min-h-[200px]"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>سيتم إرسال الرسالة إلى: {getSelectedOperator()?.name}</span>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendMessage}
                  disabled={!subject || !message}
                >
                  إرسال الرسالة
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>الرجاء اختيار شركة نقل للتواصل معها</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
} 