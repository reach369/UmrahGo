'use client';

import { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Globe, Star, Building2, CheckCircle, XCircle, Facebook, Twitter, Instagram, FileText, FileCheck2, RefreshCw, Pencil, Save, X, ImageIcon, Upload, PlusCircle, Heart, HeartHandshake, CheckCircle2, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Translation {
  locale: string;
  office_name: string;
  address: string;
  description: string;
  services_offered: string;
  city: string;
  state: string;
  country: string;
}

interface GalleryImage {
  id: number;
  image_path: string;
  thumbnail_path: string;
  title: string;
  description: string;
  is_featured: boolean;
  display_order: number;
}

interface OfficeProfile {
  id: number;
  user_id: number;
  office_name: string;
  address: string;
  contact_number: string;
  logo: string;
  license_doc: string;
  verification_status: string;
  subscription_id: number;
  email: string;
  website: string | null;
  fax: string | null;
  whatsapp: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  commercial_register_number: string;
  license_number: string;
  license_expiry_date: string;
  description: string;
  services_offered: string;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_featured: boolean;
  rating: string;
  reviews_count: number;
  is_active: boolean;
  translations?: Translation[];
  gallery?: GalleryImage[];
  user?: {
    id: number;
    name: string;
    email: string;
    role_id: number;
  };
  rejection_notes: string | null;
  verified_at: string | null;
  verified_by: number | null;
}

interface UpdateOfficeData {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  phone: string;
  email: string;
  website: string;
  license_number: string;
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
}

interface OfficeDocument {
  id: number;
  type: string;
  title: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  phone: string;
  email: string;
  website: string;
  license_number: string;
  facebook: string;
  twitter: string;
  instagram: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;
}

export default function OfficeProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ar';
  const [office, setOffice] = useState<OfficeProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // معرض الصور
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState<boolean>(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  
  // رفع الصور الجديدة
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // التعديلات
  const [formData, setFormData] = useState<FormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    phone: '',
    email: '',
    website: '',
    license_number: '',
    facebook: '',
    twitter: '',
    instagram: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    latitude: '',
    longitude: ''
  });

  // مستندات المكتب
  const [documents, setDocuments] = useState<OfficeDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  
  // رفع مستند جديد
  const [isUploadDocDialogOpen, setIsUploadDocDialogOpen] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [uploadDocSuccess, setUploadDocSuccess] = useState<boolean>(false);
  const [uploadDocError, setUploadDocError] = useState<string | null>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState<boolean>(false);
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [isUpdatingVerification, setIsUpdatingVerification] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const fetchOfficeProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching office profile...');
      const response = await axiosInstance.get('/api/v1/office/profile');
      console.log('Office profile response:', response.data);
      
      if (response.data && response.data.status) {
        const officeData = response.data.data as OfficeProfile;
        console.log('Office data:', officeData);
        setOffice(officeData);
        
        // Update form data with the response data
        setFormData({
          name: officeData.office_name || '',
          name_ar: officeData.translations?.find((t: Translation) => t.locale === 'ar')?.office_name || '',
          description: officeData.description || '',
          description_ar: officeData.translations?.find((t: Translation) => t.locale === 'ar')?.description || '',
          phone: officeData.contact_number || '',
          email: officeData.email || '',
          website: officeData.website || '',
          license_number: officeData.license_number || '',
          facebook: officeData.facebook_url || '',
          twitter: officeData.twitter_url || '',
          instagram: officeData.instagram_url || '',
          street: officeData.address || '',
          city: officeData.city || '',
          state: officeData.state || '',
          country: officeData.country || '',
          postal_code: officeData.postal_code || '',
          latitude: officeData.latitude || '',
          longitude: officeData.longitude || ''
        });
      } else {
        throw new Error(response.data?.message || 'فشل في جلب بيانات المكتب');
      }
    } catch (err: any) {
      console.error('خطأ في جلب بيانات المكتب:', err);
      setError(err.message || 'فشل في جلب بيانات المكتب');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    setGalleryError(null);
    
    try {
      const response = await axiosInstance.get('/api/v1/office/gallery');
      
      if (response.data && response.data.status) {
        // تأكد من أن البيانات المستلمة هي مصفوفة
        const galleryData = response.data.data || [];
        setGalleryImages(Array.isArray(galleryData) ? galleryData : []);
        console.log('تم جلب معرض الصور بنجاح:', galleryData);
      } else {
        setGalleryError('لم يتم العثور على صور في معرض المكتب');
        // تعيين مصفوفة فارغة في حالة عدم وجود بيانات
        setGalleryImages([]);
      }
    } catch (err: any) {
      console.error('خطأ في جلب معرض الصور:', err);
      
      if (err.response?.data?.message) {
        setGalleryError(err.response.data.message);
      } else {
        setGalleryError('حدث خطأ أثناء جلب معرض الصور. يرجى المحاولة مرة أخرى');
      }
      
      // تعيين مصفوفة فارغة في حالة حدوث خطأ
      setGalleryImages([]);
      
      console.error(`فشل في جلب معرض الصور: ${err.response?.data?.message || err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError(null);
    
    try {
      const response = await axiosInstance.get('/api/v1/office/documents');
      
      if (response.data && response.data.status) {
        // تأكد من أن البيانات المستلمة هي مصفوفة
        const documentsData = response.data.data || [];
        setDocuments(Array.isArray(documentsData) ? documentsData : []);
        console.log('تم جلب مستندات المكتب بنجاح:', documentsData);
      } else {
        setDocumentsError('لم يتم العثور على مستندات');
        // تعيين مصفوفة فارغة في حالة عدم وجود بيانات
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('خطأ في جلب مستندات المكتب:', err);
      
      if (err.response?.data?.message) {
        setDocumentsError(err.response.data.message);
      } else {
        setDocumentsError('حدث خطأ أثناء جلب المستندات. يرجى المحاولة مرة أخرى');
      }
      
      // تعيين مصفوفة فارغة في حالة حدوث خطأ
      setDocuments([]);
      
      console.error(`فشل في جلب المستندات: ${err.response?.data?.message || err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      // Transform flat form data into the structure expected by the API
      const updateData = {
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        license_number: formData.license_number,
        social_media: {
          facebook: formData.facebook,
          twitter: formData.twitter,
          instagram: formData.instagram
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
          latitude: parseFloat(formData.latitude) || null,
          longitude: parseFloat(formData.longitude) || null
        }
      };

      const response = await axiosInstance.put('/api/v1/office/profile', updateData);
      
      if (response.data && response.data.status) {
        setUpdateSuccess(true);
        
        // Update the office data with the response
        const officeData = response.data.data as OfficeProfile;
        setOffice(officeData);
        
        // Update form data with the new values
        setFormData({
          name: officeData.office_name || '',
          name_ar: officeData.translations?.find((t: Translation) => t.locale === 'ar')?.office_name || '',
          description: officeData.description || '',
          description_ar: officeData.translations?.find((t: Translation) => t.locale === 'ar')?.description || '',
          phone: officeData.contact_number || '',
          email: officeData.email || '',
          website: officeData.website || '',
          license_number: officeData.license_number || '',
          facebook: officeData.facebook_url || '',
          twitter: officeData.twitter_url || '',
          instagram: officeData.instagram_url || '',
          street: officeData.address || '',
          city: officeData.city || '',
          state: officeData.state || '',
          country: officeData.country || '',
          postal_code: officeData.postal_code || '',
          latitude: officeData.latitude || '',
          longitude: officeData.longitude || ''
        });
        
        setTimeout(() => {
          setIsEditing(false);
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('خطأ في تحديث بيانات المكتب:', err);
      
      if (err.response?.data?.message) {
        setUpdateError(err.response.data.message);
      } else {
        setUpdateError('حدث خطأ أثناء تحديث بيانات المكتب. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    // إعادة تعيين البيانات من الأصل
    if (office) {
      setFormData({
        name: office.office_name || '',
        phone: office.contact_number || '',
        street: office.address || '',
        description: office.description || '',
        name_ar: office.translations?.find(t => t.locale === 'ar')?.office_name || '',
        description_ar: office.translations?.find(t => t.locale === 'ar')?.description || '',
        email: office.email || '',
        website: office.website || '',
        license_number: office.license_number || '',
        facebook: office.facebook_url || '',
        twitter: office.twitter_url || '',
        instagram: office.instagram_url || '',
        city: office.city || '',
        state: office.state || '',
        country: office.country || '',
        postal_code: office.postal_code || '',
        latitude: office.latitude || '',
        longitude: office.longitude || ''
      });
    }
    
    setIsEditing(false);
    setUpdateSuccess(false);
    setUpdateError(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageCaption(e.target.value);
  };

  const resetUploadForm = () => {
    setSelectedImage(null);
    setImageCaption('');
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      setUploadError('يرجى اختيار صورة للرفع');
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      if (imageCaption) {
        formData.append('caption', imageCaption);
      }
      
      const response = await axiosInstance.post('/api/v1/office/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status && response.data) {
        console.log('تم رفع الصورة بنجاح:', response.data);
        setUploadSuccess(true);
        
        // تحديث معرض الصور بعد الإضافة بنجاح
        setTimeout(() => {
          fetchGallery();
          setIsUploadDialogOpen(false);
          resetUploadForm();
        }, 1500);
      } else {
        throw new Error('فشل رفع الصورة');
      }
    } catch (err: any) {
      console.error('خطأ في رفع الصورة:', err);
      
      if (err.response?.data?.message) {
        setUploadError(err.response.data.message);
      } else {
        setUploadError('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى');
      }
      
      console.error(`فشل في رفع الصورة: ${err.response?.data?.message || err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetFeatured = async (imageId: number) => {
    try {
      setIsLoadingGallery(true);
      
      const response = await axiosInstance.put(`/api/v1/office/gallery/${imageId}/featured`);
      
      if (response.status && response.data) {
        console.log('تم تعيين الصورة كمميزة بنجاح:', response.data);
        // تحديث معرض الصور لعرض التغييرات
        fetchGallery();
      } else {
        throw new Error('فشل في تعيين الصورة كمميزة');
      }
    } catch (err: any) {
      console.error('خطأ في تعيين الصورة كمميزة:', err);
      
      const errorMsg = err.response?.data?.message || err.message || 'خطأ غير معروف';
      console.error(`فشل في تعيين الصورة كمميزة: ${errorMsg}`);
      
      // عرض رسالة الخطأ للمستخدم
      setGalleryError(`فشل في تعيين الصورة كمميزة: ${errorMsg}`);
      setTimeout(() => setGalleryError(null), 3000);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedDocument(e.target.files[0]);
    }
  };

  const resetDocumentForm = () => {
    setSelectedDocument(null);
    setDocumentType('');
    setDocumentTitle('');
    setUploadDocSuccess(false);
    setUploadDocError(null);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedDocument) {
      setUploadDocError('يرجى اختيار مستند للرفع');
      return;
    }

    if (!documentType) {
      setUploadDocError('يرجى تحديد نوع المستند');
      return;
    }

    if (!documentTitle && documentType === 'other') {
      setUploadDocError('يرجى إدخال عنوان المستند');
      return;
    }

    setIsUploadingDoc(true);
    setUploadDocSuccess(false);
    setUploadDocError(null);
    
    try {
      const formData = new FormData();

      // التعامل مع أنواع المستندات المختلفة
      switch (documentType) {
        case 'tax_certificate':
          formData.append('tax_certificate', selectedDocument);
          break;
        case 'commercial_register':
          formData.append('commercial_register', selectedDocument);
          break;
        case 'other':
          formData.append('other_documents[]', selectedDocument);
          if (documentTitle) {
            formData.append('document_titles[]', documentTitle);
          }
          break;
        default:
          throw new Error('نوع مستند غير صالح');
      }
      
      const response = await axiosInstance.post('/api/v1/office/profile/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.status) {
        console.log('تم رفع المستند بنجاح:', response.data);
        setUploadDocSuccess(true);
        
        // تحديث قائمة المستندات بعد الإضافة بنجاح
        setTimeout(() => {
          fetchDocuments();
          setIsUploadDocDialogOpen(false);
          resetDocumentForm();
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'فشل رفع المستند');
      }
    } catch (err: any) {
      console.error('خطأ في رفع المستند:', err);
      
      if (err.response?.data?.message) {
        setUploadDocError(err.response.data.message);
      } else {
        setUploadDocError('حدث خطأ أثناء رفع المستند. يرجى المحاولة مرة أخرى');
      }
      
      console.error(`فشل في رفع المستند: ${err.response?.data?.message || err.message || 'خطأ غير معروف'}`);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleUpdateVerification = async (isVerified: boolean) => {
    setIsUpdatingVerification(true);
    setVerificationSuccess(false);
    setVerificationError(null);
    
    try {
      const response = await axiosInstance.put('/api/v1/office/profile/verification', {
        is_verified: isVerified,
        verification_notes: verificationNotes
      });
      
      if (response.data && response.data.status) {
        setVerificationSuccess(true);
        
        // تحديث بيانات المكتب
        const officeData = response.data.data as OfficeProfile;
        setOffice(officeData);
        
        setTimeout(() => {
          setIsVerificationDialogOpen(false);
          setVerificationNotes('');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to update verification status');
      }
    } catch (err: any) {
      console.error('خطأ في تحديث حالة التحقق:', err);
      
      if (err.response?.data?.message) {
        setVerificationError(err.response.data.message);
      } else {
        setVerificationError('حدث خطأ أثناء تحديث حالة التحقق. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsUpdatingVerification(false);
    }
  };

  useEffect(() => {
    fetchOfficeProfile();
  }, []);

  // جلب المعرض عند تحديد علامة التبويب
  const handleGalleryTabSelect = () => {
    if (galleryImages.length === 0 && !isLoadingGallery) {
      fetchGallery();
    }
  };

  // دالة تنفذ عند النقر على تبويب المستندات
  const handleDocumentsTabSelect = () => {
    if (documents.length === 0 && !isLoadingDocuments) {
      fetchDocuments();
    }
  };

  // دالة التنقل إلى المستندات
  const navigateToDocuments = () => {
    router.push(`/${locale}/umrah-offices/dashboard/documents`);
  };

  // دالة التنقل إلى معرض الصور
  const navigateToGallery = () => {
    router.push(`/${locale}/umrah-offices/dashboard/gallery`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل بيانات المكتب...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">خطأ في جلب البيانات</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button 
              onClick={fetchOfficeProfile} 
              variant="outline" 
              className="mx-auto flex gap-2 items-center"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">لم يتم العثور على بيانات</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">لم نتمكن من العثور على بيانات المكتب الخاص بك</p>
            <Button 
              onClick={fetchOfficeProfile} 
              variant="outline" 
              className="mx-auto flex gap-2 items-center"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      {/* Add navigation buttons at the top */}
      <div className="flex gap-4 justify-end mb-6">
        <Button
          onClick={navigateToGallery}
          className="bg-primary hover:bg-primary/90"
        >
          <ImageIcon className="h-4 w-4 ml-2" />
          إدارة معرض الصور
        </Button>
        <Button
          onClick={navigateToDocuments}
          className="bg-primary hover:bg-primary/90"
        >
          <FileText className="h-4 w-4 ml-2" />
          إدارة المستندات
        </Button>
        <Button
          onClick={() => router.push('profile/change-password')}
          className="bg-primary hover:bg-primary/90"
        >
          <KeyRound className="h-4 w-4 ml-2" />
          تغيير كلمة المرور
        </Button>
      </div>
      
      {/* API Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-500" />
        <div>
          <h3 className="font-bold text-green-800">حالة الاتصال بـ API</h3>
          <p className="text-green-700">
            ✅ هذه الصفحة متصلة بـ API حقيقي وتعرض بيانات فعلية
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="w-full justify-center mb-6">
          <TabsTrigger value="view">عرض الملف الشخصي</TabsTrigger>
          <TabsTrigger value="edit">تعديل الملف الشخصي</TabsTrigger>
          <TabsTrigger value="gallery" onClick={handleGalleryTabSelect}>معرض الصور</TabsTrigger>
          <TabsTrigger value="documents" onClick={handleDocumentsTabSelect}>المستندات</TabsTrigger>
          <TabsTrigger value="verification">حالة التحقق</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                {office.logo && (
                  <Image
                    src={office.logo.startsWith('http') ? office.logo : `/${office.logo}`}
                    alt={office.office_name}
                    width={120}
                    height={120}
                    className="rounded-full border object-cover"
                  />
                )}
              </div>
              <div className="flex-1 text-right">
                <CardTitle className="text-3xl font-bold text-primary mb-2">{office.office_name}</CardTitle>
                <div className="flex flex-wrap gap-2 items-center justify-end mb-2">
                  <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {office.verification_status === 'verified' ? 'موثق' : 'غير موثق'}
                  </Badge>
                  {office.is_featured && (
                    <Badge className="bg-blue-100 text-blue-700">مكتب مميز</Badge>
                  )}
                  {office.rating && (
                    <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {office.rating} / 5
                    </Badge>
                  )}
                  {office.reviews_count && (
                    <Badge className="bg-gray-100 text-gray-700">{office.reviews_count} تقييم</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 items-center justify-end text-muted-foreground text-sm">
                  {office.contact_number && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{office.contact_number}</span>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{office.email}</span>
                    </div>
                  )}
                  {office.city && office.state && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{office.city}, {office.state}</span>
                    </div>
                  )}
                  {office.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a href={office.website} target="_blank" rel="noopener noreferrer" className="hover:underline">الموقع الإلكتروني</a>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-right">
                  {office.address && (
                    <div>
                      <span className="font-semibold">العنوان:</span>
                      <span className="mr-2">{office.address}</span>
                    </div>
                  )}
                  {office.commercial_register_number && (
                    <div>
                      <span className="font-semibold">رقم السجل التجاري:</span>
                      <span className="mr-2">{office.commercial_register_number}</span>
                    </div>
                  )}
                  {office.license_number && (
                    <div>
                      <span className="font-semibold">رقم الترخيص:</span>
                      <span className="mr-2">{office.license_number}</span>
                    </div>
                  )}
                  {office.license_expiry_date && (
                    <div>
                      <span className="font-semibold">تاريخ انتهاء الترخيص:</span>
                      <span className="mr-2">{new Date(office.license_expiry_date).toLocaleDateString('ar-SA')}</span>
                    </div>
                  )}
                  {'is_active' in office && (
                    <div>
                      <span className="font-semibold">الحالة:</span>
                      <Badge className={office.is_active ? 'bg-green-500' : 'bg-gray-400'}>
                        {office.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  )}
                  {office.description && (
                    <div>
                      <span className="font-semibold">الوصف:</span>
                      <p className="text-muted-foreground mt-1">{office.description}</p>
                    </div>
                  )}
                  {office.services_offered && (
                    <div>
                      <span className="font-semibold">الخدمات المقدمة:</span>
                      <p className="text-muted-foreground mt-1">{office.services_offered}</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-2">
                    {office.facebook_url && (
                      <a href={office.facebook_url} target="_blank" rel="noopener noreferrer" title="فيسبوك">
                        <Facebook className="h-6 w-6 text-blue-600 hover:scale-110 transition" />
                      </a>
                    )}
                    {office.twitter_url && (
                      <a href={office.twitter_url} target="_blank" rel="noopener noreferrer" title="تويتر">
                        <Twitter className="h-6 w-6 text-blue-400 hover:scale-110 transition" />
                      </a>
                    )}
                    {office.instagram_url && (
                      <a href={office.instagram_url} target="_blank" rel="noopener noreferrer" title="انستجرام">
                        <Instagram className="h-6 w-6 text-pink-500 hover:scale-110 transition" />
                      </a>
                    )}
                  </div>
                  {office.license_doc && (
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <a 
                        href={office.license_doc.startsWith('http') ? office.license_doc : `/${office.license_doc}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        عرض الترخيص
                      </a>
                    </div>
                  )}
                  
                  {/* Security Section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-lg mb-2">الأمان والخصوصية</h3>
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      <button 
                        onClick={() => router.push('profile/change-password')}
                        className="text-primary hover:underline"
                      >
                        تغيير كلمة المرور
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {office.gallery && office.gallery.length > 0 && (
                    <>
                      <div className="font-semibold mb-2">معرض الصور:</div>
                      <div className="flex gap-4 flex-wrap">
                        {office.gallery.map((img) => (
                          <div key={img.id} className="w-32 h-24 rounded-lg overflow-hidden border relative group">
                            <Image 
                              src={img.image_path.startsWith('http') ? img.image_path : `/${img.image_path}`} 
                              alt={img.description ? `${img.title} - ${img.description}` : img.title || 'صورة المكتب'} 
                              width={128} 
                              height={96} 
                              className="object-cover w-full h-full" 
                            />
                            <div className="absolute bottom-0 right-0 left-0 bg-black/60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition">
                              {img.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="mt-6">
                    <div className="font-semibold mb-2">الموقع الجغرافي:</div>
                    <div className="text-muted-foreground text-sm">
                      {office.city}, {office.state}, {office.country} - {office.postal_code}
                    </div>
                    {/* يمكن إضافة خريطة تفاعلية هنا لاحقًا */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary text-center">تعديل بيانات المكتب</CardTitle>
              <CardDescription className="text-center">
                يمكنك تعديل البيانات الأساسية للمكتب من هنا
              </CardDescription>
            </CardHeader>
            <CardContent>
              {updateSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 text-center text-green-700">
                  تم تحديث بيانات المكتب بنجاح
                </div>
              )}
              
              {updateError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-center text-red-700">
                  {updateError}
                </div>
              )}
              
              <form className="space-y-6 max-w-xl mx-auto">
                <div className="space-y-2 text-right">
                  <Label htmlFor="name">اسم المكتب (بالإنجليزية)</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter office name in English"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="name_ar">اسم المكتب (بالعربية)</Label>
                  <Input
                    id="name_ar"
                    name="name_ar"
                    value={formData.name_ar}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المكتب بالعربية"
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2 text-right">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+966××××××××××"
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2 text-right">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="website">الموقع الإلكتروني</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="license_number">رقم الترخيص</Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم الترخيص"
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2 text-right">
                  <Label htmlFor="street">العنوان</Label>
                  <Input
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="أدخل عنوان المكتب"
                    dir="rtl"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم المدينة"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="state">المنطقة</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم المنطقة"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="country">الدولة</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الدولة"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="postal_code">الرمز البريدي</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="أدخل الرمز البريدي"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-right">
                  <Label htmlFor="description">وصف المكتب (بالإنجليزية)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter office description in English"
                    rows={5}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="description_ar">وصف المكتب (بالعربية)</Label>
                  <Textarea
                    id="description_ar"
                    name="description_ar"
                    value={formData.description_ar}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف المكتب بالعربية"
                    rows={5}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-right">روابط التواصل الاجتماعي</h3>
                  
                  <div className="space-y-2 text-right">
                    <Label htmlFor="facebook">فيسبوك</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/your-page"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="twitter">تويتر</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/your-handle"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="instagram">انستجرام</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/your-profile"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="min-w-[120px] bg-primary"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        حفظ التعديلات
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="min-w-[120px]"
                  >
                    <X className="h-4 w-4 mr-2" />
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card className="mb-8">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-primary text-center md:text-right">معرض صور المكتب</CardTitle>
                <CardDescription className="text-center md:text-right">
                  عرض وإدارة الصور الخاصة بالمكتب
                </CardDescription>
              </div>
              
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    إضافة صورة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] text-right">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة صورة جديدة</DialogTitle>
                    <DialogDescription className="text-right">
                      قم برفع صورة جديدة إلى معرض المكتب.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {uploadSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center text-green-700">
                      تم رفع الصورة بنجاح
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {uploadError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center text-red-700 text-sm">
                          {uploadError}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="image" className="block">اختر الصورة</Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          ref={fileInputRef}
                          className="cursor-pointer"
                        />
                        {selectedImage && (
                          <div className="text-sm text-gray-500 mt-1">
                            الملف المختار: {selectedImage.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="caption">وصف الصورة (اختياري)</Label>
                        <Input
                          id="caption"
                          value={imageCaption}
                          onChange={handleCaptionChange}
                          placeholder="أدخل وصفاً للصورة"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    {!uploadSuccess && (
                      <Button 
                        type="button" 
                        className="flex-1"
                        onClick={handleUploadImage}
                        disabled={!selectedImage || isUploading}
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            رفع الصورة
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        if (uploadSuccess) {
                          setIsUploadDialogOpen(false);
                          resetUploadForm();
                        } else {
                          resetUploadForm();
                        }
                      }}
                    >
                      {uploadSuccess ? 'إغلاق' : 'إلغاء'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingGallery ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-lg text-muted-foreground">جاري تحميل معرض الصور...</p>
                </div>
              ) : galleryError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{galleryError}</p>
                  <Button 
                    onClick={fetchGallery} 
                    variant="outline" 
                    className="mx-auto flex gap-2 items-center"
                  >
                    <RefreshCw className="h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">لا توجد صور في المعرض</p>
                  <p className="text-sm text-muted-foreground/70 mb-6">يمكنك البدء بإضافة صور لعرضها هنا</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="rounded-lg overflow-hidden border bg-white shadow-sm relative group">
                      <div className="aspect-[4/3] relative bg-gray-100 flex items-center justify-center">
                        {image.image_path ? (
                          <Image 
                            src={image.image_path.startsWith('http') ? image.image_path : `/${image.image_path}`} 
                            alt={image.description ? `${image.title} - ${image.description}` : image.title || 'صورة المكتب'} 
                            width={128} 
                            height={96} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon className="h-12 w-12 mb-2" />
                            <span className="text-sm">بدون صورة</span>
                          </div>
                        )}
                        {image.is_featured && (
                          <Badge className="absolute top-2 right-2 bg-primary">مميزة</Badge>
                        )}
                        
                        {!image.is_featured && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 h-auto"
                            onClick={() => handleSetFeatured(image.id)}
                            title="تعيين كصورة مميزة"
                          >
                            <Heart className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                      </div>
                      <div className="p-4 text-right">
                        <p className="text-sm text-gray-500 mb-2">ترتيب العرض: {image.display_order}</p>
                        <p className="text-sm text-gray-700">{image.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="mb-8">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-primary text-center md:text-right">مستندات المكتب</CardTitle>
                <CardDescription className="text-center md:text-right">
                  عرض وإدارة المستندات الخاصة بالمكتب
                </CardDescription>
              </div>
              
              <Dialog open={isUploadDocDialogOpen} onOpenChange={setIsUploadDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    إضافة مستند جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] text-right">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة مستند جديد</DialogTitle>
                    <DialogDescription className="text-right">
                      قم برفع مستند جديد لمكتبك.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {uploadDocSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center text-green-700">
                      تم رفع المستند بنجاح
                    </div>
                  ) : (
                    <div className="space-y-4 py-4">
                      {uploadDocError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center text-red-700 text-sm">
                          {uploadDocError}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="documentType">نوع المستند</Label>
                        <select
                          id="documentType"
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          dir="rtl"
                        >
                          <option value="">اختر نوع المستند</option>
                          <option value="tax_certificate">شهادة الزكاة والضريبة</option>
                          <option value="commercial_register">السجل التجاري</option>
                          <option value="other">مستند آخر</option>
                        </select>
                      </div>
                      
                      {documentType === 'other' && (
                        <div className="space-y-2">
                          <Label htmlFor="documentTitle">عنوان المستند</Label>
                          <Input
                            id="documentTitle"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            placeholder="أدخل عنواناً للمستند"
                            dir="rtl"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="document" className="block">اختر الملف</Label>
                        <Input
                          id="document"
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleDocumentSelect}
                          ref={documentInputRef}
                          className="cursor-pointer"
                        />
                        {selectedDocument && (
                          <div className="text-sm text-gray-500 mt-1">
                            الملف المختار: {selectedDocument.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    {!uploadDocSuccess && (
                      <Button 
                        type="button" 
                        className="flex-1"
                        onClick={handleUploadDocument}
                        disabled={!selectedDocument || !documentType || (documentType === 'other' && !documentTitle) || isUploadingDoc}
                      >
                        {isUploadingDoc ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            رفع المستند
                          </>
                        )}
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        if (uploadDocSuccess) {
                          setIsUploadDocDialogOpen(false);
                          resetDocumentForm();
                        } else {
                          resetDocumentForm();
                        }
                      }}
                    >
                      {uploadDocSuccess ? 'إغلاق' : 'إلغاء'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingDocuments ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-lg text-muted-foreground">جاري تحميل المستندات...</p>
                </div>
              ) : documentsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{documentsError}</p>
                  <Button 
                    onClick={fetchDocuments} 
                    variant="outline" 
                    className="mx-auto flex gap-2 items-center"
                  >
                    <RefreshCw className="h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-lg text-muted-foreground mb-2">لا توجد مستندات</p>
                  <p className="text-sm text-muted-foreground/70 mb-6">يمكنك البدء بإضافة مستندات من خلال الزر أعلاه</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div key={doc.id} className="rounded-lg overflow-hidden border bg-white shadow-sm">
                      <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center h-full">
                          <FileText className="h-16 w-16 text-primary/60 mb-2" />
                          <Badge variant="outline" className="mx-auto">
                            {doc.type === 'license' && 'ترخيص'}
                            {doc.type === 'registration' && 'تسجيل تجاري'}
                            {doc.type === 'insurance' && 'تأمين'}
                            {doc.type === 'other' && 'مستند آخر'}
                            {!['license', 'registration', 'insurance', 'other'].includes(doc.type) && doc.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 text-right">
                        <h3 className="font-semibold mb-2">{doc.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          تاريخ الإضافة: {new Date(doc.created_at).toLocaleDateString('ar-SA')}
                        </p>
                        <a 
                          href={doc.file_path.startsWith('http') ? doc.file_path : `/${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center gap-2 hover:underline text-sm"
                        >
                          <FileCheck2 className="h-4 w-4" />
                          عرض المستند
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary text-center">حالة التحقق من المكتب</CardTitle>
              <CardDescription className="text-center">
                إدارة حالة التحقق وملاحظات التحقق للمكتب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold mb-2">الحالة الحالية</h3>
                    <Badge 
                      className={office?.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                    >
                      {office?.verification_status === 'verified' ? 'تم التحقق' : 'في انتظار التحقق'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setIsVerificationDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    تحديث حالة التحقق
                  </Button>
                </div>

                {office?.verification_status === 'verified' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">ملاحظات التحقق</h4>
                      <p className="text-gray-600">{office.rejection_notes || 'لا توجد ملاحظات'}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">تاريخ التحقق</h4>
                      <p className="text-gray-600">
                        {office.verified_at ? new Date(office.verified_at).toLocaleDateString('ar-SA') : 'غير متوفر'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
            <DialogContent className="sm:max-w-[425px] text-right">
              <DialogHeader>
                <DialogTitle className="text-right">تحديث حالة التحقق</DialogTitle>
                <DialogDescription className="text-right">
                  قم بتحديث حالة التحقق وإضافة الملاحظات المطلوبة
                </DialogDescription>
              </DialogHeader>
              
              {verificationSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center text-green-700">
                  تم تحديث حالة التحقق بنجاح
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  {verificationError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center text-red-700 text-sm">
                      {verificationError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="verificationNotes">ملاحظات التحقق</Label>
                    <Textarea
                      id="verificationNotes"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="أدخل ملاحظات التحقق هنا..."
                      rows={4}
                      dir="rtl"
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {!verificationSuccess && (
                  <>
                    <Button 
                      type="button" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateVerification(true)}
                      disabled={isUpdatingVerification}
                    >
                      {isUpdatingVerification ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          تأكيد التحقق
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleUpdateVerification(false)}
                      disabled={isUpdatingVerification}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      رفض التحقق
                    </Button>
                  </>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    if (verificationSuccess) {
                      setIsVerificationDialogOpen(false);
                      setVerificationNotes('');
                    } else {
                      setIsVerificationDialogOpen(false);
                    }
                  }}
                >
                  {verificationSuccess ? 'إغلاق' : 'إلغاء'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}