'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { authService } from '@/lib/auth.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Loader2, Trash } from 'lucide-react';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { validatePhoneNumber } from '@/utils/phone-utils';
import { E164Number } from 'libphonenumber-js/core';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// نموذج بيانات نموذج التعديل
interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferred_language: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // إعداد React Hook Form
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ProfileFormData>();
  const [language, setLanguage] = useState<string>('ar');

  useEffect(() => {
    // استرجاع بيانات المستخدم من localStorage عند تحميل الصفحة
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // محاولة استرجاع بيانات المستخدم من localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          
          // تعيين قيم النموذج من بيانات المستخدم
          setValue('name', userData.name || '');
          setValue('email', userData.email || '');
          setValue('phone', userData.phone || '');
          setValue('address', userData.address || '');
          setLanguage(userData.preferred_language || 'ar');
          setValue('preferred_language', userData.preferred_language || 'ar');
          
          // تعيين صورة الملف الشخصي
          setUserPhoto(userData.profile_photo || userData.avatar || null);
        } else {
          // إذا لم تكن البيانات موجودة، حاول الحصول عليها من الخادم
          try {
            const response = await authService.getCurrentUser();
            if (response.data?.user) {
              const user = response.data.user;
              setValue('name', user.name || '');
              setValue('email', user.email || '');
              setValue('phone', user.phone || '');
              setValue('address', (user as any).address || '');
              setLanguage(user.preferred_language || 'ar');
              setValue('preferred_language', user.preferred_language || 'ar');
              
              // تعيين صورة الملف الشخصي
              setUserPhoto(user.profile_photo || user.avatar || null);
            }
          } catch (error) {
            console.error('فشل في الحصول على بيانات المستخدم من API:', error);
            toast({
              variant: "destructive",
              title: "خطأ",
              description: "فشل في استرجاع بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.",
            });
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error('فشل في استرجاع بيانات المستخدم:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في استرجاع بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, setValue, toast]);

  // فتح مربع حوار اختيار الملف
  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // تحميل صورة جديدة
  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingPhoto(true);
      const file = files[0];

      // التحقق من نوع الملف وحجمه
      if (!file.type.includes('image/')) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "يرجى اختيار ملف صورة صالح (JPG، PNG)"
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "حجم الصورة يجب أن لا يتجاوز 2 ميجابايت"
        });
        return;
      }

      // تحميل الصورة
      const response = await authService.updateProfilePhoto(file);
      
      // تحديث الواجهة بالصورة الجديدة
      if (response.status && response.data?.profile_photo) {
        setUserPhoto(response.data.profile_photo);
        toast({
          title: "تم تحديث الصورة",
          description: "تم تحديث صورة الملف الشخصي بنجاح"
        });
      }
    } catch (error: any) {
      console.error('فشل في تحديث الصورة:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحديث الصورة",
        description: error.message || "فشل في تحديث صورة الملف الشخصي، يرجى المحاولة مرة أخرى."
      });
    } finally {
      setUploadingPhoto(false);
      
      // إعادة تعيين قيمة حقل الإدخال للسماح بتحميل نفس الملف مرة أخرى إذا لزم الأمر
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // حذف صورة الملف الشخصي
  const handleDeletePhoto = async () => {
    try {
      setDeletingPhoto(true);
      const response = await authService.deleteProfilePhoto();
      
      if (response.status) {
        // حذف الصورة من واجهة المستخدم
        setUserPhoto(null);
        toast({
          title: "تم حذف الصورة",
          description: "تم حذف صورة الملف الشخصي بنجاح"
        });
      }
    } catch (error: any) {
      console.error('فشل في حذف الصورة:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل في حذف صورة الملف الشخصي. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setDeletingPhoto(false);
      setShowDeleteDialog(false);
    }
  };

  // معالجة تقديم النموذج
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      
      // إرسال بيانات التحديث إلى API
      const response = await authService.updateProfile({
        name: data.name,
        phone: data.phone,
        address: data.address
      });

      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الملف الشخصي بنجاح",
      });
      
      // العودة إلى صفحة الملف الشخصي
      router.push('/PilgrimUser/profile');
    } catch (error: any) {
      console.error('فشل في تحديث البيانات:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "فشل في تحديث بيانات الملف الشخصي. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">تعديل الملف الشخصي</h1>
      
      <Card>
        <CardHeader className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 mx-auto cursor-pointer" onClick={handlePhotoClick}>
              {userPhoto ? (
                <AvatarImage src={userPhoto} alt="صورة الملف الشخصي" />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {uploadingPhoto || deletingPhoto ? <Loader2 className="h-10 w-10 animate-spin" /> : <Camera className="h-10 w-10" />}
                </AvatarFallback>
              )}
              {(uploadingPhoto || deletingPhoto) && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                </div>
              )}
            </Avatar>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/jpeg, image/png" 
              onChange={handlePhotoChange} 
              className="hidden" 
              disabled={uploadingPhoto || deletingPhoto}
            />
            <div className="absolute bottom-0 right-0 flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full h-8 w-8 p-0"
                onClick={handlePhotoClick}
                disabled={uploadingPhoto || deletingPhoto}
              >
                <Camera className="h-4 w-4" />
              </Button>
              
              {userPhoto && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full h-8 w-8 p-0 bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-600"
                      disabled={uploadingPhoto || deletingPhoto}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف الصورة الشخصية</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من رغبتك في حذف صورتك الشخصية؟ لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeletePhoto();
                        }}
                      >
                        {deletingPhoto ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري الحذف...</>
                        ) : "حذف"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            اضغط لتحديث صورة الملف الشخصي {userPhoto && '(أو حذفها)'}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            صيغ الصور المسموحة: JPG, PNG - الحد الأقصى للحجم: 2 ميجابايت
          </p>
          <CardTitle className="mt-2">معلومات الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                type="text"
                {...register("name", { required: "الاسم مطلوب" })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                disabled
                {...register("email")}
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-sm text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <Controller
                name="phone"
                control={control}
                rules={{
                  validate: (value) => !value || validatePhoneNumber(value) || "رقم الهاتف غير صالح"
                }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <PhoneNumberInput
                    id="phone"
                    label="رقم الهاتف"
                    defaultCountry="SA"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={errors.phone?.message}
                    placeholder="أدخل رقم هاتفك"
                    className="mb-4"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                placeholder="أدخل عنوانك"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
                rows={3}
              />
              {errors.address && (
                <p className="text-red-500 text-sm">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_language">اللغة المفضلة</Label>
              <Select 
                value={language} 
                onValueChange={(value) => {
                  setLanguage(value);
                  setValue('preferred_language', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر اللغة المفضلة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">الإنجليزية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/PilgrimUser/profile')}
                disabled={isSaving}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري الحفظ...</>
                ) : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 