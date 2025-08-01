import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { 
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Database,
  Wifi,
  Settings,
  Zap,
  TrendingUp,
  Clock,        
  AlertCircle,
  Loader2,
  Wrench,
  Target
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
import enhancedWalletService, { SystemStatus as SystemStatusType } from '@/services/api/enhanced-wallet';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Types
interface SystemStatusProps {
  systemStatus?: SystemStatusType | null;
}

interface SystemStatusState {
  status: SystemStatusType | null;
  loading: boolean;
  error: string | null;
  fixing: boolean;
  verifying: boolean;
  lastCheck: Date | null;
}

interface HealthCheckItemProps {
  label: string;
  status: boolean;
  description?: string;
  icon: React.ElementType;
}

interface WalletStatusProps {
  type: 'cash' | 'online';
  wallet: {
    exists: boolean;
    active: boolean;
    balance: number;
    last_activity?: string;
  };
}

const HealthCheckItem: React.FC<HealthCheckItemProps> = ({ label, status, description, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center",
          status ? "bg-green-100" : "bg-red-100"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            status ? "text-green-600" : "text-red-600"
          )} />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      <div>
        {status ? (
          <CheckCircle className="h-6 w-6 text-green-600" />
        ) : (
          <XCircle className="h-6 w-6 text-red-600" />
        )}
      </div>
    </div>
  );
};

const WalletStatus: React.FC<WalletStatusProps> = ({ type, wallet }) => {
  const typeConfig = {
    cash: {
      title: 'المحفظة النقدية',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    online: {
      title: 'المحفظة الإلكترونية',
      icon: Wifi,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  };

  const config = typeConfig[type];
  const isHealthy = wallet.exists && wallet.active;

  return (
    <Card className={cn(
      "border-l-4",
      isHealthy ? "border-l-green-500" : "border-l-red-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", config.bgColor)}>
              <config.icon className={cn("h-4 w-4", config.color)} />
            </div>
            <h3 className="font-semibold text-gray-900">{config.title}</h3>
          </div>
          <Badge 
            variant={isHealthy ? "default" : "destructive"}
            className={isHealthy ? "bg-green-100 text-green-800" : ""}
          >
            {isHealthy ? 'سليمة' : 'تحتاج إصلاح'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">موجودة</span>
            <span className={cn(
              "text-sm font-medium",
              wallet.exists ? "text-green-600" : "text-red-600"
            )}>
              {wallet.exists ? 'نعم' : 'لا'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">نشطة</span>
            <span className={cn(
              "text-sm font-medium",
              wallet.active ? "text-green-600" : "text-red-600"
            )}>
              {wallet.active ? 'نعم' : 'لا'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">الرصيد</span>
            <span className="text-sm font-medium text-gray-900">
              {enhancedWalletService.formatCurrency(wallet.balance)}
            </span>
          </div>
          
          {wallet.last_activity && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">آخر نشاط</span>
              <span className="text-sm text-gray-600">
                {format(new Date(wallet.last_activity), 'yyyy/MM/dd HH:mm', { locale: ar })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SystemStatus: React.FC<SystemStatusProps> = ({ systemStatus: propSystemStatus }) => {
  const t = useTranslations();

  // State
  const [state, setState] = useState<SystemStatusState>({
    status: null,
    loading: !propSystemStatus,
    error: null,
    fixing: false,
    verifying: false,
    lastCheck: null
  });

  // Load system status
  const loadSystemStatus = useCallback(async () => {
    if (propSystemStatus) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await enhancedWalletService.getSystemStatus();

      if (response.status === 'success') {
        setState(prev => ({
          ...prev,
          status: response.data!,
          loading: false,
          lastCheck: new Date()
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message || 'خطأ في تحميل حالة النظام',
          loading: false
        }));
      }
    } catch (error) {
      console.error('System status loading error:', error);
      setState(prev => ({
        ...prev,
        error: 'خطأ في الاتصال بالخادم',
        loading: false
      }));
    }
  }, [propSystemStatus]);

  // Verify system integrity
  const verifyIntegrity = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, verifying: true }));

      const response = await enhancedWalletService.verifyIntegrity();

      if (response.status === 'success') {
        toast.success('تم التحقق من سلامة النظام بنجاح');
        loadSystemStatus(); // Reload status
      } else {
        toast.error(response.message || 'فشل في التحقق من سلامة النظام');
      }
    } catch (error) {
      console.error('System verification error:', error);
      toast.error('خطأ في التحقق من سلامة النظام');
    } finally {
      setState(prev => ({ ...prev, verifying: false }));
    }
  }, [loadSystemStatus]);

  // Fix system issues
  const fixSystemIssues = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, fixing: true }));

      const response = await enhancedWalletService.fixIssues({
        fix_notifications: true
      });

      if (response.status === 'success') {
        toast.success('تم إصلاح مشاكل النظام بنجاح');
        loadSystemStatus(); // Reload status
      } else {
        toast.error(response.message || 'فشل في إصلاح مشاكل النظام');
      }
    } catch (error) {
      console.error('System fix error:', error);
      toast.error('خطأ في إصلاح مشاكل النظام');
    } finally {
      setState(prev => ({ ...prev, fixing: false }));
    }
  }, [loadSystemStatus]);

  // Get health status color
  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get health status background
  const getHealthBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Initial load
  useEffect(() => {
    if (propSystemStatus) {
      setState(prev => ({
        ...prev,
        status: propSystemStatus,
        loading: false,
        lastCheck: new Date()
      }));
    } else {
      loadSystemStatus();
    }
  }, [propSystemStatus, loadSystemStatus]);

  const systemStatus = propSystemStatus || state.status;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">حالة النظام</h2>
          <p className="text-gray-600">مراقبة صحة وأداء نظام المحفظة</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadSystemStatus}
            disabled={state.loading}
          >
            <RefreshCw className={cn("h-4 w-4 ml-2", state.loading && "animate-spin")} />
            تحديث
          </Button>
          
          <Button
            variant="outline"
            onClick={verifyIntegrity}
            disabled={state.verifying || state.loading}
          >
            <Target className={cn("h-4 w-4 ml-2", state.verifying && "animate-spin")} />
            {state.verifying ? 'جاري التحقق...' : 'فحص السلامة'}
          </Button>
          
          <Button
            variant="outline"
            onClick={fixSystemIssues}
            disabled={state.fixing || state.loading}
            className="text-orange-600 hover:text-orange-700"
          >
              <Wrench className={cn("h-4 w-4 ml-2", state.fixing && "animate-spin")} />
            {state.fixing ? 'جاري الإصلاح...' : 'إصلاح المشاكل'}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="mr-3 text-gray-600">جاري تحميل حالة النظام...</span>
        </div>
      ) : state.error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">خطأ في تحميل حالة النظام</AlertTitle>
          <AlertDescription className="text-red-700">
            {state.error}
          </AlertDescription>
        </Alert>
      ) : !systemStatus ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد بيانات حالة النظام</p>
        </div>
      ) : (
        <>
          {/* Overall Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                الصحة العامة للنظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={cn(
                    "text-3xl font-bold",
                    getHealthColor(systemStatus.overall_health_percentage)
                  )}>
                    {systemStatus.overall_health_percentage.toFixed(1)}%
                  </h3>
                  <p className="text-gray-600">صحة النظام العامة</p>
                </div>
                <div className={cn(
                  "h-16 w-16 rounded-full flex items-center justify-center",
                  getHealthBgColor(systemStatus.overall_health_percentage)
                )}>
                  <Activity className={cn(
                    "h-8 w-8",
                    getHealthColor(systemStatus.overall_health_percentage)
                  )} />
                </div>
              </div>
              
              <Progress 
                value={systemStatus.overall_health_percentage} 
                className="h-3"
              />
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">المعاملات الأخيرة</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {systemStatus.recent_transactions_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">آخر فحص</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(systemStatus.last_check), 'HH:mm', { locale: ar })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Office Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                معلومات المكتب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">اسم المكتب</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {systemStatus.office.name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">معرف المكتب</label>
                  <p className="mt-1 text-lg font-mono text-gray-900">
                    #{systemStatus.office.id}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">حالة المكتب</label>
                  <div className="mt-1">
                    <Badge 
                      variant={systemStatus.office.is_active ? "default" : "secondary"}
                      className={systemStatus.office.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {systemStatus.office.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Status */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">حالة المحافظ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WalletStatus type="cash" wallet={systemStatus.wallets.cash} />
              <WalletStatus type="online" wallet={systemStatus.wallets.online} />
            </div>
          </div>

          {/* Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                فحوصات الصحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <HealthCheckItem
                  label="وجود المحافظ"
                  status={systemStatus.health_checks.wallets_exist}
                  description="التحقق من وجود محافظ نقدية وإلكترونية"
                  icon={Database}
                />
                
                <HealthCheckItem
                  label="نشاط المحافظ"
                  status={systemStatus.health_checks.wallets_active}
                  description="التحقق من كون المحافظ نشطة ومتاحة للاستخدام"
                  icon={Zap}
                />
                
                <HealthCheckItem
                  label="سلامة الأرصدة"
                  status={systemStatus.health_checks.balance_integrity}
                  description="التحقق من تطابق الأرصدة مع المعاملات"
                  icon={TrendingUp}
                />
                
                <HealthCheckItem
                  label="النشاط الأخير"
                  status={systemStatus.health_checks.recent_activity}
                  description="وجود معاملات حديثة في النظام"
                  icon={Clock}
                />
                
                <HealthCheckItem
                  label="الإعدادات"
                  status={systemStatus.health_checks.settings_configured}
                  description="التحقق من تكوين إعدادات النظام"
                  icon={Settings}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          {systemStatus.overall_health_percentage < 80 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">تحذير النظام</AlertTitle>
              <AlertDescription className="text-yellow-700">
                صحة النظام أقل من المستوى الأمثل. يُنصح بتشغيل أدوات الإصلاح أو التواصل مع الدعم الفني.
              </AlertDescription>
            </Alert>
          )}

          {/* Last Check Info */}
          {(state.lastCheck || propSystemStatus) && (
            <div className="text-center text-sm text-gray-500">
              آخر تحديث لحالة النظام: {' '}
              {format(
                state.lastCheck || new Date(systemStatus.last_check), 
                'yyyy/MM/dd HH:mm:ss', 
                { locale: ar }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { SystemStatus }; 