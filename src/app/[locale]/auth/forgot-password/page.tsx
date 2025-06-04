"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth.service';
import Link from 'next/link';
import { ForgotPasswordRequest } from '@/types/auth.types';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordRequest>();

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(data);
      
      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: "يرجى التحقق من بريدك الإلكتروني للحصول على تعليمات إعادة تعيين كلمة المرور",
      });

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد فترة قصيرة
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إرسال رابط إعادة تعيين كلمة المرور",
        description: error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">نسيت كلمة المرور؟</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={isLoading}
            >
              {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm">
                تذكرت كلمة المرور؟{" "}
                <Link href="/auth/login" className="text-primary hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
              <p className="text-sm">
                ليس لديك حساب؟{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 