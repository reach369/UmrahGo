'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRegisterCompanyMutation } from '../redux/busApiSlice';
import { useRouter } from 'next/navigation';

export default function BusRegistrationPage() {
  const t = useTranslations('BusManagement');
  const router = useRouter();
  const [registerCompany, { isLoading }] = useRegisterCompanyMutation();
  
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    commercialRegister: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerCompany(formData).unwrap();
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

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium mb-2">
              اسم الشركة
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="ownerName" className="block text-sm font-medium mb-2">
              اسم المالك
            </label>
            <input
              type="text"
              id="ownerName"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="commercialRegister" className="block text-sm font-medium mb-2">
              رقم السجل التجاري
            </label>
            <input
              type="text"
              id="commercialRegister"
              value={formData.commercialRegister}
              onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              العنوان
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
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