'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGetPackageQuery, useUpdatePackageMutation } from '../../../../redux/api/packagesApiSlice';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Loader2, Package, Save, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Image from 'next/image';

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const packageId = Number(params?.id);
  
  // Fetch package details
  const { 
    data: packageData, 
    isLoading: isLoadingPackage,
    isError: isErrorPackage,
    error: packageError 
  } = useGetPackageQuery(packageId);
  
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'umrah',
    duration_days: '',
    price: '',
    discount_price: '',
    currency: 'SAR',
    max_participants: '',
    departure_city: '',
    arrival_city: '',
    start_date: '',
    end_date: '',
    booking_deadline: '',
    inclusions: [''],
    exclusions: [''],
    itinerary: [{ day: 1, title: '', description: '', activities: [''] }],
    terms_conditions: '',
    is_featured: false,
    status: 'active',
    images: [] as File[],
    existingImages: [] as { id: number; url: string }[]
  });

  // Update form data when package data is loaded
  useEffect(() => {
    if (packageData?.data) {
      const pkg = packageData.data;
      setFormData({
        name: pkg.name || '',
        description: pkg.description || '',
        type: pkg.type || 'umrah',
        duration_days: pkg.duration_days?.toString() || '',
        price: pkg.price || '',
        discount_price: pkg.discount_price || '',
        currency: 'SAR',
        max_participants: pkg.max_persons?.toString() || '',
        departure_city: pkg.start_location || '',
        arrival_city: pkg.end_location || '',
        start_date: pkg.start_date || '',
        end_date: pkg.end_date || '',
        booking_deadline: '',
        inclusions: pkg.features ? Object.entries(pkg.features)
          .filter(([_, value]) => value)
          .map(([key]) => key) : [''],
        exclusions: [''],
        itinerary: [{ day: 1, title: '', description: '', activities: [''] }],
        terms_conditions: '',
        is_featured: pkg.is_featured || false,
        status: pkg.status || 'active',
        images: [],
        existingImages: pkg.images?.map(img => ({
          id: img.id,
          url: img.url
        })) || []
      });
    }
  }, [packageData]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle date changes
  const handleDateChange = (name, date) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    setFormData(prev => ({
      ...prev,
      [name]: formattedDate
    }));
  };

  // Handle inclusions and exclusions arrays
  const handleArrayChange = (name, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[name]];
      newArray[index] = value;
      return {
        ...prev,
        [name]: newArray
      };
    });
  };
  
  const addArrayItem = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: [...prev[name], '']
    }));
  };
  
  const removeArrayItem = (name, index) => {
    setFormData(prev => {
      const newArray = [...prev[name]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [name]: newArray
      };
    });
  };

  // Handle itinerary
  const handleItineraryChange = (index, field, value) => {
    setFormData(prev => {
      const newItinerary = [...prev.itinerary];
      newItinerary[index] = {
        ...newItinerary[index],
        [field]: value
      };
      return {
        ...prev,
        itinerary: newItinerary
      };
    });
  };
  
  const handleItineraryActivityChange = (dayIndex, activityIndex, value) => {
    setFormData(prev => {
      const newItinerary = [...prev.itinerary];
      const newActivities = [...newItinerary[dayIndex].activities];
      newActivities[activityIndex] = value;
      newItinerary[dayIndex] = {
        ...newItinerary[dayIndex],
        activities: newActivities
      };
      return {
        ...prev,
        itinerary: newItinerary
      };
    });
  };
  
  const addItineraryDay = () => {
    setFormData(prev => {
      const newDay = prev.itinerary.length + 1;
      return {
        ...prev,
        itinerary: [
          ...prev.itinerary,
          { day: newDay, title: '', description: '', activities: [''] }
        ]
      };
    });
  };
  
  const removeItineraryDay = (index) => {
    setFormData(prev => {
      const newItinerary = [...prev.itinerary];
      newItinerary.splice(index, 1);
      // Reindex days
      newItinerary.forEach((day, idx) => {
        day.day = idx + 1;
      });
      return {
        ...prev,
        itinerary: newItinerary
      };
    });
  };
  
  const addItineraryActivity = (dayIndex) => {
    setFormData(prev => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex] = {
        ...newItinerary[dayIndex],
        activities: [...newItinerary[dayIndex].activities, '']
      };
      return {
        ...prev,
        itinerary: newItinerary
      };
    });
  };
  
  const removeItineraryActivity = (dayIndex, activityIndex) => {
    setFormData(prev => {
      const newItinerary = [...prev.itinerary];
      const newActivities = [...newItinerary[dayIndex].activities];
      newActivities.splice(activityIndex, 1);
      newItinerary[dayIndex] = {
        ...newItinerary[dayIndex],
        activities: newActivities
      };
      return {
        ...prev,
        itinerary: newItinerary
      };
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...files]
      }));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  // Remove existing image
  const removeExistingImage = (id: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(img => img.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get original package data
      const originalPackage = packageData.data;
      
      // Create FormData object
      const formDataObj = new FormData();
      
      // Track which fields have been changed
      const changedFields = {
        name: formData.name !== originalPackage.name,
        description: formData.description !== originalPackage.description,
        type: formData.type !== originalPackage.type,
        duration_days: formData.duration_days !== originalPackage.duration_days.toString(),
        price: formData.price !== originalPackage.price,
        discount_price: formData.discount_price !== (originalPackage.discount_price || ''),
        max_participants: formData.max_participants !== originalPackage.max_persons.toString(),
        departure_city: formData.departure_city !== originalPackage.start_location,
        arrival_city: formData.arrival_city !== originalPackage.end_location,
        start_date: formData.start_date !== originalPackage.start_date,
        end_date: formData.end_date !== originalPackage.end_date,
        is_featured: formData.is_featured !== originalPackage.is_featured,
        status: formData.status !== originalPackage.status
      };

      // Log changed fields for debugging
      console.log('Changed fields:', changedFields);

      // Validate only changed fields
      const validationErrors = [];
      
      if (changedFields.name && !formData.name) {
        validationErrors.push('اسم الباقة مطلوب');
      }
      
      if (changedFields.description && !formData.description) {
        validationErrors.push('وصف الباقة مطلوب');
      }
      
      if (changedFields.type && !formData.type) {
        validationErrors.push('نوع الباقة مطلوب');
      }
      
      if (changedFields.duration_days && !formData.duration_days) {
        validationErrors.push('مدة الباقة مطلوبة');
      }
      
      if (changedFields.price && !formData.price) {
        validationErrors.push('سعر الباقة مطلوب');
      }
      
      if (changedFields.max_participants && !formData.max_participants) {
        validationErrors.push('الحد الأقصى للمشاركين مطلوب');
      }
      
      if (changedFields.departure_city && !formData.departure_city) {
        validationErrors.push('مدينة المغادرة مطلوبة');
      }
      
      if (changedFields.arrival_city && !formData.arrival_city) {
        validationErrors.push('مدينة الوصول مطلوبة');
      }
      
      if (changedFields.start_date && !formData.start_date) {
        validationErrors.push('تاريخ البداية مطلوب');
      }
      
      if (changedFields.end_date && !formData.end_date) {
        validationErrors.push('تاريخ النهاية مطلوب');
      }
      
      if (changedFields.status && !formData.status) {
        validationErrors.push('حالة الباقة مطلوبة');
      }

      // If there are validation errors, show them and return
      if (validationErrors.length > 0) {
        toast({
          title: "خطأ في البيانات",
          description: validationErrors.join('\n'),
          variant: "destructive",
        });
        return;
      }

      // Add changed fields to FormData
      if (changedFields.name) {
        formDataObj.append('name', formData.name);
        formDataObj.append('name_ar', formData.name);
      }
      
      if (changedFields.description) {
        formDataObj.append('description', formData.description);
        formDataObj.append('description_ar', formData.description);
      }
      
      if (changedFields.type) {
        formDataObj.append('type', formData.type);
      }
      
      if (changedFields.duration_days) {
        formDataObj.append('duration', formData.duration_days);
      }
      
      if (changedFields.price) {
        formDataObj.append('price', formData.price);
      }
      
      if (changedFields.discount_price) {
        formDataObj.append('discount_price', formData.discount_price);
      }
      
      if (changedFields.start_date) {
        formDataObj.append('starting_date', formData.start_date);
      }
      
      if (changedFields.end_date) {
        formDataObj.append('ending_date', formData.end_date);
      }
      
      if (changedFields.max_participants) {
        formDataObj.append('max_people', formData.max_participants);
      }
      
      if (changedFields.arrival_city) {
        formDataObj.append('destination', formData.arrival_city);
      }
      
      if (changedFields.departure_city) {
        formDataObj.append('meeting_location', formData.departure_city);
      }
      
      if (changedFields.is_featured) {
        formDataObj.append('is_featured', formData.is_featured.toString());
      }
      
      if (changedFields.status) {
        formDataObj.append('status', formData.status);
      }

      // Check if inclusions have changed
      const originalFeatures = Object.entries(originalPackage.features || {})
        .filter(([_, value]) => value)
        .map(([key]) => key);
      
      const inclusionsChanged = JSON.stringify(formData.inclusions) !== JSON.stringify(originalFeatures);
      
      if (inclusionsChanged) {
        // Add features (inclusions)
        formData.inclusions.forEach((feature, index) => {
          formDataObj.append(`features[${index}]`, feature);
        });
        
        // Add accommodation and transport flags
        const includesAccommodation = formData.inclusions.some(inc => 
          inc.toLowerCase().includes('hotel') || inc.toLowerCase().includes('accommodation')
        );
        const includesTransport = formData.inclusions.some(inc => 
          inc.toLowerCase().includes('transport') || inc.toLowerCase().includes('flight')
        );
        const includesMeals = formData.inclusions.some(inc => 
          inc.toLowerCase().includes('breakfast') || inc.toLowerCase().includes('dinner') || inc.toLowerCase().includes('meal')
        );
        
        formDataObj.append('includes_accommodation', includesAccommodation.toString());
        formDataObj.append('includes_transport', includesTransport.toString());
        formDataObj.append('includes_meals', includesMeals.toString());
      }

      // Check if itinerary has changed
      const originalItinerary = originalPackage.itinerary || [];
      const itineraryChanged = JSON.stringify(formData.itinerary) !== JSON.stringify(originalItinerary);
      
      if (itineraryChanged) {
        // Add itinerary as features
        formData.itinerary.forEach((day, index) => {
          formDataObj.append(`features[${formData.inclusions.length + index}]`, 
            `Day ${day.day}: ${day.title} - ${day.description}`
          );
        });
      }

      // Check if images have changed
      if (formData.images.length > 0) {
        // Add new images
        formData.images.forEach((image, index) => {
          formDataObj.append(`images[${index}]`, image);
        });
      }

      // Check if existing images have been removed
      const originalImageIds = originalPackage.images.map(img => img.id);
      const currentImageIds = formData.existingImages.map(img => img.id);
      const removedImages = originalImageIds.filter(id => !currentImageIds.includes(id));
      
      if (removedImages.length > 0) {
        formDataObj.append('removed_images', JSON.stringify(removedImages));
      }

      // Add existing images that weren't removed
      formData.existingImages.forEach((image, index) => {
        formDataObj.append(`existing_images[${index}]`, image.id.toString());
      });

      // Log the FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Check if there are any changes to submit
      if (formDataObj.entries().next().done) {
        toast({
          title: "لا توجد تغييرات",
          description: "لم يتم إجراء أي تغييرات على الباقة",
          variant: "default",
        });
        return;
      }
      
      // Update package
      console.log('Sending update request for package:', packageId);
      const response = await updatePackage({
        id: packageId,
        data: formDataObj
      }).unwrap();
      
      console.log('Package update response:', response);
      
      toast({
        title: "تم تحديث الباقة بنجاح",
        description: "تم تحديث الباقة وحفظ التغييرات في النظام",
      });
      
      // Redirect to package details
      router.push(`/ar/umrah-offices/dashboard/packages/${packageId}`);
    } catch (error) {
      console.error('Error updating package:', error);
      console.error('Error details:', error.data);
      
      let errorMessage = "حدث خطأ أثناء تحديث الباقة";
      
      // Handle specific API error messages if available
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.entries(error.data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        errorMessage = `Validation errors:\n${validationErrors}`;
      }
      
      toast({
        title: "فشل تحديث الباقة",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoadingPackage) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل بيانات الباقة...</p>
      </div>
    );
  }

  if (isErrorPackage) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">خطأ في تحميل البيانات</CardTitle>
            <CardDescription>
              {packageError?.data?.message || 'حدث خطأ أثناء تحميل بيانات الباقة'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.back()}>العودة</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">تعديل الباقة</h1>
          <p className="text-muted-foreground">تعديل بيانات الباقة الحالية</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          العودة
        </Button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic information */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>تعديل المعلومات الأساسية للباقة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الباقة *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="مثال: باقة العمرة الممتازة - 14 يوم"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الباقة *</Label>
                  <Select
                    value={formData.type || 'umrah'}
                    onValueChange={(value) => handleSelectChange('type', value)}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="اختر نوع الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="umrah">عمرة</SelectItem>
                      <SelectItem value="hajj">حج</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف الباقة *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="قدم وصفًا مفصلاً للباقة..."
                  className="min-h-32"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_days">مدة الباقة (أيام) *</Label>
                  <Input
                    id="duration_days"
                    name="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">السعر *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount_price">سعر الخصم</Label>
                  <Input
                    id="discount_price"
                    name="discount_price"
                    type="number"
                    value={formData.discount_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_participants">الحد الأقصى للمشاركين *</Label>
                <Input
                  id="max_participants"
                  name="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_city">مدينة المغادرة *</Label>
                  <Input
                    id="departure_city"
                    name="departure_city"
                    value={formData.departure_city}
                    onChange={handleInputChange}
                    placeholder="مثال: الرياض"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="arrival_city">مدينة الوصول *</Label>
                  <Input
                    id="arrival_city"
                    name="arrival_city"
                    value={formData.arrival_city}
                    onChange={handleInputChange}
                    placeholder="مثال: جدة"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ البداية *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right"
                      >
                        {formData.start_date ? (
                          format(new Date(formData.start_date), 'yyyy-MM-dd')
                        ) : (
                          <span className="text-muted-foreground">اختر تاريخًا</span>
                        )}
                        <CalendarIcon className="mr-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={ar}
                        selected={formData.start_date ? new Date(formData.start_date) : undefined}
                        onSelect={(date) => handleDateChange('start_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>تاريخ النهاية *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right"
                      >
                        {formData.end_date ? (
                          format(new Date(formData.end_date), 'yyyy-MM-dd')
                        ) : (
                          <span className="text-muted-foreground">اختر تاريخًا</span>
                        )}
                        <CalendarIcon className="mr-auto h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={ar}
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date) => handleDateChange('end_date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleCheckboxChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">باقة مميزة (ستظهر في القسم المميز)</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">حالة الباقة *</Label>
                <Select
                  value={formData.status || 'active'}
                  onValueChange={(value) => handleSelectChange('status', value)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="اختر حالة الباقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="inactive">غير نشطة</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Inclusions and Exclusions */}
          <Card>
            <CardHeader>
              <CardTitle>المشمولات والاستثناءات</CardTitle>
              <CardDescription>تعديل ما يشمله ولا يشمله السعر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Inclusions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">المشمولات *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('inclusions')}
                  >
                    إضافة عنصر
                  </Button>
                </div>
                
                {formData.inclusions.map((item, index) => (
                  <div key={`inclusion-${index}`} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                      placeholder={`مثال: وجبة الإفطار`}
                      required={index === 0}
                    />
                    {formData.inclusions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('inclusions', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Exclusions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">الاستثناءات *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('exclusions')}
                  >
                    إضافة عنصر
                  </Button>
                </div>
                
                {formData.exclusions.map((item, index) => (
                  <div key={`exclusion-${index}`} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                      placeholder={`مثال: المصروفات الشخصية`}
                      required={index === 0}
                    />
                    {formData.exclusions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('exclusions', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Itinerary */}
          <Card>
            <CardHeader>
              <CardTitle>البرنامج اليومي</CardTitle>
              <CardDescription>تعديل برنامج الرحلة اليومي بالتفصيل</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">أيام البرنامج *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItineraryDay}
                >
                  إضافة يوم
                </Button>
              </div>
              
              {formData.itinerary.map((day, dayIndex) => (
                <Card key={`day-${dayIndex}`} className="border border-dashed">
                  <CardHeader className="py-4 px-5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">اليوم {day.day}</CardTitle>
                      {formData.itinerary.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItineraryDay(dayIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 px-5 space-y-4">
                    <div className="space-y-2">
                      <Label>عنوان اليوم *</Label>
                      <Input
                        value={day.title}
                        onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                        placeholder="مثال: المغادرة والوصول"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>وصف اليوم *</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) => handleItineraryChange(dayIndex, 'description', e.target.value)}
                        placeholder="وصف تفصيلي لبرنامج اليوم..."
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>الأنشطة *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addItineraryActivity(dayIndex)}
                        >
                          إضافة نشاط
                        </Button>
                      </div>
                      
                      {day.activities.map((activity, activityIndex) => (
                        <div key={`activity-${dayIndex}-${activityIndex}`} className="flex gap-2">
                          <Input
                            value={activity}
                            onChange={(e) => handleItineraryActivityChange(dayIndex, activityIndex, e.target.value)}
                            placeholder="مثال: زيارة الحرم"
                            required={activityIndex === 0}
                          />
                          {day.activities.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItineraryActivity(dayIndex, activityIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
          
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>صور الباقة</CardTitle>
              <CardDescription>تعديل صور الباقة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Existing Images */}
                  {formData.existingImages.map((image, index) => (
                    <div key={`existing-${image.id}`} className="relative group">
                      <div className="aspect-video relative rounded-lg overflow-hidden border">
                        <Image
                          src={image.url}
                          alt={`Package image ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(image.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* New Images */}
                  {formData.images.map((image, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="aspect-video relative rounded-lg overflow-hidden border">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`New package image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <label className="aspect-video relative rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">إضافة صورة</span>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      multiple
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="gap-2"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارِ الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 