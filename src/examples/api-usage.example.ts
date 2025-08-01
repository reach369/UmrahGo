/**
 * أمثلة على استخدام خدمات API المركزية
 * Examples of using the centralized API services
 */

import apiService from '../services/api.service';
import { API_ENDPOINTS, getEndpointWithParams } from '../config/api.config';
import { publicApiClient, authApiClient } from '../lib/api.client';

// ====================
// أمثلة على Public API (لا تحتاج تسجيل دخول)
// ====================

/**
 * مثال 1: جلب الباقات المميزة
 */
export async function exampleGetFeaturedPackages() {
  try {
    const featuredPackages = await apiService.public.getFeaturedPackages();
    console.log('Featured packages:', featuredPackages);
    return featuredPackages;
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    throw error;
  }
}

/**
 * مثال 2: البحث عن باقات مع فلاتر
 */
export async function exampleSearchPackages() {
  try {
    const filters = {
      min_price: 500,
      max_price: 2000,
      min_duration: 5,
      max_duration: 15,
      sort: 'price_asc',
      per_page: 20
    };
    
    const packages = await apiService.public.getAllPackages(filters);
    console.log('Filtered packages:', packages);
    return packages;
  } catch (error) {
    console.error('Error searching packages:', error);
    throw error;
  }
}

/**
 * مثال 3: جلب معلومات مكتب محدد
 */
export async function exampleGetOfficeDetails(officeId: string) {
  try {
    const office = await apiService.public.getOfficeById(officeId);
    console.log('Office details:', office);
    
    // جلب باقات المكتب أيضاً
    const officePackages = await apiService.public.getOfficePackages(officeId, {
      per_page: 10,
      featured: true
    });
    console.log('Office packages:', officePackages);
    
    return { office, packages: officePackages };
  } catch (error) {
    console.error('Error fetching office details:', error);
    throw error;
  }
}

/**
 * مثال 4: جلب محتوى الصفحة الرئيسية
 */
export async function exampleGetHomePageContent() {
  try {
    // جلب جميع بيانات الصفحة الرئيسية
    const [homeData, features, testimonials, howItWorksSteps] = await Promise.all([
      apiService.public.getHomeData(),
      apiService.public.getFeatures(),
      apiService.public.getTestimonials(),
      apiService.public.getHowItWorksSteps()
    ]);
    
    console.log('Home page content:', {
      homeData,
      features,
      testimonials,
      howItWorksSteps
    });
    
    return {
      homeData,
      features,
      testimonials,
      howItWorksSteps
    };
  } catch (error) {
    console.error('Error fetching home page content:', error);
    throw error;
  }
}

// ====================
// أمثلة على Authentication API
// ====================

/**
 * مثال 5: تسجيل دخول المستخدم
 */
export async function exampleUserLogin() {
  try {
    const credentials = {
      email: 'user@example.com',
      password: 'password123'
    };
    
    const loginResult = await apiService.auth.login(credentials);
    console.log('Login successful:', loginResult);
    
    // بعد نجاح تسجيل الدخول، يمكن جلب بيانات المستخدم
    const userProfile = await apiService.auth.getProfile();
    console.log('User profile:', userProfile);
    
    return { loginResult, userProfile };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * مثال 6: تسجيل مستخدم جديد
 */
export async function exampleUserRegistration() {
  try {
    const userData = {
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      phone: '+966501234567',
      gender: 'male'
    };
    
    const registrationResult = await apiService.auth.register(userData);
    console.log('Registration successful:', registrationResult);
    return registrationResult;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

/**
 * مثال 7: تسجيل مكتب عمرة جديد
 */
export async function exampleOfficeRegistration() {
  try {
    const officeData = {
      // بيانات المستخدم
      name: 'محمد أحمد',
      email: 'office@example.com',
      password: 'password123',
      password_confirmation: 'password123',
      phone: '+966501234567',
      
      // بيانات المكتب
      office_name: 'مكتب النور للعمرة',
      license_number: 'LIC123456',
      address: 'شارع الملك فهد، الرياض',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      services_offered: 'باقات عمرة متنوعة، نقل، إقامة فندقية',
      website: 'https://alnoor-umrah.com'
    };
    
    const registrationResult = await apiService.auth.registerOffice(officeData);
    console.log('Office registration successful:', registrationResult);
    return registrationResult;
  } catch (error) {
    console.error('Office registration failed:', error);
    throw error;
  }
}

// ====================
// أمثلة على Pilgrim API (للمعتمرين)
// ====================

/**
 * مثال 8: إنشاء حجز جديد
 */
export async function exampleCreateBooking() {
  try {
    const bookingData = {
      package_id: 1,
      office_id: 1,
      travel_date: '2024-03-15',
      number_of_pilgrims: 2,
      special_requests: 'غرفة قريبة من الحرم',
      emergency_contact_name: 'سارة أحمد',
      emergency_contact_phone: '+966501234568'
    };
    
    const booking = await apiService.pilgrim.createBooking(bookingData);
    console.log('Booking created:', booking);
    return booking;
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw error;
  }
}

/**
 * مثال 9: جلب حجوزات المستخدم
 */
export async function exampleGetUserBookings() {
  try {
    const filters = {
      status: 'confirmed',
      per_page: 10,
      page: 1
    };
    
    const bookings = await apiService.pilgrim.getBookings(filters);
    console.log('User bookings:', bookings);
    return bookings;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

// ====================
// أمثلة على Office API (لوحة تحكم المكاتب)
// ====================

/**
 * مثال 10: إضافة باقة جديدة من المكتب
 */
export async function exampleCreatePackage() {
  try {
    // إنشاء FormData للباقة (مع الصور)
    const formData = new FormData();
    formData.append('name', 'باقة عمرة فاخرة');
    formData.append('description', 'باقة شاملة مع خدمات فاخرة');
    formData.append('price', '1500');
    formData.append('duration_days', '7');
    formData.append('start_location', 'مكة المكرمة');
    formData.append('end_location', 'المدينة المنورة');
    formData.append('is_featured', 'true');
    
    // إضافة صورة (في التطبيق الحقيقي، ستأتي من input file)
    // formData.append('images[]', imageFile);
    
    const packageResult = await apiService.office.createPackage(formData);
    console.log('Package created:', packageResult);
    return packageResult;
  } catch (error) {
    console.error('Package creation failed:', error);
    throw error;
  }
}

/**
 * مثال 11: تحديث حالة حجز
 */
export async function exampleUpdateBookingStatus() {
  try {
    const bookingId = '123';
    const newStatus = 'confirmed';
    const notes = 'تم تأكيد الحجز ودفع المبلغ كاملاً';
    
    const result = await apiService.office.updateBookingStatus(bookingId, newStatus, notes);
    console.log('Booking status updated:', result);
    return result;
  } catch (error) {
    console.error('Booking status update failed:', error);
    throw error;
  }
}

/**
 * مثال 12: جلب إحصائيات المكتب
 */
export async function exampleGetOfficeStatistics() {
  try {
    const [bookingStats, packages] = await Promise.all([
      apiService.office.getBookingStatistics(),
      apiService.office.getPackages({ per_page: 5, featured: true })
    ]);
    
    console.log('Office statistics:', {
      bookingStats,
      topPackages: packages
    });
    
    return { bookingStats, topPackages: packages };
  } catch (error) {
    console.error('Error fetching office statistics:', error);
    throw error;
  }
}

// ====================
// أمثلة على استخدام API Client المباشر
// ====================

/**
 * مثال 13: استخدام publicApiClient مباشرة
 */
export async function exampleDirectApiCall() {
  try {
    // جلب معلومات باقة محددة باستخدام endpoint مباشر
    const packageId = '123';
    const response = await publicApiClient.get(
      API_ENDPOINTS.PUBLIC.PACKAGES.DETAIL(packageId)
    );
    
    console.log('Direct API call result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Direct API call failed:', error);
    throw error;
  }
}

/**
 * مثال 14: استخدام endpoint مع parameters
 */
export async function exampleEndpointWithParams() {
  try {
    const params = {
      search: 'عمرة',
      min_price: 1000,
      max_price: 3000,
      sort: 'price_asc'
    };
    
    // بناء endpoint مع parameters
    const endpoint = getEndpointWithParams(API_ENDPOINTS.PUBLIC.PACKAGES.LIST, params);
    console.log('Generated endpoint:', endpoint);
    
    const response = await publicApiClient.get(endpoint);
    console.log('Search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

/**
 * مثال 15: رفع ملف باستخدام upload method
 */
export async function exampleFileUpload(file: File) {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'license');
    formData.append('description', 'رخصة المكتب');
    
    const response = await authApiClient.upload(
      API_ENDPOINTS.OFFICE.DOCUMENTS.UPLOAD,
      formData,
      (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted + '%');
      }
    );
    
    console.log('File uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// ====================
// مثال شامل: صفحة عرض باقة مع جميع البيانات
// ====================

/**
 * مثال 16: جلب جميع بيانات صفحة عرض باقة
 */
export async function examplePackagePageData(packageId: string) {
  try {
    // جلب بيانات الباقة
    const packageData = await apiService.public.getPackageById(packageId);
    console.log('Package data:', packageData);
    
    // جلب باقات مشابهة من نفس المكتب
    let relatedPackages = [];
    if (packageData.office?.id) {
      relatedPackages = await apiService.public.getOfficePackages(
        packageData.office.id.toString(),
        { per_page: 4, exclude: packageId }
      );
    }
    
    // جلب باقات مميزة أخرى
    const featuredPackages = await apiService.public.getFeaturedPackages();
    const otherFeatured = featuredPackages.filter(pkg => pkg.id !== packageId).slice(0, 4);
    
    return {
      package: packageData,
      relatedPackages,
      featuredPackages: otherFeatured
    };
  } catch (error) {
    console.error('Error fetching package page data:', error);
    throw error;
  }
}

// ====================
// مثال على معالجة الأخطاء
// ====================

/**
 * مثال 17: معالجة أخطاء API بطريقة شاملة
 */
export async function exampleErrorHandling() {
  try {
    // محاولة تسجيل دخول بمعلومات خاطئة
    await apiService.auth.login({
      email: 'wrong@email.com',
      password: 'wrongpassword'
    });
  } catch (error: any) {
    // معالجة أنواع مختلفة من الأخطاء
    if (apiService.isNetworkError(error)) {
      console.error('Network error - check internet connection');
      // عرض رسالة خطأ شبكة للمستخدم
    } else if (error.status === 401) {
      console.error('Invalid credentials');
      // عرض رسالة خطأ تسجيل دخول
    } else if (error.status === 422) {
      console.error('Validation error:', error.details);
      // عرض أخطاء التحقق من صحة البيانات
    } else {
      console.error('Unknown error:', apiService.handleError(error));
      // عرض رسالة خطأ عامة
    }
  }
}

// ====================
// Export جميع الأمثلة
// ====================
export default {
  // Public API examples
  getFeaturedPackages: exampleGetFeaturedPackages,
  searchPackages: exampleSearchPackages,
  getOfficeDetails: exampleGetOfficeDetails,
  getHomePageContent: exampleGetHomePageContent,
  
  // Auth API examples
  userLogin: exampleUserLogin,
  userRegistration: exampleUserRegistration,
  officeRegistration: exampleOfficeRegistration,
  
  // Pilgrim API examples
  createBooking: exampleCreateBooking,
  getUserBookings: exampleGetUserBookings,
  
  // Office API examples
  createPackage: exampleCreatePackage,
  updateBookingStatus: exampleUpdateBookingStatus,
  getOfficeStatistics: exampleGetOfficeStatistics,
  
  // Direct API examples
  directApiCall: exampleDirectApiCall,
  endpointWithParams: exampleEndpointWithParams,
  fileUpload: exampleFileUpload,
  
  // Complex examples
  packagePageData: examplePackagePageData,
  errorHandling: exampleErrorHandling
}; 