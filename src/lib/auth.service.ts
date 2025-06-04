import { LoginData, LoginResponse, UserRegistrationData, ServiceProviderRegistrationData, RegistrationResponse, LogoutResponse, CurrentUserResponse, OTPSendRequest, OTPSendResponse, OTPRateLimitError, OTPVerifyRequest, OTPVerifyResponse, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse, SocialLoginRequest, SocialLoginResponse, SocialProvider } from '@/types/auth.types';
import axios from 'axios';
import axiosInstance from './axios'; // Import the axios instance
import { getApiUrl } from './constants';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com';

// دالة مساعدة لمعالجة الأخطاء
const handleApiError = async (response: Response) => {
  const data = await response.json();
  
  // معالجة خاصة لخطأ تجاوز حد المحاولات
  if (response.status === 429) {
    const errorData = data as OTPRateLimitError;
    throw new Error(`تم تجاوز الحد المسموح به من المحاولات. يرجى الانتظار ${errorData.errors.seconds_remaining} ثانية`);
  }

  if (data.message) {
    throw new Error(data.message);
  }
  throw new Error('حدث خطأ غير متوقع');
};

// دالة مساعدة للحصول على التوكن
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    return token ? `${tokenType} ${token}` : null;
  }
  return null;
};

// دالة محسنة لتخزين بيانات المصادقة
const setAuthData = (token: string, tokenType: string, user: any) => {
  if (typeof window === 'undefined') return;

  try {
    console.log('Storing auth data:', {
      token: token ? token.substring(0, 10) + '...' : 'missing',
      tokenType,
      userDetails: user ? { id: user.id, email: user.email } : 'missing'
    });
    
    if (!token) {
      console.error('ERROR: Missing token, cannot store auth data');
      return;
    }
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('token_type', tokenType);
    localStorage.setItem('user', JSON.stringify(user));

    // Store in cookies with secure settings
    // Make sure the cookies are accessible by both client and server
    document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
    document.cookie = `token_type=${tokenType}; path=/; max-age=2592000; SameSite=Lax`;
    
    // Store minimal user info in cookie to avoid size limitations
    const essentialUserInfo = {
      id: user.id,
      email: user.email,
      roles: user.roles
    };
    document.cookie = `user_info=${JSON.stringify(essentialUserInfo)}; path=/; max-age=2592000; SameSite=Lax`;

    // Set Authorization header for future requests
    axiosInstance.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;

    console.log('Auth data stored successfully in:', {
      localStorage: {
        token: localStorage.getItem('token') ? 'present' : 'missing',
        tokenType: localStorage.getItem('token_type') || 'missing',
        user: localStorage.getItem('user') ? 'present' : 'missing'
      },
      cookies: {
        token: document.cookie.includes('token=') ? 'present' : 'missing',
        tokenType: document.cookie.includes('token_type=') ? 'present' : 'missing',
        userInfo: document.cookie.includes('user_info=') ? 'present' : 'missing'
      },
      axiosHeader: axiosInstance.defaults.headers.common['Authorization'] ? 'present' : 'missing'
    });
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

const clearAuthData = () => {
  if (typeof window === 'undefined') return;

  try {
    console.log('Clearing all auth data...');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');

    // Clear cookies properly
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'token_type=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'user_info=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // Clear Authorization header
    if (axiosInstance.defaults.headers.common) {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }

    console.log('Auth data cleared successfully');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// دالة للتحقق من حالة المصادقة
const checkAuth = (): { isAuthenticated: boolean; user: any | null } => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null };
  }

  try {
    // البحث عن التوكن في localStorage
    const token = localStorage.getItem('token');
    
    // البحث عن التوكن في الكوكيز إذا لم يكن موجوداً في localStorage
    let cookieToken = null;
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    if (!token) {
      cookieToken = cookies['token'];
    }

    // استخراج بيانات المستخدم
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        user = JSON.parse(userStr);
      } else if (cookies['user_info']) {
        user = JSON.parse(cookies['user_info']);
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }

    // التحقق من وجود التوكن والمستخدم
    const isAuthenticated = !!(token || cookieToken) && !!user;
    
    // مزامنة بيانات المصادقة بين localStorage والكوكيز
    if (isAuthenticated) {
      if (token && !cookieToken) {
        // نسخ من localStorage إلى الكوكيز
        document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Lax`;
      } else if (!token && cookieToken) {
        // نسخ من الكوكيز إلى localStorage
        localStorage.setItem('token', cookieToken);
      }
    }

    return { isAuthenticated, user };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false, user: null };
  }
};

export const authService = {
  // تسجيل دخول المستخدم
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      console.log('Login attempt:', { email: data.email });

      if (!data.email || !data.password) {
        throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      }

      const response = await axiosInstance.post('/api/v1/auth/login', {
        email: data.email.trim().toLowerCase(),
        password: data.password
      });

      console.log('Login raw response:', {
        status: response.status,
        responseStructure: Object.keys(response.data || {})
      });

      // التحقق من صحة الاستجابة
      if (response.data?.status && response.data?.data) {
        console.log('API response data structure:', {
          dataKeys: Object.keys(response.data.data)
        });
        
        // الحصول على البيانات المطلوبة
        const { token, token_type, user } = response.data.data;
        
        // للتشخيص
        console.log('Auth data extracted from API:', {
          hasToken: !!token,
          tokenType: token_type,
          userID: user?.id,
          userEmail: user?.email,
          userRoles: user?.roles?.map((r: any) => r.name)
        });
        
        // تخزين بيانات المصادقة
        if (token && user) {
          setAuthData(token, token_type || 'Bearer', user);
        } else {
          console.error('Missing token or user data in API response');
        }
        
        return response.data;
      }

      throw new Error('Invalid login response');
    } catch (error: any) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  // تسجيل مستخدم جديد (معتمر)
  async registerUser(data: UserRegistrationData): Promise<RegistrationResponse> {
    try {
      // التحقق من صحة البيانات
      if (!data.email || !data.password || !data.name) {
        throw new Error('جميع الحقول مطلوبة');
      }

      // تنظيف البيانات
      const cleanData = {
        ...data,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        phone: data.phone || '',
        preferred_language: 'ar', // إضافة اللغة المفضلة كـ "ar" لتجنب مشكلة سلسلة لغات المتصفح
      };

      // استخدام المسار الصحيح للتسجيل: /api/v1/auth/register
      const response = await axiosInstance.post('/api/v1/auth/register', cleanData);
      
      console.log('Register Response:', {
        url: '/api/v1/auth/register',
        data: response
      });

      // التحقق من صحة الاستجابة
      if (!response.data?.token || !response.data?.user) {
        throw new Error('استجابة غير صالحة من الخادم');
      }

      // حفظ بيانات المصادقة عند نجاح التسجيل
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('token_type', response.data.token_type);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response as unknown as RegistrationResponse;
    } catch (error: any) {
      console.error('Register Error:', {
        email: data.email,
        error: error.message,
        response: error.response?.data,
        url: error.config?.url,
        status: error.response?.status
      });
      throw error;
    }
  },

  // تسجيل مكتب جديد
  async registerOffice(data: ServiceProviderRegistrationData): Promise<RegistrationResponse> {
    try {
      console.log('Starting office registration with data:', {
        ...data,
        password: '[HIDDEN]',
        password_confirmation: '[HIDDEN]'
      });

      // التحقق من صحة البيانات
      if (!data.email || !data.password || !data.name || !data.office_name) {
        throw new Error('جميع الحقول مطلوبة');
      }

      // تنظيف البيانات
      const cleanData = {
        ...data,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        office_name: data.office_name.trim(),
        user_type: 'office',
        phone: data.phone?.trim() || '',
        country: data.country || 'Saudi Arabia',
      };

      console.log('Sending registration request to:', '/api/v1/auth/register/office');
      const response = await axiosInstance.post('/api/v1/auth/register/office', cleanData);
      console.log('Registration API response:', {
        status: response.status,
        statusText: response.statusText,
        data: {
          ...response.data,
          token: response.data?.token ? '[PRESENT]' : '[MISSING]'
        }
      });

      // التحقق من صحة الاستجابة
      if (!response.data?.token || !response.data?.user) {
        console.error('Invalid server response:', response.data);
        throw new Error('استجابة غير صالحة من الخادم');
      }

      return response as unknown as RegistrationResponse;
    } catch (error: any) {
      console.error('Register Office Error:', {
        email: data.email,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      // إذا كان الخطأ من الخادم
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      // إذا كان خطأ في الاتصال
      if (error.code === 'ECONNREFUSED') {
        throw new Error('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك.');
      }

      throw error;
    }
  },

  // تسجيل مشغل باصات جديد
  async registerOperator(data: ServiceProviderRegistrationData): Promise<RegistrationResponse> {
    try {
      // التحقق من صحة البيانات
      if (!data.email || !data.password || !data.name) {
        throw new Error('جميع الحقول مطلوبة');
      }

      // تنظيف البيانات
      const cleanData = {
        ...data,
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        office_name: data.office_name?.trim(),
      };

      const response = await axiosInstance.post('/auth/register/operator', cleanData);

      // التحقق من صحة الاستجابة
      if (!response.data?.token || !response.data?.user) {
        throw new Error('استجابة غير صالحة من الخادم');
      }

      return response as unknown as RegistrationResponse;
    } catch (error: any) {
      console.error('Register Operator Error:', {
        email: data.email,
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  // تسجيل الخروج
  async logout(): Promise<LogoutResponse> {
    try {
      // محاولة تسجيل الخروج من الخادم أولاً
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axiosInstance.post('/api/v1/auth/logout');
          console.log('Server logout successful');
          
          // تنظيف بيانات المصادقة المحلية
          clearAuthData();
          
          return response.data;
        } catch (error) {
          console.error('Server logout failed, continuing with client logout:', error);
        }
      }
      
      // تنظيف بيانات المصادقة المحلية
      clearAuthData();
      
      // إرجاع استجابة متوافقة مع النوع المتوقع
      return {
        status: true,
        code: 200,
        message: 'تم تسجيل الخروج بنجاح',
        data: null
      };
    } catch (error: any) {
      console.error('Error during logout:', error);
      
      // حتى في حالة الخطأ، نقوم بتنظيف البيانات المحلية
      clearAuthData();
      
      // إرجاع استجابة متوافقة مع النوع المتوقع
      return {
        status: true,
        code: 200,
        message: 'تم تسجيل الخروج بنجاح',
        data: null
      };
    }
  },

  // الحصول على بيانات المستخدم الحالي
  async getCurrentUser(): Promise<CurrentUserResponse> {
    try {
      const response = await axiosInstance.get('/auth/user');

      // التحقق من صحة الاستجابة
      if (!response.data?.user) {
        throw new Error('استجابة غير صالحة من الخادم');
      }

      // تحديث بيانات المستخدم في التخزين المحلي
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response as unknown as CurrentUserResponse;
    } catch (error: any) {
      console.error('Get Current User Error:', {
        error: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  },

  // إرسال رمز OTP
  async sendOTP(data: OTPSendRequest): Promise<OTPSendResponse> {
    const response = await axiosInstance.post('/auth/otp/send', data);
    return response as unknown as OTPSendResponse;
  },

  // إعادة إرسال رمز OTP
  async resendOTP(data: OTPSendRequest): Promise<OTPSendResponse> {
    const response = await axiosInstance.post('/auth/otp/resend', data);
    return response as unknown as OTPSendResponse;
  },

  // التحقق من صحة رقم الهاتف السعودي
  validateSaudiPhoneNumber(phone: string): boolean {
    const saudiPhoneRegex = /^\+966[0-9]{9}$/;
    return saudiPhoneRegex.test(phone);
  },

  // التحقق من رمز OTP
  async verifyOTP(data: OTPVerifyRequest): Promise<OTPVerifyResponse> {
    const response = await axiosInstance.post('/auth/otp/verify', data);
    return response as unknown as OTPVerifyResponse;
  },

  // طلب إعادة تعيين كلمة المرور
  async forgotPassword(data: ForgotPasswordRequest): Promise<PasswordResetResponse> {
    const response = await axiosInstance.post('/auth/password/forgot', data);
    return response as unknown as PasswordResetResponse;
  },

  // تغيير كلمة المرور باستخدام الرمز
  async resetPassword(data: ResetPasswordRequest): Promise<PasswordResetResponse> {
    const response = await axiosInstance.post('/auth/password/reset', data);
    return response as unknown as PasswordResetResponse;
  },

  // التحقق من صحة كلمة المرور
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل'
      };
    }

    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل'
      };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        isValid: false,
        message: 'يجب أن تحتوي كلمة المرور على حرف خاص واحد على الأقل'
      };
    }

    return { isValid: true };
  },

  // تسجيل الدخول باستخدام مواقع التواصل الاجتماعي
  async socialLogin(provider: SocialProvider, data: SocialLoginRequest): Promise<SocialLoginResponse> {
    const response = await axiosInstance.post(`/auth/social/${provider}`, data);

    // حفظ التوكن في التخزين المحلي
    if (typeof window !== 'undefined' && response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('token_type', response.data.token_type);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response as unknown as SocialLoginResponse;
  },

  // الحصول على رابط تسجيل الدخول الاجتماعي
  getSocialLoginUrl(provider: SocialProvider): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUri = `${baseUrl}/auth/callback/${provider}`;
    
    switch (provider) {
      case 'google':
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
      case 'facebook':
        return `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=email public_profile`;
      case 'apple':
        return `https://appleid.apple.com/auth/authorize?client_id=${process.env.NEXT_PUBLIC_APPLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=email name`;
      default:
        throw new Error('مزود غير مدعوم');
    }
  },

  /**
   * تحديث بيانات الملف الشخصي للمستخدم الحالي
   */
  async updateProfile(profileData: { name?: string; phone?: string; address?: string }) {
    try {
      const response = await axiosInstance.put('/user/profile', profileData);
      
      // تحديث بيانات المستخدم في localStorage
      if (response.status && response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * تحديث صورة الملف الشخصي للمستخدم الحالي
   */
  async updateProfilePhoto(photoFile: File) {
    try {
      // إنشاء كائن FormData
      const formData = new FormData();
      formData.append('photo', photoFile);

      // إرسال الطلب
      const response = await axiosInstance.post('/user/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      // تحديث البيانات في localStorage إذا كانت الاستجابة ناجحة
      if (response.status && response.data && response.data.code === 200) {
        // الحصول على بيانات المستخدم الحالية
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          // تحديث حقل صورة الملف الشخصي
          userData.profile_photo = response.data.data.profile_photo;
          // حفظ البيانات المحدثة
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      return response;
    } catch (error) {
      console.error('فشل في تحديث صورة الملف الشخصي:', error);
      throw error;
    }
  },

  /**
   * حذف صورة الملف الشخصي للمستخدم الحالي
   */
  async deleteProfilePhoto() {
    try {
      // إرسال طلب حذف الصورة
      const response = await axiosInstance.delete('/user/profile/photo');
      
      // تحديث البيانات في localStorage إذا كانت الاستجابة ناجحة
      if (response.status && response.data && response.data.code === 200) {
        // الحصول على بيانات المستخدم الحالية
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          // حذف حقل صورة الملف الشخصي
          userData.profile_photo = null;
          // حفظ البيانات المحدثة
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      return response;
    } catch (error) {
      console.error('فشل في حذف صورة الملف الشخصي:', error);
      throw error;
    }
  },

  /**
   * تحديث كلمة مرور المستخدم الحالي
   */
  async updatePassword(data: { current_password: string; password: string; password_confirmation: string }) {
    try {
      // التحقق من تطابق كلمة المرور الجديدة مع التأكيد
      if (data.password !== data.password_confirmation) {
        throw new Error('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      }
      
      // التحقق من صحة كلمة المرور الجديدة
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      
      // إرسال طلب تحديث كلمة المرور باستخدام axiosInstance
      const response = await axiosInstance.put('/user/password', data);
      
      return response;
    } catch (error: any) {
      // إذا كان الخطأ من الخادم مع استجابة
      if (error.response) {
        const responseError = error.response.data;
        // إذا كان هناك رسالة خطأ محددة
        if (responseError.message) {
          throw new Error(responseError.message);
        }
      }
      
      // إعادة إرسال الخطأ الأصلي إذا لم يكن هناك رسالة محددة
      throw error;
    }
  },

  async verifyEmail(email: string, otp: string): Promise<any> {
    try {
      console.log('Sending verification request:', { 
        email, 
        otp,
        url: '/api/v1/auth/verify-email'
      });
      
      const response = await axiosInstance.post('/api/v1/auth/verify-email', {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });
      
      console.log('Raw API Response:', JSON.stringify(response?.data, null, 2));
      
      // Return the raw response data without transformation
      if (response?.data) {
        return response.data;
      }
      
      throw new Error("استجابة غير صالحة من الخادم");
    } catch (error: any) {
      console.error('API Error:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Handle specific error messages from the server
      if (error.response?.data?.message) {
        if (error.response.data.message === 'messages.otp.invalid') {
          throw new Error('رمز التحقق غير صحيح');
        }
        throw new Error(error.response.data.message);
      }
      
      // If no specific error message, throw a generic one
      throw new Error('حدث خطأ أثناء التحقق من الرمز');
    }
  },

  async resendVerification(email: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/auth/resend-verification', {
        email
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: any): Error {
    if (error.response) {
      // الخطأ من الخادم مع رد
      const message = error.response.data.message || 'حدث خطأ في العملية';
      return new Error(message);
    } else if (error.request) {
      // لم يتم تلقي رد من الخادم
      return new Error('لا يمكن الاتصال بالخادم');
    } else {
      // خطأ في إعداد الطلب
      return new Error('حدث خطأ غير متوقع');
    }
  }
}; 