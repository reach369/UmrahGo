import { useState } from 'react';
import RegisterOperator from '@/components/RegisterOperator';
import RegisterOffice from '@/components/RegisterOffice';

export default function RegisterPage() {
  const [selectedType, setSelectedType] = useState<'operator' | 'office' | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h2>
          <p className="text-gray-600">اختر نوع الحساب الذي تريد إنشاءه</p>
        </div>

        {!selectedType ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedType('operator')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
            >
              تسجيل كمشغل
            </button>
            <button
              onClick={() => setSelectedType('office')}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-200"
            >
              تسجيل كمكتب
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <button
                onClick={() => setSelectedType(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ← رجوع للخيارات
              </button>
            </div>
            {selectedType === 'operator' ? <RegisterOperator /> : <RegisterOffice />}
          </div>
        )}
      </div>
    </div>
  );
} 