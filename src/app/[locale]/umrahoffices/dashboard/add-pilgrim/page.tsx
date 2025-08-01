'use client';

import { BookingForm } from '../../components/BookingForm';
import { AlertCircle } from 'lucide-react';

export default function AddPilgrimPage() {
  return (
    <div className="container mx-auto py-8 px-4 min-h-screen bg-background">
      {/* API Status Banner */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-bold text-red-800">حالة الاتصال بـ API</h3>
            <p className="text-red-700">
              ❌ هذه الصفحة تستخدم بيانات افتراضية وليست متصلة بـ API حقيقي
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">إضافة معتمر جديد</h1>
        <div className=" dark:bg-slate-950 rounded-lg shadow-lg p-6 border">
          <BookingForm />
        </div>
      </div>
    </div>
  );
} 