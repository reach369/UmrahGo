"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import SeparatedOTPInput from '@/components/auth/SeparatedOTPInput';
import { authService } from '@/lib/auth.service';
import { Button } from '@/components/ui/button';

export default function VerifyOfficePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (!emailParam) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "البريد الإلكتروني غير موجود",
      });
      router.push(`/${locale}/auth/register/office`);
      return;
    }
    setEmail(emailParam);
  }, [searchParams, router, toast, locale]);

  const handleOTPComplete = async (otpValue: string) => {
    try {
      console.log('Office verification starting with:', { email, otpValue });

      // The verification is already done in SeparatedOTPInput component
      // We just need to handle the success case here
      toast({
        title: "تم التحقق بنجاح",
        description: "سيتم توجيهك إلى لوحة التحكم الخاصة بالمكتب",
      });
      
      // التوجيه إلى صفحة المكاتب
      router.push(`/${locale}/umrah-offices/dashboard`);
    } catch (error: any) {
      console.error('Office verification error:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: error.message || "حدث خطأ أثناء التحقق من الرمز",
      });
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">التحقق من البريد الإلكتروني للمكتب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              يرجى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني
              <br />
              <span className="font-semibold" dir="ltr">{email}</span>
            </p>
            
            <SeparatedOTPInput
              email={email}
              onComplete={handleOTPComplete}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 