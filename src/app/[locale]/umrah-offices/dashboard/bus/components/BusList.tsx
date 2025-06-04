import React from 'react';
import { Bus, BusFilters } from '../types/bus.types';

interface BusListProps {
  buses: Bus[];
  onDelete: (id: number) => void;
  filters?: BusFilters;
}

export const BusList: React.FC<BusListProps> = ({ buses, onDelete, filters }) => {
  const filteredBuses = buses.filter(bus => {
    if (filters?.type_id && bus.type_id !== filters.type_id) return false;
    if (filters?.status && bus.status !== filters.status) return false;
    if (filters?.condition && bus.condition !== filters.condition) return false;
    if (filters?.min_price && bus.price < filters.min_price) return false;
    if (filters?.max_price && bus.price > filters.max_price) return false;
    return true;
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموديل</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعة</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة الفنية</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المميزات</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredBuses.map((bus) => (
            <tr key={bus.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bus.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.capacity}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  bus.status === 'available' ? 'bg-green-100 text-green-800' :
                  bus.status === 'rented' ? 'bg-yellow-100 text-yellow-800' :
                  bus.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {bus.status === 'available' ? 'متاح' :
                   bus.status === 'rented' ? 'مؤجر' :
                   bus.status === 'maintenance' ? 'صيانة' :
                   'محجوز'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bus.price} ريال</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {bus.condition === 'new' ? 'جديد' :
                 bus.condition === 'used' ? 'مستعمل' :
                 'صيانة'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="flex flex-wrap gap-1">
                  {bus.features?.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {feature}
                    </span>
                  )) || 'لا توجد مميزات'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(bus.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    حذف
                  </button>
                  <button
                    onClick={() => window.location.href = `/umrah-offices/dashboard/bus/manage/${bus.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    تعديل
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 