"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LoginData, UserDetails } from '@/types/auth.types';
import { authService } from '@/lib/auth.service';
import Link from 'next/link';
import TestLoginButton from '@/components/auth/TestLoginButton';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();

  // فحص حالة المصادقة عند تحميل الصفحة
  useEffect(() => {
    // فحص وجود توكن في localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // فحص وجود توكن في الكوكيز
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const cookieToken = cookies['token'];
    const cookieUserInfo = cookies['user_info'];
    
    console.log('Auth state check on login page load:', {
      localStorageToken: token ? 'present' : 'missing',
      localStorageUser: user ? 'present' : 'missing',
      cookieToken: cookieToken ? 'present' : 'missing',
      cookieUserInfo: cookieUserInfo ? 'present' : 'missing',
      cookies: Object.keys(cookies)
    });
    
    // إذا كان المستخدم مسجل الدخول بالفعل، قم بتوجيهه حسب نوع الحساب
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        const isOffice = userData.roles?.some((role: any) => role.name === 'office');
        const isPilgrim = userData.roles?.some((role: any) => role.name === 'customer');
        
        const preferredLanguage = userData.preferred_language || 'ar';
        console.log('User already logged in, redirecting based on role');
        
        if (isOffice) {
          router.push(`/${preferredLanguage}/umrah-offices/dashboard`);
        } else if (isPilgrim) {
          router.push(`/${preferredLanguage}/PilgrimUser`);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  const handleTestLogin = async () => {
    const testData = {
      email: "jigaw53875@frisbook.com",
      password: "Password123!"
    };
    
    try {
      setIsLoading(true);
      console.log('Attempting test login with:', testData);
      
      const response = await authService.login(testData);
      console.log('Login response:', response);

      if (response.status && response.data) {
        // التحقق من نوع المستخدم
        const { user } = response.data;
        const isOffice = user.roles?.some((role: any) => role.name === 'office');
        const isPilgrim = user.roles?.some((role: any) => role.name === 'customer');

        // التوجيه حسب نوع المستخدم
        const preferredLanguage = user.preferred_language || 'ar';
        
        // التوجيه مع تأخير بسيط للسماح بتعيين الكوكيز
        setTimeout(() => {
          if (isOffice) {
            router.push(`/${preferredLanguage}/umrah-offices/dashboard`);
          } else if (isPilgrim) {
            router.push(`/${preferredLanguage}/PilgrimUser`);
          } else {
            router.push(`/${preferredLanguage}`);
          }
        }, 100);
      } else {
        throw new Error('بيانات الاستجابة غير صالحة');
      }
    } catch (error: any) {
      console.error('Test login error:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: error.message || 'حدث خطأ أثناء تسجيل الدخول',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', data);
      
      // مسح بيانات المصادقة السابقة
      localStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // استدعاء API مباشرة
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com';
      console.log('API URL being used:', baseUrl);
      
      const response = await axios.post(`${baseUrl}/api/v1/auth/login`, {
        email: data.email.trim().toLowerCase(),
        password: data.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Raw login response:', {
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
        
        // التحقق من نوع المستخدم وتوجيهه للصفحة المناسبة
        const isOffice = user.roles?.some((role: any) => role.name === 'office');
        const isPilgrim = user.roles?.some((role: any) => role.name === 'customer');
        
        // التحقق من تخزين التوكن
        const localStorageToken = localStorage.getItem('token');
        const cookieToken = document.cookie.includes('token=');

        console.log('Token storage check before redirect:', {
          localStorage: localStorageToken ? 'present' : 'absent',
          cookieExists: cookieToken ? 'present' : 'absent',
          tokenValue: localStorageToken ? `${localStorageToken.substring(0, 10)}...` : 'missing'
        });

        // الانتقال إلى الصفحة المناسبة حسب نوع المستخدم
        const preferredLanguage = user.preferred_language || 'ar';
        
        // الانتظار قليلاً ثم إعادة التوجيه
        setTimeout(() => {
          console.log('Redirecting based on user role');
          if (isOffice) {
            router.push(`/${preferredLanguage}/umrah-offices/dashboard`);
          } else if (isPilgrim) {
            router.push(`/${preferredLanguage}/PilgrimUser`);
          } else {
            router.push(`/${preferredLanguage}`);
          }
        }, 1000);
      } else {
        throw new Error('استجابة غير صالحة من الخادم');
      }
    } catch (error: any) {
      console.error('Login error:', {
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

  // تبديل حالة إظهار/إخفاء كلمة المرور
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">تسجيل الدخول</CardTitle>
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

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "كلمة المرور مطلوبة"
                  })}
                  placeholder="أدخل كلمة المرور"
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  dir="ltr"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  أو
                </span>
              </div>
            </div>

            <TestLoginButton />

            <p className="text-center text-sm">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                إنشاء حساب جديد
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 