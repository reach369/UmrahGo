import { Office } from './office.model';
import { User } from './user.model';

export interface BusMedia {
  id: number;
  bus_id: number;
  media_type: 'image' | 'video';
  path: string;
  url: string;
  thumbnail_url?: string;
  is_primary: boolean;
  original_filename?: string;
}

export interface BusType {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  icon_url: string;
  is_active: boolean;
  available_buses_count?: number;
}

export interface BusOperator {
  id: number;
  user_id: number;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  logo: string | null;
  verified: boolean;
  is_active: boolean;
}

export interface Bus {
  id: number;
  model: string;
  seating_capacity: number;
  registration_number: string;
  model_year: number;
  status: 'available' | 'in_use' | 'maintenance';
  primary_image_url: string;
  features: number[];
  type: BusType;
  media: BusMedia[];
  operator: BusOperator | null;
  office?: Office | User; // Can be an office or a user (operator)
} 