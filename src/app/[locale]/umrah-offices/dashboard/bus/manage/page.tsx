'use client';

import { useState } from 'react';
import { BusForm } from '../components/BusForm';
import { BusFormData, BusType } from '../types/bus.types';
import { useRouter } from 'next/navigation';

// Mock bus types data
const mockBusTypes: BusType[] = [
  { 
    id: 1, 
    name: 'حافلة كبيرة VIP',
    description: 'حافلة فاخرة مزودة بجميع وسائل الراحة'
  },
  { 
    id: 2, 
    name: 'حافلة متوسطة',
    description: 'حافلة اقتصادية مناسبة للرحلات القصيرة'
  },
  { 
    id: 3, 
    name: 'حافلة صغيرة',
    description: 'حافلة مثالية للمجموعات الصغيرة'
  },
];

export default function AddBusPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: BusFormData) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Submitting bus:', formData);
      router.push('/umrah-offices/dashboard/bus/pages');
    } catch (error) {
      console.error('Error submitting bus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إضافة باص جديد</h1>
        <button
          onClick={() => router.push('/umrah-offices/dashboard/bus/pages')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          العودة للقائمة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <BusForm
          onSubmit={handleSubmit}
          busTypes={mockBusTypes}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 