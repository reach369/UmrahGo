'use client';

import { Bus } from '../types/bus.types';

interface BusStatsProps {
  buses: Bus[];
}

export function BusStats({ buses }: BusStatsProps) {
  const totalBuses = buses.length;
  const availableBuses = buses.filter(bus => bus.status === 'available').length;
  const rentedBuses = buses.filter(bus => bus.status === 'rented').length;
  const maintenanceBuses = buses.filter(bus => bus.status === 'maintenance').length;

  const stats = [
    {
      title: 'إجمالي الباصات',
      value: totalBuses,
      color: 'bg-blue-500',
    },
    {
      title: 'الباصات المتاحة',
      value: availableBuses,
      color: 'bg-green-500',
    },
    {
      title: 'الباصات المؤجرة',
      value: rentedBuses,
      color: 'bg-yellow-500',
    },
    {
      title: 'الباصات في الصيانة',
      value: maintenanceBuses,
      color: 'bg-red-500',
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} text-white rounded-lg p-6 shadow-md`}
        >
          <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </>
  );
} 