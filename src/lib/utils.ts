import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility
export function formatCurrency(amount: number | undefined | null, locale = 'ar', currency = 'SAR'): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(0);
  }
  
  try {
    // Always use ar-SA instead of ar for currency formatting
    const actualLocale = locale === 'ar' ? 'ar-SA' : locale;
    return new Intl.NumberFormat(actualLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(Number(amount));
  } catch (error) {
    console.error('Currency formatting error:', error);
    // Fallback to a simpler format
    return `${Number(amount).toFixed(2)} ${currency}`;
  }
}

// Number formatting utility
export function formatNumber(num: number, locale: string = 'ar-SA'): string {
  return new Intl.NumberFormat(locale).format(num);
}

// Percentage formatting utility
export function formatPercentage(num: number, locale: string = 'ar-SA', decimals: number = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
}

// Date formatting utility
export function formatDate(date: string | Date, locale: string = 'ar-SA', options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

// Date only formatting utility
export function formatDateOnly(date: string | Date, locale: string = 'ar-SA'): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Time only formatting utility
export function formatTimeOnly(date: string | Date, locale: string = 'ar-SA'): string {
  return formatDate(date, locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Relative time formatting utility
export function formatRelativeTime(date: string | Date, locale: string = 'ar-SA'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
}

// Amount with currency symbol utility
export function formatAmountWithSymbol(amount: number, currency: string = 'SAR'): string {
  const symbols: Record<string, string> = {
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
  };
  
  return `${formatNumber(amount)} ${symbols[currency] || currency}`;
}

// Compact number formatting for large numbers
export function formatCompactNumber(num: number, locale: string = 'ar-SA'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

// Parse currency string to number
export function parseCurrency(currencyString: string): number {
  return parseFloat(currencyString.replace(/[^\d.-]/g, '')) || 0;
}

// Generate random transaction number
export function generateTransactionNumber(prefix: string = 'TXN'): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Validate IBAN format
export function validateIBAN(iban: string): boolean {
  const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/;
  return ibanRegex.test(iban.replace(/\s/g, ''));
}

// Format IBAN with spaces
export function formatIBAN(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
}

// Calculate percentage of total
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Round to decimal places
export function roundToDecimal(num: number, decimals: number = 2): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Safe division to avoid division by zero
export function safeDivide(numerator: number, denominator: number, fallback: number = 0): number {
  return denominator === 0 ? fallback : numerator / denominator;
}

// Get currency symbol
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    SAR: 'ر.س',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  return symbols[currency] || currency;
}

// Determine the redirect path based on user data
export function getRedirectPathAfterLogin(userData: any, locale: string = 'ar'): string {
  // Log user data for debugging
  console.log('Determining redirect path for user:', {
    userType: userData?.userType,
    roles: userData?.roles,
    umrah_office: userData?.umrah_office,
    role_id: userData?.role_id
  });

  // Check roles array first - this is the most reliable way to determine user type
  if (userData?.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
    try {
      // Check if roles is an array of objects with name property
      if (typeof userData.roles[0] === 'object' && userData.roles[0] !== null) {
        // Extract role names safely with proper error handling
        const roleNames = userData.roles.map((role: any) => {
          if (typeof role === 'string') return role;
          if (role && typeof role === 'object' && 'name' in role) return role.name;
          return '';
        }).filter(Boolean);
        
        console.log('Extracted role names for redirection:', roleNames);
        
        if (roleNames.includes('office')) {
          return `/${locale}/umrahoffices/dashboard`;
        }
        if (roleNames.includes('bus_operator') || roleNames.includes('bus-operator')) {
          return `/${locale}/bus-operator`;
        }
        if (roleNames.includes('admin')) {
          return `/${locale}/admin/dashboard`;
        }
        // If no specific role found but roles exist, default to pilgrim
        return `/${locale}/PilgrimUser`;
      } 
      // Legacy: Check if roles is an array of strings
      else if (typeof userData.roles[0] === 'string') {
        if (userData.roles.includes('office')) {
          return `/${locale}/umrahoffices/dashboard`;
        }
        if (userData.roles.includes('bus_operator') || userData.roles.includes('bus-operator')) {
          return `/${locale}/bus-operator`;
        }
        if (userData.roles.includes('admin')) {
          return `/${locale}/admin/dashboard`;
        }
        // If no specific role found but roles exist, default to pilgrim
        return `/${locale}/PilgrimUser`;
      }
    } catch (error) {
      console.error('Error processing user roles for redirection:', error);
    }
  }
  
  // Check for umrah_office property - This is critical for office users
  if (userData?.umrah_office) {
    console.log('Found umrah_office property, redirecting to office dashboard');
    return `/${locale}/umrahoffices/dashboard`;
  }
  
  // Check userType field if roles didn't work
  if (userData?.userType) {
    switch (userData.userType) {
      case 'office':
        return `/${locale}/umrahoffices/dashboard`;
      case 'bus_operator':
      case 'bus-operator':
        return `/${locale}/bus-operator`;
      case 'pilgrim':
      case 'customer':
        return `/${locale}/PilgrimUser`;
      case 'admin':
        return `/${locale}/admin/dashboard`;
      default:
        // Continue checking other fields
        break;
    }
  }
  
  // Legacy: Check role_id as last resort
  if (userData?.role_id) {
    switch (userData.role_id) {
      case 1: // Admin
        return `/${locale}/admin/dashboard`;
      case 2: // Office
        return `/${locale}/umrahoffices/dashboard`;
      case 3: // Pilgrim/Customer
        return `/${locale}/PilgrimUser`;
      case 4: // Bus Operator
        return `/${locale}/bus-operator`;
      default:
        break;
    }
  }
  
  // Default: regular user (pilgrim)
  return `/${locale}/PilgrimUser`;
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
