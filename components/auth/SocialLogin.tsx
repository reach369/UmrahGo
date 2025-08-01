"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTranslations } from 'next-intl';
import { signInWithGoogle, requestNotificationPermission } from '@/lib/firebase';
import axiosInstance from '@/lib/axios';
import { API_BASE_CONFIG, AUTH_ENDPOINTS } from '@/config/api.config';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SocialLoginProps {
  onSuccess?: () => void;
  variant?: 'default' | 'outline';
  showText?: boolean;
  className?: string;
  mode?: 'login' | 'register';
}

export default function SocialLogin({ 
  onSuccess, 
  variant = 'outline', 
  showText = true,
  className = '',
  mode = 'login'
}: SocialLoginProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  
  // استخدام مراجع ترجمة منفصلة لتجنب مشاكل المفاتيح المفقودة
  const tLogin = useTranslations('auth.login');
  const tSocial = useTranslations('auth.social.googleAuth');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // دالة آمنة للحصول على النصوص المترجمة مع fallbacks
  const getSafeTranslation = (translationFn: any, key: string, fallback: string): string => {
    try {
      return translationFn(key);
    } catch (error) {
      console.warn(`Translation missing for key: ${key}, using fallback: ${fallback}`);
      return fallback;
    }
  };

  const showNotification = (type: 'success' | 'error', message: string, description?: string) => {
    if (type === 'success') {
      setSuccess(true);
      setError(null);
      
      const successTitle = locale === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!';
      const successDesc = description || (locale === 'ar' ? 'مرحباً بك، جاري تحويلك إلى لوحة التحكم...' : 'Welcome back! Redirecting to dashboard...');
      
      toast({
        title: successTitle,
        description: successDesc,
        duration: 4000,
      });
    } else {
      setError(message);
      setSuccess(false);
      
      const errorTitle = locale === 'ar' ? 'خطأ في تسجيل الدخول' : 'Sign-in Error';
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: message,
        duration: 6000,
      });
    }
  };

  const getErrorMessage = (error: any): string => {
    const errorCode = error?.code || '';
    
    const errorMessages: Record<string, string> = {
      'auth/popup-closed-by-user': locale === 'ar' 
        ? 'تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى' 
        : 'Sign-in popup was closed. Please try again',
      'auth/popup-blocked': locale === 'ar' 
        ? 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة وإعادة المحاولة' 
        : 'Popup was blocked. Please allow popups and try again',
      'auth/account-exists-with-different-credential': locale === 'ar' 
        ? 'هذا البريد الإلكتروني مسجل بالفعل باستخدام طريقة تسجيل دخول مختلفة' 
        : 'This email is already registered with a different sign-in method',
      'auth/user-disabled': locale === 'ar' 
        ? 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم' 
        : 'This account has been disabled. Please contact support',
      'auth/operation-not-allowed': locale === 'ar' 
        ? 'تسجيل الدخول بواسطة Google غير مفعل حالياً' 
        : 'Google sign-in is currently disabled',
      'auth/network-request-failed': locale === 'ar' 
        ? 'فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت' 
        : 'Network request failed. Please check your internet connection'
    };

    if (errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }

    // معالجة أخطاء الباك اند
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    return locale === 'ar' 
      ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' 
      : 'An unexpected error occurred. Please try again.';
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('🚀 Starting Google authentication...');

      // Step 1: Firebase Authentication
      const firebaseUser = await signInWithGoogle();
      
      if (!firebaseUser) {
        throw new Error(locale === 'ar' ? 'فشل في المصادقة مع Google' : 'Google authentication failed');
      }

      console.log('✅ Firebase authentication successful:', firebaseUser.email);

      // Step 2: Get Firebase ID token with force refresh
      const idToken = await firebaseUser.getIdToken(true);
      console.log('🔑 ID Token obtained, length:', idToken.length);

      // Step 3: Optional - Get FCM token for notifications
      let fcmToken: string | null = null;
      try {
        fcmToken = await requestNotificationPermission();
        console.log('📱 FCM token obtained:', fcmToken ? 'Yes' : 'No');
      } catch (fcmError) {
        console.warn('⚠️ FCM token request failed (non-critical):', fcmError);
      }

      // Step 4: Prepare auth payload with proper format
      const authPayload: any = {
        id_token: idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName || 'User',
        avatar: firebaseUser.photoURL || '',
        phone: firebaseUser.phoneNumber || '',
        locale: locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        provider: 'google' // Add provider field
      };
      
      if (fcmToken) {
        authPayload.fcm_token = fcmToken;
      }

      console.log('📤 Sending authentication data to backend...', {
        payloadKeys: Object.keys(authPayload),
        idTokenLength: idToken.length,
        email: firebaseUser.email,
        projectId: firebaseUser.providerId || 'N/A'
      });
      
      // Step 5: Send to backend with proper headers and better error handling
      const response = await axiosInstance.post(
        'https://admin.umrahgo.net/api/v1/auth/social/google',
        authPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          timeout: 30000, // Increase timeout
          withCredentials: false // Ensure no auth headers
        }
      );

      console.log('✅ Backend authentication successful:', response.status);

      if (response.status === 200 || response.status === 201) {
        const responseData = response.data?.data || response.data;
        
        if (responseData?.token && responseData?.user) {
          // Store authentication data
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('token_type', responseData.token_type || 'Bearer');
          localStorage.setItem('user', JSON.stringify(responseData.user));

          console.log('💾 User data stored successfully');
          
          // Show success notification
          showNotification('success', '');
          
          // Call success callback with delay
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            // Default redirect logic
            setTimeout(() => {
              let redirectPath = `/${locale}/PilgrimUser`;
              
              if (responseData.user.umrah_office) {
                redirectPath = `/${locale}/umrahoffices/dashboard`;
              } else if (responseData.user.roles?.length > 0) {
                const userRole = responseData.user.roles[0]?.name;
                switch (userRole) {
                  case 'office':
                    redirectPath = `/${locale}/umrahoffices/dashboard`;
                    break;
                  case 'admin':
                    redirectPath = `/${locale}/admin/dashboard`;
                    break;
                  case 'bus_operator':
                    redirectPath = `/${locale}/bus-operator`;
                    break;
                  default:
                    redirectPath = `/${locale}/PilgrimUser`;
                }
              }
              
              router.push(redirectPath);
            }, 2000);
          }
          
          return;
        }
      }
      
      throw new Error(locale === 'ar' ? 'فشل في المصادقة مع الخادم' : 'Server authentication failed');

    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      
      // Add specific handling for 401 errors
      if (error?.response?.status === 401) {
        console.error('🔒 401 Unauthorized - Token verification failed:', {
          responseData: error.response?.data,
          backendMessage: error.response?.data?.message || 'No backend message'
        });
        
        // Try to get more specific error info
        const backendError = error.response?.data?.message || 'Invalid or expired Google ID token';
        const errorDetails = error.response?.data?.errors || {};
        
        console.error('🔍 Backend error details:', {
          message: backendError,
          errors: errorDetails,
          status: error.response?.status,
          headers: error.response?.headers
        });

        // Additional debugging information
        console.error('🔧 Debug info for 401 error:', {
      //      'Firebase User Email': firebaseUser?.email,
      //    'Token Length': idToken?.length || 'No token',
          'Backend URL': 'https://admin.umrahgo.net/api/v1/auth/social/google',
          'Debugging Endpoint': 'https://admin.umrahgo.net/api/v1/auth/social/test-google-auth',
          'Possible Causes': [
            'Google Client ID mismatch between frontend and backend',
            'Token expired during transmission',
            'Backend Google Client library not available',
            'Firebase project configuration mismatch'
          ]
        });
      }
      
      const errorMessage = getErrorMessage(error);
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic button text based on mode and locale
  const getButtonText = () => {
    if (mode === 'register') {
      return getSafeTranslation(
        tSocial, 
        'signUp', 
        locale === 'ar' ? 'إنشاء حساب باستخدام جوجل' : 'Sign up with Google'
      );
    }
    return getSafeTranslation(
      tSocial, 
      'signIn', 
      locale === 'ar' ? 'تسجيل الدخول باستخدام جوجل' : 'Sign in with Google'
    );
  };

  const loadingText = getSafeTranslation(
    tSocial, 
    'loading', 
    locale === 'ar' ? 'جاري التحقق...' : 'Signing in...'
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200 font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
            {getSafeTranslation(
              tSocial, 
              'success', 
              locale === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Successfully signed in!'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Google Sign-in Button with Dark Theme */}
      <Button
        type="button"
        variant={variant}
        disabled={isLoading}
        onClick={handleGoogleLogin}
        className={`
          group w-full min-h-[52px] flex items-center justify-center gap-3 
          transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
          ${variant === 'outline' 
            ? ' hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-md hover:shadow-lg' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl'
          }
          ${isLoading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
          rounded-xl font-medium text-base focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {showText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {showText && <span>{getButtonText()}</span>}
          </>
        )}
      </Button>

      {/* Security Notice with Dark Theme */}
      <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          {locale === 'ar' 
            ? 'آمن ومحمي - نحن نحترم خصوصيتك ولا نصل إلى معلوماتك الشخصية دون إذن'
            : 'Secure & Protected - We respect your privacy and do not access your personal information without permission'
          }
        </p>
      </div>
    </div>
  );
} 