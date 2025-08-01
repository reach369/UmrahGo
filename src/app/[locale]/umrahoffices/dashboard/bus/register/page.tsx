'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRegisterCompanyMutation } from '../redux/busApiSlice';
import { useRouter } from 'next/navigation';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { validatePhoneNumber } from '@/utils/phone-utils';
import { Controller, useForm } from 'react-hook-form';
import type { E164Number } from 'libphonenumber-js/core';

interface BusRegistrationFormData {
  companyName: string;
  ownerName: string;
  email: string;
  phone: E164Number;
  commercialRegister: string;
  address: string;
}

export default function BusRegistrationPage() {
  const t = useTranslations('BusManagement');
  const router = useRouter();
  const [registerCompany, { isLoading }] = useRegisterCompanyMutation();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    control,
    reset 
  } = useForm<BusRegistrationFormData>();

  const handleFormSubmit = async (data: BusRegistrationFormData) => {
    try {
      await registerCompany(data).unwrap();
      // بعد نجاح التسجيل، انتقل إلى صفحة إدارة الباصات
      router.push('/umrah-offices/dashboard/bus/manage');
    } catch (error) {
      console.error('Failed to register company:', error);
      // TODO: إظهار رسالة خطأ للمستخدم
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">تسجيل شركة نقل جديدة</h1>
        <p className="text-gray-600 dark:text-gray-300">قم بإدخال بيانات شركة النقل للبدء في تقديم خدماتك</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6  dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium mb-2">
              اسم الشركة
            </label>
            <input
              type="text"
              id="companyName"
              {...register('companyName', { required: 'اسم الشركة مطلوب' })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName.message}</p>}
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium mb-2">
              اسم المالك
            </label>
            <input
              type="text"
              id="ownerName"
              {...register('ownerName', { required: 'اسم المالك مطلوب' })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.ownerName && <p className="text-red-500 text-sm">{errors.ownerName.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { required: 'البريد الإلكتروني مطلوب' })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {/* Phone Number Field - Replace with our new component */}
          <div className="mb-4">
            <Controller
              name="phone"
              control={control}
              rules={{
                required: "رقم الهاتف مطلوب",
                validate: (value) => validatePhoneNumber(value) || "رقم الهاتف غير صالح"
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <PhoneNumberInput
                  id="phone"
                  label="رقم الهاتف"
                  defaultCountry="SA"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                  placeholder="أدخل رقم هاتف السائق"
                  required
                />
              )}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="commercialRegister" className="block text-sm font-medium mb-2">
              رقم السجل التجاري
            </label>
            <input
              type="text"
              id="commercialRegister"
              {...register('commercialRegister', { required: 'رقم السجل التجاري مطلوب' })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.commercialRegister && <p className="text-red-500 text-sm">{errors.commercialRegister.message}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              العنوان
            </label>
            <input
              type="text"
              id="address"
              {...register('address', { required: 'العنوان مطلوب' })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'جاري التسجيل...' : 'تسجيل الشركة'}
          </button>
        </div>
      </form>
    </div>
  );
} 