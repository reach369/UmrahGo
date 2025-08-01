// Validation utilities for package details and booking forms

export interface PassengerData {
  name: string;
  passport_number: string;
  nationality: string;
  gender: string;
  age?: number;
  phone?: string;
  birth_date?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BookingValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validate passenger data
export const validatePassengerData = (
  passengers: PassengerData[],
  t: any
): BookingValidationResult => {
  const errors: ValidationError[] = [];
  
  passengers.forEach((passenger, index) => {
    const passengerPrefix = `passenger_${index}`;
    
    // Name validation
    if (!passenger.name || passenger.name.trim().length < 2) {
      errors.push({
        field: `${passengerPrefix}_name`,
        message: t('validation.nameRequired')
      });
    } else if (passenger.name.trim().length > 100) {
      errors.push({
        field: `${passengerPrefix}_name`,
        message: t('validation.nameTooLong')
      });
    }
    
    // Passport number validation
    if (!passenger.passport_number || passenger.passport_number.trim().length < 6) {
      errors.push({
        field: `${passengerPrefix}_passport`,
        message: t('validation.passportRequired')
      });
    } else if (passenger.passport_number.trim().length > 20) {
      errors.push({
        field: `${passengerPrefix}_passport`,
        message: t('validation.passportTooLong')
      });
    }
    
    // Nationality validation
    if (!passenger.nationality || passenger.nationality.trim().length < 2) {
      errors.push({
        field: `${passengerPrefix}_nationality`,
        message: t('validation.nationalityRequired')
      });
    }
    
    // Age validation
    if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
      errors.push({
        field: `${passengerPrefix}_age`,
        message: t('validation.ageInvalid')
      });
    }
    
    // Phone validation
    if (!passenger.phone || passenger.phone.trim().length < 10) {
      errors.push({
        field: `${passengerPrefix}_phone`,
        message: t('validation.phoneRequired')
      });
    } else if (!/^\+?[1-9]\d{1,14}$/.test(passenger.phone.replace(/\s/g, ''))) {
      errors.push({
        field: `${passengerPrefix}_phone`,
        message: t('validation.phoneInvalid')
      });
    }
    
    // Gender validation
    if (!passenger.gender || !['male', 'female'].includes(passenger.gender)) {
      errors.push({
        field: `${passengerPrefix}_gender`,
        message: t('validation.genderRequired')
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate booking form data
export const validateBookingForm = (
  formData: {
    numberOfPersons: number;
    selectedAccommodation?: string;
    paymentMethod: string;
    pkg: any;
  },
  t: any
): BookingValidationResult => {
  const errors: ValidationError[] = [];
  
  // Number of persons validation
  if (formData.numberOfPersons < 1) {
    errors.push({
      field: 'numberOfPersons',
      message: t('validation.personsRequired')
    });
  } else if (formData.pkg?.max_persons && formData.numberOfPersons > formData.pkg.max_persons) {
    errors.push({
      field: 'numberOfPersons',
      message: t('validation.personsExceedsMax', { max: formData.pkg.max_persons })
    });
  }
  
  // Available seats validation
  if (formData.pkg?.available_seats_count && formData.numberOfPersons > formData.pkg.available_seats_count) {
    errors.push({
      field: 'numberOfPersons',
      message: t('validation.personsExceedsAvailable', { available: formData.pkg.available_seats_count })
    });
  }
  
  // Accommodation validation (if required)
  if (formData.pkg?.accommodation_pricing && 
      Object.keys(formData.pkg.accommodation_pricing).length > 0 && 
      !formData.selectedAccommodation) {
    errors.push({
      field: 'selectedAccommodation',
      message: t('validation.accommodationRequired')
    });
  }
  
  // Payment method validation
  if (!formData.paymentMethod || !['cash', 'online'].includes(formData.paymentMethod)) {
    errors.push({
      field: 'paymentMethod',
      message: t('validation.paymentMethodRequired')
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate coupon code format
export const validateCouponCode = (code: string, t: any): ValidationError | null => {
  if (!code || code.trim().length === 0) {
    return {
      field: 'couponCode',
      message: t('validation.couponRequired')
    };
  }
  
  if (code.trim().length < 3 || code.trim().length > 20) {
    return {
      field: 'couponCode',
      message: t('validation.couponInvalidLength')
    };
  }
  
  // Check for valid characters (alphanumeric and some special characters)
  if (!/^[A-Za-z0-9_-]+$/.test(code.trim())) {
    return {
      field: 'couponCode',
      message: t('validation.couponInvalidFormat')
    };
  }
  
  return null;
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it matches international format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(cleanPhone);
};

// Validate passport number format
export const validatePassportNumber = (passport: string): boolean => {
  // Basic passport validation - alphanumeric, 6-20 characters
  const passportRegex = /^[A-Za-z0-9]{6,20}$/;
  return passportRegex.test(passport.replace(/\s/g, ''));
};

// Sanitize input string
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('966')) {
    // Saudi Arabia format
    return `+966 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.length === 10) {
    // Local format
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

// Format price for display
export const formatPrice = (price: number, currency: string = 'SAR'): string => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Check if package is available for booking
export const isPackageAvailable = (pkg: any): boolean => {
  if (!pkg) return false;
  
  // Check if package is fully booked
  if (pkg.is_fully_booked) return false;
  
  // Check if there are available seats
  if (pkg.available_seats_count <= 0) return false;
  
  // Check if package has ended
  if (pkg.end_date && new Date(pkg.end_date) < new Date()) return false;
  
  return true;
};

// Get validation error message for a specific field
export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
};

// Check if field has error
export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some(err => err.field === fieldName);
};

// Debounce function for input validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Local storage helpers with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// Generate unique ID for form elements
export const generateUniqueId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

export default {
  validatePassengerData,
  validateBookingForm,
  validateCouponCode,
  validateEmail,
  validatePhoneNumber,
  validatePassportNumber,
  sanitizeInput,
  formatPhoneNumber,
  formatPrice,
  calculateAge,
  isPackageAvailable,
  getFieldError,
  hasFieldError,
  debounce,
  safeLocalStorage,
  generateUniqueId,
  deepClone
}; 