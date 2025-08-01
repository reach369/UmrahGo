'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useTranslations } from 'next-intl';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface LocationPickerProps {
  onLocationSelect?: (location: MapLocation) => void;
  onAddressChange?: (address: string) => void;
  searchPlaceholder?: string;
  height?: string;
  initialLocation?: MapLocation | null;
  title?: string;
}

const libraries: any = ['places']; // Changed to any to bypass TS error

export default function LocationPicker({
  onLocationSelect,
  onAddressChange,
  searchPlaceholder = "البحث عن موقع",
  height = "300px",
  initialLocation,
  title
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(initialLocation || null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const t = useTranslations();
  
  const defaultCenter = { lat: 21.4225, lng: 39.8262 }; // Mecca as default
  const mapRef = useRef<any>(null); // Changed to any
  const searchBoxRef = useRef<any>(null); // Changed to any

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (isLoaded && mapRef.current && window.google) {
      const input = document.getElementById('location-search-input') as HTMLInputElement;
      if (input && window.google.maps) {
        try {
          // @ts-ignore
          const searchBox = new window.google.maps.places.SearchBox(input);
          searchBoxRef.current = searchBox;
          
          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (places && places.length > 0) {
              const place = places[0];
              
              if (place.geometry && place.geometry.location) {
                const newLocation: MapLocation = {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  address: place.formatted_address
                };
                
                setSelectedLocation(newLocation);
                if (onLocationSelect) onLocationSelect(newLocation);
                if (onAddressChange && place.formatted_address) onAddressChange(place.formatted_address);
                
                mapRef.current?.setCenter(place.geometry.location);
                mapRef.current?.setZoom(15);
              }
            }
          });
          
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
          });
        } catch (error) {
          console.error("Error initializing search box:", error);
        }
      }
    }
  }, [isLoaded, onLocationSelect, onAddressChange]);

  const handleMapClick = (e: any) => { // Changed to any
    if (e.latLng && window.google) {
      setLoading(true);
      
      // @ts-ignore
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results: any, status: any) => { // Changed to any
        setLoading(false);
        
        if (status === "OK" && results && results[0]) {
          const newLocation: MapLocation = {
            lat: e.latLng!.lat(),
            lng: e.latLng!.lng(),
            address: results[0].formatted_address
          };
          
          setSelectedLocation(newLocation);
          if (onLocationSelect) onLocationSelect(newLocation);
          if (onAddressChange && results[0].formatted_address) onAddressChange(results[0].formatted_address);
          setSearchQuery(results[0].formatted_address || '');
        } else {
          const newLocation: MapLocation = {
            lat: e.latLng!.lat(),
            lng: e.latLng!.lng()
          };
          
          setSelectedLocation(newLocation);
          if (onLocationSelect) onLocationSelect(newLocation);
        }
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() && isLoaded && window.google) {
      setLoading(true);
      
      // @ts-ignore
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results: any, status: any) => { // Changed to any
        setLoading(false);
        
        if (status === "OK" && results && results[0] && results[0].geometry) {
          const newLocation: MapLocation = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            address: results[0].formatted_address
          };
          
          setSelectedLocation(newLocation);
          if (onLocationSelect) onLocationSelect(newLocation);
          if (onAddressChange && results[0].formatted_address) onAddressChange(results[0].formatted_address);
          
          mapRef.current?.setCenter(results[0].geometry.location);
          mapRef.current?.setZoom(15);
        }
      });
    }
  };

  const onMapLoad = (map: any) => { // Changed to any
    mapRef.current = map;
    setMapLoaded(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          {title || t('packages.pickLocation', {fallback: 'اختيار الموقع على الخريطة'})}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            id="location-search-input"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            variant="outline" 
            disabled={loading || !isLoaded}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Map */}
        <div 
          className="w-full rounded-lg overflow-hidden border border-gray-200"
          style={{ height }}
        >
          {loadError && (
            <div className="w-full h-full flex items-center justify-center bg-red-50">
              <div className="text-center text-red-500">
                <p className="font-semibold">{t('common.error')}</p>
                <p className="text-sm mt-1">{t('packages.mapApiKeyError', {fallback: 'تأكد من وجود مفتاح API صحيح'})}</p>
              </div>
            </div>
          )}
          
          {!isLoaded && !loadError && (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}
          
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={selectedLocation || defaultCenter}
              zoom={selectedLocation ? 15 : 13}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
              onClick={handleMapClick}
              onLoad={onMapLoad}
            >
              {selectedLocation && (
                <MarkerF
                  position={selectedLocation}
                  animation={google.maps.Animation.DROP}
                />
              )}
            </GoogleMap>
          )}
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="font-medium">{t('packages.locationSelected', {fallback: 'تم تحديد الموقع بنجاح'})}</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              <p>{t('packages.latitude', {fallback: 'خط العرض'})}: {selectedLocation.lat.toFixed(6)}</p>
              <p>{t('packages.longitude', {fallback: 'خط الطول'})}: {selectedLocation.lng.toFixed(6)}</p>
              {selectedLocation.address && (
                <p>{t('packages.address', {fallback: 'العنوان'})}: {selectedLocation.address}</p>
              )}
            </div>
          </div>
        )}
        <div className="text-sm text-gray-500">
          <p>💡 {t('packages.locationPickerHelp', {fallback: 'يمكنك:'})}</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>{t('packages.locationPickerSearch', {fallback: 'البحث عن مكان معين باستخدام مربع البحث'})}</li>
            <li>{t('packages.locationPickerClick', {fallback: 'النقر على الخريطة لتحديد موقع'})}</li>
            <li>{t('packages.locationPickerSave', {fallback: 'سيتم حفظ الإحداثيات تلقائياً'})}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 