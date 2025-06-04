// Types for Umrah offices based on API response from https://umrahgo.reach369.com/api/v1/public/offices

// Single office image type
export interface OfficeImage {
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

// Office translation type
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

// Main Office type matching API response
export interface Office {
  id: number;
  user_id: number;
  office_name: string;
  address: string | null;
  contact_number: string;
  logo: string;
  license_doc: string | null;
  verification_status: 'verified' | 'pending' | 'rejected';
  subscription_id: number | null;
  email: string;
  website: string | null;
  fax: string | null;
  whatsapp: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  commercial_register_number: string | null;
  license_number: string;
  license_expiry_date: string | null;
  description: string | null;
  services_offered: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  is_featured: boolean;
  rating: string;
  reviews_count: number;
  rejection_reason: string | null;
  rejection_notes: string | null;
  verified_by: number | null;
  verified_at: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  gallery: OfficeImage[];
  translations: OfficeTranslation[];
}

// Office list response from API
export interface OfficeListResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Office[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// Single office response from API
export interface OfficeResponse {
  status: boolean;
  code: number;
  message: string;
  data: Office;
} 