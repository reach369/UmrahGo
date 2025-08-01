/**
 * مركز إعدادات API - ملف موحد لجميع endpoints والإعدادات
 * API Configuration Center - Unified file for all API endpoints and settings
 */

// ====================
// Base Configuration
// ====================
export const ADMIN_WEB_URL = process.env.NEXT_PUBLIC_ADMIN_WEB_URL || 'https://admin.umrahgo.net';
export const API_BASE_CONFIG = {
  // Base URL - يمكن تغييرها من متغير البيئة
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1',
  ADMIN_WEB_URL: process.env.NEXT_PUBLIC_ADMIN_WEB_URL || 'https://admin.umrahgo.net',
  // Fallback URLs في حالة فشل الـ URL الرئيسي
  FALLBACK_URLS: [
    'https://admin.umrahgo.net/api/v1',
    'https://www.admin.umrahgo.net/api/v1',
    // يمكن إضافة المزيد من الـ backup URLs هنا
  ],
  
  // API Version
  VERSION: 'v1',
  
  // Timeout settings
  TIMEOUT: {
    DEFAULT: 30000,      // 30 seconds
    FAST: 8000,          // 8 seconds for quick calls
    SLOW: 60000,         // 60 seconds for uploads
  },
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  
  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000,    // 1 minute
  }
} as const;

// ====================
// Public Endpoints (لا تحتاج authentication)
// ====================
export const PUBLIC_ENDPOINTS = {
  // Home & Landing
  HOME: '/public/home',
  FEATURES: '/public/features',
  TESTIMONIALS: '/public/testimonials',
  HOW_IT_WORKS: '/public/how-it-worksa',
  //  HOW_IT_WORKS: '/public/how-it-works',

  FAQS: '/public/faqs',
  ABOUT: '/public/about',
  CONTACT: '/public/contact',
  
  // Site Settings
  SETTINGS: '/public/settings',
  
  // Packages
  PACKAGES: {
    LIST: '/public/packages',
    FEATURED: '/public/packages/featured',
    POPULAR: '/public/packages/popular',
    DETAIL: (id: string | number) => `/public/packages/${id}`,
    SEARCH: '/public/packages/search',
  },
  
  // Offices
  OFFICES: {
    LIST: '/public/offices',
    DETAIL: (id: string | number) => `/public/offices/${id}`,
    PACKAGES: (id: string | number) => `/public/offices/${id}/packages`,
    REVIEWS: (id: string | number) => `/public/offices/${id}/reviews`,
  },

  // Bus Operators
  BUS_OPERATORS: {
    LIST: '/public/operators',
    POPULAR: '/public/operators/popular',
    DETAIL: (id: string | number) => `/public/operators/${id}`,
    BUSES: (id: string | number) => `/public/operators/${id}/buses`,
  },

  // Buses
  BUSES: {
    DETAIL: (id: string | number) => `/public/buses/${id}`,
    TYPES: '/public/buses/types',
  },
  
  // Statistics
  STATS: '/public/stats',
  
  // Newsletter
  NEWSLETTER: '/public/newsletter/subscribe',
} as const;

// ====================
// Authentication Endpoints
// ====================
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/password/forgot',
  RESET_PASSWORD: '/auth/password/reset',
  VERIFY_EMAIL: '/auth/verify',
  CHANGE_PASSWORD: '/auth/change-password',
  PROFILE: '/auth/profile',
  CURRENT_USER: '/auth/user',
  
  // OTP
  OTP_SEND: '/auth/otp/send',
  OTP_VERIFY: '/auth/otp/verify',
  OTP_RESEND: '/auth/otp/resend',
  
  // Social Auth
  SOCIAL: {
    GOOGLE: '/auth/social/google',
    FACEBOOK: '/auth/social/facebook',
    TWITTER: '/auth/social/twitter',
  },

  // Social Login Callback
  SOCIAL_LOGIN_CALLBACK_URL: (provider: string) => `/auth/social/${provider}/callback`,
  
  // Office Registration
  OFFICE_REGISTER: '/auth/register/office',
  OFFICE_VERIFY: '/auth/verify/office',
  
  // Operator Registration
  OPERATOR_REGISTER: '/auth/register/operator',
} as const;

// ====================
// User Endpoints
// ====================
export const USER_ENDPOINTS = {
  // Profile
  PROFILE: '/user/profile',
  PROFILE_PHOTO: '/user/profile/photo',
  PASSWORD: '/user/password',
  
  // Bookings
  BOOKINGS: {
    LIST: '/user/bookings',
    CREATE: '/user/bookings',
    DETAIL: (id: string | number) => `/user/bookings/${id}`,
    CANCEL: (id: string | number) => `/user/bookings/${id}/cancel`,
    INVOICE: (id: string | number) => `/user/bookings/${id}/invoice`,
    INVOICE_DOWNLOAD: (id: string | number) => `/user/bookings/${id}/invoice/download`,
  },
  
  // Bus Bookings
  BUS_BOOKINGS: {
    LIST: '/user/bus-bookings',
    CREATE: '/user/bus-bookings',
    DETAIL: (id: string | number) => `/user/bus-bookings/${id}`,
    CANCEL: (id: string | number) => `/user/bus-bookings/${id}/cancel`,
  },

   // Notifications
   NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },

  // FCM
  FCM_TOKEN: '/chats/fcm-token',
  UNSUBSCRIBE: '/user/unsubscribe',
  
  
  // Coupons
  COUPONS: {
    LIST: '/user/coupons',
    VALIDATE: '/user/coupons/validate',
    APPLY: '/user/coupons/apply',
    REMOVE: '/user/coupons/remove',
  },

  // Chat
  CHAT: {
    LIST: '/chats',
    CREATE: '/chats',
    MESSAGES: (chatId: string | number) => `/chats/${chatId}/messages`,
    SEND_MESSAGE: (chatId: string | number) => `/chats/${chatId}/messages`,
    MARK_READ: (chatId: string | number) => `/chats/${chatId}/read`,
    UPDATE: (chatId: string | number) => `/chats/${chatId}`,
    ARCHIVE: (chatId: string | number) => `/chats/${chatId}/archive`,
    CHECK_WITH_USER: (userId: string | number) => `/chats/with/${userId}`,
    UNREAD_COUNT: '/chats/unread-count',
  },
} as const;

// ====================
// Pilgrim User Endpoints
// ====================
export const PILGRIM_ENDPOINTS = {
  // Profile
  PROFILE: {
    GET: '/user/profile',
    UPDATE: '/user/profile',
    AVATAR: '/user/profile/avatar',
    CHANGE_PASSWORD: '/user/profile/change-password',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/user/bookings',
    DETAIL: (id: string | number) => `/user/bookings/${id}`,
    CREATE: '/user/bookings',
    UPDATE: (id: string | number) => `/user/bookings/${id}`,
    CANCEL: (id: string | number) => `/user/bookings/${id}/cancel`,
    INVOICE: (id: string | number) => `/user/bookings/${id}/invoice`,
    INVOICE_DOWNLOAD: (id: string | number) => `/user/bookings/${id}/invoice/download`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
  },

  // FCM
  FCM_TOKEN: '/chats/fcm-token',
  UNSUBSCRIBE: '/user/unsubscribe',
  
  // Favorites
  FAVORITES: {
    LIST: '/user/favorites',
    ADD: '/user/favorites',
    REMOVE: (id: string | number) => `/user/favorites/${id}`,
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/user/reviews',
    CREATE: '/user/reviews',
    UPDATE: (id: string | number) => `/user/reviews/${id}`,
    DELETE: (id: string | number) => `/user/reviews/${id}`,
  }
} as const;

// ====================
// Payment Endpoints
// ====================
export const PAYMENT_ENDPOINTS = {
  METHODS: '/payments/methods',
  PROCESS: '/payments/process',
  REFUND: '/payments/refund',
  RECEIPT: (id: string | number) => `/payments/${id}/receipt`,
  
  // Geidea Payment Gateway
  GEIDEA: {
    CONFIG: '/geidea/config',
    CREATE: '/geidea/payments/create',
    INITIATE: '/geidea/payments/initiate',
    TEST_SESSION: '/geidea/payments/test-session',
    STATUS: (id: string | number) => `/geidea/payments/${id}/status`,
    CALLBACK: '/geidea/payments/callback',
    METHODS: '/geidea/payment-methods',
  },
};

// ====================
// Office Endpoints (للمكاتب)
// ====================
export const OFFICE_ENDPOINTS = {
  // Dashboard
  DASHBOARD: {
    STATS: '/office/reports/dashboard',
    BOOKINGS_DAILY: '/office/reports/bookings-daily',
    FINANCIAL_TRANSACTIONS: '/office/reports/financial-transactions',
    PACKAGES_POPULAR: '/office/reports/packages-popular',
    BOOKINGS_CHART: '/office/reports/bookings-chart',
    REVENUE_CHART: '/office/reports/revenue-chart',
  },

  // Bookings
  BOOKINGS: {
    LIST: '/office/bookings',
    PACKAGE_BOOKINGS: '/office/package-bookings',
    PACKAGE_BOOKINGS_STATISTICS: '/office/package-bookings/statistics',
    PACKAGE_BOOKINGS_CALENDAR: '/office/package-bookings/calendar',
    PACKAGE_BOOKINGS_DETAIL: (id: string | number) => `/office/package-bookings/${id}`,
    PACKAGE_BOOKING_STATUS_UPDATE: (id: string | number) => `/office/package-bookings/${id}/status`,
    BUS_BOOKINGS: '/office/bus-bookings',
    BUS_BOOKINGS_STATISTICS: '/office/bus-bookings/statistics',
    BUS_BOOKINGS_CALENDAR: '/office/bus-bookings/calendar',
    BUS_BOOKINGS_DETAIL: (id: string | number) => `/office/bus-bookings/${id}`,
    DETAIL: (id: string | number) => `/office/bookings/${id}`,
    INVOICE: (id: string | number) => `/office/bookings/${id}/invoice`,
    DOWNLOAD_INVOICE: (id: string | number) => `/office/bookings/${id}/invoice/download`,
    UPDATE_STATUS: (id: string | number) => `/office/bookings/${id}/status`,
  },

  // Packages
  PACKAGES: {
    LIST: '/office/packages',
    DETAIL: (id: string | number) => `/office/packages/${id}`,
    CREATE: '/office/packages',
    UPDATE: (id: string | number) => `/office/packages/${id}`,
    DELETE: (id: string | number) => `/office/packages/${id}`,
    DUPLICATE: (id: string | number) => `/office/packages/${id}/duplicate`,
    CHANGE_STATUS: (id: string | number) => `/office/packages/${id}/change-status`,
    REORDER_IMAGES: (id: string | number) => `/office/packages/${id}/reorder-images`,
    TRASHED: '/office/packages/trashed',
    RESTORE: (id: string | number) => `/office/packages/${id}/restore`,
    FORCE_DELETE: (id: string | number) => `/office/packages/${id}/force-delete`,
  },
  
  // Payments
  PAYMENTS: {
    LIST: '/office/payments',
    DETAIL: (id: string | number) => `/office/payments/${id}`,
    REFUND: (id: string | number) => `/office/payments/${id}/refund`,
    METHODS: '/office/payment-methods',
  },

  // Profile
  PROFILE: {
    GET: '/office/profile',
    UPDATE: '/office/profile',
    LOGO: '/office/profile/logo',
    COVER: '/office/profile/cover',
    EMAIL_UPDATE: '/user/profile/contact',
    PHONE_UPDATE: '/user/profile/contact',
    PASSWORD_UPDATE: '/office/profile',
  },
  
  // Documents
  DOCUMENTS: {
    LIST: '/office/documents',
    DETAIL: (id: string | number) => `/office/documents/${id}`,
    UPLOAD: '/office/documents',
    UPDATE: (id: string | number) => `/office/documents/${id}`,
    DELETE: (id: string | number) => `/office/documents/${id}`,
  },
  
  // Gallery
  GALLERY: {
    LIST: '/office/gallery',
    UPLOAD: '/office/gallery',
    UPDATE: (id: string | number) => `/office/gallery/${id}`,
    DELETE: (id: string | number) => `/office/gallery/${id}`,
  },
  
  // Transportation
  TRANSPORTATION: {
    OPERATORS: '/office/transportation/operators',
    BOOKINGS: '/office/transportation/bookings',
    CHAT: '/office/transportation/chat',
  },
  
  // Bus Services
  BUS: {
    REGISTER: '/office/bus/register',
    PROFILE: '/office/bus/profile',
    BUSES: '/office/bus/buses',
    BOOKINGS: '/office/bus/bookings',
    PACKAGES: '/office/bus/packages',
    PREMIUM: '/office/bus/premium',
  },

  // Hotels
  HOTELS: {
    LIST: '/office/hotels',
    DETAIL: (id: string | number) => `/office/hotels/${id}`,
    CREATE: '/office/hotels',
    UPDATE: (id: string | number) => `/office/hotels/${id}`,
    DELETE: (id: string | number) => `/office/hotels/${id}`,
    DUPLICATE: (id: string | number) => `/office/hotels/${id}/duplicate`,
    PACKAGE_HOTELS: (packageId: string | number) => `/office/hotels/package/${packageId}`,
    ATTACH_TO_PACKAGE: (hotelId: string | number, packageId: string | number) => `/office/hotels/${hotelId}/packages/${packageId}/attach`,
    DETACH_FROM_PACKAGE: (hotelId: string | number, packageId: string | number) => `/office/hotels/${hotelId}/packages/${packageId}/detach`,
    UPDATE_PACKAGE_RELATION: (hotelId: string | number, packageId: string | number) => `/office/hotels/${hotelId}/packages/${packageId}`,
    AVAILABLE_HOTELS: '/office/hotels/available',
    OFFICE_HOTELS: '/office/hotels/office',
    REORDER_IMAGES: (id: string | number) => `/office/hotels/${id}/images/reorder`,
  },

  // Chats & Communications
  CHATS: {
    LIST: '/chats',
    DETAIL: (id: string | number) => `/chats/${id}`,
    CREATE: '/chats',
    SEND_MESSAGE: (id: string | number) => `/chats/${id}/messages`,
    GET_MESSAGES: (id: string | number) => `/chats/${id}/messages`,
    OLDER_MESSAGES: (id: string | number) => `/chats/${id}/messages/older`,
    MARK_READ: (id: string | number) => `/chats/${id}/messages/read`,
    TYPING_STATUS: (id: string | number) => `/chats/${id}/typing`,
    UNREAD_COUNT: '/chats/unread-count',
    UPLOAD_FILE: (id: string | number) => `/chats/${id}/upload`,
    SEARCH_MESSAGES: '/chats/search',
    LEAVE_CHAT: (id: string | number) => `/chats/${id}/leave`,
    GET_OR_CREATE_CONVERSATION: (userId: string | number) => `/chats/user/${userId}`,
  },

  // Enhanced Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string | number) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
    UPDATE_SETTINGS: '/notifications/settings',
    BULK_ACTIONS: '/notifications/bulk',
    MARK_DELIVERED: (id: string | number) => `/notifications/${id}/delivered`,
    GET_TYPES: '/notifications/types',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  },

  // Enhanced Wallet System Endpoints
  WALLET: {
    // Dashboard & Overview
    DASHBOARD: '/office/enhanced-wallet/dashboard',
    BALANCE: '/office/enhanced-wallet/balance',
    SYSTEM_STATUS: '/office/enhanced-wallet/system-status',
    STATISTICS: '/office/enhanced-wallet/statistics',
    
    // Transactions
    TRANSACTIONS: '/office/enhanced-wallet/transactions',
    TRANSACTION_DETAILS: (id: string | number) => `/office/enhanced-wallet/transactions/${id}`,
    VERIFY_TRANSACTION: (id: string | number) => `/office/enhanced-wallet/transactions/${id}/verify`,
    
    // Wallet Management
    WALLET_DETAILS: (type: 'cash' | 'online') => `/office/enhanced-wallet/${type}`,
    RECALCULATE_BALANCE: '/office/enhanced-wallet/recalculate',
    VERIFY_INTEGRITY: '/office/enhanced-wallet/verify-integrity',
    FIX_ISSUES: '/office/enhanced-wallet/fix-issues',
    
    // Withdrawals
    WITHDRAWAL_REQUESTS: '/office/enhanced-wallet/withdrawals',
    WITHDRAWAL_DETAILS: (id: string | number) => `/office/enhanced-wallet/withdrawals/${id}`,
    CREATE_WITHDRAWAL: '/office/enhanced-wallet/withdrawals',
    CANCEL_WITHDRAWAL: (id: string | number) => `/office/enhanced-wallet/withdrawals/${id}/cancel`,
    
    // Bank Details
    BANK_DETAILS: '/office/enhanced-wallet/bank-details',
    UPDATE_BANK_DETAILS: '/office/enhanced-wallet/bank-details',
    
    // Reports
    COMPREHENSIVE_REPORT: '/office/enhanced-wallet/reports/comprehensive',
    EXPORT_REPORT: '/office/enhanced-wallet/reports/export',
    ACCOUNTING_ENTRIES: '/office/enhanced-wallet/accounting/entries',
    ACCOUNTING_ENTRY_DETAILS: (id: string | number) => `/office/enhanced-wallet/accounting/entries/${id}`,
    TRIAL_BALANCE: '/office/enhanced-wallet/accounting/trial-balance',
  }
} as const;

// ====================
// Admin Endpoints (للإدارة)
// ====================
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: '/admin/dashboard',
  STATISTICS: '/admin/statistics',
  



  
  // Users Management
  USERS: {
    LIST: '/admin/users',
    DETAIL: (id: string | number) => `/admin/users/${id}`,
    CREATE: '/admin/users',
    UPDATE: (id: string | number) => `/admin/users/${id}`,
    DELETE: (id: string | number) => `/admin/users/${id}`,
    ACTIVATE: (id: string | number) => `/admin/users/${id}/activate`,
    DEACTIVATE: (id: string | number) => `/admin/users/${id}/deactivate`,
  },
  
  // Offices Management
  OFFICES: {
    LIST: '/admin/offices',
    DETAIL: (id: string | number) => `/admin/offices/${id}`,
    APPROVE: (id: string | number) => `/admin/offices/${id}/approve`,
    REJECT: (id: string | number) => `/admin/offices/${id}/reject`,
    SUSPEND: (id: string | number) => `/admin/offices/${id}/suspend`,
  },
  
  // Content Management
  CONTENT: {
    PAGES: '/admin/content/pages',
    SETTINGS: '/admin/content/settings',
    TRANSLATIONS: '/admin/content/translations',
  },
  
  // Reports
  REPORTS: {
    BOOKINGS: '/admin/reports/bookings',
    PAYMENTS: '/admin/reports/payments',
    USERS: '/admin/reports/users',
    OFFICES: '/admin/reports/offices',
  }
} as const;

// ====================
// Proxy Endpoints (للـ Next.js API routes)
// ====================
export const PROXY_ENDPOINTS = {
  // App Router (src/app/api/)
  APP_ROUTER: {
    GENERAL: '/api/proxy',
    PACKAGES: '/api/proxy?type=packages',
    OFFICES: '/api/proxy?type=offices',
    FEATURED_PACKAGES: '/api/proxy?type=featured-packages',
    HOW_IT_WORKS: '/api/proxy?type=how-it-works',
    TESTIMONIALS: '/api/proxy?type=testimonials',
    FEATURES: '/api/proxy?type=features',
    SETTINGS: '/api/proxy?type=settings',
    CONTACT: '/api/proxy?type=contact',
    CONTACT_FORM: '/api/proxy?type=contact-form',
  },
  
  // Pages Router (src/pages/api/)
  PAGES_ROUTER: {
    TYPE: (type: string) => `/api/proxy/${type}`,
    PACKAGES: '/api/proxy/packages',
    OFFICES: '/api/proxy/offices',
    FEATURES: '/api/proxy/features',
    TESTIMONIALS: '/api/proxy/testimonials',
    HOW_IT_WORKS: '/api/proxy/how-it-works',
    FEATURED_PACKAGES: '/api/proxy/featured-packages',
    SETTINGS: '/api/proxy/settings',
    CONTACT: '/api/proxy/contact',
    CONTACT_FORM: '/api/proxy/contact-form',
  }
} as const;

// ====================
// File Upload Endpoints
// ====================
export const UPLOAD_ENDPOINTS = {
  // General uploads
  GENERAL: '/upload',
  
  // Specific file types
  IMAGES: '/upload/images',
  DOCUMENTS: '/upload/documents',
  AVATARS: '/upload/avatars',
  
  // Package related
  PACKAGE_IMAGES: '/upload/packages/images',
  PACKAGE_DOCUMENTS: '/upload/packages/documents',
  
  // Office related
  OFFICE_LOGO: '/upload/office/logo',
  OFFICE_COVER: '/upload/office/cover',
  OFFICE_GALLERY: '/upload/office/gallery',
  OFFICE_DOCUMENTS: '/upload/office/documents',
} as const;

// ====================
// Webhook Endpoints
// ====================
export const WEBHOOK_ENDPOINTS = {
  PAYMENT_SUCCESS: '/webhooks/payment/success',
  PAYMENT_FAILED: '/webhooks/payment/failed',
  BOOKING_CONFIRMED: '/webhooks/booking/confirmed',
  BOOKING_CANCELLED: '/webhooks/booking/cancelled',
} as const;

// ====================
// Utility Functions
// ====================

/**
 * Get full URL by combining base URL with endpoint
 */
export const getFullUrl = (endpoint: string, baseUrl?: string): string => {
  const base = baseUrl || API_BASE_CONFIG.BASE_URL;
  return `${base}${endpoint}`;
};

/**
 * Get proxy URL for a specific type
 */
export const getProxyUrl = (type: string, useAppRouter = true): string => {
  if (useAppRouter) {
    return `/api/proxy?type=${type}`;
  }
  return `/api/proxy/${type}`;
};

/**
 * Build query string from parameters
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  return queryParams.toString();
};

/**
 * Get endpoint with query parameters
 */
export const getEndpointWithParams = (
  endpoint: string, 
  params?: Record<string, any>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  const queryString = buildQueryString(params);
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}${queryString}`;
};

/**
 * Get authorization header
 */
export const getAuthHeader = (token?: string): Record<string, string> => {
  if (!token) {
    // Try to get from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const tokenType = localStorage.getItem('token_type') || 'Bearer';
      if (storedToken) {
        return { Authorization: `${tokenType} ${storedToken}` };
      }
    }
    return {};
  }
  
  return { Authorization: `Bearer ${token}` };
};

/**
 * Get complete headers with auth
 */
export const getCompleteHeaders = (
  customHeaders?: Record<string, string>,
  token?: string
): Record<string, string> => {
  return {
    ...API_BASE_CONFIG.DEFAULT_HEADERS,
    ...getAuthHeader(token),
    ...customHeaders,
  };
};

/**
 * Check if URL is external
 */
export const isExternalUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Get image URL (handle both relative and absolute paths)
 */
const API_STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE_URL || 'https://admin.umrahgo.net/storage/';

/**
 * Valida e formata URLs de imagens para garantir que elas sejam válidas
 * @param url URL da imagem para validar
 * @param fallback URL de fallback se a imagem for inválida ou nula
 * @returns URL válida para a imagem
 */
export function getValidImageUrl(
  url: string | null | undefined,
  fallback: string = '/images/placeholder.jpg'
): string {
  if (!url) return fallback;

  // Se já for uma URL completa com http ou https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Se começa com barra, talvez seja um caminho absoluto relativo (ex: /images/local.jpg)
  if (url.startsWith('/') && !url.includes('storage/')) {
    return url;
  }

  // Corrigir caminhos do tipo "/storage/packages/..." ou "packages/..."
  const cleanedUrl = url.replace(/^\/?storage\//, ''); // remove "storage/" or "/storage/"

  return `${API_STORAGE_URL}${cleanedUrl}`;
}

export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/placeholder.jpg';
 

  // Se já for uma URL completa com http ou https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Se começa com barra, talvez seja um caminho absoluto relativo (ex: /images/local.jpg)
  if (url.startsWith('/') && !url.includes('storage/')) {
    return url;
  }

  // Corrigir caminhos do tipo "/storage/packages/..." ou "packages/..."
  const cleanedUrl = url.replace(/^\/?storage\//, ''); // remove "storage/" or "/storage/"

  return `${API_STORAGE_URL}${cleanedUrl}`;
  
};

// ====================
// Export All Endpoints as One Object
// ====================
export const API_ENDPOINTS = {
  PUBLIC: PUBLIC_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  PILGRIM: PILGRIM_ENDPOINTS,
  OFFICE: OFFICE_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  PROXY: PROXY_ENDPOINTS,
  UPLOAD: UPLOAD_ENDPOINTS,
  WEBHOOK: WEBHOOK_ENDPOINTS,
  PAYMENT: PAYMENT_ENDPOINTS,
} as const;

// ====================
// Export Types for TypeScript
// ====================
export type ApiEndpoints = typeof API_ENDPOINTS;
export type PublicEndpoints = typeof PUBLIC_ENDPOINTS;
export type AuthEndpoints = typeof AUTH_ENDPOINTS;
export type UserEndpoints = typeof USER_ENDPOINTS;
export type PilgrimEndpoints = typeof PILGRIM_ENDPOINTS;
export type OfficeEndpoints = typeof OFFICE_ENDPOINTS;
export type AdminEndpoints = typeof ADMIN_ENDPOINTS;
export type ProxyEndpoints = typeof PROXY_ENDPOINTS;
export type UploadEndpoints = typeof UPLOAD_ENDPOINTS;
export type WebhookEndpoints = typeof WEBHOOK_ENDPOINTS;
export type PaymentEndpoints = typeof PAYMENT_ENDPOINTS;

// ====================
// Default Export
// ====================
export default {
  CONFIG: API_BASE_CONFIG,
  ENDPOINTS: API_ENDPOINTS,
  ADMIN_WEB_URL: ADMIN_WEB_URL,
  getFullUrl,
  getProxyUrl,
  buildQueryString,
  getEndpointWithParams,
  getAuthHeader,
  getCompleteHeaders,
  isExternalUrl,
  getImageUrl,
}; 