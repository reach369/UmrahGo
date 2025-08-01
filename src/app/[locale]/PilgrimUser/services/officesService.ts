// Office Types
export interface Office {
  gallery?: any;
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
  license_expiry?: string;
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
}

// Package interface
export interface Package {
  id: number | string;
  name: string;
  description?: string;
  office_id: number | string;
  price: number;
  currency?: string;
  duration_days: number;
  max_persons?: number;
  is_featured?: boolean;
  status?: string;
  availability_status?: 'available' | 'limited' | 'sold_out';
  available_slots?: number | null;
  cover_image?: string | null;
  thumbnail?: string | null;
  includes?: string[];
  start_date?: string;
  end_date?: string;
  start_location?: string;
  end_location?: string;
  includes_transport?: boolean;
  includes_accommodation?: boolean;
  includes_meals?: boolean;
  includes_guide?: boolean;
  created_at?: string;
  updated_at?: string;
  office?: Office;
}

// API Response Types
interface OfficeApiResponse {
  status: boolean;
  data: Office[] | any;
  message?: string;
}

// Package API Response
interface PackageApiResponse {
  status: boolean;
  data: Package[] | any;
  message?: string;
}

// Paginated API Response
interface PaginatedOfficeApiResponse {
  data: {
    data: any[];
    total: number;
    per_page: number;
    current_page: number;
  };
  status: boolean;
  message: string;
}

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';

// Helper function to transform API data to Office interface
const transformOfficeData = (apiOffice: any): Office => ({
  id: apiOffice.id?.toString() || '',
  name: apiOffice.office_name || apiOffice.name || '',
  office_name: apiOffice.office_name || apiOffice.name || '',
  description: apiOffice.description || '',
  logo: apiOffice.logo || '/images/office-placeholder.jpg',
  city: apiOffice.city || '',
  address: apiOffice.address || '',
  phone: apiOffice.contact_number || apiOffice.phone || '',
  contact_number: apiOffice.contact_number || apiOffice.phone || '',
  email: apiOffice.email || '',
  website: apiOffice.website || '',
  rating: parseFloat(apiOffice.rating) || 0,
  reviews_count: apiOffice.reviews_count || 0,
  established_year: apiOffice.established_year || null,
  license_number: apiOffice.license_number || '',
  commercial_register: apiOffice.commercial_register || '',
  license_expiry: apiOffice.license_expiry || '',
  verification_status: apiOffice.verification_status || 'pending',
  is_featured: Boolean(apiOffice.is_featured),
  services: apiOffice.services || [],
  services_offered: apiOffice.services_offered || '',
  created_at: apiOffice.created_at || '',
  updated_at: apiOffice.updated_at || '',
  country: apiOffice.country || '',
  state: apiOffice.state || '',
  latitude: apiOffice.latitude || '',
  longitude: apiOffice.longitude || '',
  facebook_url: apiOffice.facebook_url || '',
  twitter_url: apiOffice.twitter_url || '',
  instagram_url: apiOffice.instagram_url || '',
  whatsapp: apiOffice.whatsapp || '',
});

// Fetch all offices with optional filters
export const fetchOffices = async (queryParams?: string): Promise<Office[]> => {
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

    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Handle different response formats
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data.map(transformOfficeData);
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map(transformOfficeData);
    } else if (Array.isArray(data)) {
      return data.map(transformOfficeData);
    }
    
    console.warn('Unexpected API response format, falling back to mock data');
    return getMockOffices();
  } catch (error) {
    console.error('Error fetching offices:', error);
    
    // Return mock data for development
    return getMockOffices();
  }
};

// Fetch single office by ID
export const fetchOfficeById = async (id: string): Promise<Office | null> => {
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

    const data = await response.json();
    console.log('Raw API response for single office:', data);
    
    // Handle different response formats
    if (data.data) {
      return transformOfficeData(data.data);
    } else if (data.office) {
      return transformOfficeData(data.office);
    }
    
    return transformOfficeData(data);
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
      return data.data.data.map(transformOfficeData);
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map(transformOfficeData);
    } else if (Array.isArray(data)) {
      return data.map(transformOfficeData);
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
      return data.data.data.map(transformOfficeData);
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map(transformOfficeData);
    } else if (Array.isArray(data)) {
      return data.map(transformOfficeData);
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
      return data.data.data.map(transformOfficeData);
    } else if (data.data && Array.isArray(data.data)) {
      return data.data.map(transformOfficeData);
    } else if (Array.isArray(data)) {
      return data.map(transformOfficeData);
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
        data: data.data.data.map(transformOfficeData)
      };
    } else if (data.data && Array.isArray(data.data)) {
      return {
        status: true,
        data: data.data.map(transformOfficeData)
      };
    } else if (Array.isArray(data)) {
      return {
        status: true,
        data: data.map(transformOfficeData)
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

// Fetch packages for a specific office
export const fetchOfficePackages = async (
  officeId: string | number
): Promise<PackageApiResponse> => {
  try {
    const url = `${API_BASE_URL}/public/offices/${officeId}/packages`;
    console.log('Fetching office packages from:', url);
    
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
    console.log('Raw API response for office packages:', data);
    
    // Handle different response formats
    if (data.data && Array.isArray(data.data)) {
      return {
        status: true,
        data: data.data.map(transformPackageData)
      };
    } else if (data && Array.isArray(data)) {
      return {
        status: true,
        data: data.map(transformPackageData)
      };
    }
    
    return {
      status: false,
      data: [],
      message: 'No packages found'
    };
  } catch (error) {
    console.error('Error fetching office packages:', error);
    
    // Return mock data for development
    return getMockOfficePackages(officeId);
  }
};

// Helper function to transform API package data
const transformPackageData = (apiPackage: any): Package => ({
  id: apiPackage.id?.toString() || '',
  name: apiPackage.name || '',
  description: apiPackage.description || '',
  office_id: apiPackage.office_id?.toString() || '',
  price: parseFloat(apiPackage.price) || 0,
  currency: apiPackage.currency || 'SAR',
  duration_days: apiPackage.duration_days || 1,
  max_persons: apiPackage.max_persons || null,
  is_featured: Boolean(apiPackage.is_featured),
  status: apiPackage.status || 'active',
  availability_status: apiPackage.availability_status || 'available',
  available_slots: apiPackage.available_slots || null,
  cover_image: apiPackage.cover_image || apiPackage.featured_image_url || null,
  thumbnail: apiPackage.thumbnail || null,
  includes: apiPackage.includes || [],
  start_date: apiPackage.start_date || null,
  end_date: apiPackage.end_date || null,
  start_location: apiPackage.start_location || '',
  end_location: apiPackage.end_location || '',
  includes_transport: Boolean(apiPackage.includes_transport),
  includes_accommodation: Boolean(apiPackage.includes_accommodation),
  includes_meals: Boolean(apiPackage.includes_meals),
  includes_guide: Boolean(apiPackage.includes_guide),
  created_at: apiPackage.created_at || '',
  updated_at: apiPackage.updated_at || '',
  office: apiPackage.office ? transformOfficeData(apiPackage.office) : undefined
});

// Mock data for office packages
const getMockOfficePackages = (officeId: string | number): PackageApiResponse => {
  return {
    status: true,
    data: [
      {
        id: '101',
        name: 'باقة العمرة الاقتصادية',
        description: 'باقة اقتصادية تشمل الإقامة والنقل والإرشاد',
        office_id: officeId,
        price: 2500,
        currency: 'SAR',
        duration_days: 7,
        max_persons: 50,
        is_featured: true,
        status: 'active',
        availability_status: 'available',
        available_slots: 20,
        cover_image: '/images/packages/package1.jpg',
        thumbnail: '/images/packages/package1-thumb.jpg',
        includes: [
          'الإقامة في فندق 3 نجوم',
          'النقل من وإلى المطار',
          'النقل بين مكة والمدينة',
          'وجبة إفطار يومياً',
          'مرشد ديني متخصص'
        ],
        start_date: '2024-12-01',
        end_date: '2024-12-07',
        start_location: 'جدة',
        end_location: 'جدة',
        includes_transport: true,
        includes_accommodation: true,
        includes_meals: true,
        includes_guide: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '102',
        name: 'باقة العمرة الفاخرة',
        description: 'باقة فاخرة تشمل الإقامة في فنادق 5 نجوم قريبة من الحرم',
        office_id: officeId,
        price: 5000,
        currency: 'SAR',
        duration_days: 10,
        max_persons: 30,
        is_featured: false,
        status: 'active',
        availability_status: 'limited',
        available_slots: 5,
        cover_image: '/images/packages/package2.jpg',
        thumbnail: '/images/packages/package2-thumb.jpg',
        includes: [
          'الإقامة في فندق 5 نجوم',
          'النقل من وإلى المطار',
          'النقل بين مكة والمدينة',
          'وجبات كاملة يومياً',
          'مرشد ديني متخصص',
          'زيارة للأماكن التاريخية'
        ],
        start_date: '2024-12-10',
        end_date: '2024-12-20',
        start_location: 'الرياض',
        end_location: 'جدة',
        includes_transport: true,
        includes_accommodation: true,
        includes_meals: true,
        includes_guide: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]
  };
};

// Office service for compatibility with existing code
export const officeService = {
  fetchOffices,
  fetchOfficeById,
  getFeaturedOffices,
  searchOffices,
  getOfficesByCity,
  fetchTopRatedOffices,
  fetchOfficePackages,
  
  // Additional methods for better compatibility
  fetchFeaturedOffices: getFeaturedOffices,
}; 