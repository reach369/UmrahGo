'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function TestLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // معلومات تسجيل دخول صحيحة
  const testCredentials = {
    email: "jigaw53875@frisbook.com",
    password: "Password123!"
  };

  const handleTestLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Starting test login with:', testCredentials);

      // مسح بيانات المصادقة السابقة
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('Cleared existing auth data');

      // استدعاء API مباشرة - تغيير عنوان API لاستخدام القيمة المحددة
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com';
      console.log('API URL being used:', baseUrl);
      
      const response = await axios.post(`${baseUrl}/api/v1/auth/login`, testCredentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Raw API response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      // التحقق من صحة الاستجابة
      if (response.data?.status && response.data?.data) {
        const { user, token, token_type } = response.data.data;
        
        console.log('Extracted login data:', {
          userId: user?.id,
          userEmail: user?.email,
          token: token ? `${token.substring(0, 10)}...` : 'missing',
          tokenType: token_type
        });
        
        if (!token) {
          throw new Error('توكن المصادقة غير موجود في الاستجابة');
        }
        
        // تخزين بيانات المصادقة
        localStorage.setItem('token', token);
        localStorage.setItem('token_type', token_type || 'Bearer');
        localStorage.setItem('user', JSON.stringify(user));
        
        // تخزين في الكوكيز أيضاً بضمان تنسيق صحيح
        document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `token_type=${encodeURIComponent(token_type || 'Bearer')}; path=/; max-age=2592000; SameSite=Lax`;
        
        // تخزين معلومات المستخدم الأساسية في الكوكيز
        const essentialUserInfo = {
          id: user.id,
          email: user.email,
          roles: user.roles?.map((r: any) => r.name) || []
        };
        document.cookie = `user_info=${encodeURIComponent(JSON.stringify(essentialUserInfo))}; path=/; max-age=2592000; SameSite=Lax`;
        
        // التحقق من صلاحية المستخدم كمكتب
        const isOffice = user.roles?.some((role: any) => role.name === 'office');
        if (!isOffice) {
          throw new Error('هذا الحساب ليس مكتب عمرة');
        }

        // التحقق من تخزين التوكن
        const localStorageToken = localStorage.getItem('token');
        const cookieToken = document.cookie.includes('token=');

        console.log('Token storage check:', {
          localStorage: localStorageToken ? 'present' : 'absent',
          cookieExists: cookieToken ? 'present' : 'absent',
          tokenValue: localStorageToken ? `${localStorageToken.substring(0, 10)}...` : 'missing'
        });

        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${user.name}`,
        });

        // الانتقال إلى لوحة التحكم
        const preferredLanguage = user.preferred_language || 'ar';
        
        // الانتظار قليلاً ثم إعادة التوجيه
        setTimeout(() => {
          console.log('Redirecting to dashboard from test login');
          router.push(`/${preferredLanguage}/umrah-offices/dashboard`);
        }, 1000);
      } else {
        throw new Error('استجابة غير صالحة من الخادم');
      }
    } catch (error: any) {
      console.error('Test login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: error.message || 'حدث خطأ أثناء تسجيل الدخول',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTestLogin}
      disabled={isLoading}
      className="w-full"
      variant="outline"
    >
      {isLoading ? "جاري تسجيل الدخول..." : "تجربة تسجيل الدخول"}
    </Button>
  );
} 