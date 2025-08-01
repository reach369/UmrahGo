'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Users, 
  Star,
  Percent,
  Clock
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  color: string;
  icon: any;
}

interface PerformanceWidgetProps {
  isLoading?: boolean;
}

export default function PerformanceWidget({ isLoading = false }: PerformanceWidgetProps) {
  const t = useTranslations('UmrahOfficesDashboard.performanceMetrics');

  // Mock performance metrics - in real app would come from API
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'bookingGrowth',
      label: t('bookingGrowth'),
      value: 85,
      target: 100,
      unit: '%',
      trend: 12,
      color: 'text-blue-600',
      icon: TrendingUp
    },
    {
      id: 'revenueGrowth',
      label: t('revenueGrowth'),
      value: 92,
      target: 100,
      unit: '%',
      trend: 8,
      color: 'text-green-600',
      icon: Target
    },
    {
      id: 'customerRetention',
      label: t('customerRetention'),
      value: 78,
      target: 85,
      unit: '%',
      trend: -3,
      color: 'text-purple-600',
      icon: Users
    },
    {
      id: 'averageRating',
      label: t('averageRating'),
      value: 4.6,
      target: 5,
      unit: '/5',
      trend: 5,
      color: 'text-yellow-600',
      icon: Star
    }
  ];

  const getProgressColor = (value: number, target: number): string => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <div className="h-3 w-3"></div>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-600" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {performanceMetrics.map((metric) => {
            const IconComponent = metric.icon;
            const progressPercentage = (metric.value / metric.target) * 100;
            
            return (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">
                      {metric.value}
                      {metric.unit}
                    </span>
                    <span className="text-gray-500">
                      / {metric.target}{metric.unit}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs ${
                        metric.trend > 0 ? 'text-green-600' : 
                        metric.trend < 0 ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {metric.trend !== 0 && (
                          <>
                            {metric.trend > 0 ? '+' : ''}
                            {metric.trend}%
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={Math.min(progressPercentage, 100)} 
                    className="h-2"
                  />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.value, metric.target)}`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0{metric.unit}</span>
                  <span>{metric.target}{metric.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Performance Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">الأداء العام</div>
              <div className="text-xl font-bold text-green-600">
                {Math.round(performanceMetrics.reduce((acc, metric) => acc + (metric.value / metric.target), 0) / performanceMetrics.length * 100)}%
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">التحسن الشهري</div>
              <div className="text-xl font-bold text-blue-600">
                +{Math.round(performanceMetrics.reduce((acc, metric) => acc + metric.trend, 0) / performanceMetrics.length)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 