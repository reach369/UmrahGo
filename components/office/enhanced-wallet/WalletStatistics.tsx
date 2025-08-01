'use client';

/**
 * Enhanced Wallet Statistics Component
 * Professional implementation with comprehensive error handling and data visualization
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Target,
  Percent
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Services & Types
import enhancedWalletService, { WalletStatistics as WalletStatisticsType } from '@/services/api/enhanced-wallet';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types
interface StatisticsPeriod {
  label: string;
  value: string;
  from: string;
  to: string;
}

interface StatisticsState {
  statistics: WalletStatisticsType | null;
  loading: boolean;
  error: string | null;
  period: StatisticsPeriod;
  customDateFrom: string;
  customDateTo: string;
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
  trend?: 'up' | 'down' | 'neutral';
}

interface ChartDataPoint {
  date: string;
  credits: number;
  debits: number;
  transactions: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  color, 
  bgColor, 
  description,
  trend = 'neutral'
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            
            {change !== undefined && (
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : trend === 'down' ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={cn(
                  "text-sm font-medium ml-1",
                  trend === 'up' ? "text-green-600" : 
                  trend === 'down' ? "text-red-600" : "text-gray-600"
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

const WalletStatistics: React.FC = () => {
  const t = useTranslations();

  // Predefined periods
  const periods: StatisticsPeriod[] = [
    {
      label: 'آخر 7 أيام',
      value: 'week',
      from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd')
    },
    {
      label: 'الشهر الحالي',
      value: 'month',
      from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    },
    {
      label: 'آخر 30 يوم',
      value: 'last30',
      from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd')
    },
    {
      label: 'آخر 3 شهور',
      value: 'quarter',
      from: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd')
    },
    {
      label: 'مخصص',
      value: 'custom',
      from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd')
    }
  ];

  // State
  const [state, setState] = useState<StatisticsState>({
    statistics: null,
    loading: true,
    error: null,
    period: periods[1], // Default to current month
    customDateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    customDateTo: format(new Date(), 'yyyy-MM-dd')
  });

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = {
        date_from: state.period.value === 'custom' ? state.customDateFrom : state.period.from,
        date_to: state.period.value === 'custom' ? state.customDateTo : state.period.to
      };

      const response = await enhancedWalletService.getStatistics(params);

      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          statistics: response.data!,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'خطأ في تحميل الإحصائيات',
          loading: false
        }));
      }
    } catch (error) {
      console.error('Statistics loading error:', error);
      setState(prev => ({
        ...prev,
        error: 'خطأ في الاتصال بالخادم',
        loading: false
      }));
    }
  }, [state.period, state.customDateFrom, state.customDateTo]);

  // Update period
  const updatePeriod = useCallback((periodValue: string) => {
    const period = periods.find(p => p.value === periodValue) || periods[0];
    setState(prev => ({ ...prev, period }));
  }, [periods]);

  // Apply custom date range
  const applyCustomRange = useCallback(() => {
    if (state.period.value === 'custom') {
      loadStatistics();
    }
  }, [state.period.value, loadStatistics]);

  // Format chart data
  const formatChartData = (dailyStats: any[]): ChartDataPoint[] => {
    return dailyStats.map(stat => ({
      date: stat.date,
      credits: stat.daily_credits || 0,
      debits: stat.daily_debits || 0,
      transactions: stat.daily_transactions || 0
    }));
  };

  // Calculate trend
  const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  // Get percentage change
  const getPercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Initial load and when period changes
  useEffect(() => {
    if (state.period.value !== 'custom') {
      loadStatistics();
    }
  }, [state.period]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إحصائيات المحفظة</h2>
          <p className="text-gray-600">تحليل مفصل لأداء المحفظة المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadStatistics}
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

      {/* Period Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            اختيار الفترة الزمنية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-48">
              <Label htmlFor="period">الفترة</Label>
              <Select value={state.period.value} onValueChange={updatePeriod}>
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {state.period.value === 'custom' && (
              <>
                <div>
                  <Label htmlFor="date-from">من تاريخ</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={state.customDateFrom}
                    onChange={(e) => setState(prev => ({ ...prev, customDateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">إلى تاريخ</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={state.customDateTo}
                    onChange={(e) => setState(prev => ({ ...prev, customDateTo: e.target.value }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={applyCustomRange}>
                    <Filter className="h-4 w-4 ml-2" />
                    تطبيق
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Period Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">الفترة المحددة: </span>
              {format(new Date(state.period.value === 'custom' ? state.customDateFrom : state.period.from), 'yyyy/MM/dd', { locale: ar })}
              {' إلى '}
              {format(new Date(state.period.value === 'custom' ? state.customDateTo : state.period.to), 'yyyy/MM/dd', { locale: ar })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-3 text-gray-600">جاري تحميل الإحصائيات...</span>
        </div>
      ) : state.error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{state.error}</div>
          <Button onClick={loadStatistics}>إعادة المحاولة</Button>
        </div>
      ) : !state.statistics ? (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد إحصائيات للعرض</p>
        </div>
      ) : (
        <>
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.statistics.overall && (
              <>
                <StatCard
                  title="إجمالي الأرباح"
                  value={enhancedWalletService.formatCurrency(state.statistics.overall.total_earnings || 0)}
                  icon={TrendingUp}
                  color="text-green-600"
                  bgColor="bg-green-50"
                  description="صافي الأرباح للفترة"
                  trend="up"
                />
                
                <StatCard
                  title="إجمالي المسحوبات"
                  value={enhancedWalletService.formatCurrency(state.statistics.overall.total_withdrawals || 0)}
                  icon={TrendingDown}
                  color="text-red-600"
                  bgColor="bg-red-50"
                  description="إجمالي المبالغ المسحوبة"
                  trend="down"
                />
                
                <StatCard 
                  title="عدد المعاملات"
                  value={(state.statistics.overall.total_transactions || 0).toLocaleString()}
                  icon={CreditCard}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                  description="جميع المعاملات"
                />
                
                <StatCard
                  title="متوسط قيمة المعاملة"
                  value={enhancedWalletService.formatCurrency(state.statistics.overall.average_transaction_amount || 0)}
                  icon={Target}
                  color="text-purple-600"
                  bgColor="bg-purple-50"
                  description="متوسط قيمة المعاملة الواحدة"
                />
              </>
            )}
          </div>

          {/* Wallet Type Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Wallet Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-green-600" />
                  إحصائيات المحفظة النقدية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.statistics.by_wallet_type?.cash ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">الأرباح</p>
                        <p className="text-lg font-semibold text-green-600">
                          {enhancedWalletService.formatCurrency(state.statistics.by_wallet_type.cash.total_earnings || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المعاملات</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {(state.statistics.by_wallet_type.cash.total_transactions || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد بيانات</p>
                )}
              </CardContent>
            </Card>

            {/* Online Wallet Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  إحصائيات المحفظة الإلكترونية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.statistics.by_wallet_type?.online ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">الأرباح</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {enhancedWalletService.formatCurrency(state.statistics.by_wallet_type.online.total_earnings || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المعاملات</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {(state.statistics.by_wallet_type.online.total_transactions || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">لا توجد بيانات</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {state.statistics.by_category && state.statistics.by_category.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  تحليل حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.statistics.by_category.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-sm text-gray-600">
                          {category.count} معاملة
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {enhancedWalletService.formatCurrency(category.total_gross || 0)}
                        </p>
                        <p className="text-sm text-green-600">
                          صافي: {enhancedWalletService.formatCurrency(category.total_net || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Trends */}
          {state.statistics.daily_stats && state.statistics.daily_stats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  الاتجاهات اليومية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="transactions">المعاملات</TabsTrigger>
                      <TabsTrigger value="credits">الإيداعات</TabsTrigger>
                      <TabsTrigger value="debits">السحوبات</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="transactions" className="space-y-4">
                      <div className="space-y-2">
                        {state.statistics.daily_stats.slice(-7).map((stat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">
                              {format(new Date(stat.date), 'MM/dd', { locale: ar })}
                            </span>
                            <span className="font-medium text-gray-900">
                              {stat.daily_transactions || 0} معاملة
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="credits" className="space-y-4">
                      <div className="space-y-2">
                        {state.statistics.daily_stats.slice(-7).map((stat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded">
                            <span className="text-sm text-gray-600">
                              {format(new Date(stat.date), 'MM/dd', { locale: ar })}
                            </span>
                            <span className="font-medium text-green-700">
                              {enhancedWalletService.formatCurrency(stat.daily_credits || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="debits" className="space-y-4">
                      <div className="space-y-2">
                        {state.statistics.daily_stats.slice(-7).map((stat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded">
                            <span className="text-sm text-gray-600">
                              {format(new Date(stat.date), 'MM/dd', { locale: ar })}
                            </span>
                            <span className="font-medium text-red-700">
                              {enhancedWalletService.formatCurrency(stat.daily_debits || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export { WalletStatistics }; 