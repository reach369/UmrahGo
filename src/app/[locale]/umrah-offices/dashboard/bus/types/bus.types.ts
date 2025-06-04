export interface Bus {
  id: number;
  operator_id: number;
  type_id: number;
  model: string;
  year: number;
  capacity: number;
  price: number;
  condition: 'new' | 'used' | 'maintenance';
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  verified: boolean;
  location_lat: number | null;
  location_lng: number | null;
  images: string[];
  videos: string[];
  features: string[];
  amenities: string[];
  insurance: {
    provider: string;
    policy_number: string;
    expiry_date: string;
  };
  maintenance_history: {
    date: string;
    description: string;
    cost: number;
    next_maintenance_date: string;
  }[];
  seasonal_pricing: {
    start_date: string;
    end_date: string;
    price_multiplier: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface BusType {
  id: number;
  name: string;
  description: string;
}

export interface BusFormData {
  type_id: number;
  model: string;
  year: number;
  capacity: number;
  price: number;
  condition: 'new' | 'used' | 'maintenance';
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  location_lat?: number;
  location_lng?: number;
  images: string[];
  videos: string[];
  features: string[];
  amenities: string[];
  insurance: {
    provider: string;
    policy_number: string;
    expiry_date: string;
  };
  seasonal_pricing: {
    start_date: string;
    end_date: string;
    price_multiplier: number;
  }[];
}

export interface BusFilters {
  type_id?: number;
  status?: 'available' | 'rented' | 'maintenance' | 'reserved';
  condition?: 'new' | 'used' | 'maintenance';
  min_price?: number;
  max_price?: number;
}

export interface BusCompany {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  commercialRegister: string;
  address: string;
  buses: Bus[];
  isVerified: boolean;
  rating: number;
  totalBookings: number;
  subscription?: {
    type: 'basic' | 'premium' | 'enterprise';
    expiresAt: string;
  };
}

export interface BusReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BusBooking {
  id: string;
  busId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export interface PremiumPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in months
  features: string[];
  maxBuses: number;
  priority: number;
} 