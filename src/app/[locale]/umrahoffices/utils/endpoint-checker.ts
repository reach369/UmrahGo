import axios from 'axios';
import { OFFICE_ENDPOINTS, API_BASE_CONFIG } from '@/config/api.config';

// Define interface for endpoint check result
export interface EndpointCheckResult {
  endpoint: string;
  url: string;
  method: string;
  status: number;
  success: boolean;
  responseTime: number;
  timestamp: string;
  data?: any;
  error?: any;
}

// Define interface for endpoint check log
export interface EndpointCheckLog {
  timestamp: string;
  results: EndpointCheckResult[];
  successRate: number;
  averageResponseTime: number;
}

class EndpointChecker {
  private baseUrl: string;
  private token: string | null = null;
  private logs: EndpointCheckLog[] = [];
  private maxLogs: number = 10;

  constructor(baseUrl = API_BASE_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadLogsFromStorage();
  }

  // Set authentication token
  public setToken(token: string): void {
    this.token = token;
  }

  // Load logs from local storage
  private loadLogsFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedLogs = localStorage.getItem('endpoint_check_logs');
      if (storedLogs) {
        try {
          this.logs = JSON.parse(storedLogs);
        } catch (e) {
          console.error('Failed to parse endpoint check logs from storage');
          this.logs = [];
        }
      }
    }
  }

  // Save logs to local storage
  private saveLogsToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('endpoint_check_logs', JSON.stringify(this.logs));
      } catch (e) {
        console.error('Failed to save endpoint check logs to storage');
      }
    }
  }

  // Check a single endpoint
  public async checkEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<EndpointCheckResult> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    let result: EndpointCheckResult = {
      endpoint,
      url,
      method,
      status: 0,
      success: false,
      responseTime: 0,
      timestamp: new Date().toISOString(),
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await axios({
        method,
        url,
        headers,
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' && data ? data : undefined,
      });

      const endTime = Date.now();
      result = {
        ...result,
        status: response.status,
        success: response.status >= 200 && response.status < 300,
        responseTime: endTime - startTime,
        data: response.data,
      };
    } catch (error: any) {
      const endTime = Date.now();
      result = {
        ...result,
        status: error.response?.status || 0,
        success: false,
        responseTime: endTime - startTime,
        error: {
          message: error.message,
          data: error.response?.data,
        },
      };
    }

    return result;
  }

  // Check all endpoints for offices dashboard
  public async checkAllOfficeDashboardEndpoints(): Promise<EndpointCheckLog> {
    const results: EndpointCheckResult[] = [];
    
    // Dashboard endpoints
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.DASHBOARD.STATS));
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.DASHBOARD.BOOKINGS_DAILY));
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.DASHBOARD.FINANCIAL_TRANSACTIONS));
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.DASHBOARD.PACKAGES_POPULAR));
    
    // Calculate statistics
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;
    const totalResponseTime = results.reduce((total, r) => total + r.responseTime, 0);
    const averageResponseTime = results.length > 0 ? totalResponseTime / results.length : 0;
    
    // Create log entry
    const log: EndpointCheckLog = {
      timestamp: new Date().toISOString(),
      results,
      successRate,
      averageResponseTime,
    };
    
    // Add to logs and limit size
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Save logs
    this.saveLogsToStorage();
    
    return log;
  }

  // Check all endpoints for bookings
  public async checkAllBookingEndpoints(): Promise<EndpointCheckLog> {
    const results: EndpointCheckResult[] = [];
    
    // Booking endpoints
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.BOOKINGS.LIST));
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS));
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS_STATISTICS));
    
    // Calculate statistics
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;
    const totalResponseTime = results.reduce((total, r) => total + r.responseTime, 0);
    const averageResponseTime = results.length > 0 ? totalResponseTime / results.length : 0;
    
    // Create log entry
    const log: EndpointCheckLog = {
      timestamp: new Date().toISOString(),
      results,
      successRate,
      averageResponseTime,
    };
    
    // Add to logs and limit size
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Save logs
    this.saveLogsToStorage();
    
    return log;
  }

  // Check all endpoints for packages
  public async checkAllPackageEndpoints(): Promise<EndpointCheckLog> {
    const results: EndpointCheckResult[] = [];
    
    // Package endpoints
    results.push(await this.checkEndpoint(OFFICE_ENDPOINTS.PACKAGES.LIST));
    
    // Calculate statistics
    const successCount = results.filter(r => r.success).length;
    const successRate = (successCount / results.length) * 100;
    const totalResponseTime = results.reduce((total, r) => total + r.responseTime, 0);
    const averageResponseTime = results.length > 0 ? totalResponseTime / results.length : 0;
    
    // Create log entry
    const log: EndpointCheckLog = {
      timestamp: new Date().toISOString(),
      results,
      successRate,
      averageResponseTime,
    };
    
    // Add to logs and limit size
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    
    // Save logs
    this.saveLogsToStorage();
    
    return log;
  }

  // Get all logs
  public getLogs(): EndpointCheckLog[] {
    return this.logs;
  }
}

// Create and export a singleton instance
export const endpointChecker = new EndpointChecker(); 