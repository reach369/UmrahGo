"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth.service';
import { ResetPasswordRequest } from '@/types/auth.types';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordRequest>({
    defaultValues: {
      email: email || '',
      token: token || '',
    }
  });

  const onSubmit = async (data: ResetPasswordRequest) => {
    try {
      // التحقق من صحة كلمة المرور
      const passwordValidation = authService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      setIsLoading(true);
      await authService.resetPassword(data);
      
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة",
      });

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push('/auth/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق من وجود البريد الإلكتروني والرمز
  if (!email || !token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-red-500">رابط غير صالح</h2>
              <p className="text-gray-600">
                يبدو أن رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.
                يرجى طلب رابط جديد من صفحة نسيت كلمة المرور.
              </p>
              <Button
                onClick={() => router.push('/auth/forgot-password')}
                className="mt-4"
              >
                طلب رابط جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">تغيير كلمة المرور</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "كلمة المرور مطلوبة",
                  minLength: {
                    value: 8,
                    message: "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
                  }
                })}
                placeholder="أدخل كلمة المرور الجديدة"
                className={errors.password ? "border-red-500" : ""}
                dir="ltr"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
              <Input
                id="password_confirmation"
                type="password"
                {...register("password_confirmation", {
                  required: "تأكيد كلمة المرور مطلوب",
                  validate: (value) => value === watch('password') || "كلمات المرور غير متطابقة"
                })}
                placeholder="أدخل تأكيد كلمة المرور"
                className={errors.password_confirmation ? "border-red-500" : ""}
                dir="ltr"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>يجب أن تحتوي كلمة المرور على:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>8 أحرف على الأقل</li>
                <li>حرف كبير واحد على الأقل</li>
                <li>رقم واحد على الأقل</li>
                <li>حرف خاص واحد على الأقل (!@#$%^&*)</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={isLoading}
            >
              {isLoading ? "جاري تغيير كلمة المرور..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 