'use client';

/**
 * Enhanced Withdrawal Requests Component
 * Professional implementation with comprehensive error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  Plus,
  Eye,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
  DollarSign,
  Building,
  CreditCard,
  FileText,
  Loader2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Services & Types
import enhancedWalletService, { WithdrawalRequest, DashboardData, ApiResponse } from '@/services/api/enhanced-wallet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form Schema
const withdrawalSchema = z.object({
  amount: z.number().min(1, 'المبلغ مطلوب').max(1000000, 'المبلغ كبير جداً'),
  bank_name: z.string().min(1, 'اسم البنك مطلوب'),
  account_number: z.string().min(1, 'رقم الحساب مطلوب'),
  iban: z.string().min(24, 'رقم الآيبان غير صحيح').max(34, 'رقم الآيبان غير صحيح'),
  swift_code: z.string().optional(),
  account_holder_name: z.string().min(1, 'اسم صاحب الحساب مطلوب'),
  bank_branch: z.string().optional(),
  notes: z.string().optional(),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

// Types
interface WithdrawalState {
  requests: WithdrawalRequest[];
  loading: boolean;
  error: string | null;
  selectedRequest: WithdrawalRequest | null;
  dashboardData: DashboardData | null;
  submitting: boolean;
}

const WithdrawalRequests: React.FC = () => {
  const t = useTranslations('wallet');

  // State
  const [state, setState] = useState<WithdrawalState>({
    requests: [],
    loading: true,
    error: null,
    selectedRequest: null,
    dashboardData: null,
    submitting: false
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Form
  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      bank_name: '',
      account_number: '',
      iban: '',
      swift_code: '',
      account_holder_name: '',
      bank_branch: '',
      notes: '',
    },
  });

  // Load withdrawal requests
  const loadWithdrawalRequests = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [requestsResponse, dashboardResponse] = await Promise.allSettled([
        enhancedWalletService.getWithdrawalRequests(),
        enhancedWalletService.getDashboard()
      ]);

      let requests: WithdrawalRequest[] = [];
      let dashboardData: DashboardData | null = null;
      let error: string | null = null;

      if (requestsResponse.status === 'fulfilled' && requestsResponse.value.status === 'success') {
        requests = requestsResponse.value.data || [];
      } else {
        error = t('withdrawals.errorLoadingWithdrawals');
      }

      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value.status === 'success') {
        dashboardData = dashboardResponse.value.data!;
      }

      setState(prev => ({
        ...prev,
        requests,
        dashboardData,
        loading: false,
        error
      }));

    } catch (error) {
      console.error('Withdrawal requests loading error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: t('errors.connectionError')
      }));
    }
  }, []);

  // Create withdrawal request
  const createWithdrawalRequest = useCallback(async (data: WithdrawalFormData) => {
    try {
      setState(prev => ({ ...prev, submitting: true }));

      const response = await enhancedWalletService.createWithdrawalRequest(data);

      if (response.status === 'success') {
        toast.success(t('withdrawals.requestSuccess'));
        setShowCreateDialog(false);
        form.reset();
        loadWithdrawalRequests(); // Reload the list
      } else {
        toast.error(response.message || t('withdrawals.requestError'));
      }
    } catch (error) {
      console.error('Withdrawal creation error:', error);
      toast.error(t('withdrawals.requestError'));
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  }, [form, loadWithdrawalRequests]);

  // Cancel withdrawal request
  const cancelWithdrawalRequest = useCallback(async (requestId: number) => {
    try {
      const response = await enhancedWalletService.cancelWithdrawalRequest(requestId);

      if (response.status === 'success') {
        toast.success(t('withdrawals.cancelSuccess'));
        loadWithdrawalRequests(); // Reload the list
      } else {
        toast.error(response.message || t('withdrawals.cancelError'));
      }
    } catch (error) {
      console.error('Withdrawal cancellation error:', error);
      toast.error(t('withdrawals.cancelError'));
    }
  }, [loadWithdrawalRequests]);

  // Load withdrawal details
  const loadWithdrawalDetails = useCallback(async (requestId: number) => {
    try {
      const response = await enhancedWalletService.getWithdrawalDetails(requestId);
      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          selectedRequest: response.data!
        }));
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error('Withdrawal details loading error:', error);
      toast.error(t('errors.loadingData'));
    }
  }, []);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: t('withdrawals.status_pending'), 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock 
      },
      approved: { 
        label: t('withdrawals.status_approved'), 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle 
      },
      processed: { 
        label: t('withdrawals.status_processed'), 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle 
      },
      rejected: { 
        label: t('withdrawals.status_rejected'), 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: X 
      },
      cancelled: { 
        label: t('withdrawals.status_cancelled'), 
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Ban 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={cn('flex items-center gap-1', config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Check if user can create withdrawal
  const canCreateWithdrawal = () => {
    if (!state.dashboardData) return false;
    
    const { wallets } = state.dashboardData;
    const totalAvailable = wallets.cash.net_available_balance + wallets.online.net_available_balance;
    
    return totalAvailable > 0 && (wallets.cash.is_active || wallets.online.is_active);
  };

  // Get available balance for withdrawal
  const getAvailableBalance = () => {
    if (!state.dashboardData) return 0;
    
    const { wallets } = state.dashboardData;
    return wallets.cash.net_available_balance + wallets.online.net_available_balance;
  };

  // Initial load
  useEffect(() => {
    loadWithdrawalRequests();
  }, [loadWithdrawalRequests]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('withdrawals.title')}</h2>
          <p className="text-gray-600">{t('withdrawals.history')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadWithdrawalRequests}
            disabled={state.loading}
          >
            <RefreshCw className={cn("h-4 w-4 ml-2", state.loading && "animate-spin")} />
            {t('refresh')}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button disabled={!canCreateWithdrawal()}>
                <Plus className="h-4 w-4 ml-2" />
                {t('withdrawals.newRequest')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>{t('withdrawals.newRequest')}</DialogTitle>
              </DialogHeader>

              {/* Available Balance Alert */}
              <Alert className="border-blue-200 bg-blue-50">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">{t('availableBalance')}</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {enhancedWalletService.formatCurrency(getAvailableBalance())}
                </AlertDescription>
              </Alert>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(createWithdrawalRequest)} className="space-y-6">
                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('withdrawals.amount')} *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder={t('withdrawals.amount')}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          الحد الأقصى: {enhancedWalletService.formatCurrency(getAvailableBalance())}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Details Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('bankDetails.title')}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bank Name */}
                      <FormField
                        control={form.control}
                        name="bank_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('bankDetails.bankName')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('bankDetails.bankName')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Account Holder Name */}
                      <FormField
                        control={form.control}
                        name="account_holder_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('bankDetails.accountHolder')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('bankDetails.accountHolder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Account Number */}
                      <FormField
                        control={form.control}
                        name="account_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('bankDetails.accountNumber')} *</FormLabel>
                            <FormControl>
                              <Input placeholder={t('bankDetails.accountNumber')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* IBAN */}
                      <FormField
                        control={form.control}
                        name="iban"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('bankDetails.iban')} *</FormLabel>
                            <FormControl>
                              <Input placeholder="SA0380000000608010167519" {...field} />
                            </FormControl>
                            <FormDescription>
                              يجب أن يبدأ بـ SA ويكون 24 رقم
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* SWIFT Code */}
                      <FormField
                        control={form.control}
                        name="swift_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('bankDetails.swiftCode')} ({t('optional')})</FormLabel>
                            <FormControl>
                              <Input placeholder="NCBKSARI" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Bank Branch */}
                      <FormField
                        control={form.control}
                        name="bank_branch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('withdrawals.bankBranch')} ({t('optional')})</FormLabel>
                            <FormControl>
                              <Input placeholder="فرع الرياض الرئيسي" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('withdrawals.notes')} ({t('optional')})</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أي ملاحظات إضافية حول طلب السحب"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                      disabled={state.submitting}
                    >
                      {t('withdrawals.cancel')}
                    </Button>
                    <Button type="submit" disabled={state.submitting}>
                      {state.submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          {t('submitting')}...
                        </>
                      ) : (
                        t('withdrawals.submit')
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Warning for inactive wallets */}
      {!canCreateWithdrawal() && state.dashboardData && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">تحذير</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {getAvailableBalance() === 0 
              ? 'لا يوجد رصيد متاح للسحب في المحافظ'
              : 'جميع المحافظ غير نشطة حالياً'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Withdrawal Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('withdrawals.history')}
            {state.requests.length > 0 && (
              <span className="text-sm font-normal text-gray-500 mr-2">
                ({state.requests.length} طلب)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="mr-3 text-gray-600">{t('withdrawals.loadingWithdrawals')}</span>
            </div>
          ) : state.error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{state.error}</div>
              <Button onClick={loadWithdrawalRequests}>{t('retry')}</Button>
            </div>
          ) : state.requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('withdrawals.noWithdrawals')}</p>
              <p className="text-gray-500 text-sm">{t('create_new_to_start')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('withdrawals.amount')}</TableHead>
                    <TableHead>{t('withdrawals.bankName')}</TableHead>
                    <TableHead>{t('withdrawals.accountNumber')}</TableHead>
                    <TableHead>{t('withdrawals.status')}</TableHead>
                    <TableHead>{t('withdrawals.requestDate')}</TableHead>
                    <TableHead>{t('withdrawals.processDate')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">
                          {enhancedWalletService.formatCurrency(request.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {request.bank_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {request.account_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {format(new Date(request.requested_at), 'yyyy/MM/dd HH:mm', { locale: ar })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.processed_at ? (
                          <div className="text-sm text-gray-600">
                            {format(new Date(request.processed_at), 'yyyy/MM/dd HH:mm', { locale: ar })}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadWithdrawalDetails(request.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {(request.status === 'pending' || request.status === 'approved') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelWithdrawalRequest(request.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب السحب</DialogTitle>
          </DialogHeader>
          
          {state.selectedRequest && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">
                    طلب سحب #{state.selectedRequest.id}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {format(new Date(state.selectedRequest.requested_at), 'yyyy/MM/dd HH:mm', { locale: ar })}
                  </p>
                </div>
                <div>
                  {getStatusBadge(state.selectedRequest.status)}
                </div>
              </div>

              {/* Amount & Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">مبلغ السحب</label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {enhancedWalletService.formatCurrency(state.selectedRequest.amount)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">الرصيد المتاح وقت الطلب</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {enhancedWalletService.formatCurrency(state.selectedRequest.available_balance)}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">بيانات البنك</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">اسم البنك</label>
                    <p className="mt-1 text-sm text-gray-900">{state.selectedRequest.bank_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">اسم صاحب الحساب</label>
                    <p className="mt-1 text-sm text-gray-900">{state.selectedRequest.account_holder_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">رقم الحساب</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{state.selectedRequest.account_number}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">رقم الآيبان</label>
                    <p className="mt-1 text-sm font-mono text-gray-900">{state.selectedRequest.iban}</p>
                  </div>
                  
                  {state.selectedRequest.swift_code && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">كود السويفت</label>
                      <p className="mt-1 text-sm font-mono text-gray-900">{state.selectedRequest.swift_code}</p>
                    </div>
                  )}
                  
                  {state.selectedRequest.bank_branch && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">الفرع</label>
                      <p className="mt-1 text-sm text-gray-900">{state.selectedRequest.bank_branch}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {state.selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">ملاحظات المكتب</label>
                  <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded">
                    {state.selectedRequest.notes}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {state.selectedRequest.admin_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">ملاحظات الإدارة</label>
                  <p className="mt-1 text-sm text-gray-900 p-3 bg-blue-50 rounded border-blue-200">
                    {state.selectedRequest.admin_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                {(state.selectedRequest.status === 'pending' || state.selectedRequest.status === 'approved') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      cancelWithdrawalRequest(state.selectedRequest!.id);
                      setShowDetailsDialog(false);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 ml-2" />
                    إلغاء الطلب
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { WithdrawalRequests }; 