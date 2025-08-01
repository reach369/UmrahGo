import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Banknote,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calculator,
  Receipt,
  FileText,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import enhancedWalletService, { DashboardData, WalletBalance } from '@/services/api/enhanced-wallet';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface WalletDashboardProps {
  dashboardData?: DashboardData | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

interface WalletCardProps {
  wallet: WalletBalance;
  type: 'cash' | 'online';
  showBalance: boolean;
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, type, showBalance, className }) => {
  const t = useTranslations('wallet');
  
  const typeConfig = {
    cash: {
      title: t('cashWallet'),
      icon: Banknote,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    online: {
      title: t('onlineWallet'),
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const config = typeConfig[type];

  return (
    <Card className={cn("relative overflow-hidden", config.borderColor, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {config.title}
          </CardTitle>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgColor)}>
            <config.icon className={cn("h-5 w-5", config.color)} />
          </div>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Badge 
            variant={wallet.is_active ? "default" : "secondary"}
            className={wallet.is_active ? "bg-green-100 text-green-800" : ""}
          >
            {wallet.is_active ? t('active') : t('inactive')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Main Balance */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{t('totalBalance')}</p>
            <p className="text-2xl font-bold text-gray-900">
              {showBalance ? wallet.formatted_balance : '••••••'}
            </p>
          </div>

          {/* Net Available Balance */}
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{t('availableBalance')}</p>
            <p className="text-xl font-semibold text-green-600">
              {showBalance ? wallet.formatted_net_balance : '••••••'}
            </p>
          </div>

          {/* Balance Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('totalEarnings')}</p>
              <p className="text-sm font-medium text-gray-900">
                {showBalance ? enhancedWalletService.formatCurrency(wallet.total_earned) : '••••'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">{t('totalWithdrawals')}</p>
              <p className="text-sm font-medium text-gray-900">
                {showBalance ? enhancedWalletService.formatCurrency(wallet.total_withdrawn) : '••••'}
              </p>
            </div>
          </div>

          {/* Deductions */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{t('transactions.commission')}</span>
              <span className="text-xs font-medium text-red-600">
                {showBalance ? enhancedWalletService.formatCurrency(wallet.total_commission_deducted) : '••••'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{t('transactions.tax')}</span>
              <span className="text-xs font-medium text-red-600">
                {showBalance ? enhancedWalletService.formatCurrency(wallet.total_tax_deducted) : '••••'}
              </span>
            </div>
          </div>

          {/* Progress Bar for Available vs Total */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">{t('availableBalance')} %</span>
              <span className="text-xs font-medium text-gray-700">
                {wallet.balance > 0 ? Math.round((wallet.net_available_balance / wallet.balance) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={wallet.balance > 0 ? (wallet.net_available_balance / wallet.balance) * 100 : 0}
              className="h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color, 
  bgColor, 
  description 
}) => {
  const t = useTranslations('wallet');
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-sm font-medium ml-1",
                  change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(change).toFixed(1)}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-gray-500 ml-2">{changeLabel}</span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className={cn("h-6 w-6", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WalletDashboard: React.FC<WalletDashboardProps> = ({ 
  dashboardData, 
  isRefreshing = false, 
  onRefresh 
}) => {
  const locale = useLocale();
  const t = useTranslations('wallet');
  const [localData, setLocalData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(!dashboardData);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  // Fetch data if not provided as prop
  const fetchDashboardData = async () => {
    if (dashboardData) return;
    
    try {
      setError(null);
      setLoading(true);
      const response = await enhancedWalletService.getDashboard();
      if (response.status === 'success') {
        setLocalData(response.data!);
      } else {
        setError(response.message || t('errors.loadingData'));
      }
    } catch (err) {
      setError(t('errors.connectionError'));
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dashboardData) {
      fetchDashboardData();
    } else {
      setLocalData(dashboardData);
      setLoading(false);
      setError(null);
    }
  }, [dashboardData]);

  const data = dashboardData || localData;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={onRefresh || fetchDashboardData}
      />
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('system.noData')}</p>
      </div>
    );
  }

  const { wallets, totals, rates } = data;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-primary">{t('dashboard.title')}</h2>
        <div className="flex gap-2">
          <Button onClick={onRefresh || fetchDashboardData} disabled={isRefreshing} variant="outline">
            {isRefreshing ? 
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :
              <RefreshCw className="h-4 w-4 mr-2" />
            }
            {t('dashboard.refresh')}
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Card */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-secondary flex items-center gap-2">
              <Wallet className="h-5 w-5" /> {t('dashboard.total_balance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={cn(
                "text-2xl font-bold transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {formatCurrency(totals.total_balance, locale)}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? 
                  <EyeOff className="h-4 w-4 text-muted-foreground" /> : 
                  <Eye className="h-4 w-4 text-muted-foreground" />
                }
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.after_deductions')}:
              <span className={cn(
                "font-semibold mr-1 transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {formatCurrency(totals.total_net_balance, locale)}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Commission Card */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-secondary flex items-center gap-2">
              <Percent className="h-5 w-5" /> {t('dashboard.commission')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rates.commission_rate}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.total_commission')}:
              <span className={cn(
                "font-semibold mr-1 transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {formatCurrency(totals.total_commission_deducted, locale)}
              </span>
            </p>
          </CardContent>
        </Card>
        
        {/* Tax Card */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-secondary flex items-center gap-2">
              <Calculator className="h-5 w-5" /> {t('dashboard.tax')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rates.tax_rate}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.total_tax')}:
              <span className={cn(
                "font-semibold mr-1 transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {formatCurrency(totals.total_tax_deducted, locale)}
              </span>
            </p>
          </CardContent>
        </Card>
        
        {/* Deductions Card */}
        <Card className="shadow-md transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-md text-secondary flex items-center gap-2">
              <Receipt className="h-5 w-5" /> {t('dashboard.deductions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rates.total_deduction_rate}%
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.total_deductions')}:
              <span className={cn(
                "font-semibold mr-1 transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {formatCurrency(totals.total_deductions, locale)}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Cash Wallet */}
        <Card className="shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="h-6 w-6 text-amber-600" />
                <span>{t('wallet.cash_wallet')}</span>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-100">
                {t('wallet.cash')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('wallet.balance')}</span>
              <span className={cn(
                "text-xl font-bold transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {wallets.cash ? formatCurrency(wallets.cash.balance, locale) : '0'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('wallet.commission_deducted')}</span>
                <span className={cn(
                  "font-medium text-rose-600 transition-all",
                  showBalance ? "blur-none" : "blur-md"
                )}>
                  - {wallets.cash ? formatCurrency(wallets.cash.total_commission_deducted, locale) : '0'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('wallet.tax_deducted')}</span>
                <span className={cn(
                  "font-medium text-rose-600 transition-all",
                  showBalance ? "blur-none" : "blur-md"
                )}>
                  - {wallets.cash ? formatCurrency(wallets.cash.total_tax_deducted, locale) : '0'}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('wallet.net_available')}</span>
                <span className={cn(
                  "text-xl font-bold text-green-600 transition-all",
                  showBalance ? "blur-none" : "blur-md"
                )}>
                  {wallets.cash ? formatCurrency(wallets.cash.net_available_balance, locale) : '0'}
                </span>
              </div>
            </div>
            
            {wallets.cash && (
              <div className="text-xs text-muted-foreground">
                {t('wallet.last_updated')}: {new Date(wallets.cash.last_transaction_at || Date.now()).toLocaleDateString(locale)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Online Wallet */}
        <Card className="shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span>{t('wallet.online_wallet')}</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
                {t('wallet.online')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('wallet.balance')}</span>
              <span className={cn(
                "text-xl font-bold transition-all",
                showBalance ? "blur-none" : "blur-md"
              )}>
                {wallets.online ? formatCurrency(wallets.online.balance, locale) : '0'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('wallet.commission_deducted')}</span>
                <span className={cn(
                  "font-medium text-rose-600 transition-all",
                  showBalance ? "blur-none" : "blur-md"
                )}>
                  - {wallets.online ? formatCurrency(wallets.online.total_commission_deducted, locale) : '0'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t('wallet.tax_deducted')}</span>
                <span className={cn(
                  "font-medium text-rose-600 transition-all",
                  showBalance ? "blur-none" : "blur-md"
                )}>
                  - {wallets.online ? formatCurrency(wallets.online.total_tax_deducted, locale) : '0'}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('wallet.net_available')}</span>
                <span className={cn(
                  "text-xl font-bold text-green-600 transition-all",
                  showBalance ? "blur-none" : "blur-md"
                )}>
                  {wallets.online ? formatCurrency(wallets.online.net_available_balance, locale) : '0'}
                </span>
              </div>
            </div>
            
            {wallets.online && (
              <div className="text-xs text-muted-foreground">
                {t('wallet.last_updated')}: {new Date(wallets.online.last_transaction_at || Date.now()).toLocaleDateString(locale)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informational Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">{t('dashboard.important_note')}</AlertTitle>
        <AlertDescription className="text-blue-700">
          {t('dashboard.commission_tax_notice', {
            commission: rates.commission_rate,
            tax: rates.tax_rate
          })}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export { WalletDashboard }; 