// Package model based on API response from https://umrahgo.reach369.com/api/v1/public/packages
export interface PackageImage {
  id: number;
  package_id: number;
  image_path: string;
  is_main: boolean;
  title: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  alt_text: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  url: string;
}

export interface PackageOffice {
  id: number;
  user_id: number;
  office_name: string;
  address: string;
  contact_number: string;
  logo: string | null;
  license_doc: string | null;
  verification_status: string;
  subscription_id: number | null;
  email: string;
  website: string | null;
  fax: string | null;
  whatsapp: string | null;
  city: string;
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
}

export interface PackageHotel {
  id: number;
  office_id: number | null;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  featured_image_url: string;
  pivot?: {
    package_id: number;
    hotel_id: number;
    nights: number;
    room_type: string;
    created_at: string;
    updated_at: string;
  };
}

export interface Package {
  id: number;
  office_id: number;
  name: string;
  description: string;
  price: string;
  discount_price: string | null;
  duration_days: number;
  features: string[] | Record<string, any>;
  status: string;
  is_featured: boolean;
  views_count: number;
  max_persons: number;
  includes_transport: boolean;
  includes_accommodation: boolean;
  includes_meals: boolean;
  includes_guide: boolean;
  includes_insurance: boolean;
  includes_activities: boolean;
  start_location: string | null;
  end_location: string | null;
  start_date: string | null;
  end_date: string | null;
  location_coordinates: {
    location: string | null;
    lat?: string;
    lng?: string;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  featured_image_url: string;
  thumbnail_url: string;
  has_discount: boolean;
  discount_percentage: number;
  images: PackageImage[];
  office: PackageOffice;
  hotels: PackageHotel[];
}

// Response format for package listings
export interface PackagesResponse {
  status: boolean;
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Package[];
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

// Response format for a single package
export interface PackageResponse {
  status: boolean;
  code: number;
  message: string;
  data: Package;
} 