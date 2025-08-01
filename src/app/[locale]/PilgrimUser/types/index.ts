export interface Office {
  id: string;
  office_name: string;
  description: string;
  address: string;
  contact_number: string;
  logo: string;
  rating: number;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Campaign {
  id: number;
  description: string;
  start_date: string;
  end_date: string;
  available_seats: number;
  status: 'active' | 'completed';
  packages: Package[];
  buses: Bus[];
  office_id?: number;
  package_id?: number;
}

export interface Bus {
  id: number;
  model: string;
  year: number;
  capacity: number;
  condition: string;
  operator_id?: number;
  type_id?: number;
  price?: number;
  location_lat?: number;
  location_lng?: number;
  status?: 'available' | 'rented';
  created_at?: string;
}

export interface OfficeWithPackages extends Office {
  packages: Package[];
} 