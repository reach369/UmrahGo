'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ServiceProviderRegistrationData } from '@/types/auth.types';
import { authService } from '@/lib/auth.service';
import { getRedirectPathAfterLogin, handleApiError } from '@/lib/utils';
import Link from 'next/link';
import { StatusDialog } from '@/components/ui/status-dialog';
import TestOfficeLoginButton from '@/components/auth/TestOfficeLoginButton';

export default function OfficeRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ServiceProviderRegistrationData>();
  const password = watch('password');

  const onSubmit = async (data: ServiceProviderRegistrationData) => {
    try {
      setIsLoading(true);
      setResult(null);
      
      // التأكد من تطابق كلمتي المرور
      if (data.password !== data.password_confirmation) {
        throw new Error('كلمتا المرور غير متطابقتين');
      }

      // التحقق من قوة كلمة المرور
      const passwordValidation = authService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      
      // التحقق من وجود جميع البيانات المطلوبة
      if (!data.office_name || !data.address || !data.license_number || !data.commercial_register) {
        throw new Error('جميع البيانات المطلوبة للمكتب يجب إدخالها');
      }
      
      // تحويل البيانات إلى النوع المطلوب
      const officeData = {
        ...data,
        phone: data.phone || '',
        office_name: data.office_name,
        address: data.address,
        license_number: data.license_number,
        commercial_register: data.commercial_register,
      };
      
      const response = await authService.registerOffice(officeData);
      console.log('Office registration successful:', response);

      setResult({
        success: response.status,
        message: response.message,
        details: response
      });

      if (response.data?.token) {
        // حفظ بيانات المصادقة
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('token_type', response.data.token_type);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // توجيه المستخدم إلى صفحة التحقق
        router.push(`/ar/auth/verify-office?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: any) {
      console.error('Office registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = handleApiError(error);

      setResult({
        success: false,
        message: errorMessage,
        details: {
          status: error.response?.status,
          data: error.response?.data
        }
      });

      toast({
        variant: "destructive",
        title: "فشل إنشاء حساب المكتب",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">إنشاء حساب مكتب عمرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TestOfficeLoginButton />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المسؤول</Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name", {
                    required: "اسم المسؤول مطلوب",
                    minLength: {
                      value: 3,
                      message: "الاسم يجب أن يكون على الأقل 3 أحرف"
                    }
                  })}
                  placeholder="أدخل اسم المسؤول"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_name">اسم المكتب</Label>
                <Input
                  id="office_name"
                  type="text"
                  {...register("office_name", {
                    required: "اسم المكتب مطلوب",
                    minLength: {
                      value: 3,
                      message: "اسم المكتب يجب أن يكون على الأقل 3 أحرف"
                    }
                  })}
                  placeholder="أدخل اسم المكتب"
                  className={errors.office_name ? "border-red-500" : ""}
                />
                {errors.office_name && (
                  <p className="text-red-500 text-sm">{errors.office_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "البريد الإلكتروني مطلوب",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "البريد الإلكتروني غير صالح"
                    }
                  })}
                  placeholder="أدخل بريدك الإلكتروني"
                  className={errors.email ? "border-red-500" : ""}
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "رقم الهاتف مطلوب",
                    pattern: {
                      value: /^\+?[0-9]{10,15}$/,
                      message: "رقم الهاتف غير صالح"
                    }
                  })}
                  placeholder="أدخل رقم هاتفك مثل +966XXXXXXXXX"
                  className={errors.phone ? "border-red-500" : ""}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">عنوان المكتب</Label>
                <Input
                  id="address"
                  type="text"
                  {...register("address", {
                    required: "عنوان المكتب مطلوب",
                    minLength: {
                      value: 5,
                      message: "العنوان يجب أن يكون على الأقل 5 أحرف"
                    }
                  })}
                  placeholder="أدخل عنوان المكتب"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number">رقم الترخيص</Label>
                <Input
                  id="license_number"
                  type="text"
                  {...register("license_number", {
                    required: "رقم الترخيص مطلوب"
                  })}
                  placeholder="أدخل رقم الترخيص"
                  className={errors.license_number ? "border-red-500" : ""}
                />
                {errors.license_number && (
                  <p className="text-red-500 text-sm">{errors.license_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercial_register">السجل التجاري</Label>
                <Input
                  id="commercial_register"
                  type="text"
                  {...register("commercial_register", {
                    required: "السجل التجاري مطلوب"
                  })}
                  placeholder="أدخل رقم السجل التجاري"
                  className={errors.commercial_register ? "border-red-500" : ""}
                />
                {errors.commercial_register && (
                  <p className="text-red-500 text-sm">{errors.commercial_register.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                    minLength: {
                      value: 8,
                      message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
                    }
                  })}
                  placeholder="أدخل كلمة المرور"
                  className={errors.password ? "border-red-500" : ""}
                  dir="ltr"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير، ورقم، وحرف خاص
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  {...register("password_confirmation", {
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: value => value === password || "كلمتا المرور غير متطابقتين"
                  })}
                  placeholder="أعد إدخال كلمة المرور"
                  className={errors.password_confirmation ? "border-red-500" : ""}
                  dir="ltr"
                />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={isLoading}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب مكتب"}
              </Button>

              {result && (
                <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <h3 className="font-bold mb-2">{result.success ? '✅ نجاح' : '❌ خطأ'}</h3>
                  <p className="mb-2">{result.message}</p>
                  {result.details && (
                    <pre className="text-xs bg-black/5 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              <p className="text-center text-sm">
                لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 