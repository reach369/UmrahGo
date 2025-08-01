/**
 * Enhanced Wallet Service - Professional Implementation
 * Complete wallet management solution with error handling and retry logic
 * http://127.0.0.1:8000/api/v1/office/enhanced-wallet/dashboard
 */
import { 
  API_BASE_CONFIG, 
  PUBLIC_ENDPOINTS,
  PROXY_ENDPOINTS,
  getFullUrl,
  getCompleteHeaders,
  getProxyUrl,
  getImageUrl
} from '@/config/api.config';
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { getAuthToken } from '@/lib/auth.service';

// Enhanced Types for Backend Compatibility
export interface WalletBalance {
  id: number;
  umrah_office_id: number;
  wallet_type: 'cash' | 'online';
  balance: number;
  pending_balance: number;
  reserved_balance: number;
  total_earned: number;
  total_withdrawn: number;
  total_commission_paid: number;
  tax_deducted: number;
  net_available_balance: number;
  total_gross_earnings: number;
  total_tax_deducted: number;
  total_commission_deducted: number;
  currency: string;
  is_active: boolean;
  last_transaction_at?: string;
  last_settlement_at?: string;
  last_calculation_at?: string;
  settings?: any;
  accounting_metadata?: any;
  created_at: string;
  updated_at: string;
  // Computed attributes
  available_balance: number;
  total_balance: number;
  formatted_balance: string;
  formatted_available_balance: string;
  formatted_net_balance: string;
  wallet_type_arabic: string;
}

export interface WalletTransaction {
  id: number;
  umrah_office_id: number;
  office_wallet_id: number;
  transaction_number: string;
  type: 'credit' | 'debit';
  category: string;
  wallet_type: 'cash' | 'online';
  amount: number;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  tax_rate: number;
  tax_amount: number;
  net_amount: number;
  balance_before: number;
  balance_after: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference_type?: string;
  reference_id?: number;
  payment_method_type: string;
  metadata?: any;
  has_accounting_entries: boolean;
  accounting_posted_at?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  // Computed attributes
  type_description: string;
  category_description: string;
  wallet_type_description: string;
  status_description: string;
  payment_method_type_description: string;
  transaction_breakdown: any;
  formatted_amounts: {
    gross_amount: string;
    commission: string;
    tax: string;
    net_amount: string;
    amount: string;
  };
}

export interface WithdrawalRequest {
  id: number;
  umrah_office_id: number;
  office_wallet_id: number;
  amount: number;
  available_balance: number;
  currency: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected' | 'cancelled';
  bank_name: string;
  account_number: string;
  iban: string;
  swift_code?: string;
  account_holder_name: string;
  bank_branch?: string;
  notes?: string;
  admin_notes?: string;
  reviewed_by?: number;
  processed_by?: number;
  reviewed_at?: string;
  processed_at?: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  wallets: {
    cash: WalletBalance;
    online: WalletBalance;
  };
  totals: {
    total_balance: number;
    total_net_balance: number;
    total_commission_deducted: number;
    total_tax_deducted: number;
    total_deductions: number;
    formatted_total_balance: string;
    formatted_total_net_balance: string;
  };
  rates: {
    commission_rate: number;
    tax_rate: number;
    total_deduction_rate: number;
  };
  monthly_stats: {
    transactions_count: number;
    earnings: number;
    withdrawals: number;
    commission_deducted: number;
    tax_deducted: number;
  };
}

export interface WalletStatistics {
  period: {
    from: string;
    to: string;
    label: string;
  };
  statistics: {
    period_summary: {
      balance_at_start: number;
      balance_at_end: number;
      net_change: number;
      total_transactions: number;
      average_transaction_value: number;
    };
    earnings_summary: {
      gross_earnings: number;
      net_earnings: number;
      total_transactions: number;
    };
    deductions_details: {
      total_commission_paid: number;
      total_tax_paid: number;
      total_deductions: number;
    };
    withdrawals_summary: {
      total_withdrawn: number;
      total_requests: number;
      pending_requests_count: number;
      pending_requests_amount: number;
    };
    detailed_breakdown: {
      earnings_by_category: Record<string, { count: number; gross_amount: number; net_amount: number; commission: number; }>;
      debits_by_category: Record<string, { count: number; amount: number; }>;
    };
    daily_performance: {
      daily_net_earnings: Record<string, number>;
      daily_transactions: Record<string, number>;
    };
  };
  // Add these fields to match what the component expects
  overall: {
    total_earnings: number;
    total_withdrawals: number;
    total_transactions: number;
    average_transaction_amount: number;
  };
  by_wallet_type: {
    cash: {
      total_earnings: number;
      total_transactions: number;
    };
    online: {
      total_earnings: number;
      total_transactions: number;
    };
  };
  by_category: Array<{
    category: string;
    count: number;
    total_gross: number;
    total_net: number;
  }>;
  daily_stats: Array<{
    date: string;
    daily_transactions: number;
    daily_credits: number;
    daily_debits: number;
  }>;
}

export interface AccountingEntry {
  id: number;
  office_wallet_id: number;
  office_wallet_transaction_id: number;
  entry_number: string;
  entry_type: string;
  entry_type_arabic: string;
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  amount: number;
  description: string;
  status: string;
  posted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemStatus {
  office: {
    id: number;
    name: string;
    is_active: boolean;
  };
  wallets: {
    cash: {
      exists: boolean;
      active: boolean;
      balance: number;
      last_activity?: string;
    };
    online: {
      exists: boolean;
      active: boolean;
      balance: number;
      last_activity?: string;
    };
  };
  health_checks: {
    wallets_exist: boolean;
    wallets_active: boolean;
    balance_integrity: boolean;
    recent_activity: boolean;
    settings_configured: boolean;
  };
  overall_health_percentage: number;
  recent_transactions_count: number;
  last_check: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  status?: string;
  data?: T;
  message?: string;
  errors?: any;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface WalletDetails {
  wallet: WalletBalance;
  monthly_summary: {
    transactions_count: number;
    total_credits: number;
    total_debits: number;
    total_commission: number;
    total_tax: number;
  };
  category_summary: Array<{
    category: string;
    count: number;
    total_amount: number;
  }>;
  recent_transactions: WalletTransaction[];
  accounting_entries: AccountingEntry[];
}

// Configuration
const WALLET_CONFIG = {
  BASE_URL: API_BASE_CONFIG.BASE_URL,
  ENDPOINTS: {
    // Office Enhanced Wallet Endpoints (Updated to match backend)
    DASHBOARD: '/office/enhanced-wallet/dashboard',
    WALLET_DETAILS: '/office/enhanced-wallet/details', // Add this line
    TRANSACTIONS: '/office/enhanced-wallet/transactions',
    TRANSACTION_DETAILS: '/office/enhanced-wallet/transactions',
    STATISTICS: '/office/enhanced-wallet/statistics',
    COMPREHENSIVE_REPORT: '/office/enhanced-wallet/comprehensive-report',
    EXPORT_REPORT: '/office/enhanced-wallet/export',
    
    // Withdrawal Management
    WITHDRAWAL_REQUESTS: '/office/enhanced-wallet/withdrawals',
    CREATE_WITHDRAWAL: '/office/enhanced-wallet/withdrawals',
    CANCEL_WITHDRAWAL: '/office/enhanced-wallet/withdrawals',
    
    // Accounting
    ACCOUNTING_ENTRIES: '/office/enhanced-wallet/accounting/entries',
    ACCOUNTING_ENTRY_DETAILS: '/office/enhanced-wallet/accounting/entries',
    TRIAL_BALANCE: '/office/enhanced-wallet/accounting/trial-balance',
    
    // Verification & System
    VERIFICATION_STATUS: '/office/enhanced-wallet/verification/status',
    RECALCULATE_BALANCES: '/office/enhanced-wallet/verification/recalculate',
    VERIFY_INTEGRITY: '/office/system/verify-integrity',
    FIX_ISSUES: '/office/system/fix-issues',
    SYSTEM_STATUS: '/office/system/status',
    
    // Basic Office Wallet (fallback)
    BASIC_WALLET: '/office/wallet',
    BASIC_TRANSACTIONS: '/office/wallet/transactions',
    BASIC_STATISTICS: '/office/wallet/statistics',
    BASIC_WITHDRAWALS: '/office/withdrawals'
  },
  TIMEOUT: 15000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

class EnhancedWalletService {
  private api: AxiosInstance;

  constructor() {
    this.api = this.createApiInstance();
  }

  private createApiInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: WALLET_CONFIG.BASE_URL,
      timeout: WALLET_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for authentication
    instance.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add user type header
        config.headers['X-User-Type'] = 'office';
        
        // Add request timestamp for debugging
        config.headers['X-Request-Time'] = new Date().toISOString();
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Wallet API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );

    return instance;
  }

  private handleApiError(error: AxiosError): void {
    const response = error.response;
    const request = error.request;
    
    if (response) {
      // Server responded with error status
      console.error('Wallet API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        url: response.config?.url
      });
      
      // Handle specific error codes
      switch (response.status) {
        case 401:
          console.error('Wallet API: Unauthorized - token may be expired');
          break;
        case 403:
          console.error('Wallet API: Forbidden - insufficient permissions');
          break;
        case 404:
          console.error('Wallet API: Not Found - endpoint may not exist');
          break;
        case 422:
          console.error('Wallet API: Validation Error:', response.data);
          break;
        case 429:
          console.error('Wallet API: Rate Limited');
          break;
        case 500:
          console.error('Wallet API: Internal Server Error');
          break;
        default:
          console.error('Wallet API: Unknown Error:', response.status);
      }
    } else if (request) {
      // Network error
      console.error('Wallet API Network Error:', {
        message: error.message,
        code: error.code
      });
    } else {
      // Other error
      console.error('Wallet API Error:', error.message);
    }
  }

  private async makeRequestWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
    maxRetries = WALLET_CONFIG.MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    let lastError: Error | any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await requestFn();
        
        // Check if response exists and has data
        if (response && response.data) {
          if (response.data.status === 'success' || response.data.success) {
            return response.data;
          } else {
            throw new Error(response.data.message || 'API returned unsuccessful response');
          }
        } else {
          throw new Error('Empty response received from API');
        }
      } catch (error: any) {
        lastError = error;
        
        console.warn(`Wallet API attempt ${attempt} failed:`, error.message);
        
        // Don't retry on authentication or client errors
        if (error.response?.status && error.response.status < 500) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = WALLET_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we reach here, all attempts failed
    return {
      status: 'error',
      message: lastError?.message || 'Failed to make request after retries'
    };
  }

  // Add fallback mock data
  private mockDashboardData: DashboardData = {
    wallets: {
      cash: {
        id: 1,
        umrah_office_id: 1,
        wallet_type: 'cash' as const,
        balance: 150000,
        pending_balance: 0,
        reserved_balance: 0,
        total_earned: 200000,
        total_withdrawn: 50000,
        total_commission_paid: 8000,
        tax_deducted: 2000,
        net_available_balance: 140000,
        total_gross_earnings: 200000,
        total_tax_deducted: 2000,
        total_commission_deducted: 8000,
        currency: 'SAR',
        is_active: true,
        last_transaction_at: new Date().toISOString(),
        last_settlement_at: new Date().toISOString(),
        last_calculation_at: new Date().toISOString(),
        settings: {},
        accounting_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Computed attributes
        available_balance: 140000,
        total_balance: 150000,
        formatted_balance: '150,000 ر.س',
        formatted_available_balance: '140,000 ر.س',
        formatted_net_balance: '140,000 ر.س',
        wallet_type_arabic: 'نقدي'
      },
      online: {
        id: 2,
        umrah_office_id: 1,
        wallet_type: 'online' as const,
        balance: 75000,
        pending_balance: 0,
        reserved_balance: 0,
        total_earned: 100000,
        total_withdrawn: 25000,
        total_commission_paid: 4000,
        tax_deducted: 1000,
        net_available_balance: 70000,
        total_gross_earnings: 100000,
        total_tax_deducted: 1000,
        total_commission_deducted: 4000,
        currency: 'SAR',
        is_active: true,
        last_transaction_at: new Date().toISOString(),
        last_settlement_at: new Date().toISOString(),
        last_calculation_at: new Date().toISOString(),
        settings: {},
        accounting_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Computed attributes
        available_balance: 70000,
        total_balance: 75000,
        formatted_balance: '75,000 ر.س',
        formatted_available_balance: '70,000 ر.س',
        formatted_net_balance: '70,000 ر.س',
        wallet_type_arabic: 'إلكتروني'
      }
    },
    totals: {
      total_balance: 225000,
      total_net_balance: 210000,
      total_commission_deducted: 12000,
      total_tax_deducted: 3000,
      total_deductions: 15000,
      formatted_total_balance: '225,000 ر.س',
      formatted_total_net_balance: '210,000 ر.س'
    },
    rates: {
      commission_rate: 4.0,
      tax_rate: 1.0,
      total_deduction_rate: 5.0
    },
    monthly_stats: {
      transactions_count: 45,
      earnings: 25000,
      withdrawals: 5000,
      commission_deducted: 1000,
      tax_deducted: 250
    }
  };

  private mockSystemStatus: SystemStatus = {
    office: {
      id: 123,
      name: 'مكتب العمرة الذهبي',
      is_active: true
    },
    wallets: {
      cash: {
        exists: true,
        active: true,
        balance: 150000,
        last_activity: new Date().toISOString()
      },
      online: {
        exists: true,
        active: true,
        balance: 75000,
        last_activity: new Date().toISOString()
      }
    },
    health_checks: {
      wallets_exist: true,
      wallets_active: true,
      balance_integrity: true,
      recent_activity: true,
      settings_configured: true
    },
    overall_health_percentage: 95,
    recent_transactions_count: 45,
    last_check: new Date().toISOString()
  };

  private mockWithdrawalRequests: WithdrawalRequest[] = [
    {
      id: 1,
      umrah_office_id: 1,
      office_wallet_id: 1,
      amount: 10000,
      available_balance: 140000,
      currency: 'SAR',
      status: 'pending',
      bank_name: 'البنك الأهلي السعودي',
      account_number: '123456789',
      iban: 'SA0380000000608010167519',
      swift_code: 'NCBKSARI',
      account_holder_name: 'أحمد محمد',
      bank_branch: 'فرع الرياض الرئيسي',
      notes: 'طلب سحب شهري',
      admin_notes: undefined,
      reviewed_by: undefined,
      processed_by: undefined,
      reviewed_at: undefined,
      processed_at: undefined,
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  /**
   * Get dashboard data with fallback to mock data
   */
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await this.makeRequestWithRetry(() =>
        this.api.get(WALLET_CONFIG.ENDPOINTS.DASHBOARD)
      );
      return response as ApiResponse<DashboardData>;
    } catch (error: any) {
      // If API is not available (404), return mock data
      if (error?.response?.status === 404) {
        console.warn('Wallet API not available, using mock data');
        return {
          status: 'success' as const,
          message: 'Dashboard data loaded (mock)',
          data: this.mockDashboardData
        };
      }
      throw error;
    }
  }

  // Get wallet balance (uses basic wallet endpoint for compatibility)
  async getBalance(): Promise<ApiResponse<WalletBalance>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.BASIC_WALLET)
    );
  }

  // Get transaction history
  async getTransactions(params?: {
    page?: number;
    per_page?: number;
    wallet_type?: 'cash' | 'online';
    type?: string;
    category?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ApiResponse<WalletTransaction[]>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.TRANSACTIONS, { params })
    );
  }

  // Get transaction details
  async getTransactionDetails(transactionId: number): Promise<ApiResponse<{
    transaction: any;
    reference: any;
    accounting_entries: any[];
  }>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(`${WALLET_CONFIG.ENDPOINTS.TRANSACTION_DETAILS}/${transactionId}`)
    );
  }

  // Get comprehensive report
  async getComprehensiveReport(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.COMPREHENSIVE_REPORT, { params })
    );
  }

  // Export reports
  async exportReport(data: {
    format?: 'pdf' | 'excel';
    date_from?: string;
    date_to?: string;
    include_transactions?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.post(WALLET_CONFIG.ENDPOINTS.EXPORT_REPORT, data)
    );
  }

  // Create withdrawal request
  async createWithdrawalRequest(data: {
    amount: number;
    bank_name: string;
    account_number: string;
    iban: string;
    swift_code?: string;
    account_holder_name: string;
    bank_branch?: string;
    notes?: string;
  }): Promise<ApiResponse<WithdrawalRequest>> {
    return this.makeRequestWithRetry(() =>
      this.api.post(WALLET_CONFIG.ENDPOINTS.CREATE_WITHDRAWAL, data)
    );
  }

  /**
   * Get withdrawal requests with fallback to mock data
   */
  async getWithdrawalRequests(params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }): Promise<ApiResponse<WithdrawalRequest[]>> {
    try {
      const response = await this.makeRequestWithRetry(() =>
        this.api.get(WALLET_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS, { params })
      );
      return response as ApiResponse<WithdrawalRequest[]>;
    } catch (error: any) {
      // If API is not available (404), return mock data
      if (error?.response?.status === 404) {
        console.warn('Withdrawal requests API not available, using mock data');
        return {
          status: 'success' as const,
          message: 'Withdrawal requests loaded (mock)',
          data: this.mockWithdrawalRequests
        };
      }
      throw error;
    }
  }

  // Get withdrawal details
  async getWithdrawalDetails(requestId: number): Promise<ApiResponse<WithdrawalRequest>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(`${WALLET_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS}/${requestId}`)
    );
  }

  // Cancel withdrawal request
  async cancelWithdrawalRequest(id: number): Promise<ApiResponse<WithdrawalRequest>> {
    return this.makeRequestWithRetry(() =>
      this.api.post(`${WALLET_CONFIG.ENDPOINTS.CANCEL_WITHDRAWAL}/${id}/cancel`)
    );
  }

  // Get wallet statistics
  async getStatistics(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<WalletStatistics>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.STATISTICS, { params })
    );
  }

  // Get accounting entries
  async getAccountingEntries(params?: {
    page?: number;
    per_page?: number;
    entry_type?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<AccountingEntry[]>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.ACCOUNTING_ENTRIES, { params })
    );
  }

  // Get accounting entry details
  async getAccountingEntryDetails(entryId: number): Promise<ApiResponse<AccountingEntry>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(`${WALLET_CONFIG.ENDPOINTS.ACCOUNTING_ENTRY_DETAILS}/${entryId}`)
    );
  }

  // Get trial balance
  async getTrialBalance(params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.TRIAL_BALANCE, { params })
    );
  }

  // Get verification status
  async getVerificationStatus(): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.VERIFICATION_STATUS)
    );
  }

  // Recalculate balances
  async recalculateBalances(): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.post(WALLET_CONFIG.ENDPOINTS.RECALCULATE_BALANCES)
    );
  }

  // Verify system integrity
  async verifyIntegrity(): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.post(WALLET_CONFIG.ENDPOINTS.VERIFY_INTEGRITY)
    );
  }

  // Fix system issues
  async fixIssues(data?: { fix_notifications?: boolean }): Promise<ApiResponse<any>> {
    return this.makeRequestWithRetry(() =>
      this.api.post(WALLET_CONFIG.ENDPOINTS.FIX_ISSUES, data)
    );
  }

  /**
   * Get system status with fallback to mock data
   */
  async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    try {
      const response = await this.makeRequestWithRetry(() =>
        this.api.get(WALLET_CONFIG.ENDPOINTS.SYSTEM_STATUS)
      );
      return response as ApiResponse<SystemStatus>;
    } catch (error: any) {
      // If API is not available (404), return mock data
      if (error?.response?.status === 404) {
        console.warn('System status API not available, using mock data');
        return {
          status: 'success' as const,
          message: 'System status loaded (mock)',
            data: this.mockSystemStatus
        };
      }
      throw error;
    }
  }

  /**
   * Get wallet details by type
   */
  async getWalletDetails(walletType: 'cash' | 'online'): Promise<ApiResponse<WalletDetails>> {
    try {
      const response = await this.makeRequestWithRetry(() =>
        this.api.get(`${WALLET_CONFIG.ENDPOINTS.WALLET_DETAILS}/${walletType}`)
      );
      return response as ApiResponse<WalletDetails>;
    } catch (error: any) {
      // If API is not available (404), return mock data
      if (error?.response?.status === 404) {
        console.warn('Wallet details API not available, using mock data');
        return {
          status: 'success' as const,
          message: 'Wallet details loaded (mock)',
          data: this.generateMockWalletDetails(walletType)
        };
      }
      throw error;
    }
  }

  // Mock wallet details for development
  private generateMockWalletDetails(type: 'cash' | 'online'): WalletDetails {
    const isCash = type === 'cash';
    const wallet = isCash ? this.mockDashboardData.wallets.cash : this.mockDashboardData.wallets.online;
    
    return {
      wallet: wallet,
      monthly_summary: {
        transactions_count: 24,
        total_credits: isCash ? 50000 : 30000,
        total_debits: isCash ? 10000 : 8000,
        total_commission: isCash ? 2000 : 1200,
        total_tax: isCash ? 300 : 180
      },
      category_summary: [
        { category: 'payment_received', count: 12, total_amount: isCash ? 50000 : 30000 },
        { category: 'withdrawal', count: 5, total_amount: isCash ? 10000 : 8000 },
        { category: 'refund', count: 2, total_amount: isCash ? 2000 : 1000 }
      ],
      recent_transactions: Array(10).fill(null).map((_, i) => {
        const transactionType = i % 3 === 0 ? 'debit' : 'credit';
        const category = i % 3 === 0 ? 'withdrawal' : 'payment_received';
        
        return {
          payment_method_type: 'wallet',
          has_accounting_entries: true,
          updated_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          type_description: i % 3 === 0 ? 'Withdrawal' : 'Payment Received',
          tax_rate: 0.05,
          balance_before: isCash ? 50000 - (i * 1000) : 30000 - (i * 800),
          balance_after: isCash ? 50000 - ((i+1) * 1000) : 30000 - ((i+1) * 800),
          currency: 'SAR',
          id: i + 1,
          transaction_number: `TRX${type.toUpperCase()}${1000 + i}`,
          type: transactionType as any,
          category: category,
          umrah_office_id: 1,
          office_wallet_id: i + 100,
          wallet_type: type,
          commission_rate: 5,
          amount: Math.floor(Math.random() * 5000) + 1000,
          gross_amount: Math.floor(Math.random() * 5000) + 1000,
          commission_amount: 200,
          tax_amount: 30,
          net_amount: Math.floor(Math.random() * 4000) + 900,
          description: i % 3 === 0 ? 'سحب من المحفظة' : 'دفعة مستلمة من حجز',
          status: 'completed' as any,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          processed_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          // Add missing required properties
          category_description: i % 3 === 0 ? 'Withdrawal' : 'Payment Received',
          wallet_type_description: type === 'cash' ? 'Cash' : 'Online',
          status_description: 'Completed',
          payment_method_type_description: 'Wallet',
          transaction_breakdown: {
            gross: Math.floor(Math.random() * 5000) + 1000,
            commission: 200,
            tax: 30,
            net: Math.floor(Math.random() * 4000) + 900
          },
          formatted_amounts: {
            gross_amount: `${Math.floor(Math.random() * 5000) + 1000} SAR`,
            commission: '200 SAR',
            tax: '30 SAR',
            net_amount: `${Math.floor(Math.random() * 4000) + 900} SAR`,
            amount: `${Math.floor(Math.random() * 5000) + 1000} SAR`
          },
          formatted: {
            amount: `${Math.floor(Math.random() * 5000) + 1000} SAR`,
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()
          }
        };
      }),
      accounting_entries: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        entry_number: `ACC${1000 + i}`,
        entry_type: i % 2 === 0 ? 'credit' : 'debit',
        entry_type_arabic: i % 2 === 0 ? 'دائن' : 'مدين',
        office_wallet_id: i + 100,
        office_wallet_transaction_id: i + 200,
        account_code: `AC${1000 + i}`,
        amount: Math.floor(Math.random() * 2000) + 500,
        status: 'completed',
        account_name: i % 2 === 0 ? 'حساب المكتب - ' + type : 'عمولة المنصة',
        debit_amount: i % 2 === 0 ? 0 : Math.floor(Math.random() * 2000) + 500,
        credit_amount: i % 2 === 0 ? Math.floor(Math.random() * 2000) + 500 : 0,
        description: i % 2 === 0 ? 'إيداع مبلغ' : 'خصم عمولة',
        posted_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        formatted: {
          debit: i % 2 === 0 ? '' : `${Math.floor(Math.random() * 2000) + 500} SAR`,
          credit: i % 2 === 0 ? `${Math.floor(Math.random() * 2000) + 500} SAR` : '',
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      }))
    };
  }

  // Update bank details (deprecated - keeping for compatibility)
  async updateBankDetails(data: {
    bank_name: string;
    account_number: string;
    account_holder: string;
    iban?: string;
    swift_code?: string;
  }): Promise<ApiResponse<any>> {
    console.warn('updateBankDetails is deprecated. Bank details should be included in withdrawal requests.');
    return this.makeRequestWithRetry(() =>
      this.api.post(WALLET_CONFIG.ENDPOINTS.BASIC_WALLET, data)
    );
  }

  // Get bank details (deprecated - keeping for compatibility)
  async getBankDetails(): Promise<ApiResponse<any>> {
    console.warn('getBankDetails is deprecated. Bank details are now part of withdrawal requests.');
    return this.makeRequestWithRetry(() =>
      this.api.get(WALLET_CONFIG.ENDPOINTS.BASIC_WALLET)
    );
  }

  // Utility methods
  formatCurrency(amount: number, currency = 'SAR'): string {
    try {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      // Fallback to a simpler format if there's an error
      return `${amount.toFixed(2)} ${currency}`;
    }
  }

  validateAmount(amount: number, minAmount = 1, maxAmount = 1000000): boolean {
    return amount >= minAmount && amount <= maxAmount && !isNaN(amount);
  }

  getTransactionStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      failed: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getTransactionTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      deposit: '📥',
      withdraw: '📤',
      transfer: '🔄',
      commission: '💰',
      refund: '↩️',
      fee: '💳',
      bonus: '🎁',
      penalty: '⚠️',
    };
    return icons[type] || '💰';
  }
}

// Export singleton instance
const enhancedWalletService = new EnhancedWalletService();
export default enhancedWalletService; 
