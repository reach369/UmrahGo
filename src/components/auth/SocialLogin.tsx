"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth.service";
import { SocialProvider } from "@/types/auth.types";
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { getRedirectPathAfterLogin, handleApiError } from '@/lib/utils';

interface SocialLoginProps {
  onSuccess?: () => void;
}

export default function SocialLogin({ onSuccess }: SocialLoginProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<SocialProvider | null>(null);

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setIsLoading(provider);
      
      // الحصول على رابط تسجيل الدخول
      const loginUrl = authService.getSocialLoginUrl(provider);
      
      // فتح نافذة منبثقة لتسجيل الدخول
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        loginUrl,
        'socialLogin',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // الاستماع لرسالة من النافذة المنبثقة
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === 'social-login-success' && event.data?.accessToken) {
          try {
            const response = await authService.socialLogin(provider, {
              access_token: event.data.accessToken
            });

            toast({
              title: "تم تسجيل الدخول بنجاح",
              description: "جاري تحويلك إلى لوحة التحكم",
            });

            if (response.data?.user) {
              const redirectPath = getRedirectPathAfterLogin(response.data.user);
              router.push(redirectPath);
            } else if (onSuccess) {
              onSuccess();
            }
          } catch (error: any) {
            console.error('Social login error:', error);
            
            // استخدام دالة معالجة الأخطاء للحصول على رسالة خطأ صديقة للمستخدم
            const errorMessage = handleApiError(error);
            
            toast({
              variant: "destructive",
              title: "خطأ في تسجيل الدخول",
              description: errorMessage,
            });
          }
        }

        window.removeEventListener('message', messageHandler);
        popup?.close();
      };

      window.addEventListener('message', messageHandler);
    } catch (error: any) {
      console.error('Social login window error:', error);
      
      // استخدام دالة معالجة الأخطاء للحصول على رسالة خطأ صديقة للمستخدم
      const errorMessage = handleApiError(error);
      
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('google')}
        disabled={isLoading !== null}
      >
        <FcGoogle className="h-5 w-5 ml-2" />
        {isLoading === 'google' ? 'جاري التسجيل...' : 'تسجيل الدخول باستخدام Google'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
        onClick={() => handleSocialLogin('facebook')}
        disabled={isLoading !== null}
      >
        <FaFacebook className="h-5 w-5 ml-2" />
        {isLoading === 'facebook' ? 'جاري التسجيل...' : 'تسجيل الدخول باستخدام Facebook'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full bg-black text-white hover:bg-black/90"
        onClick={() => handleSocialLogin('apple')}
        disabled={isLoading !== null}
      >
        <FaApple className="h-5 w-5 ml-2" />
        {isLoading === 'apple' ? 'جاري التسجيل...' : 'تسجيل الدخول باستخدام Apple'}
      </Button>
    </div>
  );
} 