export interface NotificationData {
  title: string;
  body: string;
  url?: string;
  // Any other custom data properties
  [key: string]: any;
}

export interface Notification {
  id: string; // Typically a UUID
  type: string; // e.g., 'App\\Notifications\\NewBookingNotification'
  notifiable_type: string; // e.g., 'App\\Models\\User'
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
} 