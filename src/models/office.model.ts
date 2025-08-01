export interface OfficeTranslation {
  id: number;
  office_id: number;
  locale: 'ar' | 'en';
  office_name: string;
  address: string;
  description: string | null;
  services_offered: string | null;
  city: string | null;
  state: string | null;
  country: string;
  created_at: string;
  updated_at: string;
}

export interface Office {
  id: number;
  user_id: number;
  office_name: string;
  logo?: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  contact_number: string | null;
  email: string | null;
  website?: string | null;
  fax?: string | null;
  whatsapp?: string | null;
  license_number: string | null;
  license_expiry_date?: string | null;
  commercial_register_number: string | null;
  description: string | null;
  services_offered?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  is_featured?: boolean;
  rating?: string; // or number, based on API consistency
  reviews_count?: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  rejection_notes?: string | null;
  verified_by?: number | null;
  verified_at?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  translations: OfficeTranslation[];
} 