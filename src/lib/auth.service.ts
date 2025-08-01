import { LoginData, LoginResponse, UserRegistrationData, ServiceProviderRegistrationData, RegistrationResponse, LogoutResponse, CurrentUserResponse, OTPSendRequest, OTPSendResponse, OTPRateLimitError, OTPVerifyRequest, OTPVerifyResponse, ForgotPasswordRequest, ResetPasswordRequest, PasswordResetResponse, SocialLoginRequest, SocialLoginResponse, SocialProvider } from '@/types/auth.types';
import axios from 'axios';
import axiosInstance from './axios'; // Import the axios instance
import { 
  API_BASE_CONFIG, 
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  getCompleteHeaders
} from '@/config/api.config';

// Use API config instead of hardcoded BASE_URL

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

// تحديث الدالة لتتوافق مع AuthContext
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    try {
      // Try to get token from multiple sources in order of preference
      // 1. AuthContext/NextAuth tokens (highest priority)
      const nextAuthToken = localStorage.getItem('nextauth_token');
      if (nextAuthToken) {
        return nextAuthToken;
      }
      
      // 2. Standard tokens
      const localToken = localStorage.getItem('token');
      if (localToken) {
        return localToken;
      }
      
      // 3. Session storage fallback
      const sessionToken = sessionStorage.getItem('token');
      if (sessionToken) {
        return sessionToken;
      }
      
      // 4. Legacy token names
      const umrahToken = localStorage.getItem('umrah_token');
      if (umrahToken) {
        return umrahToken;
      }
      
      // 5. Firebase tokens for Firebase auth flows
      const firebaseToken = localStorage.getItem('firebase_token');
      if (firebaseToken) {
        return firebaseToken;
      }
      
      console.log('Auth token sources check:', {
        nextAuthToken: nextAuthToken ? '✓' : '✗',
        localStorage: localToken ? '✓' : '✗',
        sessionStorage: sessionToken ? '✓' : '✗',
        umrahToken: umrahToken ? '✓' : '✗',
        firebaseToken: firebaseToken ? '✓' : '✗'
      });
      
      return null;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  }
  return null;
};

// دالة جديدة للحصول على بيانات المستخدم من AuthContext
export const getUserFromAuthContext = (): any | null => {
  if (typeof window !== 'undefined') {
    try {
      // Try NextAuth user data first
      const nextAuthUser = localStorage.getItem('nextauth_user');
      if (nextAuthUser) {
        return JSON.parse(nextAuthUser);
      }
      
      // Fallback to regular user data
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user from AuthContext:', error);
      return null;
    }
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
    
    // Store in localStorage with error handling
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('token_type', tokenType);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Store additional auth flags
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
      
      console.log('✓ Data stored in localStorage successfully');
    } catch (localStorageError) {
      console.error('Failed to store in localStorage:', localStorageError);
    }

    // Store in sessionStorage as backup
    try {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('token_type', tokenType);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('isAuthenticated', 'true');
      
      console.log('✓ Data stored in sessionStorage as backup');
    } catch (sessionStorageError) {
      console.error('Failed to store in sessionStorage:', sessionStorageError);
    }

    // Store in cookies with secure settings
    try {
      const cookieOptions = `path=/; max-age=2592000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
      
      document.cookie = `token=${token}; ${cookieOptions}`;
      document.cookie = `token_type=${tokenType}; ${cookieOptions}`;
      
      // Store minimal user info in cookie to avoid size limitations
      const essentialUserInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles?.map((r: any) => r.name) || []
      };
      document.cookie = `user_info=${encodeURIComponent(JSON.stringify(essentialUserInfo))}; ${cookieOptions}`;
      document.cookie = `isAuthenticated=true; ${cookieOptions}`;
      
      console.log('✓ Data stored in cookies successfully');
    } catch (cookieError) {
      console.error('Failed to store in cookies:', cookieError);
    }

    // Set Authorization header for future requests
    try {
      axiosInstance.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
      console.log('✓ Authorization header set successfully');
    } catch (headerError) {
      console.error('Failed to set authorization header:', headerError);
    }

    // Verify storage
    const verification = {
      localStorage: {
        token: localStorage.getItem('token') ? 'present' : 'missing',
        tokenType: localStorage.getItem('token_type') || 'missing',
        user: localStorage.getItem('user') ? 'present' : 'missing',
        isAuthenticated: localStorage.getItem('isAuthenticated') || 'missing'
      },
      sessionStorage: {
        token: sessionStorage.getItem('token') ? 'present' : 'missing',
        tokenType: sessionStorage.getItem('token_type') || 'missing',
        user: sessionStorage.getItem('user') ? 'present' : 'missing'
      },
      cookies: {
        token: document.cookie.includes('token=') ? 'present' : 'missing',
        tokenType: document.cookie.includes('token_type=') ? 'present' : 'missing',
        userInfo: document.cookie.includes('user_info=') ? 'present' : 'missing',
        isAuthenticated: document.cookie.includes('isAuthenticated=') ? 'present' : 'missing'
      },
      axiosHeader: axiosInstance.defaults.headers.common['Authorization'] ? 'present' : 'missing'
    };

    console.log('Auth data storage verification:', verification);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authDataStored', { 
      detail: { 
        user, 
        token: token.substring(0, 10) + '...',
        tokenType 
      } 
    }));
    
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

const clearAuthData = () => {
  if (typeof window === 'undefined') return;

  try {
    console.log('Clearing all auth data...');
    
    // Clear localStorage - include Firebase-specific keys
    const localStorageKeys = [
      'token', 'token_type', 'user', 'isAuthenticated', 'authTimestamp', 
      'firebase_token', 'firebase_user', 'nextauth_token', 'umrah_token'
    ];
    localStorageKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage:`, error);
      }
    });

    // Clear sessionStorage
    const sessionStorageKeys = ['token', 'token_type', 'user', 'isAuthenticated', 'firebase_token'];
    sessionStorageKeys.forEach(key => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from sessionStorage:`, error);
      }
    });

    // Clear cookies
    const cookiesToClear = ['token', 'token_type', 'user_info', 'isAuthenticated', 'firebase_token'];
    cookiesToClear.forEach(cookieName => {
      try {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      } catch (error) {
        console.error(`Failed to clear ${cookieName} cookie:`, error);
      }
    });

    // Clear NextAuth cookies if present
    const nextAuthCookies = ['next-auth.session-token', 'next-auth.callback-url', 'next-auth.csrf-token'];
    nextAuthCookies.forEach(cookieName => {
      try {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      } catch (error) {
        console.error(`Failed to clear ${cookieName} cookie:`, error);
      }
    });

    // Clear Authorization header
    try {
      delete axiosInstance.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Failed to clear authorization header:', error);
    }

    console.log('✓ All auth data cleared successfully');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authDataCleared'));
    
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// دالة محسنة للتحقق من حالة المصادقة مع عدة مصادر
const checkAuth = (): { isAuthenticated: boolean; user: any | null } => {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, user: null };
  }

  try {
    // Check multiple sources for authentication data
    let token: string | null = null;
    let tokenType: string | null = null;
    let user: any = null;
    let source: string = 'none';

    // Try localStorage first
    try {
      // Check for standard token
      token = localStorage.getItem('token');
      
      // Check for Firebase token as backup
      if (!token) {
        token = localStorage.getItem('firebase_token');
        if (token) source = 'firebase_token';
      } else {
        source = 'localStorage';
      }
      
      // Look for alternative tokens if still not found
      if (!token) {
        token = localStorage.getItem('nextauth_token');
        if (token) source = 'nextauth';
      }
      
      // Get token type and user
      tokenType = localStorage.getItem('token_type') || 'Bearer';
      const userStr = localStorage.getItem('user');
      if (userStr) {
        user = JSON.parse(userStr);
        if (!source && user) source = 'localStorage_user';
      }
      
      // For Firebase auth specifically
      const firebaseUserStr = localStorage.getItem('firebase_user');
      if (!user && firebaseUserStr) {
        try {
          user = JSON.parse(firebaseUserStr);
          if (user) source = 'firebase_user';
        } catch (parseError) {
          console.warn('Failed to parse Firebase user:', parseError);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    // Fallback to sessionStorage
    if (!token || !user) {
      try {
        const sessionToken = sessionStorage.getItem('token');
        if (!token && sessionToken) {
          token = sessionToken;
          source = 'sessionStorage';
        }
        
        tokenType = tokenType || sessionStorage.getItem('token_type') || 'Bearer';
        
        if (!user) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            user = JSON.parse(userStr);
            if (!source && user) source = 'sessionStorage_user';
          }
        }
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error);
      }
    }

    // Fallback to cookies
    if (!token || !user) {
      try {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        if (!token && cookies.token) {
          token = cookies.token;
          source = 'cookies';
        }
        
        tokenType = tokenType || cookies.token_type || 'Bearer';
        
        if (!user && cookies.user_info) {
          try {
            user = JSON.parse(decodeURIComponent(cookies.user_info));
            if (!source && user) source = 'cookies_user';
          } catch (parseError) {
            console.warn('Failed to parse user from cookie:', parseError);
          }
        }
      } catch (error) {
        console.warn('Failed to read from cookies:', error);
      }
    }

    // Special case for Firebase Google auth - we might have user without token
    // In this case, consider auth valid if we have Firebase user with id
    let isAuthenticated = !!(token && user && user.id);
    
    // For Firebase auth with Google, sometimes we have user but no token
    // Consider authenticated if from Firebase and we have user info
    const isFirebaseAuth = source.includes('firebase') && user && user.uid;
    if (isFirebaseAuth && !isAuthenticated) {
      // If we're using Firebase auth without a token, create a temporary session token
      if (!token && typeof window !== 'undefined') {
        const tempToken = 'firebase_session_' + Date.now();
        localStorage.setItem('firebase_token', tempToken);
        token = tempToken;
        tokenType = 'Firebase';
        isAuthenticated = true;
        console.log('Created temporary Firebase session token');
      }
    }
    
    // Set Authorization header if we have valid auth data
    if (token && tokenType) {
      axiosInstance.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }

    console.log('Auth check result:', {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      userId: user?.id || user?.uid,
      userEmail: user?.email,
      source
    });

    return { isAuthenticated, user };
  } catch (error) {
    console.error('Error checking auth status:', error);
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

      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
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
        password_confirmation: data.password_confirmation || data.password // Make sure password_confirmation is set
      };

      console.log('Sending registration request:', {
        ...cleanData,
        password: '[HIDDEN]',
        password_confirmation: '[HIDDEN]'
      });

      // استخدام المسار الصحيح للتسجيل: /auth/register
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.REGISTER}`, cleanData);
      
      console.log('Register Response:', {
        url: AUTH_ENDPOINTS.REGISTER,
        status: response.status,
        message: response.data?.message,
        success: response.data?.status,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user
      });

      // حفظ بيانات المصادقة عند نجاح التسجيل إذا وجدت
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('token_type', response.data.token_type || 'Bearer');
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response as unknown as RegistrationResponse;
    } catch (error: any) {
      console.error('Register Error:', {
        email: data.email,
        error: error.message,
        response: error.response?.data,
        url: error.config?.url,
        status: error.response?.status,
        errors: error.response?.data?.errors
      });
      
      // Format validation errors into a more helpful error message
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages: string[] = [];
        
        for (const field in validationErrors) {
          if (validationErrors[field] && validationErrors[field].length) {
            errorMessages.push(validationErrors[field][0]);
          }
        }
        
        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join('. '));
        }
      }
      
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

      console.log('Sending registration request to:', AUTH_ENDPOINTS.OFFICE_REGISTER);
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OFFICE_REGISTER}`, cleanData);
      console.log('Registration API response:', {
        status: response.status,
        statusText: response.statusText,
        data: {
          ...response.data,
          token: response.data?.token ? '[PRESENT]' : '[MISSING]'
        }
      });

      // حفظ بيانات المصادقة عند نجاح التسجيل إذا وجدت
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('token_type', response.data.token_type || 'Bearer');
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
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

      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OPERATOR_REGISTER}`, cleanData);

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
      console.log('Starting logout process...');
      
      // Try to handle Firebase logout if we were using Firebase auth
      if (typeof window !== 'undefined') {
        // Check if we're using Firebase auth
        const firebaseUser = localStorage.getItem('firebase_user');
        if (firebaseUser) {
          console.log('Firebase user detected, performing Firebase logout');
          try {
            // Import and use the Firebase signOut method if available
            const { getAuth, signOut } = await import('firebase/auth');
            const auth = getAuth();
            if (auth.currentUser) {
              await signOut(auth);
              console.log('✓ Firebase signOut successful');
            }
          } catch (firebaseError) {
            console.warn('Firebase logout error (non-critical):', firebaseError);
            // Non-critical error, continue with the logout process
          }
        }
      }
      
      // محاولة تسجيل الخروج من الخادم أولاً
      const token = localStorage.getItem('token') || localStorage.getItem('firebase_token');
      if (token) {
        try {
          const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`);
          console.log('Server logout successful');
        } catch (error) {
          console.error('Server logout failed, continuing with client logout:', error);
        }
      }
      
      // Clean up NextAuth session if needed
      try {
        if (typeof window !== 'undefined' && window.sessionStorage.getItem('next-auth.session-token')) {
          console.log('NextAuth session found, cleaning up...');
          // Try to use NextAuth signOut
          try {
            const { signOut } = await import('next-auth/react');
            await signOut({ redirect: false });
            console.log('✓ NextAuth signOut successful');
          } catch (nextAuthError) {
            console.warn('NextAuth signOut failed (non-critical):', nextAuthError);
          }
        }
      } catch (sessionError) {
        console.warn('Error checking NextAuth session:', sessionError);
      }
      
      // Always clean local auth data
      clearAuthData();
      
      // Refresh the page to ensure all state is cleared
      if (typeof window !== 'undefined') {
        // Dispatch a logout event that components can listen for
        window.dispatchEvent(new CustomEvent('user-logged-out'));
        
        // Schedule a refresh after a short delay
        setTimeout(() => {
          try {
            window.location.href = '/'; // Redirect to homepage
          } catch (refreshError) {
            console.warn('Failed to redirect after logout:', refreshError);
          }
        }, 300);
      }
      
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
      // الاستعلام عن حالة المصادقة
      const { isAuthenticated, user } = checkAuth();

      // تسجيل الخروج عند عدم وجود مستخدم أو توكن
      if (!isAuthenticated && !user) {
        // If there's neither a token nor cached user data, don't even try an API call
        // This will return early and avoid unnecessary API errors
        const errorMessage = 'المستخدم غير مسجل الدخول';
        throw new Error(errorMessage);
      }

      // Try to fetch user data from server if we have a token
      try {
        const response = await axiosInstance.get(API_BASE_CONFIG.BASE_URL+AUTH_ENDPOINTS.CURRENT_USER,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        console.log('getCurrentUser API response:', {
          status: response.status,
          dataKeys: Object.keys(response.data || {}),
          hasUser: !!response.data?.user,
          hasDataUser: !!response.data?.data?.user,
          hasId: !!response.data?.id,
          responseStructure: response.data
        });

        // التحقق من صحة الاستجابة
        if (!response.data) {
          throw new Error('استجابة فارغة من الخادم');
        }

        // Handle different response structures with more flexibility
        let userData: any = null;
        
        // Try different response structures
        if (response.data.user) {
          userData = response.data.user;
          console.log('✓ Found user data in response.data.user');
        } else if (response.data.data && response.data.data.user) {
          userData = response.data.data.user;
          console.log('✓ Found user data in response.data.data.user');
        } else if (response.data.id) {
          userData = response.data;
          console.log('✓ Found user data in response.data (direct)');
        } else if (response.data.status && response.data.data) {
          // Handle wrapped response - check if data itself is the user
          if (response.data.data.id || response.data.data.email) {
            userData = response.data.data;
            console.log('✓ Found user data in response.data.data (wrapped)');
          } else if (response.data.data.user) {
            userData = response.data.data.user;
            console.log('✓ Found user data in response.data.data.user (double wrapped)');
          }
        } else if (response.data.status === 'success' && response.data.data) {
          // Handle success response with data
          userData = response.data.data;
          console.log('✓ Found user data in success response');
        }
        
        // If we got server data, use it
        if (userData) {
          // تحديث بيانات المستخدم في التخزين المحلي
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('user', JSON.stringify(userData));
              sessionStorage.setItem('user', JSON.stringify(userData));
              
              // Update cookie with essential user info
              const essentialUserInfo = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                roles: userData.roles?.map((r: any) => r.name) || []
              };
              const cookieOptions = `path=/; max-age=2592000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
              document.cookie = `user_info=${encodeURIComponent(JSON.stringify(essentialUserInfo))}; ${cookieOptions}`;
              
              console.log('✓ User data updated in storage');
            } catch (storageError) {
              console.warn('Failed to update user data in storage:', storageError);
            }
          }

          return {
            status: true,
            code: response.status,
            message: 'تم الحصول على بيانات المستخدم بنجاح',
            data: {
              user: userData
            }
          } as CurrentUserResponse;
        }
      } catch (apiError: any) {
        console.warn('API request for user data failed:', apiError.message);
        
        // If it's a 401 error but we have local user data, don't clear auth
        if (apiError.response?.status === 401 && !user) {
          clearAuthData();
        }
      }
      
      // Fallback to cached user data if API request failed
      if (user) {
        console.log('✓ Using cached user data as fallback');
        return {
          status: true,
          code: 200,
          message: 'تم استخدام بيانات المستخدم المخزنة محلياً',
          data: {
            user: user
          }
        } as CurrentUserResponse;
      }
      
      // If we get here, we couldn't get user data
      throw new Error('فشل الحصول على بيانات المستخدم');
    } catch (error: any) {
      // Only log detailed errors for unexpected cases, not for common "not logged in" case
      if (error.message !== 'المستخدم غير مسجل الدخول') {
        console.error('Get Current User Error:', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      
      throw error;
    }
  },

  // إرسال رمز OTP
  async sendOTP(data: OTPSendRequest): Promise<OTPSendResponse> {
    try {
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OTP_SEND}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // إعادة إرسال رمز OTP
  async resendOTP(data: OTPSendRequest): Promise<OTPSendResponse> {
    try {
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OTP_RESEND}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // التحقق من صحة رقم الهاتف السعودي
  validateSaudiPhoneNumber(phone: string): boolean {
    const saudiPhoneRegex = /^\+966[0-9]{9}$/;
    return saudiPhoneRegex.test(phone);
  },

  // التحقق من رمز OTP
  async verifyOTP(data: OTPVerifyRequest): Promise<OTPVerifyResponse> {
    try {
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OTP_VERIFY}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // طلب إعادة تعيين كلمة المرور
  async forgotPassword(data: ForgotPasswordRequest): Promise<PasswordResetResponse> {
    try {
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // تغيير كلمة المرور باستخدام الرمز
  async resetPassword(data: ResetPasswordRequest): Promise<PasswordResetResponse> {
    try {
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // التحقق من صحة كلمة المرور
  validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل'
      };
    }

    return { isValid: true };
  },

  // تسجيل الدخول باستخدام مواقع التواصل الاجتماعي
  async socialLogin(provider: SocialProvider, data: SocialLoginRequest): Promise<SocialLoginResponse> {
    try {
      console.log(`Attempting social login with ${provider}`, {
        hasIdToken: !!data.id_token,
        hasAccessToken: !!data.access_token,
        endpoint: AUTH_ENDPOINTS.SOCIAL[provider.toUpperCase()]
      });
      
      // For Google, ensure we're sending the token in the correct format
      let payload = data;
      
      // Ensure the API endpoint is correctly formatted
      const endpoint = AUTH_ENDPOINTS.SOCIAL[provider.toUpperCase()];
      if (!endpoint) {
        throw new Error(`Unsupported social provider: ${provider}`);
      }
      
      // Make the API call
      const response = await axiosInstance.post(API_BASE_CONFIG.BASE_URL + endpoint, payload);
      
      console.log('Social login API response:', {
        status: response.status,
        hasToken: !!response.data?.token || !!response.data?.data?.token,
        hasUser: !!response.data?.user || !!response.data?.data?.user
      });

      // Extract token and user from different possible response structures
      let token, tokenType, user;
      
      if (response.data?.token) {
        token = response.data.token;
        tokenType = response.data.token_type || 'Bearer';
        user = response.data.user;
      } else if (response.data?.data?.token) {
        token = response.data.data.token;
        tokenType = response.data.data.token_type || 'Bearer';
        user = response.data.data.user;
      }
      
      // Store auth data if we have both token and user
      if (token && user) {
        console.log('Social login successful, storing auth data');
        setAuthData(token, tokenType, user);
      } else {
        console.error('Social login response missing token or user data');
        
        // If we have user data but no token (common with Firebase auth), store user data anyway
        if (user && !token && typeof window !== 'undefined') {
          console.log('Storing user data without token (Firebase auth)');
          localStorage.setItem('user', JSON.stringify(user));
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      }

      return response as unknown as SocialLoginResponse;
    } catch (error: any) {
      console.error('Social login error:', {
        provider,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Get URL for social login
  getSocialLoginUrl(provider: SocialProvider): string {
    const baseUrl = API_BASE_CONFIG.BASE_URL;
    
    switch (provider) {
      case 'google':
        return `${baseUrl}/auth/social/google`;
      case 'facebook':
        return `${baseUrl}/auth/social/facebook/redirect`;
      case 'apple':
        return `${baseUrl}/auth/social/apple/redirect`;
      default:
        throw new Error(`Unsupported social provider: ${provider}`);
    }
  },

  // Handle the callback from the social login provider
  async handleSocialLoginCallback(provider: SocialProvider, code: string): Promise<LoginResponse> {
    try {
      console.log(`Handling social login callback for ${provider}:`, {
        provider,
        hasCode: !!code,
        callbackUrl: AUTH_ENDPOINTS.SOCIAL_LOGIN_CALLBACK_URL(provider)
      });
      
      let response;
      
      try {
        response = await axiosInstance.post<LoginResponse>(
          AUTH_ENDPOINTS.SOCIAL_LOGIN_CALLBACK_URL(provider),
          { code }
        );
      } catch (apiError: any) {
        console.error('Social login callback API error:', {
          status: apiError.response?.status,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        // For Firebase Google auth, we might need to handle the token differently
        if (provider === 'google' && typeof window !== 'undefined') {
          console.log('Attempting Firebase token handling for Google auth...');
          
          // If we have user data from Firebase but the API call failed
          const firebaseUserStr = localStorage.getItem('firebase_user');
          if (firebaseUserStr) {
            try {
              const firebaseUser = JSON.parse(firebaseUserStr);
              
              // Try to get the ID token
              if (code) {
                // Try to send the token directly as id_token instead
                console.log('Retrying with id_token format...');
                return await this.socialLogin('google', { id_token: code });
              }
              
              // If we have just the user but no valid token response
              return {
                status: true,
                code: 200,
                message: 'تم تسجيل الدخول باستخدام حساب Google',
                data: {
                  token: 'firebase_session_' + Date.now(),
                  token_type: 'Firebase',
                  user: firebaseUser
                }
              } as LoginResponse;
            } catch (fallbackError) {
              console.error('Firebase fallback error:', fallbackError);
            }
          }
        }
        
        // If we couldn't handle it specially, rethrow
        throw apiError;
      }

      console.log('Social login callback response:', {
        status: response.status,
        hasToken: !!response.data?.data?.token,
        hasUser: !!response.data?.data?.user
      });

      // Process the response and store auth data
      if (response.data?.data?.user && response.data?.data?.token) {
        setAuthData(
          response.data.data.token,
          response.data.data.token_type || 'Bearer',
          response.data.data.user
        );
        
        // Also store as firebase_token for Firebase auth flows
        if (provider === 'google' && typeof window !== 'undefined') {
          localStorage.setItem('firebase_token', response.data.data.token);
        }
      } else {
        console.warn('Social callback missing token or user in response:', {
          dataStructure: Object.keys(response.data || {}),
          hasDataField: !!response.data?.data
        });
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * تحديث بيانات الملف الشخصي للمستخدم الحالي
   */
  async updateProfile(profileData: { name?: string; phone?: string; address?: string }) {
    try {
      const response = await axiosInstance.put(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.PROFILE, profileData);
      
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
        const response = await axiosInstance.post(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.PROFILE_PHOTO, formData, {
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
      const response = await axiosInstance.delete(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.PROFILE_PHOTO);
      
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
      const response = await axiosInstance.put(API_BASE_CONFIG.BASE_URL+USER_ENDPOINTS.PASSWORD, data);
      
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
        url: `${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.VERIFY_EMAIL}`
      });
      
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.VERIFY_EMAIL}`, {
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });
      
      console.log('Verification API Response:', {
        status: response.status,
        data: response.data,
        message: response.data?.message,
        success: response.data?.status
      });
      
      // Enhanced response handling to accommodate different response formats
      const responseData = response?.data;
      
      // Check for success indicators in different possible response structures
      const isVerified = 
        responseData?.verified === true || 
        responseData?.email_verified === true || 
        responseData?.status === true || 
        (responseData?.data && (responseData.data.verified === true || responseData.data.email_verified === true));
      
      if (isVerified) {
        // If verification is successful, also store any token and user data if present
        if (responseData?.token || (responseData?.data && responseData.data.token)) {
          const token = responseData.token || responseData.data?.token;
          const tokenType = responseData.token_type || responseData.data?.token_type || 'Bearer';
          const user = responseData.user || responseData.data?.user;
          
          if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('token_type', tokenType);
          }
          
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        
        // Return with verified flag for consistency
        return { 
          ...responseData,
          verified: true 
        };
      }
      
      // If the response doesn't indicate success but also doesn't have an error
      if (responseData && !responseData.error) {
        return {
          ...responseData,
          verified: false
        };
      }
      
      // If there's an explicit error message
      throw new Error(responseData?.message || responseData?.error || 'Verification failed');
      
    } catch (error: any) {
      console.error('Verification API Error:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Handle specific error messages from the server
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Format validation errors into a more helpful error message
        if (error.response?.status === 422 && errorData?.errors) {
          const validationErrors = errorData.errors;
          const errorMessages: string[] = [];
          
          for (const field in validationErrors) {
            if (validationErrors[field] && validationErrors[field].length) {
              errorMessages.push(validationErrors[field][0]);
            }
          }
          
          if (errorMessages.length > 0) {
            throw new Error(errorMessages.join('. '));
          }
        }
        
        // Check for error messages in different possible structures
        const errorMessage = 
          errorData.message || 
          (errorData.errors && errorData.errors.otp && errorData.errors.otp[0]) ||
          'رمز التحقق غير صحيح';
        
        if (errorMessage.includes('otp.invalid') || errorMessage.includes('رمز التحقق')) {
          throw new Error('رمز التحقق غير صحيح');
        }
        
        throw new Error(errorMessage);
      }
      
      // If no specific error message, throw a generic one
      throw new Error('حدث خطأ أثناء التحقق من الرمز');
    }
  },

  async resendVerification(email: string): Promise<any> {
    try {
      console.log('Sending verification resend request:', {
        email,
        url: `${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OTP_RESEND}`
      });
      
      const response = await axiosInstance.post(`${API_BASE_CONFIG.BASE_URL}${AUTH_ENDPOINTS.OTP_RESEND}`, {
        email: email.trim().toLowerCase()
      });
      
      console.log('Resend verification response:', {
        status: response.status,
        success: response.data?.status,
        message: response.data?.message
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', {
        email,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Format validation errors into a more helpful error message
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages: string[] = [];
        
        for (const field in validationErrors) {
          if (validationErrors[field] && validationErrors[field].length) {
            errorMessages.push(validationErrors[field][0]);
          }
        }
        
        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join('. '));
        }
      }
      
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