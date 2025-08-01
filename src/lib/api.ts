// Base API configuration and utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export class ApiException extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiException';
  }
}

// Get authentication token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }
  return null;
}

// Set authentication token
export function setAuthToken(token: string, remember: boolean = false): void {
  if (typeof window !== 'undefined') {
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }
}

// Remove authentication token
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  }
}

// Base request function
export async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (for file uploads)
  if (data instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  const config: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  if (data && method !== 'GET') {
    config.body = data instanceof FormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      if (response.ok) {
        return response as any;
      }
      throw new ApiException('Request failed', response.status);
    }

    const result = await response.json();

    if (!response.ok) {
      throw new ApiException(
        result.message || 'Request failed',
        response.status,
        result.errors
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }

    // Network or parsing errors
    throw new ApiException(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// Specific HTTP method helpers
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>('GET', endpoint, undefined, options),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>('POST', endpoint, data, options),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>('PUT', endpoint, data, options),
    
  patch: <T = any>(endpoint: string, data?: any, options?: RequestInit) => 
    apiRequest<T>('PATCH', endpoint, data, options),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>('DELETE', endpoint, undefined, options),
};

// Upload file helper
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return apiRequest('POST', endpoint, formData);
}

// Download file helper
export async function downloadFile(
  endpoint: string,
  filename?: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new ApiException('Download failed', response.status);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

// Retry helper for failed requests
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry client errors (4xx)
      if (error instanceof ApiException && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying (except on last attempt)
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}

// Request interceptors
export function setupRequestInterceptor(interceptor: (config: RequestInit) => RequestInit): void {
  // Implementation would go here for request interception
}

export function setupResponseInterceptor(
  onSuccess: (response: any) => any,
  onError: (error: ApiException) => void
): void {
  // Implementation would go here for response interception
}

// Error handling utilities
export function isApiError(error: any): error is ApiException {
  return error instanceof ApiException;
}

export function getErrorMessage(error: any): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

export function getValidationErrors(error: any): Record<string, string[]> | null {
  if (isApiError(error) && error.errors) {
    return error.errors;
  }
  
  return null;
} 