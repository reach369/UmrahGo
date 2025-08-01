import axios, { AxiosError } from 'axios';
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  OFFICE_ENDPOINTS,
  getImageUrl
} from '@/config/api.config';
import { getValidImageUrl } from '@/utils/image-helpers';

export interface Office {
  id: number;
  user_id: number;
  office_name: string;
  address: string | null;
  contact_number: string | null;
  logo: string | null;
  license_doc: string | null;
  verification_status: string;
  subscription_id: number | null;
  email: string | null;
  website: string | null;
  fax: string | null;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  commercial_register_number: string | null;
  license_number: string | null;
  license_expiry_date: string | null;
  description: string | null;
  services_offered: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  rejection_reason: string | null;
  rejection_notes: string | null;
  verified_by: number | null;
  verified_at: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  gallery: Gallery[];
  translations?: OfficeTranslation[];
  services?: string[];
}

export interface OfficeTranslation {
  id: number;
  office_id: number;
  locale: string;
  office_name: string;
  address: string;
  description: string;
  services_offered: string;
  city: string;
  state: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: number;
  office_id: number;
  image_path: string;
  thumbnail_path: string;
  title: string;
  description: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  office_id?: string;
  name: string;
  description?: string;
  price?: number;
  discount_price?: number;
  duration?: number;
  duration_days?: number;
  duration_unit?: 'days' | 'weeks' | 'months';
  start_date?: string;
  end_date?: string;
  cover_image?: string;
  featured_image_url?: string;
  thumbnail_url?: string;
  gallery?: string[];
  images?: any[];
  is_featured?: boolean;
  is_active?: boolean;
  status?: string;
  capacity?: number;
  available_places?: number;
  rating?: number;
  reviews_count?: number;
  views_count?: number;
  max_persons?: number;
  location?: string;
  city?: string;
  country?: string;
  start_location?: string | null;
  end_location?: string | null;
  includes?: string[];
  excludes?: string[];
  highlights?: string[];
  features?: Record<string, string>;
  has_discount?: boolean;
  discount_percentage?: number;
  includes_transport?: boolean;
  includes_accommodation?: boolean;
  includes_meals?: boolean;
  includes_guide?: boolean;
  includes_insurance?: boolean;
  includes_activities?: boolean;
  location_coordinates?: { location: any };
  office?: any;
  hotels?: any[];
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  office_name?: string;
  office_logo?: string;
}

const apiInstance = axios.create({
  baseURL: API_BASE_CONFIG.BASE_URL,
  timeout: API_BASE_CONFIG.TIMEOUT.DEFAULT,
  headers: API_BASE_CONFIG.DEFAULT_HEADERS,
});

const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(`An error occurred in ${context}.`);
};

class OfficeService {
  async searchOffices(filters: {
    keyword?: string;
    city?: string;
    min_rating?: number;
    is_featured?: boolean;
    per_page?: number;
    page?: number;
  }) {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.OFFICES.LIST, { params: filters });
      if (response.data && response.data.status === true && response.data.data) {
        return {
          offices: response.data.data.data.map(this.processOfficeData),
          pagination: response.data.data,
        };
      }
      return { offices: [], pagination: {} };
    } catch (error) {
      handleError(error, 'searchOffices');
      return { offices: [], pagination: {} };
    }
  }

  async getOfficeById(officeId: string) {
    try {
      const response = await apiInstance.get(PUBLIC_ENDPOINTS.OFFICES.DETAIL(officeId));
      if (response.data && response.data.status === true && response.data.data) {
        return {
          status: true,
          data: this.processOfficeData(response.data.data),
        };
      }
      return { status: false, data: this.createFallbackOffice(officeId) };
    } catch (error) {
      handleError(error, 'getOfficeById');
      return { status: false, data: this.createFallbackOffice(officeId) };
    }
  }

  async getOfficePackages(officeId: string, params?: Record<string, any>) {
    try {
        const response = await apiInstance.get(PUBLIC_ENDPOINTS.OFFICES.PACKAGES(officeId), { params });
        
        // Handle different response formats
        if (response.data && response.data.status === true) {
          // Check if data exists and is an array
          if (response.data.data && Array.isArray(response.data.data)) {
            return response.data.data.map(this.processPackageData);
          } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
            // Handle paginated response
            return response.data.data.data.map(this.processPackageData);
          } else {
            console.warn('Office packages data is not in expected format:', response.data);
            return [];
          }
        } else if (response.data && Array.isArray(response.data)) {
          // Handle direct array response
          return response.data.map(this.processPackageData);
        } else {
          console.warn('Unexpected response format for office packages:', response.data);
          return [];
        }
    } catch (error) {
        handleError(error, 'getOfficePackages');
        return [];
    }
  }

  async fetchFeaturedOffices(limit = 6) {
    try {
      const response = await this.searchOffices({ 
        is_featured: true,
        per_page: limit
      });
      
        return {
          status: true,
      data: response.offices
    };
  } catch (error) {
    handleError(error, 'fetchFeaturedOffices');
    return {
      status: false,
      data: [
        this.createFallbackOffice('1'),
        this.createFallbackOffice('2'),
        this.createFallbackOffice('3')
      ]
    };
  }
  }

  private processOfficeData(office: any): Office {
    const services = office.services_offered 
      ? office.services_offered.split(',').map((s: string) => s.trim())
      : [];
      
    const galleryImages = office.gallery && Array.isArray(office.gallery) 
      ? office.gallery.map((item: Gallery) => ({
          ...item,
          image_path: getValidImageUrl(item.image_path),
          thumbnail_path: getValidImageUrl(item.thumbnail_path)
        }))
      : [];
      
    return {
      id: office.id,
      user_id: office.user_id,
      office_name: office.office_name || '',
      address: office.address,
      contact_number: office.contact_number,
      logo: getValidImageUrl(office.logo),
      license_doc: office.license_doc,
      verification_status: office.verification_status || 'pending',
      subscription_id: office.subscription_id,
      email: office.email,
      website: office.website,
      fax: office.fax,
      whatsapp: office.whatsapp,
      city: office.city,
      state: office.state,
      country: office.country,
      postal_code: office.postal_code,
      latitude: office.latitude,
      longitude: office.longitude,
      commercial_register_number: office.commercial_register_number,
      license_number: office.license_number,
      license_expiry_date: office.license_expiry_date,
      description: office.description,
      services_offered: office.services_offered,
      facebook_url: office.facebook_url,
      twitter_url: office.twitter_url,
      instagram_url: office.instagram_url,
      is_featured: !!office.is_featured,
      rating: parseFloat(office.rating) || 0,
      reviews_count: office.reviews_count || 0,
      rejection_reason: office.rejection_reason,
      rejection_notes: office.rejection_notes,
      verified_by: office.verified_by,
      verified_at: office.verified_at,
      is_active: !!office.is_active,
      deleted_at: office.deleted_at,
      created_at: office.created_at,
      updated_at: office.updated_at,
      gallery: galleryImages,
      translations: office.translations,
      services
    };
  }

  private createFallbackOffice(officeId: string): Office {
      return {
          id: parseInt(officeId),
          user_id: 0,
          office_name: 'Office Name',
          description: 'This is a fallback description for when the API is unavailable.',
          logo: '/images/office-placeholder.jpg',
          address: 'Makkah, Saudi Arabia',
          contact_number: '+966 50 000 0000',
          email: 'info@example.com',
          verification_status: 'verified',
          rating: 4.5,
          reviews_count: 120,
          gallery: [],
          is_featured: true,
          license_doc: null,
          subscription_id: null,
          website: null,
          fax: null,
          whatsapp: null,
          city: 'Makkah',
          state: null,
          country: 'Saudi Arabia',
          postal_code: null,
          latitude: null,
          longitude: null,
          commercial_register_number: null,
          license_number: null,
          license_expiry_date: null,
          services_offered: 'Accommodation, Transportation, Guidance',
          facebook_url: null,
          twitter_url: null,
          instagram_url: null,
          rejection_reason: null,
          rejection_notes: null,
          verified_by: null,
          verified_at: null,
          is_active: true,
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          services: ['Accommodation', 'Transportation', 'Guidance']
      };
  }
    
  processPackageData(pkg: any): Package {
    return {
        ...pkg,
        id: pkg.id.toString(),
        cover_image: getImageUrl(pkg.cover_image),
        featured_image_url: getImageUrl(pkg.featured_image_url),
        thumbnail_url: getImageUrl(pkg.thumbnail_url),
        price: parseFloat(pkg.price) || 0,
        rating: parseFloat(pkg.rating) || 0,
        office_name: pkg.office?.office_name,
        office_logo: getImageUrl(pkg.office?.logo),
    };
  }
}

const officeService = new OfficeService();
export default officeService;

export const fetchOffices = async (filters: any) => {
  const { offices, pagination } = await officeService.searchOffices(filters);
  return { data: offices, pagination };
};

export const fetchOfficeById = async (officeId: string) => {
  return await officeService.getOfficeById(officeId);
};

export const fetchFeaturedOffices = async (limit = 6) => {
  return await officeService.fetchFeaturedOffices(limit);
};

export const fetchOfficePackages = async (officeId: string, params?: Record<string, any>) => {
  return await officeService.getOfficePackages(officeId, params);
};

// Add the missing fetchPackages function
export const fetchPackages = async (params: Record<string, any> = {}) => {
  try {
    const response = await apiInstance.get(PUBLIC_ENDPOINTS.PACKAGES.LIST, { params });
    
    if (response.data && response.data.status === true) {
      // Handle different response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          status: true,
          packages: response.data.data.map(pkg => officeService.processPackageData(pkg)),
          data: response.data.data.map(pkg => officeService.processPackageData(pkg)) // Add data property for backward compatibility
        };
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        // Handle paginated response
        const processedPackages = response.data.data.data.map(pkg => officeService.processPackageData(pkg));
        return {
          status: true,
          packages: processedPackages,
          data: processedPackages, // Add data property for backward compatibility
          pagination: {
            total: response.data.data.total,
            per_page: response.data.data.per_page,
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page
          }
        };
      }
    }
    
    console.warn('Unexpected response format for packages:', response.data);
    return { status: false, packages: [], data: [] }; // Include data property for backward compatibility
  } catch (error) {
    handleError(error, 'fetchPackages');
    return { status: false, packages: [], data: [] }; // Include data property for backward compatibility
  }
};

export const fetchTopRatedOffices = async (limit = 6) => {
  try {
    const response = await officeService.searchOffices({
      per_page: limit,
      min_rating: 4.0
    });
    
    if (response.offices && response.offices.length > 0) {
      // Sort by rating in descending order
      const sortedOffices = response.offices.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return {
        status: true,
        offices: sortedOffices,
        data: sortedOffices // Add data property for backward compatibility
      };
    }
    
    return { status: false, offices: [], data: [] };
  } catch (error) {
    handleError(error, 'fetchTopRatedOffices');
    return { status: false, offices: [], data: [] };
  }
};
