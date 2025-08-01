import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  CreditCard,
  BarChart3,
  FileText,
  RefreshCw,
  Loader2,
  DollarSign,
  AlertCircle,
  EyeOff,
  Eye,
  PieChart,
  Target,
  Percent,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import enhancedWalletService, { WalletDetails } from '@/services/api/enhanced-wallet';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Add a safe format currency function
const formatCurrency = (amount: number | undefined | null, locale: string = 'ar-SA', currency: string = 'SAR'): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(0);
  }
  
  try {
    // Always use ar-SA instead of ar for currency formatting
    const actualLocale = locale === 'ar' ? 'ar-SA' : locale;
    return new Intl.NumberFormat(actualLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(Number(amount));
  } catch (error) {
    console.error('Currency formatting error:', error);
    // Fallback to a simpler format if Intl.NumberFormat fails
    return `${Number(amount).toFixed(2)} ${currency}`;
  }
};

interface WalletDetailedViewProps {
  walletType: 'cash' | 'online';
  showBalance?: boolean;
  onToggleBalance?: () => void;
}

export const WalletDetailedView: React.FC<WalletDetailedViewProps> = ({
  walletType,
  showBalance = true,
  onToggleBalance
}) => {
  const locale = useLocale();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('overview');
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wallet type colors
  const walletConfig = {
    cash: {
      title: t('wallet.cash_wallet'),
      icon: Banknote,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300'
    },
    online: {
      title: t('wallet.online_wallet'),
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300'
    }
  };

  const config = walletConfig[walletType];
  const Icon = config.icon;

  const loadWalletDetails = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      const response = await enhancedWalletService.getWalletDetails(walletType);
      if (response && response.status === 'success' && response.data) {
        setWalletDetails(response.data);
      } else {
        setError(response?.message || 'Failed to load wallet details');
      }
    } catch (err: any) {
      console.error('Error loading wallet details:', err);
      setError(err?.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletDetails();
  }, [walletType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={() => loadWalletDetails()}
      />
    );
  }

  if (!walletDetails) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('errors.no_data')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          <h2 className="text-2xl font-bold">{config.title}</h2>
        </div>
        <div className="flex gap-2">
          {onToggleBalance && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onToggleBalance}
            >
              {showBalance ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showBalance ? t('actions.hide_balance') : t('actions.show_balance')}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadWalletDetails(false)} 
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {t('actions.refresh')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="transactions">{t('tabs.transactions')}</TabsTrigger>
          <TabsTrigger value="accounting">{t('tabs.accounting')}</TabsTrigger>
          <TabsTrigger value="statistics">{t('tabs.statistics')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main wallet card */}
            <Card className={cn("shadow-md border-l-4", config.borderColor)}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-6 w-6", config.color)} />
                    <span>{config.title}</span>
                  </div>
                  <Badge 
                    variant={walletDetails?.wallet?.is_active ? "default" : "secondary"}
                    className={walletDetails?.wallet?.is_active ? "bg-green-100 text-green-800" : ""}
                  >
                    {walletDetails?.wallet?.is_active ? t('status.active') : t('status.inactive')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Balance */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('wallet.balance')}</p>
                  <p className={cn(
                    "text-2xl font-bold text-gray-900",
                    !showBalance && "blur-md"
                  )}>
                    {formatCurrency(walletDetails?.wallet?.balance, locale)}
                  </p>
                </div>

                {/* Deductions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.commission_deducted')}</p>
                    <p className={cn(
                      "text-sm font-medium text-red-600",
                      !showBalance && "blur-md"
                    )}>
                      - {formatCurrency(walletDetails?.wallet?.total_commission_deducted, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.tax_deducted')}</p>
                    <p className={cn(
                      "text-sm font-medium text-red-600",
                      !showBalance && "blur-md"
                    )}>
                      - {formatCurrency(walletDetails?.wallet?.total_tax_deducted, locale)}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Net Available Balance */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t('wallet.net_available')}</p>
                  <p className={cn(
                    "text-2xl font-bold text-green-600",
                    !showBalance && "blur-md"
                  )}>
                    {formatCurrency(walletDetails?.wallet?.net_available_balance, locale)}
                  </p>
                </div>

                {/* Balance Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.total_earned')}</p>
                    <p className={cn(
                      "text-sm font-medium text-gray-900",
                      !showBalance && "blur-md"
                    )}>
                      {formatCurrency(walletDetails?.wallet?.total_earned, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.total_withdrawn')}</p>
                    <p className={cn(
                      "text-sm font-medium text-gray-900",
                      !showBalance && "blur-md"
                    )}>
                      {formatCurrency(walletDetails?.wallet?.total_withdrawn, locale)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar for Available vs Total */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">{t('wallet.available_ratio')}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {(walletDetails?.wallet?.balance || 0) > 0 ? 
                        Math.round(((walletDetails?.wallet?.net_available_balance || 0) / walletDetails?.wallet?.balance) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={(walletDetails?.wallet?.balance || 0) > 0 ? 
                      ((walletDetails?.wallet?.net_available_balance || 0) / walletDetails?.wallet?.balance) * 100 : 0}
                    className="h-2"
                  />
                </div>

                {/* Last Transaction */}
                <div className="text-xs text-gray-500">
                  {t('wallet.last_transaction')}: {
                    walletDetails?.wallet?.last_transaction_at ? 
                    format(new Date(walletDetails.wallet.last_transaction_at), 'yyyy/MM/dd HH:mm', { locale: ar }) :
                    t('wallet.no_transactions')
                  }
                </div>
              </CardContent>
            </Card>

            {/* Monthly Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gray-600" />
                    <span>{t('wallet.monthly_summary')}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.transactions_count')}</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {walletDetails?.monthly_summary?.transactions_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.month_credits')}</p>
                    <p className={cn(
                      "text-xl font-semibold text-green-600",
                      !showBalance && "blur-md"
                    )}>
                      {formatCurrency(walletDetails?.monthly_summary?.total_credits || 0, locale)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.month_debits')}</p>
                    <p className={cn(
                      "text-xl font-semibold text-red-600",
                      !showBalance && "blur-md"
                    )}>
                      {formatCurrency(walletDetails?.monthly_summary?.total_debits || 0, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{t('wallet.month_deductions')}</p>
                    <p className={cn(
                      "text-xl font-semibold text-amber-600",
                      !showBalance && "blur-md"
                    )}>
                      {formatCurrency(
                        (walletDetails?.monthly_summary?.total_commission || 0) + 
                        (walletDetails?.monthly_summary?.total_tax || 0), 
                        locale
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t('wallet.month_by_category')}</p>
                  <div className="space-y-2">
                    {walletDetails?.category_summary && walletDetails.category_summary.map((category, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm">{t(`categories.${category?.category}`) || category?.category || 'Unknown'}</span>
                        <span className={cn(
                          "text-sm font-medium",
                          !showBalance && "blur-md"
                        )}>
                          {formatCurrency(category?.total_amount || 0, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span>{t('wallet.recent_transactions')}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletDetails?.recent_transactions && walletDetails.recent_transactions.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {walletDetails.recent_transactions.map((transaction, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium">
                              {transaction?.type === 'credit' ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500 inline mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-500 inline mr-1" />
                              )}
                              {t(`categories.${transaction?.category}`) || transaction?.category || 'Transaction'}
                            </p>
                            <p className="text-xs text-gray-500">{transaction?.processed_at || '-'}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-semibold",
                              transaction?.type === 'credit' ? 'text-green-600' : 'text-red-600',
                              !showBalance && "blur-md"
                            )}>
                              {transaction?.type === 'credit' ? '+' : '-'} {transaction?.amount || '0'}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {transaction?.transaction_number || '-'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{transaction?.description || '-'}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertDescription>
                    {t('wallet.no_recent_transactions')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <span>{t('wallet.accounting_entries')}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletDetails?.accounting_entries && walletDetails.accounting_entries.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-600">{t('accounting.entry_number')}</th>
                        <th className="text-left py-2 font-medium text-gray-600">{t('accounting.type')}</th>
                        <th className="text-left py-2 font-medium text-gray-600">{t('accounting.account')}</th>
                        <th className="text-right py-2 font-medium text-gray-600">{t('accounting.debit')}</th>
                        <th className="text-right py-2 font-medium text-gray-600">{t('accounting.credit')}</th>
                        <th className="text-right py-2 font-medium text-gray-600">{t('accounting.date')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletDetails.accounting_entries.map((entry, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{entry?.entry_number || '-'}</td>
                          <td className="py-2 text-sm">{entry?.entry_type_arabic || entry?.entry_type || '-'}</td>
                          <td className="py-2 text-sm">{entry?.account_name || '-'}</td>
                          <td className={cn(
                            "py-2 text-sm text-right", 
                            (entry?.debit_amount || 0) > 0 ? "text-red-600 font-medium" : "",
                            !showBalance && (entry?.debit_amount || 0) > 0 && "blur-md"
                          )}>
                            {entry?.debit_amount || '-'}
                          </td>
                          <td className={cn(
                            "py-2 text-sm text-right", 
                            (entry?.credit_amount || 0) > 0 ? "text-green-600 font-medium" : "",
                            !showBalance && (entry?.credit_amount || 0) > 0 && "blur-md"
                          )}>
                            {entry?.credit_amount || '-'}
                          </td>
                          <td className="py-2 text-sm text-right">{entry?.posted_at || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertDescription>
                    {t('accounting.no_entries')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="pt-4">
          {/* Updated statistics content with charts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <span>{t('wallet.statistics_and_charts')}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monthly Balance Trend */}
              <div>
                <h3 className="text-base font-medium mb-3">{t('wallet.monthly_balance_trend')}</h3>
                <div className="h-[200px] bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Placeholder for chart - actual chart integration would be here */}
                      <div className="flex flex-col items-center">
                        <BarChart3 className="h-12 w-12 text-blue-300 mb-2" />
                        <p className="text-sm text-gray-500">{t('wallet.balance_visualization')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium mb-3">{t('wallet.transaction_distribution')}</h3>
                  <div className="h-[200px] bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Placeholder for chart */}
                        <div className="flex flex-col items-center">
                          <PieChart className="h-12 w-12 text-purple-300 mb-2" />
                          <p className="text-sm text-gray-500">{t('wallet.category_distribution')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Comparison */}
                <div>
                  <h3 className="text-base font-medium mb-3">{t('wallet.monthly_comparison')}</h3>
                  <div className="h-[200px] bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Placeholder for chart */}
                        <div className="flex flex-col items-center">
                          <BarChart3 className="h-12 w-12 text-green-300 mb-2" />
                          <p className="text-sm text-gray-500">{t('wallet.performance_comparison')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div>
                <h3 className="text-base font-medium mb-3">{t('wallet.key_indicators')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{t('wallet.average_transaction')}</p>
                          <p className={cn(
                            "text-lg font-semibold",
                            !showBalance && "blur-md"
                          )}>
                            {walletDetails?.monthly_summary?.transactions_count > 0 
                              ? formatCurrency((walletDetails?.monthly_summary?.total_credits || 0) / walletDetails?.monthly_summary?.transactions_count, locale)
                              : formatCurrency(0, locale)}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{t('wallet.deduction_rate')}</p>
                          <p className="text-lg font-semibold">
                            {walletDetails?.monthly_summary?.total_credits > 0 
                              ? `${((walletDetails?.monthly_summary?.total_commission || 0) / walletDetails?.monthly_summary?.total_credits * 100).toFixed(1)}%`
                              : '0.0%'}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-rose-100 rounded-full flex items-center justify-center">
                          <Percent className="h-5 w-5 text-rose-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{t('wallet.activity_frequency')}</p>
                          <p className="text-lg font-semibold">
                            {`${walletDetails?.monthly_summary?.transactions_count || 0} / ${t('wallet.day')}`}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 