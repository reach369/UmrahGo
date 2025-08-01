export interface Permission {
  id: number;
  name: string;
  description: string;
  group: string;
  created_at: string;
  updated_at: string;
  pivot: {
    role_id: number;
    permission_id: number;
  };
}

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
  pivot?: {
    user_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  status: 'pending' | 'active' | 'inactive' | 'banned';
  is_active: boolean;
  preferred_language: 'ar' | 'en';
  profile_photo?: string | null;
  avatar?: string | null;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  verification_status?: 'none' | 'pending' | 'approved' | 'rejected';
  notification_preferences?: any; // Consider defining a specific interface for this
  fcm_token?: string | null;
  google_id?: string | null;
  facebook_id?: string | null;
  twitter_id?: string | null;
  apple_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  profile_photo_path?: string | null;
  roles: Role[];
}

export interface AuthResponse {
  user: User;
  token: string;
  otp?: string;
  token_type: 'Bearer';
} 