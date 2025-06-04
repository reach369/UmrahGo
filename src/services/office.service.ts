import { getValidImageUrl } from '@/utils/image-helpers';

// Definição dos tipos
export interface Office {
  id: string;
  office_name: string;
  description?: string;
  logo?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_number?: string;
  email?: string;
  website?: string;
  license_number?: string;
  verification_status?: 'verified' | 'pending' | 'rejected';
  rating?: number;
  reviews_count?: number;
  gallery?: string[];
  is_featured?: boolean;
  services?: string[];
  created_at?: string;
  updated_at?: string;
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
    
    // Processar os dados recebidos
    if (data && data.data && Array.isArray(data.data.data)) {
      const offices = data.data.data.map((office: any) => ({
        id: office.id.toString(),
        office_name: office.office_name || 'Unnamed Office',
        description: office.description || '',
        logo: getValidImageUrl(office.logo, '/images/office-placeholder.jpg'),
        address: office.address || '',
        city: office.city || '',
        country: office.country || '',
        contact_number: office.contact_number || '',
        email: office.email || '',
        website: office.website || '',
        license_number: office.license_number || '',
        verification_status: office.verification_status || 'pending',
        rating: office.rating || 0,
        reviews_count: office.reviews_count || 0,
        gallery: office.gallery ? office.gallery.map((img: string) => getValidImageUrl(img)) : [],
        is_featured: office.is_featured || false,
        services: office.services || [],
        created_at: office.created_at,
        updated_at: office.updated_at
      }));
      
      return {
        offices,
        pagination: data.data.pagination || {
          total: offices.length,
          per_page: filters.per_page || 10,
          current_page: filters.page || 1,
          last_page: 1,
          from: 1,
          to: offices.length
        }
      };
    }
    
    return { offices: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 } };
  } catch (error) {
    console.error('Error fetching offices:', error);
    return { offices: [], pagination: { total: 0, per_page: 10, current_page: 1, last_page: 1, from: 0, to: 0 } };
  }
}

// Função para buscar um escritório por ID
export async function fetchOfficeById(officeId: string) {
  try {
    // Primeiro, tente buscar do servidor
    const response = await fetch(`${API_URL}/v1/public/offices/${officeId}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.data) {
        // Processar dados do escritório
        const office: Office = {
          id: data.data.id.toString(),
          office_name: data.data.office_name || 'Unnamed Office',
          description: data.data.description || '',
          logo: getValidImageUrl(data.data.logo, '/images/office-placeholder.jpg'),
          address: data.data.address || '',
          city: data.data.city || '',
          country: data.data.country || '',
          contact_number: data.data.contact_number || '',
          email: data.data.email || '',
          website: data.data.website || '',
          license_number: data.data.license_number || '',
          verification_status: data.data.verification_status || 'pending',
          rating: data.data.rating || 0,
          reviews_count: data.data.reviews_count || 0,
          gallery: data.data.gallery ? data.data.gallery.map((img: string) => getValidImageUrl(img)) : [],
          is_featured: data.data.is_featured || false,
          services: data.data.services || [],
          created_at: data.data.created_at,
          updated_at: data.data.updated_at
        };
        
        return { status: true, data: office };
      }
    }
    
    // Se não conseguiu buscar do servidor, use dados de fallback
    return {
      status: false,
      data: {
        id: officeId,
        office_name: 'Office Name',
        description: 'This is a fallback description for when the API is unavailable.',
        logo: '/images/office-placeholder.jpg',
        address: 'Makkah, Saudi Arabia',
        contact_number: '+966 50 000 0000',
        email: 'info@example.com',
        verification_status: 'verified' as const,
        rating: 4.5,
        reviews_count: 120,
        gallery: ['/images/office-placeholder.jpg'],
        is_featured: true
      } as Office
    };
  } catch (error) {
    console.error('Error fetching office details:', error);
    
    // Retornar dados de fallback em caso de erro
    return {
      status: false,
      data: {
        id: officeId,
        office_name: 'Office Name',
        description: 'This is a fallback description for when the API is unavailable.',
        logo: '/images/office-placeholder.jpg',
        address: 'Makkah, Saudi Arabia',
        contact_number: '+966 50 000 0000',
        email: 'info@example.com',
        verification_status: 'verified' as const,
        rating: 4.5,
        reviews_count: 120,
        gallery: ['/images/office-placeholder.jpg'],
        is_featured: true
      } as Office
    };
  }
} 