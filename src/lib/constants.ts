/**
 * ملف الثوابت المحدث - Updated Constants File
 * يستخدم الإعدادات المركزية الجديدة من api.config.ts
 */

// Import centralized API configuration
import { API_BASE_CONFIG } from '../config/api.config';

// ====================
// API Configuration (من api.config.ts)
// ====================
export const API_CONFIG = {
  ...API_BASE_CONFIG,
  // يمكن إضافة إعدادات إضافية هنا إذا لزم الأمر
} as const;

// ====================
// Application Constants
// ====================
export const APP_CONFIG = {
  NAME: 'UmrahGo',
  DESCRIPTION: 'منصة شاملة لخدمات العمرة',
  VERSION: '1.0.0',
  LOCALE: {
    DEFAULT: 'ar',
    SUPPORTED: ['ar', 'en']
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 100
  }
} as const;

// ====================
// UI Constants
// ====================
export const UI_CONFIG = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500
    },
    EASING: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
      EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
      EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080
  }
} as const;

// ====================
// Form Constants
// ====================
export const FORM_CONFIG = {
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },
  INPUT: {
    DEBOUNCE_DELAY: 300,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
} as const;

// ====================
// Business Logic Constants
// ====================
export const BUSINESS_CONFIG = {
  PACKAGE: {
    MIN_PRICE: 0,
    MAX_PRICE: 50000,
    MIN_DURATION: 1,
    MAX_DURATION: 30,
    CURRENCY: {
      DEFAULT: 'SAR',
      SUPPORTED: ['SAR', 'USD', 'EUR']
    }
  },
  BOOKING: {
    STATUS: {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      REFUNDED: 'refunded'
    },
    CANCELLATION: {
      FREE_CANCELLATION_DAYS: 7,
      PARTIAL_REFUND_DAYS: 3
    }
  },
  OFFICE: {
    RATING: {
      MIN: 0,
      MAX: 5,
      DEFAULT: 0
    },
    VERIFICATION_STATUS: {
      PENDING: 'pending',
      VERIFIED: 'verified',
      REJECTED: 'rejected',
      SUSPENDED: 'suspended'
    }
  }
} as const;

// ====================
// Storage Keys
// ====================
export const STORAGE_KEYS = {
  // Auth
  TOKEN: 'token',
  TOKEN_TYPE: 'token_type',
  USER: 'user',
  REFRESH_TOKEN: 'refresh_token',
  
  // Preferences
  LANGUAGE: 'language',
  THEME: 'theme',
  CURRENCY: 'preferred_currency',
  
  // Cart & Favorites
  CART: 'cart',
  FAVORITES: 'favorites',
  
  // Search History
  SEARCH_HISTORY: 'search_history',
  RECENT_PACKAGES: 'recent_packages',
  
  // UI State
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  SELECTED_FILTERS: 'selected_filters'
} as const;

// ====================
// Error Messages
// ====================
export const ERROR_MESSAGES = {
  NETWORK: 'خطأ في الاتصال بالشبكة',
  SERVER: 'خطأ في الخادم',
  UNAUTHORIZED: 'غير مخول للوصول',
  FORBIDDEN: 'ممنوع الوصول',
  NOT_FOUND: 'الصفحة غير موجودة',
  VALIDATION: 'خطأ في التحقق من البيانات',
  UNKNOWN: 'حدث خطأ غير متوقع',
  
  // Form specific
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_PHONE: 'رقم الهاتف غير صحيح',
  PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة جداً',
  PASSWORDS_NOT_MATCH: 'كلمات المرور غير متطابقة',
  
  // File upload
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم',
  UPLOAD_FAILED: 'فشل في رفع الملف'
} as const;

// ====================
// Success Messages
// ====================
export const SUCCESS_MESSAGES = {
  LOGIN: 'تم تسجيل الدخول بنجاح',
  LOGOUT: 'تم تسجيل الخروج بنجاح',
  REGISTER: 'تم إنشاء الحساب بنجاح',
  PASSWORD_RESET: 'تم إرسال رابط إعادة تعيين كلمة المرور',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  PASSWORD_CHANGED: 'تم تغيير كلمة المرور بنجاح',
  EMAIL_VERIFIED: 'تم التحقق من البريد الإلكتروني بنجاح',
  
  // Booking
  BOOKING_CREATED: 'تم إنشاء الحجز بنجاح',
  BOOKING_CANCELLED: 'تم إلغاء الحجز بنجاح',
  BOOKING_UPDATED: 'تم تحديث الحجز بنجاح',
  
  // Package
  PACKAGE_CREATED: 'تم إنشاء الباقة بنجاح',
  PACKAGE_UPDATED: 'تم تحديث الباقة بنجاح',
  PACKAGE_DELETED: 'تم حذف الباقة بنجاح',
  
  // General
  FORM_SUBMITTED: 'تم إرسال النموذج بنجاح',
  FILE_UPLOADED: 'تم رفع الملف بنجاح',
  CHANGES_SAVED: 'تم حفظ التغييرات بنجاح'
} as const;

// ====================
// Date & Time Constants
// ====================
export const DATE_CONFIG = {
  FORMATS: {
    DATE: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    TIME: 'HH:mm',
    DISPLAY_DATE: 'DD/MM/YYYY',
    DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
    MONTH_YEAR: 'MM/YYYY'
  },
  TIMEZONE: 'Asia/Riyadh',
  LOCALE: 'ar-SA'
} as const;

// ====================
// Export Legacy Constants (for backward compatibility)
// ====================

// Keep the old API_CONFIG export for backward compatibility
export { API_CONFIG as API_CONFIG_LEGACY };

// Re-export from the centralized config
export * from '../config/api.config';

// ====================
// Default Export
// ====================
export default {
  API: API_CONFIG,
  APP: APP_CONFIG,
  UI: UI_CONFIG,
  FORM: FORM_CONFIG,
  BUSINESS: BUSINESS_CONFIG,
  STORAGE: STORAGE_KEYS,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  DATE: DATE_CONFIG
} as const; 