'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePackageMutation } from '../../../redux/api/packagesApiSlice';
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

export default function CreatePackagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [createPackage, { isLoading }] = useCreatePackageMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'umrah', // Default to umrah
    duration_days: '',
    price: '',
    currency: 'SAR',
    max_participants: '',
    min_participants: '',
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
    images: [] as File[]
  });
  
  // Add example data function
  const fillExampleData = () => {
    const exampleData = {
      name: "Premium Umrah Package - 14 Days",
      description: "Comprehensive 14-day Umrah package including luxury accommodation, guided tours, and premium transportation services",
      type: "umrah",
      duration_days: "14",
      price: "8500.00",
      currency: "SAR",
      max_participants: "50",
      min_participants: "10",
      departure_city: "Riyadh",
      arrival_city: "Jeddah",
      start_date: "2025-03-01",
      end_date: "2025-03-14",
      booking_deadline: "2025-02-15",
      inclusions: [
        "Round-trip flights",
        "5-star hotel accommodation in Makkah (7 nights)",
        "4-star hotel accommodation in Madinah (5 nights)",
        "Daily breakfast and dinner",
        "Air-conditioned transportation",
        "Experienced religious guide",
        "Ziyarat tours",
        "Visa processing",
        "Travel insurance"
      ],
      exclusions: [
        "Personal expenses",
        "Lunch meals",
        "Optional tours",
        "Laundry services",
        "Tips and gratuities"
      ],
      itinerary: [
        {
          day: 1,
          title: "Departure and Arrival",
          description: "Departure from Riyadh, arrival in Jeddah, transfer to Makkah hotel",
          activities: ["Airport transfer", "Hotel check-in", "Orientation meeting"]
        },
        {
          day: 2,
          title: "First Umrah",
          description: "Perform first Umrah with guided assistance",
          activities: ["Ihram preparation", "Tawaf", "Sa'i", "Halq/Taqsir"]
        }
      ],
      terms_conditions: "Full payment required 30 days before departure. Cancellation policy applies as per company terms.",
      is_featured: true,
      status: "active"
    };

    setFormData(exampleData);
  };
  
  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Check if all required fields are filled
      if (
        !formData.name ||
        !formData.description ||
        !formData.type ||
        !formData.duration_days ||
        !formData.price ||
        !formData.currency ||
        !formData.min_participants ||
        !formData.max_participants ||
        !formData.departure_city ||
        !formData.arrival_city ||
        !formData.start_date ||
        !formData.end_date ||
        !formData.booking_deadline ||
        !formData.terms_conditions
      ) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }
      
      // Check if inclusions and exclusions have at least one item
      if (formData.inclusions.length === 0 || !formData.inclusions[0]) {
        toast({
          title: "خطأ في البيانات",
          description: "يجب إضافة عنصر واحد على الأقل في المشمولات",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.exclusions.length === 0 || !formData.exclusions[0]) {
        toast({
          title: "خطأ في البيانات",
          description: "يجب إضافة عنصر واحد على الأقل في الاستثناءات",
          variant: "destructive",
        });
        return;
      }
      
      // Check if itinerary has at least one day with all required fields
      if (
        formData.itinerary.length === 0 ||
        !formData.itinerary[0].title ||
        !formData.itinerary[0].description ||
        formData.itinerary[0].activities.length === 0 ||
        !formData.itinerary[0].activities[0]
      ) {
        toast({
          title: "خطأ في البيانات",
          description: "يجب إضافة يوم واحد على الأقل في البرنامج اليومي مع تعبئة جميع الحقول",
          variant: "destructive",
        });
        return;
      }
      
      // Create FormData object
      const formDataObj = new FormData();
      
      // Add basic fields
      formDataObj.append('name', formData.name);
      formDataObj.append('name_ar', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('description_ar', formData.description);
      formDataObj.append('type', formData.type);
      formDataObj.append('duration', formData.duration_days);
      formDataObj.append('price', formData.price);
      formDataObj.append('starting_date', formData.start_date);
      formDataObj.append('ending_date', formData.end_date);
      formDataObj.append('max_people', formData.max_participants);
      formDataObj.append('destination', formData.arrival_city);
      formDataObj.append('meeting_location', formData.departure_city);
      formDataObj.append('is_featured', formData.is_featured.toString());
      formDataObj.append('status', formData.status);
      
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
      
      // Add itinerary as features
      formData.itinerary.forEach((day, index) => {
        formDataObj.append(`features[${formData.inclusions.length + index}]`, 
          `Day ${day.day}: ${day.title} - ${day.description}`
        );
      });

      // Add images
      formData.images.forEach((image, index) => {
        formDataObj.append(`images[${index}]`, image);
      });

      // Log the FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // RTK Query mutation automatically handles authentication headers
      const response = await createPackage(formDataObj).unwrap();
      
      console.log('Package creation response:', response);
      
      toast({
        title: "تم إنشاء الباقة بنجاح",
        description: "تم إنشاء الباقة الجديدة وحفظها في النظام",
      });
      
      // Redirect to packages list
      router.push('/ar/umrah-offices/dashboard/packages');
    } catch (error) {
      console.error('Error creating package:', error);
      console.error('Error details:', error.data);
      
      let errorMessage = "حدث خطأ أثناء إنشاء الباقة";
      
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
        title: "فشل إنشاء الباقة",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">إضافة باقة جديدة</h1>
          <p className="text-muted-foreground">أنشئ باقة جديدة للعرض للحجاج</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fillExampleData}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            تعبئة نموذج تجريبي
          </Button>
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            العودة
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic information */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>أدخل المعلومات الأساسية للباقة</CardDescription>
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
                    value={formData.type}
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
                  <Label htmlFor="currency">العملة *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange('currency', value)}
                    required
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_participants">الحد الأدنى للمشاركين *</Label>
                  <Input
                    id="min_participants"
                    name="min_participants"
                    type="number"
                    value={formData.min_participants}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <div className="space-y-2">
                  <Label>آخر موعد للحجز *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right"
                      >
                        {formData.booking_deadline ? (
                          format(new Date(formData.booking_deadline), 'yyyy-MM-dd')
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
                        selected={formData.booking_deadline ? new Date(formData.booking_deadline) : undefined}
                        onSelect={(date) => handleDateChange('booking_deadline', date)}
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
                  value={formData.status}
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
              <CardDescription>حدد ما يشمله ولا يشمله السعر</CardDescription>
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
              <CardDescription>حدد برنامج الرحلة اليومي بالتفصيل</CardDescription>
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
          
          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>الشروط والأحكام</CardTitle>
              <CardDescription>حدد شروط وأحكام الباقة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="terms_conditions">الشروط والأحكام *</Label>
                <Textarea
                  id="terms_conditions"
                  name="terms_conditions"
                  value={formData.terms_conditions}
                  onChange={handleInputChange}
                  placeholder="أدخل الشروط والأحكام المتعلقة بالباقة..."
                  className="min-h-32"
                  required
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>صور الباقة</CardTitle>
              <CardDescription>أضف صورًا للباقة لعرضها في صفحة التفاصيل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images && formData.images.length > 0 ? (
                    formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video relative rounded-lg overflow-hidden border">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Package image ${index + 1}`}
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
                    ))
                  ) : null}
                  
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جارِ الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ الباقة
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 