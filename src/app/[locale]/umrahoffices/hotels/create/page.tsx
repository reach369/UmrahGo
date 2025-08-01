'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2,
  MapPin,
  Star,
  Upload,
  X,
  Plus,
  ArrowLeft,
  Save,
  AlertCircle,
  Check,
  Image as ImageIcon,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Waves,
  Flower,
  Wind,
  MoveVertical,
  Coffee,
  Shirt,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import LocationPicker from '@/components/maps/LocationPicker';
import { MapLocation } from '@/lib/google-maps';
import { 
  useCreateHotelMutation,
  useGetOfficeHotelsQuery,
  CreateHotelRequest 
} from '../../redux/api/hotelsApiSlice';

// Predefined amenities with icons
const PREDEFINED_AMENITIES = [
  { id: 'wifi', label: 'hotels.wifi', icon: Wifi },
  { id: 'parking', label: 'hotels.parking', icon: Car },
  { id: 'restaurant', label: 'hotels.restaurant', icon: Utensils },
  { id: 'gym', label: 'hotels.gym', icon: Dumbbell },
  { id: 'pool', label: 'hotels.pool', icon: Waves },
  { id: 'spa', label: 'hotels.spa', icon: Flower },
  { id: 'airConditioning', label: 'hotels.airConditioning', icon: Wind },
  { id: 'elevator', label: 'hotels.elevator', icon: MoveVertical },
  { id: 'breakfast', label: 'hotels.breakfast', icon: Coffee },
  { id: 'laundry', label: 'hotels.laundry', icon: Shirt },
  { id: 'businessCenter', label: 'hotels.businessCenter', icon: Briefcase },
];

interface FormData {
  name: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  amenities: string[];
  is_active: boolean;
  images: File[];
  package_ids: number[];
  nights?: number;
  room_type: string;
}

export default function CreateHotelPage() {
  const t = useTranslations();
  const router = useRouter();

  // State
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    rating: undefined,
    amenities: [],
    is_active: true,
    images: [],
    package_ids: [],
    nights: undefined,
    room_type: ''
  });
  const [customAmenity, setCustomAmenity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API hooks
  const [createHotel, { isLoading: isCreating }] = useCreateHotelMutation();
  const { data: officeHotelsResponse } = useGetOfficeHotelsQuery({});

  // Handlers
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationSelect = (location: MapLocation) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const handleAddressChange = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ليس ملف صورة صالح`);
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} حجم الملف كبير جداً (الحد الأقصى 5MB)`);
        return;
      }

      validFiles.push(file);
      newPreviewUrls.push(URL.createObjectURL(file));
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = (amenityId: string) => {
    if (!formData.amenities.includes(amenityId)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityId]
      }));
    }
  };

  const removeAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(id => id !== amenityId)
    }));
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('validation.required');
    }

    if (formData.rating && (formData.rating < 1 || formData.rating > 5)) {
      newErrors.rating = t('validation.ratingRange');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('validation.checkErrors'));
      return;
    }

    try {
      const requestData: CreateHotelRequest = {
        name: formData.name,
        description: formData.description || undefined,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rating: formData.rating,
        amenities: formData.amenities,
        is_active: formData.is_active,
        images: formData.images.length > 0 ? formData.images : undefined,
        package_ids: formData.package_ids.length > 0 ? formData.package_ids : undefined,
        nights: formData.nights,
        room_type: formData.room_type || undefined
      };

      await createHotel(requestData).unwrap();
      toast.success(t('hotels.hotelCreated'));
      router.push('/umrahoffices/hotels');
    } catch (error: any) {
      console.error('Hotel creation error:', error);
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/umrahoffices/hotels">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('hotels.addHotel')}</h1>
            <p className="text-gray-600 mt-1">
              {t('common.fillRequiredInfo')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  {t('common.basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hotel Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    {t('hotels.name')} <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('hotels.name')}
                    error={errors.name}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">{t('hotels.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('hotels.description')}
                    rows={4}
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating">{t('hotels.rating')}</Label>
                  <Select 
                    value={formData.rating?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('rating', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('hotels.rating')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {t('hotels.stars')}</SelectItem>
                      <SelectItem value="2">2 {t('hotels.stars')}</SelectItem>
                      <SelectItem value="3">3 {t('hotels.stars')}</SelectItem>
                      <SelectItem value="4">4 {t('hotels.stars')}</SelectItem>
                      <SelectItem value="5">5 {t('hotels.stars')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rating && (
                    <p className="text-sm text-red-600">{errors.rating}</p>
                  )}
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <Label htmlFor="roomType">{t('hotels.roomType')}</Label>
                  <Input
                    id="roomType"
                    value={formData.room_type}
                    onChange={(e) => handleInputChange('room_type', e.target.value)}
                    placeholder={t('hotels.roomType')}
                  />
                </div>

                {/* Nights */}
                <div className="space-y-2">
                  <Label htmlFor="nights">{t('hotels.nights')}</Label>
                  <Input
                    id="nights"
                    type="number"
                    min="1"
                    value={formData.nights || ''}
                    onChange={(e) => handleInputChange('nights', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder={t('hotels.nights')}
                  />
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="isActive" className="flex items-center">
                    {formData.is_active ? (
                      <><Check className="w-4 h-4 mr-1 text-green-600" /> {t('hotels.active')}</>
                    ) : (
                      <><X className="w-4 h-4 mr-1 text-red-600" /> {t('hotels.inactive')}</>
                    )}
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              onAddressChange={handleAddressChange}
              searchPlaceholder={t('hotels.searchHotels')}
              height="350px"
            />

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hotels.amenities')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Predefined amenities */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PREDEFINED_AMENITIES.map(amenity => {
                    const Icon = amenity.icon;
                    const isSelected = formData.amenities.includes(amenity.id);
                    
                    return (
                      <Button
                        key={amenity.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => isSelected ? removeAmenity(amenity.id) : addAmenity(amenity.id)}
                        className="justify-start"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {t(amenity.label)}
                      </Button>
                    );
                  })}
                </div>

                {/* Custom amenity */}
                <div className="flex gap-2">
                  <Input
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder={t('hotels.addAmenity')}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                  />
                  <Button type="button" variant="outline" onClick={addCustomAmenity}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Selected amenities */}
                {formData.amenities.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t('common.selected')}:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map(amenityId => {
                        const predefined = PREDEFINED_AMENITIES.find(a => a.id === amenityId);
                        const label = predefined ? t(predefined.label) : amenityId;
                        
                        return (
                          <Badge key={amenityId} variant="secondary" className="flex items-center">
                            {label}
                            <X 
                              className="w-3 h-3 ml-1 cursor-pointer" 
                              onClick={() => removeAmenity(amenityId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  {t('hotels.images')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload button */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="images" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{t('hotels.uploadImages')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP (5MB {t('common.max')})
                    </p>
                  </Label>
                </div>

                {/* Image previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('common.creating')}...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t('hotels.addHotel')}
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <Link href="/umrahoffices/hotels">
                      {t('common.cancel')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 