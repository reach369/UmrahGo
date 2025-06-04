// واجهة بيانات تسجيل الدخول
export interface LoginCredentials {
  email: string;
  password: string;
}

// واجهة الاستجابة لتسجيل الدخول
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// واجهة أخطاء واجهة برمجة التطبيقات
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// واجهة الاستجابة العامة لواجهة برمجة التطبيقات
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
} 