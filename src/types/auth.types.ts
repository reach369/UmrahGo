// نوع حالة المصادقة
export type AuthState = {
  isAuthenticated: boolean; // حالة المصادقة
  user: User | null; // بيانات المستخدم
  loading: boolean; // حالة التحميل
};

// نوع إجراءات المصادقة
export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User } // إجراء نجاح تسجيل الدخول
  | { type: 'LOGOUT' } // إجراء تسجيل الخروج
  | { type: 'SET_LOADING'; payload: boolean }; // إجراء تعيين حالة التحميل

// نوع سياق المصادقة
export type AuthContextType = {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null;

// واجهة بيانات المستخدم
export interface User {
  id: number;
  name: string;
  email: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
    permissions: Array<{
      id: number;
      name: string;
      description: string;
      group: string;
    }>;
  }>;
  status: 'active' | 'pending' | 'blocked';
  preferred_language: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  profile_photo?: string | null;
  avatar?: string | null;
  email_verified_at?: string | null;
  is_active?: boolean;
  umrah_office?: {
    id: number;
    office_name: string;
    address: string;
    contact_number: string;
    verification_status: string;
    is_active: boolean;
  };
}

// نوع بيانات تسجيل المستخدم العادي
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  office_name?: string;
  license_number?: string;
  commercial_register?: string;
  user_type?: string;
}

// نوع بيانات تسجيل مزود الخدمة
export interface ServiceProviderRegistrationData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  office_name: string;
  office_name_ar?: string;
  office_name_en?: string;
  address?: string;
  license_number?: string;
  commercial_register?: string;
  description?: string;
  city?: string;
  country?: string;
  user_type?: string;
}

// نوع بيانات تسجيل الدخول
export interface LoginData {
  email: string;
  password: string;
}

// واجهة بيانات المكتب
export interface OfficeData {
  id: number;
  office_name: string;
  address: string;
  city: string;
  country: string;
  contact_number: string;
  email: string;
  logo: string | null;
  verification_status: 'pending' | 'approved' | 'rejected';
  license_number: string | null;
}

// واجهة بيانات مشغل الباصات
export interface OperatorData {
  id: number;
  company_name: string | null;
  address: string;
  verified: boolean;
}

// واجهة بيانات المستخدم المفصلة
export interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_photo: string | null;
  avatar: string | null;
  status: 'pending' | 'active' | 'suspended';
  is_active: boolean;
  preferred_language: string;
  email_verified_at: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
  office?: OfficeData;
  operator?: OperatorData;
}

// نوع استجابة تسجيل الدخول
export interface LoginResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    user: User;
    token: string;
    token_type: string;
  };
}

// نوع استجابة التسجيل
export interface RegistrationResponse {
  status: boolean;
  code: number;
  message: string;
  data?: {
    token: string;
    token_type: string;
    user: User;
  };
  errors?: {
    [key: string]: string[];
  };
}

// نوع استجابة تسجيل الخروج
export interface LogoutResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

// نوع استجابة المستخدم الحالي
export interface CurrentUserResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    user: User;
  };
}

// نوع طلب إرسال رمز التحقق
export interface OTPSendRequest {
  phone?: string;
  email?: string;
}

// نوع استجابة إرسال رمز التحقق
export interface OTPSendResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

// نوع خطأ تجاوز حد المحاولات
export interface OTPRateLimitError {
  status: boolean;
  code: number;
  message: string;
  errors: {
    seconds_remaining: number;
  };
}

// نوع طلب التحقق من رمز OTP
export interface OTPVerifyRequest {
  phone?: string;
  email?: string;
  otp: string;
}

// نوع استجابة التحقق من رمز OTP
export interface OTPVerifyResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    email_verified?: boolean;
    phone_verified?: boolean;
  };
}

// نوع طلب إعادة تعيين كلمة المرور
export interface ForgotPasswordRequest {
  email: string;
}

// نوع طلب تغيير كلمة المرور
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

// نوع استجابة إعادة تعيين كلمة المرور
export interface PasswordResetResponse {
  status: boolean;
  code: number;
  message: string;
  data: null;
}

// نوع مزود التسجيل الاجتماعي
export type SocialProvider = 'google' | 'facebook' | 'apple';

// نوع طلب التسجيل الاجتماعي
export interface SocialLoginRequest {
  access_token?: string;
  id_token?: string;

  provider: SocialProvider;
}

// نوع استجابة التسجيل الاجتماعي
export interface SocialLoginResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    token: string;
    token_type: string;
    user: User;
  };
} 