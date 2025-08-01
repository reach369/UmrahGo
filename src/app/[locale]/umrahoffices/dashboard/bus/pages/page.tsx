'use client';

import { useEffect } from 'react';
import { BusList } from '../components/BusList';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { Bus } from '../types/bus.types';

// بيانات افتراضية للباصات
const defaultBuses: Bus[] = [
  {
    id: 1,
    operator_id: 1,
    type_id: 1,
    model: 'مرسيدس 2023',
    year: 2023,
    capacity: 45,
    price: 500000.00,
    condition: 'جديد',
    location_lat: 24.7136,
    location_lng: 46.6753,
    status: 'available',
    created_at: '2024-03-26T12:00:00Z'
  },
  {
    id: 2,
    operator_id: 1,
    type_id: 2,
    model: 'فولفو 2022',
    year: 2022,
    capacity: 50,
    price: 450000.00,
    condition: 'مستعمل',
    location_lat: 21.4225,
    location_lng: 39.8262,
    status: 'rented',
    created_at: '2024-03-25T12:00:00Z'
  }
];

export default function BusManagementPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { buses, loading, error } = useSelector((state: RootState) => state.bus);

  useEffect(() => {
    dispatch({ type: 'bus/setBuses', payload: defaultBuses });
  }, [dispatch]);

  const handleDelete = async (busId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الباص؟')) return;

    try {
      dispatch({ type: 'bus/deleteBus', payload: busId });
    } catch (error) {
      console.error('Error deleting bus:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">جاري تحميل الباصات...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة الباصات</h1>
        <button
          onClick={() => router.push('/ar/umrah-offices/dashboard/bus/manage')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          إضافة باص جديد
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(!buses || buses.length === 0) ? (
        <div className="text-center text-gray-500">لا توجد باصات متاحة</div>
      ) : (
        <div className=" rounded-lg shadow-md p-6">
          <BusList
            buses={buses}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
} 