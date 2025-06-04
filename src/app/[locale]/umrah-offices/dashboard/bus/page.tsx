'use client';

import { useState, useEffect } from 'react';
import { BusList } from './components/BusList';
import { Bus, BusFilters as BusFiltersType } from './types/bus.types';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BusFilters } from './components/BusFilters';
import { BusStats } from './components/BusStats';
import { BusMap } from './components/BusMap';

// Temporary mock data for testing
const mockBuses: Bus[] = [
  {
    id: 1,
    operator_id: 1,
    type_id: 1,
    model: 'مرسيدس بنز',
    year: 2022,
    capacity: 50,
    price: 500000,
    condition: 'new',
    status: 'available',
    verified: false,
    location_lat: 24.7136,
    location_lng: 46.6753,
    images: ['/images/bus1.jpg'],
    videos: [],
    features: ['WiFi', 'USB Charging', 'Air Conditioning'],
    amenities: ['Reclining Seats', 'Luggage Storage'],
    insurance: {
      provider: 'شركة التأمين الوطنية',
      policy_number: 'INS123456',
      expiry_date: '2024-12-31',
    },
    maintenance_history: [],
    seasonal_pricing: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    operator_id: 1,
    type_id: 2,
    model: 'تويوتا',
    year: 2021,
    capacity: 30,
    price: 300000,
    condition: 'used',
    status: 'available',
    verified: true,
    location_lat: 24.7236,
    location_lng: 46.6853,
    images: ['/images/bus2.jpg'],
    videos: [],
    features: ['Air Conditioning', 'USB Charging'],
    amenities: ['Reclining Seats'],
    insurance: {
      provider: 'شركة التأمين الوطنية',
      policy_number: 'INS123457',
      expiry_date: '2024-12-31',
    },
    maintenance_history: [
      {
        date: '2023-12-01',
        description: 'صيانة دورية',
        cost: 5000,
        next_maintenance_date: '2024-06-01',
      },
    ],
    seasonal_pricing: [
      {
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        price_multiplier: 1.2,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    operator_id: 1,
    type_id: 3,
    model: 'هينو',
    year: 2020,
    capacity: 45,
    price: 450000,
    condition: 'used',
    status: 'maintenance',
    verified: true,
    location_lat: 24.7336,
    location_lng: 46.6953,
    images: ['/images/bus3.jpg'],
    videos: [],
    features: ['WiFi', 'USB Charging', 'Air Conditioning'],
    amenities: ['Reclining Seats', 'Luggage Storage'],
    insurance: {
      provider: 'شركة التأمين الوطنية',
      policy_number: 'INS123458',
      expiry_date: '2024-12-31',
    },
    maintenance_history: [
      {
        date: '2024-01-15',
        description: 'إصلاح محرك',
        cost: 15000,
        next_maintenance_date: '2024-07-15',
      },
    ],
    seasonal_pricing: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    operator_id: 1,
    type_id: 1,
    model: 'مرسيدس بنز',
    year: 2023,
    capacity: 55,
    price: 600000,
    condition: 'new',
    status: 'rented',
    verified: true,
    location_lat: 24.7436,
    location_lng: 46.7053,
    images: ['/images/bus4.jpg'],
    videos: [],
    features: ['WiFi', 'USB Charging', 'Air Conditioning', 'Entertainment System'],
    amenities: ['Reclining Seats', 'Luggage Storage', 'Refreshment Center'],
    insurance: {
      provider: 'شركة التأمين الوطنية',
      policy_number: 'INS123459',
      expiry_date: '2024-12-31',
    },
    maintenance_history: [],
    seasonal_pricing: [
      {
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        price_multiplier: 1.3,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function BusManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BusFiltersType>({});
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    const fetchBuses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBuses(mockBuses);
      } catch (err) {
        console.error('Error fetching buses:', err);
        setError('حدث خطأ أثناء تحميل الباصات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchBuses();
    }
  }, [status, router]);

  const handleDelete = async (busId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الباص؟')) return;

    try {
      // TODO: Replace with actual API call
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== busId));
    } catch (error) {
      console.error('Error deleting bus:', error);
      alert('حدث خطأ أثناء حذف الباص. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleFilterChange = (newFilters: BusFiltersType) => {
    setFilters(newFilters);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-lg">جاري تحميل الباصات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            تحديث الصفحة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة الباصات</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            {viewMode === 'list' ? 'عرض الخريطة' : 'عرض القائمة'}
          </button>
          <button
            onClick={() => router.push('/umrah-offices/dashboard/bus/manage')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            إضافة باص جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <BusStats buses={buses} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <BusFilters onFilterChange={handleFilterChange} />
      </div>

      {buses.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">لا توجد باصات متاحة</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {viewMode === 'list' ? (
            <BusList
              buses={buses}
              onDelete={handleDelete}
              filters={filters}
            />
          ) : (
            <BusMap buses={buses} />
          )}
        </div>
      )}
    </div>
  );
} 