import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  RefreshCw,
  Printer,
  Mail,
  Share2,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  TrendingUp,
  DollarSign,
  Receipt,
  Calculator,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

// Services & Types
import enhancedWalletService from '@/services/api/enhanced-wallet';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth, formatDate } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types
interface ReportConfig {
  type: 'comprehensive' | 'transactions' | 'financial' | 'tax';
  format: 'pdf' | 'excel';
  date_from: string;
  date_to: string;
  include_transactions: boolean;
  include_charts: boolean;
  include_breakdown: boolean;
  include_summaries: boolean;
}

interface ReportState {
  comprehensiveReport: any | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
  config: ReportConfig;
}

interface QuickReportProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ReportSummaryCardProps {
  title: string;
  data: any;
  icon: React.ElementType;
  color: string;
}

const QuickReport: React.FC<QuickReportProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  bgColor, 
  onClick, 
  disabled = false 
}) => {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className={cn("h-6 w-6", color)} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({ title, data, icon: Icon, color }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-lg font-bold text-gray-900">
              {typeof data === 'number' ? enhancedWalletService.formatCurrency(data) : data}
            </p>
          </div>
          <Icon className={cn("h-8 w-8", color)} />
        </div>
      </CardContent>
    </Card>
  );
};

const WalletReports: React.FC = () => {
  const t = useTranslations();

  // State
  const [state, setState] = useState<ReportState>({
    comprehensiveReport: null,
    loading: false,
    error: null,
    generating: false,
    config: {
      type: 'comprehensive',
      format: 'pdf',
      date_from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      date_to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      include_transactions: true,
      include_charts: true,
      include_breakdown: true,
      include_summaries: true
    }
  });

  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false);

  // Load comprehensive report data
  const loadComprehensiveReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await enhancedWalletService.getComprehensiveReport({
        date_from: state.config.date_from,
        date_to: state.config.date_to
      });

      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          comprehensiveReport: response.data,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'خطأ في تحميل التقرير',
          loading: false
        }));
      }
    } catch (error) {
      console.error('Report loading error:', error);
      setState(prev => ({
        ...prev,
        error: 'خطأ في الاتصال بالخادم',
        loading: false
      }));
    }
  }, [state.config.date_from, state.config.date_to]);

  // Generate custom report
  const generateReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, generating: true }));

      const response = await enhancedWalletService.exportReport(state.config);

      if (response.status === 'success') {
        toast.success('تم إنشاء التقرير بنجاح');
        setShowCustomReportDialog(false);
        
        // If the response contains a download URL, trigger download
        if (response.data?.download_url) {
          window.open(response.data.download_url, '_blank');
        }
      } else {
        toast.error(response.message || 'فشل في إنشاء التقرير');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('خطأ في إنشاء التقرير');
    } finally {
      setState(prev => ({ ...prev, generating: false }));
    }
  }, [state.config]);

  // Quick report generators
  const generateQuickReport = useCallback(async (type: string, format: 'pdf' | 'excel' = 'pdf') => {
    try {
      setState(prev => ({ ...prev, generating: true }));

      const config = {
        type: type as any,
        format: format as any,
        date_from: formatDate(startOfMonth(new Date()), 'yyyy-MM-dd'),
        date_to: formatDate(endOfMonth(new Date()), 'yyyy-MM-dd'),
        include_transactions: true,
        include_charts: true,
        include_breakdown: true,
        include_summaries: true
      };

      const response = await enhancedWalletService.exportReport(config);

      if (response.status === 'success') {
        toast.success(`تم إنشاء تقرير ${type} بنجاح`);
        
        if (response.data?.download_url) {
          window.open(response.data.download_url, '_blank');
        }
      } else {
        toast.error(response.message || 'فشل في إنشاء التقرير');
      }
    } catch (error) {
      console.error('Quick report generation error:', error);
      toast.error('خطأ في إنشاء التقرير');
    } finally {
      setState(prev => ({ ...prev, generating: false }));
    }
  }, []);

  // Update config
  const updateConfig = useCallback((key: keyof ReportConfig, value: any) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  }, []);

  // Initial load
  useEffect(() => {
    loadComprehensiveReport();
  }, []);

  // Load when date range changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadComprehensiveReport();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state.config.date_from, state.config.date_to]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقارير المالية</h2>
          <p className="text-gray-600">تقارير شاملة ومفصلة للمحفظة المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadComprehensiveReport}
            disabled={state.loading}
          >
            <RefreshCw className={cn("h-4 w-4 ml-2", state.loading && "animate-spin")} />
            تحديث
          </Button>
          <Dialog open={showCustomReportDialog} onOpenChange={setShowCustomReportDialog}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 ml-2" />
                تقرير مخصص
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء تقرير مخصص</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Report Type */}
                <div>
                  <Label>نوع التقرير</Label>
                  <Select 
                    value={state.config.type} 
                    onValueChange={(value) => updateConfig('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">تقرير شامل</SelectItem>
                      <SelectItem value="transactions">تقرير المعاملات</SelectItem>
                      <SelectItem value="financial">تقرير مالي</SelectItem>
                      <SelectItem value="tax">تقرير ضريبي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format */}
                <div>
                  <Label>صيغة التقرير</Label>
                  <Select 
                    value={state.config.format} 
                    onValueChange={(value) => updateConfig('format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>من تاريخ</Label>
                    <Input
                      type="date"
                      value={state.config.date_from}
                      onChange={(e) => updateConfig('date_from', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>إلى تاريخ</Label>
                    <Input
                      type="date"
                      value={state.config.date_to}
                      onChange={(e) => updateConfig('date_to', e.target.value)}
                    />
                  </div>
                </div>

                {/* Options */}
                <div>
                  <Label className="text-base font-medium">خيارات التقرير</Label>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="include_transactions"
                        checked={state.config.include_transactions}
                        onCheckedChange={(checked) => updateConfig('include_transactions', checked)}
                      />
                      <Label htmlFor="include_transactions">تضمين تفاصيل المعاملات</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="include_charts"
                        checked={state.config.include_charts}
                        onCheckedChange={(checked) => updateConfig('include_charts', checked)}
                      />
                      <Label htmlFor="include_charts">تضمين الرسوم البيانية</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="include_breakdown"
                        checked={state.config.include_breakdown}
                        onCheckedChange={(checked) => updateConfig('include_breakdown', checked)}
                      />
                      <Label htmlFor="include_breakdown">تضمين تفاصيل العمولات والضرائب</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="include_summaries"
                        checked={state.config.include_summaries}
                        onCheckedChange={(checked) => updateConfig('include_summaries', checked)}
                      />
                      <Label htmlFor="include_summaries">تضمين الملخصات</Label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomReportDialog(false)}
                    disabled={state.generating}
                  >
                    إلغاء
                  </Button>
                  <Button onClick={generateReport} disabled={state.generating}>
                    {state.generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 ml-2" />
                        إنشاء التقرير
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Reports */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">التقارير السريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickReport
            title="التقرير الشهري"
            description="تقرير شامل للشهر الحالي"
            icon={Calendar}
            color="text-blue-600"
            bgColor="bg-blue-50"
            onClick={() => generateQuickReport('comprehensive', 'pdf')}
            disabled={state.generating}
          />
          
          <QuickReport
            title="تقرير المعاملات"
            description="تفاصيل جميع المعاملات"
            icon={Receipt}
            color="text-green-600"
            bgColor="bg-green-50"
            onClick={() => generateQuickReport('transactions', 'excel')}
            disabled={state.generating}
          />
          
          <QuickReport
            title="التقرير المالي"
            description="الأرصدة والأرباح والخسائر"
            icon={DollarSign}
            color="text-purple-600"
            bgColor="bg-purple-50"
            onClick={() => generateQuickReport('financial', 'pdf')}
            disabled={state.generating}
          />
          
          <QuickReport
            title="التقرير الضريبي"
            description="العمولات والضرائب المخصومة"
            icon={Calculator}
            color="text-orange-600"
            bgColor="bg-orange-50"
            onClick={() => generateQuickReport('tax', 'excel')}
            disabled={state.generating}
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>تخصيص فترة التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-date-from">من تاريخ</Label>
              <Input
                id="report-date-from"
                type="date"
                value={state.config.date_from}
                onChange={(e) => updateConfig('date_from', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="report-date-to">إلى تاريخ</Label>
              <Input
                id="report-date-to"
                type="date"
                value={state.config.date_to}
                onChange={(e) => updateConfig('date_to', e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">الفترة المحددة: </span>
              {format(new Date(state.config.date_from), 'yyyy/MM/dd', { locale: ar })}
              {' إلى '}
              {format(new Date(state.config.date_to), 'yyyy/MM/dd', { locale: ar })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-3 text-gray-600">جاري تحميل معاينة التقرير...</span>
        </div>
      ) : state.error ? (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{state.error}</div>
          <Button onClick={loadComprehensiveReport}>إعادة المحاولة</Button>
        </div>
      ) : state.comprehensiveReport ? (
        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                ملخص التقرير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {state.comprehensiveReport.wallet_summary && (
                  <>
                    <ReportSummaryCard
                      title="الرصيد النقدي"
                      data={state.comprehensiveReport.wallet_summary.cash_wallet?.current_balance || 0}
                      icon={DollarSign}
                      color="text-green-600"
                    />
                    
                    <ReportSummaryCard
                      title="الرصيد الإلكتروني"
                      data={state.comprehensiveReport.wallet_summary.online_wallet?.current_balance || 0}
                      icon={DollarSign}
                      color="text-blue-600"
                    />
                    
                    <ReportSummaryCard
                      title="إجمالي الأرباح"
                      data={(state.comprehensiveReport.wallet_summary.cash_wallet?.total_earned || 0) + 
                            (state.comprehensiveReport.wallet_summary.online_wallet?.total_earned || 0)}
                      icon={TrendingUp}
                      color="text-green-600"
                    />
                    
                    <ReportSummaryCard
                      title="إجمالي المسحوبات"
                      data={(state.comprehensiveReport.wallet_summary.cash_wallet?.total_withdrawn || 0) + 
                            (state.comprehensiveReport.wallet_summary.online_wallet?.total_withdrawn || 0)}
                      icon={Download}
                      color="text-red-600"
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Period Summary */}
          {state.comprehensiveReport.period_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  ملخص الفترة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي المعاملات</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {state.comprehensiveReport.period_summary.total_transactions?.toLocaleString() || 0}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي العمولات المخصومة</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {enhancedWalletService.formatCurrency(
                        state.comprehensiveReport.period_summary.total_commission_amount || 0
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي الضرائب المخصومة</p>
                    <p className="text-2xl font-bold text-red-600">
                      {enhancedWalletService.formatCurrency(
                        state.comprehensiveReport.period_summary.total_tax_amount || 0
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">صافي الأرباح</p>
                    <p className="text-2xl font-bold text-green-600">
                      {enhancedWalletService.formatCurrency(
                        state.comprehensiveReport.period_summary.period_earnings || 0
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي المسحوبات</p>
                    <p className="text-2xl font-bold text-red-600">
                      {enhancedWalletService.formatCurrency(
                        state.comprehensiveReport.period_summary.period_withdrawals || 0
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">معدل العمولة</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {state.comprehensiveReport.rates?.commission_rate || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>تصدير التقارير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => generateReport()}
                  disabled={state.generating}
                >
                  <FileSpreadsheet className="h-4 w-4 ml-2" />
                  تصدير PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    updateConfig('format', 'excel');
                    generateReport();
                  }}
                  disabled={state.generating}
                >
                  <FileSpreadsheet className="h-4 w-4 ml-2" />
                  تصدير Excel
                </Button>
                
                <Button variant="outline" disabled>
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
                
                <Button variant="outline" disabled>
                  <Mail className="h-4 w-4 ml-2" />
                  إرسال بالبريد
                </Button>
                
                <Button variant="outline" disabled>
                  <Share2 className="h-4 w-4 ml-2" />
                  مشاركة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد بيانات تقرير للعرض</p>
        </div>
      )}
    </div>
  );
};

export { WalletReports }; 