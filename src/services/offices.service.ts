// Office Types
export interface Office {
  id: string;
  name: string;
  office_name?: string;
  description?: string;
  logo?: string;
  city?: string;
  address?: string;
  phone?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviews_count?: number;
  established_year?: number;
  license_number?: string;
  commercial_register?: string;
  commercial_register_number?: string;
  license_expiry?: string;
  license_expiry_date?: string;
  verification_status?: 'verified' | 'pending' | 'rejected';
  is_featured?: boolean;
  services?: string[];
  services_offered?: string;
  created_at?: string;
  updated_at?: string;
  country?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  whatsapp?: string;
  translations?: OfficeTranslation[];
  gallery?: any[];
}

export interface OfficeTranslation {
  id: number;
  office_id: number;
  locale: string;
  office_name: string;
  address: string;
  description: string | null;
  services_offered: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

// API Response Types
interface OfficeApiResponse {
  status: boolean;
  data: Office[] | any;
  message?: string;
}

// Paginated API Response
interface PaginatedOfficeApiResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    current_page: number;
    data: any[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{url: string | null, label: string, active: boolean}>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';

// Helper function to get translation in preferred locale
const getTranslation = (translations: OfficeTranslation[] | undefined, locale: string, fallbackLocale: string = 'ar') => {
  if (!translations || !Array.isArray(translations)) return null;
  
  // First try with exact locale match
  const exactTranslation = translations.find(t => t.locale === locale);
  if (exactTranslation) return exactTranslation;
  
  // Then try with fallback locale
  const fallbackTranslation = translations.find(t => t.locale === fallbackLocale);
  if (fallbackTranslation) return fallbackTranslation;
  
  // If nothing found, return the first translation
  return translations[0] || null;
};

// Helper function to transform API data to Office interface
const transformOfficeData = (apiOffice: any, locale: string = 'ar'): Office => {
  // Get translation for the current locale
  const translation = getTranslation(apiOffice.translations, locale);
  
  // Extract services from services_offered string if it exists
  let services: string[] = [];
  if (apiOffice.services_offered) {
    // Handle different formats of services_offered
    if (typeof apiOffice.services_offered === 'string') {
      services = apiOffice.services_offered
        .split(/[,;\-\n]/) // Split by common separators including newlines
        .map((s: string) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(apiOffice.services_offered)) {
      services = apiOffice.services_offered;
    }
  }
  
  // If a translation has services_offered, extract from there as well
  if (translation && translation.services_offered) {
    if (typeof translation.services_offered === 'string') {
      services = translation.services_offered
        .split(/[,;\-\n]/) // Split by common separators including newlines
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }
  
  // Handle office name with proper fallbacks
  const officeName = translation?.office_name || apiOffice.office_name || apiOffice.name || '';
  
  // Process coordinates ensuring they are valid strings
  const latitude = apiOffice.latitude ? String(apiOffice.latitude) : '';
  const longitude = apiOffice.longitude ? String(apiOffice.longitude) : '';
  
  return {
    id: apiOffice.id?.toString() || '',
    name: officeName,
    office_name: officeName,
    description: translation?.description || apiOffice.description || '',
    logo: apiOffice.logo || '',
    city: translation?.city || apiOffice.city || '',
    address: translation?.address || apiOffice.address || '',
    phone: apiOffice.contact_number || apiOffice.phone || '',
    contact_number: apiOffice.contact_number || apiOffice.phone || '',
    email: apiOffice.email || '',
    website: apiOffice.website || '',
    rating: typeof apiOffice.rating === 'string' ? parseFloat(apiOffice.rating) : (apiOffice.rating || 0),
    reviews_count: apiOffice.reviews_count || 0,
    established_year: apiOffice.established_year || null,
    license_number: apiOffice.license_number || '',
    commercial_register: apiOffice.commercial_register || '',
    commercial_register_number: apiOffice.commercial_register_number || '',
    license_expiry: apiOffice.license_expiry || apiOffice.license_expiry_date || '',
    license_expiry_date: apiOffice.license_expiry_date || apiOffice.license_expiry || '',
    verification_status: apiOffice.verification_status || 'pending',
    is_featured: Boolean(apiOffice.is_featured),
    services: services.length > 0 ? services : [],
    services_offered: translation?.services_offered || apiOffice.services_offered || '',
    created_at: apiOffice.created_at || '',
    updated_at: apiOffice.updated_at || '',
    country: translation?.country || apiOffice.country || '',
    state: translation?.state || apiOffice.state || '',
    latitude,
    longitude,
    facebook_url: apiOffice.facebook_url || '',
    twitter_url: apiOffice.twitter_url || '',
    instagram_url: apiOffice.instagram_url || '',
    whatsapp: apiOffice.whatsapp || '',
    translations: apiOffice.translations || [],
    gallery: apiOffice.gallery || [],
  };
};

// Fetch all offices with optional filters
export const fetchOffices = async (queryParams?: string, locale: string = 'ar'): Promise<any> => {
  try {
    const url = `${API_BASE_URL}/public/offices${queryParams ? `?${queryParams}` : ''}`;
    console.log('Fetching offices from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Raw API response:', result);
    
    // Handle the new API response structure and preserve pagination info
    if (result.status && result.data) {
      // If response has paginated structure with data.data array
      if (result.data.data && Array.isArray(result.data.data)) {
        // This is the new pagination structure
        console.log('Processing paginated data structure');
        
        // Transform the office data
        const transformedOffices = result.data.data.map((office: any) => transformOfficeData(office, locale));
        
        // Return pagination metadata with transformed data
        return {
          data: {
            current_page: result.data.current_page,
            data: transformedOffices,
            from: result.data.from,
            last_page: result.data.last_page,
            per_page: result.data.per_page,
            to: result.data.to,
            total: result.data.total
          }
        };
      }
      
      // If data is a simple array
      if (Array.isArray(result.data)) {
        // This is the old array structure
        console.log('Processing array data structure');
        return result.data.map((office: any) => transformOfficeData(office, locale));
      }
      
      // If data is an object with pagination info (current_page, data array, etc.)
      if (typeof result.data === 'object' && result.data.current_page && Array.isArray(result.data.data)) {
        console.log('Processing paginated object structure');
        return {
          data: {
            current_page: result.data.current_page,
            data: result.data.data.map((office: any) => transformOfficeData(office, locale)),
            from: result.data.from,
            last_page: result.data.last_page,
            per_page: result.data.per_page,
            to: result.data.to,
            total: result.data.total
          }
        };
      }
    }
    
    // Return the raw result if none of the above conditions match
    console.warn('Unexpected API response format, returning raw result');
    return result;
  } catch (error) {
    console.error('Error fetching offices:', error);
    
    // Return mock data for development
    return getMockOffices();
  }
};

// Fetch single office by ID
export const fetchOfficeById = async (id: string, locale: string = 'ar'): Promise<Office | null> => {
  try {
    const url = `${API_BASE_URL}/public/offices/${id}`;
    console.log('Fetching office by ID from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Raw API response for single office:', result);
    
    // Handle different response formats
    if (result.status && result.data) {
      return transformOfficeData(result.data, locale);
    } else if (result.office) {
      return transformOfficeData(result.office, locale);
    }
    
    return transformOfficeData(result, locale);
  } catch (error) {
    console.error('Error fetching office:', error);
    
    // Return mock data for development
    const mockOffices = getMockOffices();
    return mockOffices.find(office => office.id === id) || null;
  }
};

// Mock data for development
const getMockOffices = (): Office[] => [
  {
    id: '1',
    name: 'مكتب الحرمين للعمرة والحج',
    description: 'مكتب متخصص في تنظيم رحلات العمرة والحج بأعلى معايير الجودة والخدمة',
    logo: '/images/offices/office1.jpg',
    city: 'الرياض',
    address: 'شارع الملك فهد، الرياض',
    phone: '+966 50 123 4567',
    email: 'info@haramain-umrah.com',
    website: 'https://haramain-umrah.com',
    rating: 4.8,
    established_year: 2010,
    license_number: 'UMR-2010-001',
    commercial_register: '1010123456',
    license_expiry: '2025-12-31',
    verification_status: 'verified',
    is_featured: true,
    services: [
      'تنظيم رحلات العمرة',
      'حجز الفنادق',
      'النقل والمواصلات',
      'الإرشاد الديني',
      'خدمات الإقامة',
      'التأمين الصحي'
    ],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'شركة الأنوار للعمرة',
    description: 'نقدم خدمات العمرة المتكاملة مع أفضل العروض والباقات المناسبة لجميع الفئات',
    logo: '/images/offices/office2.jpg',
    city: 'جدة',
    address: 'شارع الأمير سلطان، جدة',
    phone: '+966 50 234 5678',
    email: 'contact@alanwar-umrah.com',
    website: 'https://alanwar-umrah.com',
    rating: 4.6,
    established_year: 2015,
    license_number: 'UMR-2015-002',
    commercial_register: '4030123456',
    license_expiry: '2025-06-30',
    verification_status: 'verified',
    is_featured: true,
    services: [
      'باقات العمرة الاقتصادية',
      'باقات العمرة الفاخرة',
      'الإرشاد السياحي',
      'خدمات الطعام',
      'النقل الداخلي',
      'الخدمات الطبية'
    ],
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'مؤسسة الهدى للعمرة والزيارة',
    description: 'مؤسسة رائدة في مجال العمرة والزيارة مع خبرة تزيد عن 20 عاماً في الخدمات الدينية',
    logo: '/images/offices/office3.jpg',
    city: 'مكة المكرمة',
    address: 'حي العزيزية، مكة المكرمة',
    phone: '+966 50 345 6789',
    email: 'info@alhuda-umrah.com',
    website: 'https://alhuda-umrah.com',
    rating: 4.9,
    established_year: 2005,
    license_number: 'UMR-2005-003',
    commercial_register: '4000123456',
    license_expiry: '2025-03-31',
    verification_status: 'verified',
    is_featured: false,
    services: [
      'العمرة الجماعية',
      'العمرة الفردية',
      'زيارة المسجد النبوي',
      'الجولات الدينية',
      'خدمات كبار السن',
      'برامج التوعية الدينية'
    ],
    created_at: '2023-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'مكتب الفردوس للحج والعمرة',
    description: 'نسعى لتقديم أفضل الخدمات للحجاج والمعتمرين في رحلة روحانية مميزة',
    logo: '/images/offices/office4.jpg',
    city: 'الدمام',
    address: 'شارع الملك عبدالعزيز، الدمام',
    phone: '+966 50 456 7890',
    email: 'services@alfirdous-hajj.com',
    website: 'https://alfirdous-hajj.com',
    rating: 4.4,
    established_year: 2012,
    license_number: 'UMR-2012-004',
    commercial_register: '2050123456',
    license_expiry: '2025-09-30',
    verification_status: 'verified',
    is_featured: false,
    services: [
      'حجز الطيران',
      'الإقامة الفندقية',
      'النقل البري',
      'الوجبات الحلال',
      'الخدمات الطبية',
      'المرافقة والإرشاد'
    ],
    created_at: '2023-04-01T00:00:00Z',
    updated_at: '2024-04-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'شركة البركة للسياحة الدينية',
    description: 'شركة متخصصة في السياحة الدينية مع التركيز على الجودة والخدمة المتميزة',
    logo: '/images/offices/office5.jpg',
    city: 'المدينة المنورة',
    address: 'شارع قباء، المدينة المنورة',
    phone: '+966 50 567 8901',
    email: 'info@albaraka-tours.com',
    website: 'https://albaraka-tours.com',
    rating: 4.7,
    established_year: 2008,
    license_number: 'UMR-2008-005',
    commercial_register: '3000123456',
    license_expiry: '2025-11-30',
    verification_status: 'pending',
    is_featured: false,
    services: [
      'الجولات التاريخية',
      'زيارة المساجد',
      'الرحلات التعليمية',
      'خدمات الترجمة',
      'الإرشاد الديني',
      'التصوير الفوتوغرافي'
    ],
    created_at: '2023-05-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'مكتب النور للعمرة والحج',
    description: 'مكتب معتمد يقدم خدمات العمرة والحج بأسعار تنافسية وجودة عالية',
    logo: '/images/offices/office6.jpg',
    city: 'الطائف',
    address: 'شارع الملك فيصل، الطائف',
    phone: '+966 50 678 9012',
    email: 'contact@alnour-umrah.com',
    website: 'https://alnour-umrah.com',
    rating: 4.3,
    established_year: 2018,
    license_number: 'UMR-2018-006',
    commercial_register: '5000123456',
    license_expiry: '2025-07-31',
    verification_status: 'verified',
    is_featured: true,
    services: [
      'العمرة الاقتصادية',
      'العمرة المتوسطة',
      'العمرة الفاخرة',
      'خدمات العائلات',
      'برامج الشباب',
      'الرعاية الصحية'
    ],
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z'
  }
];

// Search offices
export const searchOffices = async (searchTerm: string): Promise<Office[]> => {
  try {
    const url = `${API_BASE_URL}/public/offices?search=${encodeURIComponent(searchTerm)}`;
    console.log('Searching offices from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data.map((office: any) => transformOfficeData(office));
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map((office: any) => transformOfficeData(office));
    } else if (Array.isArray(data)) {
      return data.map((office: any) => transformOfficeData(office));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching offices:', error);
    
    // Return filtered mock data for development
    const mockOffices = getMockOffices();
    return mockOffices.filter(office => 
      office.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      office.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

// Get featured offices
export const getFeaturedOffices = async (): Promise<Office[]> => {
  try {
    const url = `${API_BASE_URL}/public/offices?is_featured=true`;
    console.log('Fetching featured offices from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw API response for featured offices:', data);
    
    // Handle different response formats
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data.map((office: any) => transformOfficeData(office));
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map((office: any) => transformOfficeData(office));
    } else if (Array.isArray(data)) {
      return data.map((office: any) => transformOfficeData(office));
    }
    
    console.warn('Unexpected API response format for featured offices, falling back to mock data');
    const mockOffices = getMockOffices();
    return mockOffices.filter(office => office.is_featured);
  } catch (error) {
    console.error('Error fetching featured offices:', error);
    
    // Return filtered mock data for development
    const mockOffices = getMockOffices();
    return mockOffices.filter(office => office.is_featured);
  }
};

// Get offices by city
export const getOfficesByCity = async (city: string): Promise<Office[]> => {
  try {
    const url = `${API_BASE_URL}/public/offices?city=${encodeURIComponent(city)}`;
    console.log('Fetching offices by city from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data.map((office: any) => transformOfficeData(office));
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map((office: any) => transformOfficeData(office));
    } else if (Array.isArray(data)) {
      return data.map((office: any) => transformOfficeData(office));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching offices by city:', error);
    
    // Return filtered mock data for development
    const mockOffices = getMockOffices();
    return mockOffices.filter(office => 
      office.city?.toLowerCase() === city.toLowerCase()
    );
  }
};

// Fetch top rated offices
export const fetchTopRatedOffices = async (): Promise<OfficeApiResponse> => {
  try {
    const url = `${API_BASE_URL}/public/offices?sort_by=rating&sort_direction=desc&per_page=10`;
    console.log('Fetching top rated offices from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return {
        status: true,
        data: data.data.data.map((office: any) => transformOfficeData(office))
      };
    } else if (data.data && Array.isArray(data.data)) {
      return {
        status: true,
        data: data.data.map((office: any) => transformOfficeData(office))
      };
    } else if (Array.isArray(data)) {
      return {
        status: true,
        data: data.map((office: any) => transformOfficeData(office))
      };
    }
    
    console.warn('Unexpected API response format for top rated offices, falling back to mock data');
    return {
      status: true,
      data: getMockOffices().sort((a, b) => (b.rating || 0) - (a.rating || 0))
    };
  } catch (error) {
    console.error('Error fetching top rated offices:', error);
    
    // Return mock data for development
    return {
      status: true,
      data: getMockOffices().sort((a, b) => (b.rating || 0) - (a.rating || 0))
    };
  }
};

// Office service for compatibility with existing code
export const officeService = {
  fetchOffices,
  fetchOfficeById,
  getFeaturedOffices,
  searchOffices,
  getOfficesByCity,
  fetchTopRatedOffices,
  
  // Additional methods for better compatibility
  fetchFeaturedOffices: getFeaturedOffices,
}; 