'use client';

import { useState } from 'react';
import { BusFilters as BusFiltersType } from '../types/bus.types';

interface BusFiltersProps {
  onFilterChange: (filters: BusFiltersType) => void;
}

export function BusFilters({ onFilterChange }: BusFiltersProps) {
  const [filters, setFilters] = useState<BusFiltersType>({});

  const handleChange = (key: keyof BusFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          نوع الباص
        </label>
        <select
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => handleChange('type_id', e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">الكل</option>
          <option value="1">حافلة كبيرة VIP</option>
          <option value="2">حافلة متوسطة</option>
          <option value="3">حافلة صغيرة</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الحالة
        </label>
        <select
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => handleChange('status', e.target.value as BusFiltersType['status'])}
        >
          <option value="">الكل</option>
          <option value="available">متاح</option>
          <option value="rented">مؤجر</option>
          <option value="maintenance">صيانة</option>
          <option value="reserved">محجوز</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الحالة الفنية
        </label>
        <select
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => handleChange('condition', e.target.value as BusFiltersType['condition'])}
        >
          <option value="">الكل</option>
          <option value="new">جديد</option>
          <option value="used">مستعمل</option>
          <option value="maintenance">صيانة</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          السعر
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="من"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => handleChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
          />
          <input
            type="number"
            placeholder="إلى"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => handleChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>
    </div>
  );
} 