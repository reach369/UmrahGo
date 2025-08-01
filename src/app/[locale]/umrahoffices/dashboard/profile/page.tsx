'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toast } from 'react-hot-toast';
import { User, Building, Mail, Phone, MapPin, Globe, FileText, Upload, Camera } from 'lucide-react';
import { getValidImageUrl } from '@/utils/image-helpers';
  import { useGetOfficeProfileQuery, useUpdateOfficeProfileMutation, useUploadLogoMutation } from '../../redux/api/officesApiSlice';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function OfficeProfilePage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  // Get auth data from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
    const officeId = user?.officeId;
  
  // Query office profile data
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetOfficeProfileQuery();
  
  // Mutation hooks for updating profile
  const [updateProfile, { isLoading: isUpdating }] = useUpdateOfficeProfileMutation();
  const [uploadLogo, { isLoading: isUploading }] = useUploadLogoMutation();
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    office_name: '',
    email: '',
    contact_number: '',
    whatsapp: '',
    website: '',
    description: ''
  });
  
  const [addressInfo, setAddressInfo] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    latitude: '',
    longitude: ''
  });
  
  const [legalInfo, setLegalInfo] = useState({
    license_number: '',
    license_expiry_date: '',
    commercial_register_number: ''
  });
  
  const [socialInfo, setSocialInfo] = useState({
    facebook_url: '',
    twitter_url: '',
    instagram_url: ''
  });
  
  // File upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Current tab state
  const [currentTab, setCurrentTab] = useState('basic');
  
  // Load data into state when profile data is fetched
  useEffect(() => {
    if (profileData) {
      setBasicInfo({
        office_name: profileData.office_name || '',
        email: profileData.email || '',
        contact_number: profileData.contact_number || '',
        whatsapp: profileData.whatsapp || '',
        website: profileData.website || '',
        description: profileData.description || ''
      });
      
      setAddressInfo({
        address: profileData.address || '',
        city: profileData.city || '',
        state: profileData.state || '',
        country: profileData.country || '',
        postal_code: profileData.postal_code || '',
        latitude: profileData.latitude || '',
        longitude: profileData.longitude || ''
      });
      
      setLegalInfo({
        license_number: profileData.license_number || '',
        license_expiry_date: profileData.license_expiry_date ? 
          new Date(profileData.license_expiry_date).toISOString().split('T')[0] : '',
        commercial_register_number: profileData.commercial_register_number || ''
      });
      
      setSocialInfo({
        facebook_url: profileData.facebook_url || '',
        twitter_url: profileData.twitter_url || '',
        instagram_url: profileData.instagram_url || ''
      });
    }
  }, [profileData]);
  
  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      
      await uploadLogo(formData).unwrap();
      toast.success('تم تحديث شعار المكتب بنجاح');
      
      // Refresh profile data
      refetchProfile();
      
      // Clear logo file
      setLogoFile(null);
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error('حدث خطأ أثناء تحديث الشعار');
    }
  };
  
  // Handle basic info update
  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({ 
        ...basicInfo 
      }).unwrap();
      toast.success('تم تحديث المعلومات الأساسية بنجاح');
    } catch (err) {
      console.error('Error updating basic info:', err);
      toast.error('حدث خطأ أثناء تحديث المعلومات الأساسية');
    }
  };
  
  // Handle address info update
  const handleAddressInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({ 
        ...addressInfo 
      }).unwrap();
      toast.success('تم تحديث معلومات العنوان بنجاح');
    } catch (err) {
      console.error('Error updating address info:', err);
      toast.error('حدث خطأ أثناء تحديث معلومات العنوان');
    }
  };
  
  // Handle legal info update
  const handleLegalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({ 
        ...legalInfo 
      }).unwrap();
      toast.success('تم تحديث المعلومات القانونية بنجاح');
    } catch (err) {
      console.error('Error updating legal info:', err);
      toast.error('حدث خطأ أثناء تحديث المعلومات القانونية');
    }
  };
  
  // Handle social info update
  const handleSocialInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({ 
        ...socialInfo 
      }).unwrap();
      toast.success('تم تحديث معلومات التواصل الاجتماعي بنجاح');
    } catch (err) {
      console.error('Error updating social info:', err);
      toast.error('حدث خطأ أثناء تحديث معلومات التواصل الاجتماعي');
    }
  };
  
  // Loading state
  if (isProfileLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (profileError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات الملف الشخصي. يرجى المحاولة مرة أخرى لاحقا.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchProfile()}>إعادة المحاولة</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold">الملف الشخصي للمكتب</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            يمكنك إدارة وتحديث بيانات مكتبك من هنا
          </p>
        </div>
        
        <div className="flex flex-col items-center  dark:bg-gray-800 p-6 rounded-lg shadow-sm w-full md:w-auto">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={logoPreview || getValidImageUrl(profileData?.logo)} alt={profileData?.office_name || 'شعار المكتب'} />
            <AvatarFallback>{profileData?.office_name?.charAt(0) || 'O'}</AvatarFallback>
          </Avatar>
          {/* <Badge className={`mb-2 ${profileData?.verification_status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {profileData?.verification_status === 'verified' ? 'موثق' : 'قيد المراجعة'}
          </Badge> */}
          <h2 className="text-xl font-bold">{profileData?.office_name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{profileData?.email}</p>
          
          <div className="mt-4 w-full">
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Camera className="h-4 w-4" />
                <span>تغيير الشعار</span>
              </div>
              <Input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleLogoChange} 
              />
            </Label>
            
            {logoFile && (
              <Button 
                className="w-full mt-2" 
                onClick={handleLogoUpload}
                disabled={isUploading}
              >
                {isUploading ? 'جاري الرفع...' : 'تحديث الشعار'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="address">العنوان</TabsTrigger>
          <TabsTrigger value="legal">المعلومات القانونية</TabsTrigger>
          <TabsTrigger value="social">التواصل الاجتماعي</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>
                قم بتحديث المعلومات الأساسية الخاصة بمكتبك
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleBasicInfoSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="office_name">اسم المكتب</Label>
                    <Input
                      id="office_name"
                      placeholder="اسم المكتب"
                      value={basicInfo.office_name}
                      onChange={(e) => setBasicInfo({ ...basicInfo, office_name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">رقم الهاتف</Label>
                    <Input
                      id="contact_number"
                      placeholder="رقم الهاتف"
                      value={basicInfo.contact_number}
                      onChange={(e) => setBasicInfo({ ...basicInfo, contact_number: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">رقم الواتساب</Label>
                    <Input
                      id="whatsapp"
                      placeholder="رقم الواتساب"
                      value={basicInfo.whatsapp}
                      onChange={(e) => setBasicInfo({ ...basicInfo, whatsapp: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <Input
                      id="website"
                      placeholder="الموقع الإلكتروني"
                      value={basicInfo.website}
                      onChange={(e) => setBasicInfo({ ...basicInfo, website: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المكتب</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف المكتب"
                    value={basicInfo.description}
                    onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                    rows={5}
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ المعلومات'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العنوان</CardTitle>
              <CardDescription>
                قم بتحديث معلومات عنوان المكتب
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddressInfoSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    placeholder="العنوان"
                    value={addressInfo.address}
                    onChange={(e) => setAddressInfo({ ...addressInfo, address: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      placeholder="المدينة"
                      value={addressInfo.city}
                      onChange={(e) => setAddressInfo({ ...addressInfo, city: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">المنطقة</Label>
                    <Input
                      id="state"
                      placeholder="المنطقة"
                      value={addressInfo.state}
                      onChange={(e) => setAddressInfo({ ...addressInfo, state: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">الدولة</Label>
                    <Input
                      id="country"
                      placeholder="الدولة"
                      value={addressInfo.country}
                      onChange={(e) => setAddressInfo({ ...addressInfo, country: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">الرمز البريدي</Label>
                    <Input
                      id="postal_code"
                      placeholder="الرمز البريدي"
                      value={addressInfo.postal_code}
                      onChange={(e) => setAddressInfo({ ...addressInfo, postal_code: e.target.value })}
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">خط العرض (Latitude)</Label>
                    <Input
                      id="latitude"
                      placeholder="خط العرض"
                      value={addressInfo.latitude}
                      onChange={(e) => setAddressInfo({ ...addressInfo, latitude: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="longitude">خط الطول (Longitude)</Label>
                    <Input
                      id="longitude"
                      placeholder="خط الطول"
                      value={addressInfo.longitude}
                      onChange={(e) => setAddressInfo({ ...addressInfo, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ معلومات العنوان'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات القانونية</CardTitle>
              <CardDescription>
                قم بتحديث المعلومات القانونية الخاصة بمكتبك
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLegalInfoSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">رقم الترخيص</Label>
                    <Input
                      id="license_number"
                      placeholder="رقم الترخيص"
                      value={legalInfo.license_number}
                      onChange={(e) => setLegalInfo({ ...legalInfo, license_number: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry_date">تاريخ انتهاء الترخيص</Label>
                    <Input
                      id="license_expiry_date"
                      type="date"
                      value={legalInfo.license_expiry_date}
                      onChange={(e) => setLegalInfo({ ...legalInfo, license_expiry_date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commercial_register_number">رقم السجل التجاري</Label>
                    <Input
                      id="commercial_register_number"
                      placeholder="رقم السجل التجاري"
                      value={legalInfo.commercial_register_number}
                      onChange={(e) => setLegalInfo({ ...legalInfo, commercial_register_number: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ المعلومات القانونية'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>التواصل الاجتماعي</CardTitle>
              <CardDescription>
                قم بتحديث روابط وسائل التواصل الاجتماعي
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSocialInfoSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">فيسبوك</Label>
                    <Input
                      id="facebook_url"
                      placeholder="رابط صفحة الفيسبوك"
                      value={socialInfo.facebook_url}
                      onChange={(e) => setSocialInfo({ ...socialInfo, facebook_url: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">تويتر</Label>
                    <Input
                      id="twitter_url"
                      placeholder="رابط حساب تويتر"
                      value={socialInfo.twitter_url}
                      onChange={(e) => setSocialInfo({ ...socialInfo, twitter_url: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">انستجرام</Label>
                    <Input
                      id="instagram_url"
                      placeholder="رابط حساب انستجرام"
                      value={socialInfo.instagram_url}
                      onChange={(e) => setSocialInfo({ ...socialInfo, instagram_url: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ معلومات التواصل الاجتماعي'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}