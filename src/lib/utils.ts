import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Determine the redirect path based on user data
export function getRedirectPathAfterLogin(userData: any): string {
  // Check for roles array with objects containing name property
  if (userData?.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
    // Find office role by checking name property on each role object
    const hasOfficeRole = userData.roles.some((role: any) => role.name === 'office');
    
    if (hasOfficeRole || userData?.umrah_office) {
      return '/umrah-offices/dashboard';
    }
  }
  
  // If role_id is 2, it's an office
  if (userData?.role_id === 2) {
    return '/umrah-offices/dashboard';
  }
  
  // If user has umrah_office property directly
  if (userData?.umrah_office) {
    return '/umrah-offices/dashboard';
  }
  
  // Default: regular user
  return '/PilgrimUser';
}

export const handleApiError = (error: any): string => {
  console.error('API Error:', error);

  if (error.response) {
    // الخطأ له استجابة من الخادم
    const { status, data } = error.response;
    console.log('Error status:', status);
    console.log('Error data:', data);

    if (status === 401) {
      // معالجة خاصة لخطأ تسجيل الدخول غير الناجح
      if (data.message === 'messages.auth.login_failed') {
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. الرجاء التحقق والمحاولة مرة أخرى.';
      }
      return 'جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.';
    }

    if (status === 422) {
      // أخطاء التحقق
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        return Array.isArray(firstError) ? firstError[0] : 'بيانات غير صالحة';
      }
    }

    if (status === 429) {
      return `تم تجاوز الحد المسموح به من المحاولات. يرجى المحاولة لاحقاً.`;
    }

    if (data.message) {
      return data.message;
    }
  }

  if (error.request) {
    // تم إرسال الطلب لكن لم يتم تلقي استجابة
    console.log('No response received:', error.request);
    return 'لم نتمكن من الوصول إلى الخادم. يرجى التحقق من اتصال الإنترنت الخاص بك.';
  }

  // حدث خطأ في إعداد الطلب
  console.log('Error details:', error.message);
  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
}
