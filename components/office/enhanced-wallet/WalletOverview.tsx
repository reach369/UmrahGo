import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Banknote,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Services & Types
import enhancedWalletService, { DashboardData } from '@/services/api/enhanced-wallet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types
interface WalletOverviewProps {
  showBalance?: boolean;
  compact?: boolean;
  refreshInterval?: number;
  onWalletClick?: () => void;
  className?: string;
}

interface WalletOverviewState {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface QuickStatProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
  showBalance: boolean;
}

const QuickStat: React.FC<QuickStatProps> = ({ 
  label, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color, 
  showBalance 
}) => {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center bg-gray-50")}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            {showBalance ? value : '••••••'}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {change >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                "text-xs font-medium mr-1",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {Math.abs(change).toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500 mr-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WalletOverview: React.FC<WalletOverviewProps> = ({ 
  showBalance = true,
  compact = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  onWalletClick,
  className
}) => {
  const t = useTranslations();

  // State
  const [state, setState] = useState<WalletOverviewState>({
    dashboardData: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [localShowBalance, setLocalShowBalance] = useState(showBalance);

  // Load dashboard data
  const loadDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await enhancedWalletService.getDashboard();

      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          dashboardData: response.data!,
          loading: false,
          error: null,
          lastUpdated: new Date()
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'خطأ في تحميل بيانات المحفظة',
          loading: false
        }));
      }
    } catch (error) {
      console.error('Dashboard loading error:', error);
      setState(prev => ({
        ...prev,
        error: 'خطأ في الاتصال بالخادم',
        loading: false
      }));
    }
  }, []);

  // Toggle balance visibility
  const toggleBalanceVisibility = useCallback(() => {
    setLocalShowBalance(prev => !prev);
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  // Initial load and auto-refresh
  useEffect(() => {
    loadDashboardData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        loadDashboardData(false);
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [loadDashboardData, refreshInterval]);

  // Update local show balance when prop changes
  useEffect(() => {
    setLocalShowBalance(showBalance);
  }, [showBalance]);

  if (state.loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="mr-3 text-gray-600">جاري تحميل المحفظة...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">خطأ في تحميل المحفظة</AlertTitle>
            <AlertDescription className="text-red-700">
              {state.error}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={() => loadDashboardData()}>
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!state.dashboardData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            لا توجد بيانات محفظة
          </div>
        </CardContent>
      </Card>
    );
  }

  const { wallets, totals, rates, monthly_stats } = state.dashboardData;

  if (compact) {
    return (
      <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)} onClick={onWalletClick}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Wallet className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">المحفظة</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBalanceVisibility();
                }}
                className="h-6 w-6 p-0"
              >
                {localShowBalance ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">إجمالي الرصيد</span>
              <span className="text-sm font-bold text-gray-900">
                {localShowBalance ? totals.formatted_total_balance : '••••••'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">صافي المتاح</span>
              <span className="text-sm font-semibold text-green-600">
                {localShowBalance ? totals.formatted_total_net_balance : '••••••'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">معاملات الشهر</span>
              <span className="text-sm font-medium text-blue-600">
                {monthly_stats.transactions_count.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-3 flex space-x-2 space-x-reverse">
            <div className={cn(
              "flex-1 h-2 rounded-full",
              wallets.cash.is_active ? "bg-green-100" : "bg-gray-100"
            )}>
              <div 
                className={cn(
                  "h-full rounded-full",
                  wallets.cash.is_active ? "bg-green-500" : "bg-gray-300"
                )}
                style={{ width: `${wallets.cash.is_active ? 100 : 0}%` }}
              />
            </div>
            <div className={cn(
              "flex-1 h-2 rounded-full",
              wallets.online.is_active ? "bg-blue-100" : "bg-gray-100"
            )}>
              <div 
                className={cn(
                  "h-full rounded-full",
                  wallets.online.is_active ? "bg-blue-500" : "bg-gray-300"
                )}
                style={{ width: `${wallets.online.is_active ? 100 : 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            نظرة عامة على المحفظة
          </CardTitle>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBalanceVisibility}
            >
              {localShowBalance ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Balance Display */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">إجمالي الرصيد</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {localShowBalance ? totals.formatted_total_balance : '••••••••'}
          </p>
          <p className="text-lg text-green-600">
            صافي المتاح: {localShowBalance ? totals.formatted_total_net_balance : '••••••••'}
          </p>
        </div>

        {/* Wallet Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">المحفظة النقدية</p>
            <p className="text-lg font-bold text-green-600">
              {localShowBalance ? wallets.cash.formatted_balance : '••••••'}
            </p>
            <Badge 
              variant={wallets.cash.is_active ? "default" : "secondary"}
              className={wallets.cash.is_active ? "bg-green-100 text-green-800" : ""}
            >
              {wallets.cash.is_active ? 'نشطة' : 'غير نشطة'}
            </Badge>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">المحفظة الإلكترونية</p>
            <p className="text-lg font-bold text-blue-600">
              {localShowBalance ? wallets.online.formatted_balance : '••••••'}
            </p>
            <Badge 
              variant={wallets.online.is_active ? "default" : "secondary"}
              className={wallets.online.is_active ? "bg-blue-100 text-blue-800" : ""}
            >
              {wallets.online.is_active ? 'نشطة' : 'غير نشطة'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <QuickStat
            label="أرباح الشهر"
            value={enhancedWalletService.formatCurrency(monthly_stats.earnings)}
            icon={TrendingUp}
            color="text-green-600"
            showBalance={localShowBalance}
          />
          
          <QuickStat
            label="مسحوبات الشهر"
            value={enhancedWalletService.formatCurrency(monthly_stats.withdrawals)}
            icon={TrendingDown}
            color="text-red-600"
            showBalance={localShowBalance}
          />
          
          <QuickStat
            label="عدد المعاملات"
            value={monthly_stats.transactions_count.toLocaleString()}
            icon={CreditCard}
            color="text-blue-600"
            showBalance={true} // Always show transaction count
          />
        </div>

        {/* Deduction Summary */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">ملخص الخصومات</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600">العمولة ({rates.commission_rate}%)</p>
              <p className="text-sm font-semibold text-orange-600">
                {localShowBalance ? enhancedWalletService.formatCurrency(totals.total_commission_deducted) : '••••••'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">الضريبة ({rates.tax_rate}%)</p>
              <p className="text-sm font-semibold text-red-600">
                {localShowBalance ? enhancedWalletService.formatCurrency(totals.total_tax_deducted) : '••••••'}
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {state.lastUpdated && (
          <div className="text-center text-xs text-gray-500">
            آخر تحديث: {format(state.lastUpdated, 'HH:mm:ss', { locale: ar })}
          </div>
        )}

        {/* Action Button */}
        {onWalletClick && (
          <Button onClick={onWalletClick} className="w-full">
            عرض التفاصيل الكاملة
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export { WalletOverview }; 