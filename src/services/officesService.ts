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

// URL base da API - deve ser carregado do .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com/api';

// Função para buscar escritórios com filtros
export async function searchOfficesWithFilters(filters: {
  keyword?: string;
  city?: string;
  min_rating?: number;
  is_featured?: boolean;
  per_page?: number;
  page?: number;
}) {
  try {
    // Construir os parâmetros de consulta
    const queryParams = new URLSearchParams();
    
    if (filters.keyword) queryParams.append('keyword', filters.keyword);
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.min_rating) queryParams.append('min_rating', filters.min_rating.toString());
    if (filters.is_featured !== undefined) queryParams.append('is_featured', filters.is_featured ? '1' : '0');
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    // Fazer a requisição à API
    const response = await fetch(`${API_URL}/v1/public/offices?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch offices: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Processar os dados recebidos conforme a estrutura da API
    if (data && data.status === true && data.data) {
      return {
        offices: data.data.data.map(processOfficeData),
        pagination: {
          total: data.data.total || 0,
          per_page: data.data.per_page || 10,
          current_page: data.data.current_page || 1,
          last_page: data.data.last_page || 1,
          from: data.data.from || 0,
          to: data.data.to || 0
        }
      };
    }
    
    return { offices: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 } };
  } catch (error) {
    console.error('Error fetching offices:', error);
    return { offices: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 } };
  }
}

// Função para processar dados de um escritório
function processOfficeData(office: any): Office {
  // Extract services from services_offered
  const services = office.services_offered 
    ? office.services_offered.split(',').map((s: string) => s.trim())
    : [];
    
  // Process gallery images
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

// Função para buscar um escritório por ID
export async function fetchOfficeById(officeId: string) {
  try {
    // Primeiro, tente buscar do servidor
    const response = await fetch(`${API_URL}/v1/public/offices/${officeId}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.status === true && data.data) {
        // Processar dados do escritório
        return { 
          status: true, 
          data: processOfficeData(data.data)
        };
      }
    }
    
    // Se não conseguiu buscar do servidor, use dados de fallback
    return {
      status: false,
      data: createFallbackOffice(officeId)
    };
  } catch (error) {
    console.error('Error fetching office details:', error);
    
    // Retornar dados de fallback em caso de erro
    return {
      status: false,
      data: createFallbackOffice(officeId)
    };
  }
}

// Criar um objeto Office de fallback para quando a API não estiver disponível
function createFallbackOffice(officeId: string): Office {
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
    services_offered: null,
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
    services: ['Umrah packages', 'Transportation', 'Accommodation']
  };
}

// Definição dos tipos
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

// Função para buscar pacotes com filtros
export async function searchPackagesWithFilters(filters: {
  keyword?: string;
  office_id?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  is_featured?: boolean;
  per_page?: number;
  page?: number;
}) {
  try {
    // Construir os parâmetros de consulta
    const queryParams = new URLSearchParams();
    
    if (filters.keyword) queryParams.append('keyword', filters.keyword);
    if (filters.office_id) queryParams.append('office_id', filters.office_id);
    if (filters.min_price) queryParams.append('min_price', filters.min_price.toString());
    if (filters.max_price) queryParams.append('max_price', filters.max_price.toString());
    if (filters.min_rating) queryParams.append('min_rating', filters.min_rating.toString());
    if (filters.is_featured !== undefined) queryParams.append('is_featured', filters.is_featured ? '1' : '0');
    if (filters.per_page) queryParams.append('per_page', filters.per_page.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    
    // Fazer a requisição à API
    const response = await fetch(`${API_URL}/v1/public/packages?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Processar os dados recebidos
    if (data && data.status === true && data.data) {
      const packages = data.data.data.map((pkg: any) => ({
        id: pkg.id.toString(),
        office_id: pkg.office_id ? pkg.office_id.toString() : undefined,
        name: pkg.name || 'Unnamed Package',
        description: pkg.description || '',
        price: pkg.price || 0,
        discount_price: pkg.discount_price || null,
        duration: pkg.duration || 0,
        duration_days: pkg.duration_days || pkg.duration || 0,
        duration_unit: pkg.duration_unit || 'days',
        start_date: pkg.start_date,
        end_date: pkg.end_date,
        cover_image: getValidImageUrl(pkg.cover_image, '/images/package-placeholder.jpg'),
        featured_image_url: getValidImageUrl(pkg.featured_image_url || pkg.cover_image, '/images/package-placeholder.jpg'),
        thumbnail_url: getValidImageUrl(pkg.thumbnail_url || pkg.cover_image, '/images/package-placeholder.jpg'),
        gallery: pkg.gallery ? pkg.gallery.map((img: string) => getValidImageUrl(img)) : [],
        images: pkg.images || [],
        is_featured: pkg.is_featured || false,
        is_active: pkg.is_active || true,
        status: pkg.status || 'available',
        capacity: pkg.capacity || 0,
        available_places: pkg.available_places || 0,
        max_persons: pkg.max_persons || 0,
        views_count: pkg.views_count || 0,
        rating: pkg.rating || 0,
        reviews_count: pkg.reviews_count || 0,
        location: pkg.location || '',
        city: pkg.city || '',
        country: pkg.country || '',
        start_location: pkg.start_location || null,
        end_location: pkg.end_location || null,
        includes: pkg.includes || [],
        excludes: pkg.excludes || [],
        highlights: pkg.highlights || [],
        features: pkg.features || {},
        has_discount: !!pkg.discount_price,
        discount_percentage: pkg.discount_percentage || 0,
        includes_transport: pkg.includes_transport || false,
        includes_accommodation: pkg.includes_accommodation || false,
        includes_meals: pkg.includes_meals || false,
        includes_guide: pkg.includes_guide || false,
        includes_insurance: pkg.includes_insurance || false,
        includes_activities: pkg.includes_activities || false,
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        office_name: pkg.office_name || '',
        office_logo: getValidImageUrl(pkg.office_logo)
      }));
      
      return {
        packages,
        pagination: {
          total: data.data.total || packages.length,
          per_page: data.data.per_page || filters.per_page || 10,
          current_page: data.data.current_page || filters.page || 1,
          last_page: data.data.last_page || 1,
          from: data.data.from || 1,
          to: data.data.to || packages.length
        }
      };
    }
    
    return { packages: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 } };
  } catch (error) {
    console.error('Error fetching packages:', error);
    return { packages: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 } };
  }
}

// Função para buscar um pacote por ID
export async function fetchPackageById(packageId: string) {
  try {
    // Primeiro, tente buscar do servidor
    const response = await fetch(`${API_URL}/v1/public/packages/${packageId}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.status === true && data.data) {
        // Processar dados do pacote
        const pkg: Package = {
          id: data.data.id.toString(),
          office_id: data.data.office_id ? data.data.office_id.toString() : undefined,
          name: data.data.name || 'Unnamed Package',
          description: data.data.description || '',
          price: data.data.price || 0,
          discount_price: data.data.discount_price || null,
          duration: data.data.duration || 0,
          duration_days: data.data.duration_days || data.data.duration || 0,
          duration_unit: data.data.duration_unit || 'days',
          start_date: data.data.start_date,
          end_date: data.data.end_date,
          cover_image: getValidImageUrl(data.data.cover_image, '/images/package-placeholder.jpg'),
          featured_image_url: getValidImageUrl(data.data.featured_image_url || data.data.cover_image, '/images/package-placeholder.jpg'),
          thumbnail_url: getValidImageUrl(data.data.thumbnail_url || data.data.cover_image, '/images/package-placeholder.jpg'),
          gallery: data.data.gallery ? data.data.gallery.map((img: string) => getValidImageUrl(img)) : [],
          images: data.data.images || [],
          is_featured: data.data.is_featured || false,
          is_active: data.data.is_active || true,
          status: data.data.status || 'available',
          capacity: data.data.capacity || 0,
          available_places: data.data.available_places || 0,
          max_persons: data.data.max_persons || 0,
          views_count: data.data.views_count || 0,
          rating: data.data.rating || 0,
          reviews_count: data.data.reviews_count || 0,
          location: data.data.location || '',
          city: data.data.city || '',
          country: data.data.country || '',
          start_location: data.data.start_location || null,
          end_location: data.data.end_location || null,
          includes: data.data.includes || [],
          excludes: data.data.excludes || [],
          highlights: data.data.highlights || [],
          features: data.data.features || {},
          has_discount: !!data.data.discount_price,
          discount_percentage: data.data.discount_percentage || 0,
          includes_transport: data.data.includes_transport || false,
          includes_accommodation: data.data.includes_accommodation || false,
          includes_meals: data.data.includes_meals || false,
          includes_guide: data.data.includes_guide || false,
          includes_insurance: data.data.includes_insurance || false,
          includes_activities: data.data.includes_activities || false,
          created_at: data.data.created_at,
          updated_at: data.data.updated_at,
          office_name: data.data.office_name || '',
          office_logo: getValidImageUrl(data.data.office_logo)
        };
        
        return { status: true, data: pkg };
      }
    }
    
    // Se não conseguiu buscar do servidor, use dados de fallback
    return {
      status: false,
      data: createFallbackPackage(packageId)
    };
  } catch (error) {
    console.error('Error fetching package details:', error);
    
    // Retornar dados de fallback em caso de erro
    return {
      status: false,
      data: createFallbackPackage(packageId)
    };
  }
}

// Criar um objeto Package de fallback
function createFallbackPackage(packageId: string): Package {
  return {
    id: packageId,
    name: 'Package Name',
    description: 'This is a fallback description for when the API is unavailable.',
    price: 5000,
    discount_price: 4500,
    duration: 7,
    duration_days: 7,
    duration_unit: 'days' as const,
    cover_image: '/images/package-placeholder.jpg',
    featured_image_url: '/images/package-placeholder.jpg',
    thumbnail_url: '/images/package-placeholder.jpg',
    gallery: ['/images/package-placeholder.jpg'],
    images: [{
      id: 1,
      package_id: packageId,
      image_path: '/images/package-placeholder.jpg',
      is_main: true
    }],
    is_featured: true,
    is_active: true,
    status: 'available',
    capacity: 30,
    available_places: 15,
    max_persons: 30,
    views_count: 100,
    rating: 4.5,
    reviews_count: 45,
    location: 'Makkah & Madinah',
    city: 'Makkah',
    country: 'Saudi Arabia',
    start_location: 'Jeddah Airport',
    end_location: 'Makkah',
    includes: ['Hotel accommodation', 'Transportation', 'Meals'],
    excludes: ['Flights', 'Personal expenses'],
    highlights: ['Visit to holy sites', 'Expert guides'],
    features: {
      'Duration': '7 days',
      'Transportation': 'Included',
      'Accommodation': 'Luxury Hotel'
    },
    has_discount: true,
    discount_percentage: 10,
    includes_transport: true,
    includes_accommodation: true,
    includes_meals: true,
    includes_guide: true,
    includes_insurance: false,
    includes_activities: true,
    location_coordinates: { location: null },
    office_name: 'Sample Umrah Office',
    office_logo: '/images/office-placeholder.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  };
}

// Função para buscar todos os escritórios
export async function fetchOffices(page = 1, perPage = 10) {
  return await searchOfficesWithFilters({ page, per_page: perPage });
}

// Função para buscar escritórios em destaque
export async function fetchFeaturedOffices(limit = 6) {
  try {
    const response = await searchOfficesWithFilters({ 
      is_featured: true,
      per_page: limit
    });
    
    return {
      status: true,
      data: response.offices
    };
  } catch (error) {
    console.error('Error fetching featured offices:', error);
    return {
      status: false,
      data: [
        createFallbackOffice('1'),
        createFallbackOffice('2'),
        createFallbackOffice('3')
      ]
    };
  }
}

// Função para buscar escritórios mais bem avaliados
export async function fetchTopRatedOffices(limit = 6) {
  try {
    const response = await searchOfficesWithFilters({ 
      min_rating: 4.0,
      per_page: limit
    });
    
    // Ordenar por avaliação em ordem decrescente
    const sortedOffices = [...response.offices].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return {
      status: true,
      data: sortedOffices
    };
  } catch (error) {
    console.error('Error fetching top rated offices:', error);
    return {
      status: false,
      data: [
        createFallbackOffice('1'),
        createFallbackOffice('2'),
        createFallbackOffice('3')
      ]
    };
  }
}

// Função para buscar todos os pacotes
export async function fetchPackages(page = 1, perPage = 10) {
  return await searchPackagesWithFilters({ page, per_page: perPage });
}

// Função para buscar pacotes em destaque
export async function fetchFeaturedPackages(limit = 6) {
  try {
    const response = await searchPackagesWithFilters({ 
      is_featured: true,
      per_page: limit
    });
    
    return {
      status: true,
      data: response.packages
    };
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    return {
      status: false,
      data: [
        createFallbackPackage('1'),
        createFallbackPackage('2'),
        createFallbackPackage('3')
      ]
    };
  }
} 