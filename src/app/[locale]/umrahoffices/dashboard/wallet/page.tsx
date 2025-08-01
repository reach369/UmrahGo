'use client';

/**
 * Enhanced Wallet Page - Umrah Offices
 * Professional wallet management with comprehensive features and error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Wallet,
  CreditCard,
  Download,
  RefreshCw,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
  Loader2,
  Banknote,
  BarChart3,
  PieChart,
  FileText,
  Activity,
  History
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Wallet Components
import { WalletDashboard } from '@/components/office/enhanced-wallet/WalletDashboard';
import { WalletStatistics } from '@/components/office/enhanced-wallet/WalletStatistics';
import { WithdrawalRequests } from '@/components/office/enhanced-wallet/WithdrawalRequests';
import { TransactionsTable } from '@/components/office/enhanced-wallet/TransactionsTable';
import { WalletReports } from '@/components/office/enhanced-wallet/WalletReports';
import { SystemStatus } from '@/components/office/enhanced-wallet/SystemStatus';
import { WalletDetailedView } from '@/components/office/enhanced-wallet/WalletDetailedView';

// Services
import enhancedWalletService, { 
  DashboardData, 
  WalletBalance, 
  WalletTransaction, 
  SystemStatus as SystemStatusType,
  ApiResponse 
} from '@/services/api/enhanced-wallet';

// Utils
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types
interface WalletPageState {
  dashboardData: DashboardData | null;
  systemStatus: SystemStatusType | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  showBalance: boolean;
  lastUpdated: Date | null;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  action: () => void;
  disabled?: boolean;
}

export default function WalletPage() {
  const t = useTranslations('wallet');
  
  // State management
  const [state, setState] = useState<WalletPageState>({
    dashboardData: null,
    systemStatus: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    showBalance: true,
    lastUpdated: null
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return enhancedWalletService.formatCurrency(amount);
  }, []);

  // Load wallet data with comprehensive error handling
  const loadWalletData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      } else {
        setState(prev => ({ ...prev, isRefreshing: true }));
      }

      // Parallel data fetching for better performance
      const [dashboardResponse, systemStatusResponse] = await Promise.allSettled([
        enhancedWalletService.getDashboard(),
        enhancedWalletService.getSystemStatus()
      ]);

      // Process dashboard data
      let dashboardData: DashboardData | null = null;
      let dashboardError: string | null = null;
      
      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value.status === 'success') {
        dashboardData = dashboardResponse.value.data!;
      } else if (dashboardResponse.status === 'rejected') {
        console.error('Dashboard fetch failed:', dashboardResponse.reason);
        dashboardError = t('error');
      }

      // Process system status
      let systemStatus: SystemStatusType | null = null;
      let systemError: string | null = null;
      
      if (systemStatusResponse.status === 'fulfilled' && systemStatusResponse.value.status === 'success') {
        systemStatus = systemStatusResponse.value.data!;
      } else if (systemStatusResponse.status === 'rejected') {
        console.error('System status fetch failed:', systemStatusResponse.reason);
        systemError = t('system.errorLoadingStatus');
      }

      // Determine overall error state
      const hasErrors = !dashboardData;
      const errorMessage = dashboardError || (hasErrors ? t('error') : null);

      setState(prev => ({
        ...prev,
        dashboardData,
        systemStatus,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage,
        lastUpdated: new Date()
      }));

      if (errorMessage) {
        toast.error(errorMessage);
      } else if (dashboardData) {
        if (!showLoading) {
          toast.success(t('notifications.balanceUpdated'));
        }
      }

    } catch (error) {
      console.error('Wallet data loading error:', error);
      const errorMessage = t('error');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage
      }));
      
      toast.error(errorMessage);
    }
  }, [t]);

  // Auto-refresh data
  useEffect(() => {
    loadWalletData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadWalletData(false);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadWalletData]);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: 'withdraw',
      title: t('actions.withdraw.title'),
      description: t('actions.withdraw.description'),
      icon: Download,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      action: () => setActiveTab('withdrawals'),
      disabled: !state.dashboardData?.wallets.cash.is_active && !state.dashboardData?.wallets.online.is_active
    },
    {
      id: 'transactions',
      title: t('actions.transactions.title'),
      description: t('actions.transactions.description'),
      icon: CreditCard,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      action: () => setActiveTab('transactions')
    },
    {
      id: 'reports',
      title: t('actions.reports.title'),
      description: t('actions.reports.description'),
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      action: () => setActiveTab('reports')
    },
    {
      id: 'statistics',
      title: t('actions.statistics.title'),
      description: t('actions.statistics.description'),
      icon: PieChart,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      action: () => setActiveTab('statistics')
    }
  ];

  // Toggle balance visibility
  const toggleBalanceVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showBalance: !prev.showBalance }));
  }, []);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    loadWalletData(false);
  }, [loadWalletData]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('loading')}</h3>
              <p className="text-muted-foreground">{t('please_wait')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.dashboardData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('error')}</h3>
              <p className="text-muted-foreground mb-4">{state.error}</p>
              <Button onClick={() => loadWalletData()} disabled={state.isRefreshing}>
                {state.isRefreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    {t('retrying')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 ml-2" />
                    {t('retry')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBalanceVisibility}
                className="flex items-center space-x-2 space-x-reverse"
              >
                {state.showBalance ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span>{state.showBalance ? t('balance.hide') : t('balance.show')}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={state.isRefreshing}
                className="flex items-center space-x-2 space-x-reverse"
              >
                <RefreshCw className={cn("h-4 w-4", state.isRefreshing && "animate-spin")} />
                <span>{t('refresh')}</span>
              </Button>
            </div>
          </div>

          {/* Last updated indicator */}
          {state.lastUpdated && (
            <div className="text-sm text-muted-foreground">
              {t('last_updated')} {format(state.lastUpdated, 'yyyy/MM/dd HH:mm', { locale: ar })}
            </div>
          )}
        </div>

        {/* System Status Alert */}
        {state.systemStatus && state.systemStatus.overall_health_percentage < 80 && (
          <Alert className="mb-6 border-warning bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-foreground">{t('system_warning')}</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {t('system_health')} {state.systemStatus.overall_health_percentage.toFixed(1)}%
              - {t('review_system_status')}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={action.disabled ? undefined : action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", action.bgColor)}>
                    <action.icon className={cn("h-6 w-6", action.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full flex-wrap md:flex-nowrap mb-4 overflow-x-auto gap-1 p-1 scrollbar-hide">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              <span>{t('tabs.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span>{t('tabs.transactions')}</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{t('tabs.withdrawals')}</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>{t('tabs.statistics')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{t('tabs.reports')}</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>{t('tabs.system')}</span>
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>{t('tabs.detailed')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <WalletDashboard 
              dashboardData={state.dashboardData}
              isRefreshing={state.isRefreshing}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionsTable />
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <WithdrawalRequests />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <WalletStatistics />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <WalletReports />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemStatus systemStatus={state.systemStatus} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Tabs defaultValue="cash">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="cash" className="flex items-center gap-1">
                  <Banknote className="h-4 w-4" />
                  <span>{t('cash_wallet')}</span>
                </TabsTrigger>
                <TabsTrigger value="online" className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span>{t('online_wallet')}</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="cash" className="pt-6">
                <WalletDetailedView 
                  walletType="cash"
                  showBalance={state.showBalance} 
                  onToggleBalance={toggleBalanceVisibility}
                />
              </TabsContent>
              <TabsContent value="online" className="pt-6">
                <WalletDetailedView 
                  walletType="online"
                  showBalance={state.showBalance} 
                  onToggleBalance={toggleBalanceVisibility}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 