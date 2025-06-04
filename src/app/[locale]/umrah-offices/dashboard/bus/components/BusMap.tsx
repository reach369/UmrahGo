'use client';

import { useEffect, useRef } from 'react';
import { Bus } from '../types/bus.types';

interface BusMapProps {
  buses: Bus[];
}

export function BusMap({ buses }: BusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 24.7136, lng: 46.6753 }, // Riyadh coordinates
      zoom: 12,
    });

    // Clean up markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    // Add markers for buses with location
    buses.forEach(bus => {
      if (bus.location_lat && bus.location_lng) {
        const marker = new google.maps.Marker({
          position: { lat: bus.location_lat, lng: bus.location_lng },
          map: mapInstance.current,
          title: `${bus.model} - ${bus.status}`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: getStatusColor(bus.status),
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">${bus.model}</h3>
              <p>الحالة: ${getStatusText(bus.status)}</p>
              <p>السعة: ${bus.capacity}</p>
              <p>السعر: ${bus.price} ريال</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current, marker);
        });

        markers.current.push(marker);
      }
    });

    return () => {
      markers.current.forEach(marker => marker.setMap(null));
    };
  }, [buses]);

  const getStatusColor = (status: Bus['status']) => {
    switch (status) {
      case 'available':
        return '#22c55e'; // green-500
      case 'rented':
        return '#eab308'; // yellow-500
      case 'maintenance':
        return '#ef4444'; // red-500
      case 'reserved':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const getStatusText = (status: Bus['status']) => {
    switch (status) {
      case 'available':
        return 'متاح';
      case 'rented':
        return 'مؤجر';
      case 'maintenance':
        return 'صيانة';
      case 'reserved':
        return 'محجوز';
      default:
        return 'غير معروف';
    }
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}