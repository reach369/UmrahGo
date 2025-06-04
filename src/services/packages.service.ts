import { getValidImageUrl } from '@/utils/image-helpers';

// Definição dos tipos
export interface Package {
  id: string;
  office_id?: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  duration_unit?: 'days' | 'weeks' | 'months';
  start_date?: string;
  end_date?: string;
  cover_image?: string;
  gallery?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  capacity?: number;
  available_places?: number;
  rating?: number;
  reviews_count?: number;
  location?: string;
  city?: string;
  country?: string;
  includes?: string[];
  excludes?: string[];
  highlights?: string[];
  created_at?: string;
  updated_at?: string;
  office_name?: string;
  office_logo?: string;
}

// URL base da API - deve ser carregado do .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://umrahgo.reach369.com/api';

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
    if (data && data.data && Array.isArray(data.data.data)) {
      const packages = data.data.data.map((pkg: any) => ({
        id: pkg.id.toString(),
        office_id: pkg.office_id ? pkg.office_id.toString() : undefined,
        name: pkg.name || 'Unnamed Package',
        description: pkg.description || '',
        price: pkg.price || 0,
        duration: pkg.duration || 0,
        duration_unit: pkg.duration_unit || 'days',
        start_date: pkg.start_date,
        end_date: pkg.end_date,
        cover_image: getValidImageUrl(pkg.cover_image, '/images/package-placeholder.jpg'),
        gallery: pkg.gallery ? pkg.gallery.map((img: string) => getValidImageUrl(img)) : [],
        is_featured: pkg.is_featured || false,
        is_active: pkg.is_active || true,
        capacity: pkg.capacity || 0,
        available_places: pkg.available_places || 0,
        rating: pkg.rating || 0,
        reviews_count: pkg.reviews_count || 0,
        location: pkg.location || '',
        city: pkg.city || '',
        country: pkg.country || '',
        includes: pkg.includes || [],
        excludes: pkg.excludes || [],
        highlights: pkg.highlights || [],
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        office_name: pkg.office_name || '',
        office_logo: getValidImageUrl(pkg.office_logo)
      }));
      
      return {
        packages,
        pagination: data.data.pagination || {
          total: packages.length,
          per_page: filters.per_page || 10,
          current_page: filters.page || 1,
          last_page: 1,
          from: 1,
          to: packages.length
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
      
      if (data && data.data) {
        // Processar dados do pacote
        const pkg: Package = {
          id: data.data.id.toString(),
          office_id: data.data.office_id ? data.data.office_id.toString() : undefined,
          name: data.data.name || 'Unnamed Package',
          description: data.data.description || '',
          price: data.data.price || 0,
          duration: data.data.duration || 0,
          duration_unit: data.data.duration_unit || 'days',
          start_date: data.data.start_date,
          end_date: data.data.end_date,
          cover_image: getValidImageUrl(data.data.cover_image, '/images/package-placeholder.jpg'),
          gallery: data.data.gallery ? data.data.gallery.map((img: string) => getValidImageUrl(img)) : [],
          is_featured: data.data.is_featured || false,
          is_active: data.data.is_active || true,
          capacity: data.data.capacity || 0,
          available_places: data.data.available_places || 0,
          rating: data.data.rating || 0,
          reviews_count: data.data.reviews_count || 0,
          location: data.data.location || '',
          city: data.data.city || '',
          country: data.data.country || '',
          includes: data.data.includes || [],
          excludes: data.data.excludes || [],
          highlights: data.data.highlights || [],
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
      data: {
        id: packageId,
        name: 'Package Name',
        description: 'This is a fallback description for when the API is unavailable.',
        price: 5000,
        duration: 7,
        duration_unit: 'days' as const,
        cover_image: '/images/package-placeholder.jpg',
        gallery: ['/images/package-placeholder.jpg'],
        is_featured: true,
        is_active: true,
        capacity: 30,
        available_places: 15,
        rating: 4.5,
        reviews_count: 45,
        location: 'Makkah & Madinah',
        city: 'Makkah',
        country: 'Saudi Arabia',
        includes: ['Hotel accommodation', 'Transportation', 'Meals'],
        excludes: ['Flights', 'Personal expenses'],
        highlights: ['Visit to holy sites', 'Expert guides'],
        office_name: 'Sample Umrah Office',
        office_logo: '/images/office-placeholder.jpg'
      } as Package
    };
  } catch (error) {
    console.error('Error fetching package details:', error);
    
    // Retornar dados de fallback em caso de erro
    return {
      status: false,
      data: {
        id: packageId,
        name: 'Package Name',
        description: 'This is a fallback description for when the API is unavailable.',
        price: 5000,
        duration: 7,
        duration_unit: 'days' as const,
        cover_image: '/images/package-placeholder.jpg',
        gallery: ['/images/package-placeholder.jpg'],
        is_featured: true,
        is_active: true,
        capacity: 30,
        available_places: 15,
        rating: 4.5,
        reviews_count: 45,
        location: 'Makkah & Madinah',
        city: 'Makkah',
        country: 'Saudi Arabia',
        includes: ['Hotel accommodation', 'Transportation', 'Meals'],
        excludes: ['Flights', 'Personal expenses'],
        highlights: ['Visit to holy sites', 'Expert guides'],
        office_name: 'Sample Umrah Office',
        office_logo: '/images/office-placeholder.jpg'
      } as Package
    };
  }
} 