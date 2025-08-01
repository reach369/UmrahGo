'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Crown, AlertCircle } from 'lucide-react';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { validatePhoneNumber } from '@/utils/phone-utils';
import type { E164Number } from 'libphonenumber-js/core';

interface Passenger {
  name: string;
  passport_number: string;
  nationality: string;
  age: number;
  phone: string;
  gender: 'male' | 'female';
}

interface PassengerFormProps {
  passengers: Passenger[];
  setPassengers: (passengers: Passenger[]) => void;
  numberOfPersons: number;
  t: any;
  className?: string;
  updatePassenger?: (index: number, field: string, value: any) => void;
}

export default function PassengerForm({ 
  passengers, 
  setPassengers, 
  numberOfPersons, 
  t,
  className = '',
  updatePassenger: externalUpdatePassenger
}: PassengerFormProps) {
  const updatePassenger = externalUpdatePassenger || ((index: number, field: keyof Passenger, value: string | number) => {
    const newPassengers = [...passengers];
    if (newPassengers[index]) {
      newPassengers[index] = {
        ...newPassengers[index],
        [field]: value
      };
      setPassengers(newPassengers);
    }
  });

  // التأكد من وجود البيانات للعدد المطلوب من المعتمرين
  const ensurePassengersLength = () => {
    if (passengers.length < numberOfPersons) {
      const newPassengers = [...passengers];
      for (let i = passengers.length; i < numberOfPersons; i++) {
        newPassengers.push({
          name: '',
          passport_number: '',
          nationality: '',
          age: 30,
          phone: '',
          gender: 'male'
        });
      }
      setPassengers(newPassengers);
    }
  };

  // التأكد من وجود البيانات عند تحميل المكون
  React.useEffect(() => {
    ensurePassengersLength();
  }, [numberOfPersons]);

  // عرض المعتمرين بناءً على العدد المحدد
  const displayedPassengers = passengers.slice(0, numberOfPersons);

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`py-4 md:py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}
    >
      <div className="container mx-auto px-3 md:px-4 lg:px-6">
        <Card className="border-0 shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden bg-gray-800 border-gray-700">
          <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 md:p-6 lg:p-8 border-b border-gray-700">
            <CardTitle className="flex items-center gap-2 md:gap-3 text-white text-lg md:text-xl lg:text-2xl font-bold">
              <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-primary/30 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-primary" />
              </div>
              {t('packages.passengerDetails') || 'بيانات المعتمرين'}
            </CardTitle>
            <p className="text-gray-400 mt-2 text-xs md:text-sm lg:text-base">
              {t('packages.passengerDetailsDesc') || 'يرجى إدخال بيانات جميع المعتمرين بدقة لضمان سلامة الحجز'}
            </p>
          </CardHeader>
          
          <CardContent className="p-3 md:p-4 lg:p-8 bg-gray-800">
            <div className="space-y-4 md:space-y-6">
              {displayedPassengers.map((passenger, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 md:p-4 lg:p-6 border border-gray-600 rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-2 md:gap-3">
                    <h4 className="font-bold text-base md:text-lg lg:text-xl text-white flex items-center gap-2 md:gap-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <span className="text-sm md:text-base lg:text-lg">
                        {t('packages.passenger') || 'معتمر'} {index + 1}
                      </span>
                    </h4>
                    {index === 0 && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-fit text-xs md:text-sm px-3 py-1 rounded-full shadow-lg">
                        <Crown className="h-3 w-3 mr-1" />
                        {t('packages.mainPassenger') || 'المعتمر الرئيسي'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Form Fields */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`name-${index}`} className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-1">
                          {t('packages.fullName') || 'الاسم الكامل'} 
                          <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id={`name-${index}`}
                          value={passenger.name}
                          onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                          placeholder={t('packages.fullNamePlaceholder') || 'أدخل الاسم الكامل'}
                          className="w-full h-10 md:h-11 lg:h-12 rounded-lg md:rounded-xl border-gray-500 bg-gray-800 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm md:text-base transition-all duration-300"
                          required
                        />
                      </div>
                      
                      {/* Passport Number */}
                      <div className="space-y-2">
                        <Label htmlFor={`passport-${index}`} className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-1">
                          {t('packages.passportNumber') || 'رقم الجواز'} 
                          <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id={`passport-${index}`}
                          value={passenger.passport_number}
                          onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)}
                          placeholder={t('packages.passportNumberPlaceholder') || 'A1234567'}
                          className="w-full h-10 md:h-11 lg:h-12 rounded-lg md:rounded-xl border-gray-500 bg-gray-800 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm md:text-base transition-all duration-300"
                          required
                        />
                      </div>
                      
                      {/* Nationality */}
                      <div className="space-y-2">
                        <Label htmlFor={`nationality-${index}`} className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-1">
                          {t('packages.nationality') || 'الجنسية'} 
                          <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id={`nationality-${index}`}
                          value={passenger.nationality}
                          onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                          placeholder={t('packages.nationalityPlaceholder') || 'المملكة العربية السعودية'}
                          className="w-full h-10 md:h-11 lg:h-12 rounded-lg md:rounded-xl border-gray-500 bg-gray-800 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm md:text-base transition-all duration-300"
                          required
                        />
                      </div>
                      
                      {/* Age */}
                      <div className="space-y-2">
                        <Label htmlFor={`age-${index}`} className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-1">
                          {t('packages.age') || 'العمر'} 
                          <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id={`age-${index}`}
                          type="number"
                          min="1"
                          max="120"
                          value={passenger.age || ''}
                          onChange={(e) => updatePassenger(index, 'age', parseInt(e.target.value) || 0)}
                          placeholder={t('packages.agePlaceholder') || '30'}
                          className="w-full h-10 md:h-11 lg:h-12 rounded-lg md:rounded-xl border-gray-500 bg-gray-800 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm md:text-base transition-all duration-300"
                          required
                        />
                      </div>
                      
                      {/* Phone Number */}
                      <div className="space-y-2">
                        <PhoneNumberInput
                          id={`phone-${index}`}
                          label={t('packages.phoneNumber') || 'رقم الهاتف'}
                          required
                          value={passenger.phone || ''}
                          onChange={(value) => updatePassenger(index, 'phone', value || '')}
                          defaultCountry="SA"
                          placeholder={t('packages.phonePlaceholder') || '+966501234567'}
                          className="w-full"
                          inputClassName="h-10 md:h-11 lg:h-12 rounded-lg md:rounded-xl border-gray-500 bg-gray-800 text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20 text-sm md:text-base transition-all duration-300"
                          labelClassName="text-xs md:text-sm font-medium text-gray-300"
                          errorClassName="text-xs text-red-400"
                          error={passenger.phone && !validatePhoneNumber(passenger.phone) ? (t('validation.phoneInvalid') || 'رقم الهاتف غير صالح') : undefined}
                        />
                      </div>
                      
                      {/* Gender */}
                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-1">
                          {t('packages.gender') || 'الجنس'} 
                          <span className="text-red-400">*</span>
                        </Label>
                        <RadioGroup 
                          value={passenger.gender} 
                          onValueChange={(value) => updatePassenger(index, 'gender', value)}
                          className="flex space-x-4 md:space-x-6 rtl:space-x-reverse"
                        >
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <RadioGroupItem value="male" id={`male-${index}`} className="border-gray-500 text-primary" />
                            <Label htmlFor={`male-${index}`} className="text-xs md:text-sm font-medium text-gray-300 cursor-pointer">
                              {t('packages.male') || 'ذكر'}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <RadioGroupItem value="female" id={`female-${index}`} className="border-gray-500 text-primary" />
                            <Label htmlFor={`female-${index}`} className="text-xs md:text-sm font-medium text-gray-300 cursor-pointer">
                              {t('packages.female') || 'أنثى'}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Important Note */}
            <Alert className="mt-6 md:mt-8 border-amber-600 bg-gradient-to-r from-amber-900/50 to-yellow-900/50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-xs md:text-sm text-amber-300">
                <strong>{t('packages.importantNote') || 'ملاحظة مهمة'}:</strong> 
                {' '}
                {t('packages.passportNote') || 'يرجى التأكد من صحة بيانات الجوازات وتطابقها مع الجوازات الأصلية قبل السفر'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
    } 