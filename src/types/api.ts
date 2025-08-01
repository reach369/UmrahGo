export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T | null;
  errors?: any;
  meta?: {
    pagination?: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
} 