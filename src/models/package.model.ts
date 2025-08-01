export interface PackageImage {
  id: number;
  image: string | null;
  is_featured?: boolean;
}

export interface Package {
  thumbnail_url: any;
  id: string;
  name: string;
  title?: string;
  description: string;
  price: number;
  currency?: string;
  duration_days: number;
  start_location?: string;
  end_location?: string;
  location?: string;
  rating: number;
  is_featured?: boolean;
  amenities?: string[];
  images?: PackageImage[];
  office?: {
    logo: string;
    contact_number: ReactNode;
    id?: number;
    office_name?: string;
    rating?: number;
    services_offered?: string;
  };
} 