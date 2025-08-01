export interface SubscriptionPackage {
  id: number;
  office_id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  created_at: string;
}

export interface SubscriptionPackageFormData {
  name: string;
  description: string;
  price: number;
  duration_days: number;
} 