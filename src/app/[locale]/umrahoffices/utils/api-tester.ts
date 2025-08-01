import axios from 'axios';
import { OFFICE_ENDPOINTS, API_BASE_CONFIG } from '@/config/api.config';

// Interface for endpoint test results
interface EndpointTestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  responseTime: number;
  data?: any;
  error?: any;
  timestamp: string;
}

// Class to test API endpoints
export class ApiEndpointTester {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl = API_BASE_CONFIG.BASE_URL, token: string | null = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  // Set authentication token
  setToken(token: string): void {
    this.token = token;
  }

  // Test a single endpoint
  async testEndpoint(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<EndpointTestResult> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    let result: EndpointTestResult = {
      endpoint,
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
          response: error.response?.data,
        },
      };
    }

    return result;
  }

  // Test all office endpoints
  async testAllOfficeEndpoints(): Promise<Record<string, EndpointTestResult>> {
    const results: Record<string, EndpointTestResult> = {};

    // Test dashboard endpoints
    results['dashboard_stats'] = await this.testEndpoint(OFFICE_ENDPOINTS.DASHBOARD.STATS);
    results['daily_bookings'] = await this.testEndpoint(OFFICE_ENDPOINTS.DASHBOARD.BOOKINGS_DAILY);
    results['financial_transactions'] = await this.testEndpoint(OFFICE_ENDPOINTS.DASHBOARD.FINANCIAL_TRANSACTIONS);
    results['packages_popular'] = await this.testEndpoint(OFFICE_ENDPOINTS.DASHBOARD.PACKAGES_POPULAR);
    
    // Test bookings endpoints
    results['bookings_list'] = await this.testEndpoint(OFFICE_ENDPOINTS.BOOKINGS.LIST);
    results['package_bookings'] = await this.testEndpoint(OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS);
    results['package_bookings_statistics'] = await this.testEndpoint(OFFICE_ENDPOINTS.BOOKINGS.PACKAGE_BOOKINGS_STATISTICS);
    
    // Test packages endpoints
    results['packages_list'] = await this.testEndpoint(OFFICE_ENDPOINTS.PACKAGES.LIST);
    
    // Test profile endpoints
    results['profile_get'] = await this.testEndpoint(OFFICE_ENDPOINTS.PROFILE.GET);
    
    // Test gallery endpoints
    results['gallery_list'] = await this.testEndpoint(OFFICE_ENDPOINTS.GALLERY.LIST);
    
    // Test documents endpoints
    results['documents_list'] = await this.testEndpoint(OFFICE_ENDPOINTS.DOCUMENTS.LIST);
    
    // Test payments endpoints
    results['payments_list'] = await this.testEndpoint(OFFICE_ENDPOINTS.PAYMENTS.LIST);

    return results;
  }

  // Generate HTML report from test results
  async generateHTMLReport(): Promise<string> {
    const results = await this.testAllOfficeEndpoints();
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Endpoint Test Results</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .endpoint { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .success { background-color: #d4edda; }
        .failure { background-color: #f8d7da; }
        .details { margin-top: 10px; }
        pre { background-color: #f8f9fa; padding: 10px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>API Endpoint Test Results</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
    `;

    Object.entries(results).forEach(([key, result]) => {
      html += `
      <div class="endpoint ${result.success ? 'success' : 'failure'}">
        <h2>${result.endpoint}</h2>
        <p><strong>Method:</strong> ${result.method}</p>
        <p><strong>Status:</strong> ${result.status}</p>
        <p><strong>Response Time:</strong> ${result.responseTime}ms</p>
        <p><strong>Success:</strong> ${result.success ? 'Yes' : 'No'}</p>
        
        <div class="details">
          <h3>Response Data:</h3>
          <pre>${JSON.stringify(result.data || result.error, null, 2)}</pre>
        </div>
      </div>
      `;
    });

    html += `
    </body>
    </html>
    `;

    return html;
  }
}

// Create and export a singleton instance
export const apiTester = new ApiEndpointTester(); 