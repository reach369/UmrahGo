import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Search,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  Banknote,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Loader2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Services & Types
import enhancedWalletService, { WalletTransaction, ApiResponse } from '@/services/api/enhanced-wallet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types
interface TransactionFilters {
  search: string;
  wallet_type: 'all' | 'cash' | 'online';
  type: 'all' | 'credit' | 'debit';
  category: string;
  status: 'all' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  date_from: string;
  date_to: string;
}

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface TransactionsState {
  transactions: WalletTransaction[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  selectedTransaction: WalletTransaction | null;
  filters: TransactionFilters;
}

const TransactionsTable: React.FC = () => {
  const t = useTranslations('wallet.transactions');

  // State
  const [state, setState] = useState<TransactionsState>({
    transactions: [],
    pagination: null,
    loading: true,
    error: null,
    selectedTransaction: null,
    filters: {
      search: '',
      wallet_type: 'all',
      type: 'all',
      category: '',
      status: 'all',
      date_from: '',
      date_to: ''
    }
  });

  // Load transactions
  const loadTransactions = useCallback(async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const params: any = {
        page,
        per_page: 20,
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      // Apply filters
      if (state.filters.search) params.search = state.filters.search;
      if (state.filters.wallet_type !== 'all') params.wallet_type = state.filters.wallet_type;
      if (state.filters.type !== 'all') params.type = state.filters.type;
      if (state.filters.category) params.category = state.filters.category;
      if (state.filters.status !== 'all') params.status = state.filters.status;
      if (state.filters.date_from) params.date_from = state.filters.date_from;
      if (state.filters.date_to) params.date_to = state.filters.date_to;

      const response = await enhancedWalletService.getTransactions(params);

      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          transactions: response.data || [],
          pagination: response.meta ? {
            current_page: response.meta.current_page || 1,
            last_page: response.meta.last_page || 1,
            per_page: response.meta.per_page || 20,
            total: response.meta.total || 0
          } : null,
          loading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || t('loading')
        }));
      }
    } catch (error) {
      console.error('Transactions loading error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'خطأ في الاتصال بالخادم'
      }));
    }
  }, [state.filters]);

  // Update filters
  const updateFilter = useCallback((key: keyof TransactionFilters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        search: '',
        wallet_type: 'all',
        type: 'all',
        category: '',
        status: 'all',
        date_from: '',
        date_to: ''
      }
    }));
  }, []);

  // Load transaction details
  const loadTransactionDetails = useCallback(async (transactionId: number) => {
    try {
      const response = await enhancedWalletService.getTransactionDetails(transactionId);
      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          selectedTransaction: response.data?.transaction || null
        }));
      }
    } catch (error) {
      console.error('Transaction details loading error:', error);
    }
  }, []);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t('pending'), className: 'bg-warning/20 text-warning border-warning/50' },
      processing: { label: t('processing'), className: 'bg-primary/20 text-primary border-primary/50' },
      completed: { label: t('completed'), className: 'bg-success/20 text-success border-success/50' },
      failed: { label: t('failed'), className: 'bg-destructive/20 text-destructive border-destructive/50' },
      cancelled: { label: t('cancelled'), className: 'bg-muted/20 text-muted-foreground border-muted/50' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Get type badge
  const getTypeBadge = (type: string) => {
    const isCredit = type === 'credit';
    return (
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isCredit ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
      )}>
        {isCredit ? (
          <ArrowDownRight className="h-3 w-3" />
        ) : (
          <ArrowUpRight className="h-3 w-3" />
        )}
        {isCredit ? t('deposit') : t('withdrawal')}
      </div>
    );
  };

  // Get wallet type badge
  const getWalletTypeBadge = (walletType: string) => {
    const isCash = walletType === 'cash';
    return (
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        isCash ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
      )}>
        {isCash ? (
          <Banknote className="h-3 w-3" />
        ) : (
          <CreditCard className="h-3 w-3" />
        )}
        {isCash ? t('cash_wallet') : t('online_wallet')}
      </div>
    );
  };

  // Initial load
  useEffect(() => {
    loadTransactions();
  }, []);

  // Apply filters when they change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.filters.search.length === 0 || state.filters.search.length >= 3) {
        applyFilters();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.filters.search]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => loadTransactions(state.pagination?.current_page || 1, false)}
            disabled={state.loading}
          >
            <RefreshCw className={cn("h-4 w-4 ml-2", state.loading && "animate-spin")} />
            تحديث
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('search')}</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('search')}
                  value={state.filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Wallet Type */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('wallet_type')}</label>
              <Select
                value={state.filters.wallet_type}
                onValueChange={(value) => updateFilter('wallet_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_wallets')}</SelectItem>
                  <SelectItem value="cash">{t('cash_wallet')}</SelectItem>
                  <SelectItem value="online">{t('online_wallet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('type')}</label>
              <Select
                value={state.filters.type}
                onValueChange={(value) => updateFilter('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_types')}</SelectItem>
                  <SelectItem value="credit">{t('deposit')}</SelectItem>
                  <SelectItem value="debit">{t('withdrawal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('status')}</label>
              <Select
                value={state.filters.status}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="processing">{t('processing')}</SelectItem>
                  <SelectItem value="completed">{t('completed')}</SelectItem>
                  <SelectItem value="failed">{t('failed')}</SelectItem>
                  <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('from_date')}</label>
              <Input
                type="date"
                value={state.filters.date_from}
                onChange={(e) => updateFilter('date_from', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">{t('to_date')}</label>
              <Input
                type="date"
                value={state.filters.date_to}
                onChange={(e) => updateFilter('date_to', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              {t('reset')}
            </Button>
            <Button onClick={applyFilters}>
              <Filter className="h-4 w-4 ml-2" />
              {t('apply_filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('title')}
              {state.pagination && (
                <span className="text-sm font-normal text-muted-foreground mr-2">
                  ({state.pagination.total} {t('transactions_count')})
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-3 text-muted-foreground">{t('loading')}</span>
            </div>
          ) : state.error ? (
            <div className="text-center py-12">
              <div className="text-destructive mb-4">{state.error}</div>
              <Button onClick={() => loadTransactions()}>{t('retry')}</Button>
            </div>
          ) : state.transactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('no_transactions')}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('transaction_number')}</TableHead>
                      <TableHead>{t('type')}</TableHead>
                      <TableHead>{t('wallet_type')}</TableHead>
                      <TableHead>{t('gross_amount')}</TableHead>
                      <TableHead>{t('net_amount')}</TableHead>
                      <TableHead>{t('commission')}</TableHead>
                      <TableHead>{t('tax')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('date')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(state.transactions || []).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {transaction.transaction_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(transaction.type)}
                        </TableCell>
                        <TableCell>
                          {getWalletTypeBadge(transaction.wallet_type)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {transaction.formatted_amounts?.gross_amount || 
                             enhancedWalletService.formatCurrency(transaction.gross_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-success">
                            {transaction.formatted_amounts?.net_amount || 
                             enhancedWalletService.formatCurrency(transaction.net_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-warning">
                            {transaction.formatted_amounts?.commission || 
                             enhancedWalletService.formatCurrency(transaction.commission_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-destructive">
                            {transaction.formatted_amounts?.tax || 
                             enhancedWalletService.formatCurrency(transaction.tax_amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), 'yyyy/MM/dd HH:mm', { locale: ar })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setState(prev => ({ ...prev, selectedTransaction: transaction }));
                                  loadTransactionDetails(transaction.id);
                                }}
                              >
                                <Eye className="h-4 w-4 ml-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 ml-2" />
                                تحميل الإيصال
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {state.pagination && state.pagination.last_page > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    {t('showing')} {((state.pagination.current_page - 1) * state.pagination.per_page) + 1} {t('to')}{' '}
                    {Math.min(state.pagination.current_page * state.pagination.per_page, state.pagination.total)} {t('of')}{' '}
                    {state.pagination.total} {t('transactions_count')}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTransactions(state.pagination!.current_page - 1)}
                      disabled={state.pagination.current_page === 1 || state.loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                      {t('previous')}
                    </Button>
                    
                    <span className="text-sm text-muted-foreground">
                      {t('page')} {state.pagination.current_page} {t('of_pages')} {state.pagination.last_page}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadTransactions(state.pagination!.current_page + 1)}
                      disabled={state.pagination.current_page === state.pagination.last_page || state.loading}
                    >
                      {t('next')}
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={!!state.selectedTransaction} 
        onOpenChange={(open) => !open && setState(prev => ({ ...prev, selectedTransaction: null }))}
      >
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المعاملة</DialogTitle>
          </DialogHeader>
          
          {state.selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    معاملة رقم: {state.selectedTransaction.transaction_number}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(state.selectedTransaction.created_at), 'yyyy/MM/dd HH:mm', { locale: ar })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(state.selectedTransaction.status)}
                  {getTypeBadge(state.selectedTransaction.type)}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">نوع المحفظة</label>
                  <div className="mt-1">
                    {getWalletTypeBadge(state.selectedTransaction.wallet_type)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">الفئة</label>
                  <p className="mt-1 text-sm text-foreground">
                    {state.selectedTransaction.category_description || state.selectedTransaction.category}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">المبلغ الإجمالي</label>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {enhancedWalletService.formatCurrency(state.selectedTransaction.gross_amount)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">المبلغ الصافي</label>
                  <p className="mt-1 text-lg font-semibold text-success">
                    {enhancedWalletService.formatCurrency(state.selectedTransaction.net_amount)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">العمولة</label>
                  <p className="mt-1 text-sm text-warning">
                    {enhancedWalletService.formatCurrency(state.selectedTransaction.commission_amount)} 
                    ({state.selectedTransaction.commission_rate}%)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">الضريبة</label>
                  <p className="mt-1 text-sm text-destructive">
                    {enhancedWalletService.formatCurrency(state.selectedTransaction.tax_amount)} 
                    ({state.selectedTransaction.tax_rate}%)
                  </p>
                </div>
              </div>

              {/* Description */}
              {state.selectedTransaction.description && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">الوصف</label>
                  <p className="mt-1 text-sm text-foreground">
                    {state.selectedTransaction.description}
                  </p>
                </div>
              )}

              {/* Reference */}
              {state.selectedTransaction.reference_type && state.selectedTransaction.reference_id && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">المرجع</label>
                  <p className="mt-1 text-sm text-foreground">
                    {state.selectedTransaction.reference_type}: {state.selectedTransaction.reference_id}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { TransactionsTable }; 