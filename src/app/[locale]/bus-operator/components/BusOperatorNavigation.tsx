'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  Calendar, 
  Bus, 
  BarChart3, 
  MessageSquare, 
  User, 
  Settings,
  FileText,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  isNew?: boolean;
}

export default function BusOperatorNavigation({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations('BusOperatorDashboard.navigation');

  const navigationItems: NavigationItem[] = [
    {
      href: `/${locale}/bus-operator`,
      icon: LayoutDashboard,
      label: t('dashboard'),
    },
    {
      href: `/${locale}/bus-operator/bookings`,
      icon: Calendar,
      label: t('bookings'),
      badge: 5, // عدد الحجوزات المعلقة
    },
    {
      href: `/${locale}/bus-operator/buses`,
      icon: Bus,
      label: t('buses'),
    },
    {
      href: `/${locale}/bus-operator/statistics`,
      icon: BarChart3,
      label: t('statistics'),
    },
    {
      href: `/${locale}/bus-operator/calendar`,
      icon: Calendar,
      label: t('calendar'),
    },
    {
      href: `/${locale}/bus-operator/chat`,
      icon: MessageSquare,
      label: t('chats'),
      badge: 3, // عدد الرسائل غير المقروءة
    },
    {
      href: `/${locale}/bus-operator/profile`,
      icon: User,
      label: t('profile'),
    },
    {
      href: `/${locale}/bus-operator/settings`,
      icon: Settings,
      label: t('settings'),
    },
  ];

  const quickActions = [
    {
      href: `/${locale}/bus-operator/bookings/create`,
      icon: Plus,
      label: 'إضافة حجز جديد',
      variant: 'default' as const,
    },
    {
      href: `/${locale}/bus-operator/buses/add`,
      icon: Plus,
      label: 'إضافة باص جديد',
      variant: 'outline' as const,
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === `/${locale}/bus-operator`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500 px-3">إجراءات سريعة</h3>
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Button 
              variant={action.variant}
              className="w-full justify-start h-9"
              size="sm"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Main Navigation */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">القائمة الرئيسية</h3>
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={isActive ? 'secondary' : 'default'} 
                    className="text-xs px-1.5 py-0.5"
                  >
                    {item.badge}
                  </Badge>
                )}
                {item.isNew && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                    جديد
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Help & Support */}
      <div className="border-t pt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">المساعدة والدعم</h3>
        <Link href={`/${locale}/bus-operator/help`}>
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <FileText className="w-4 h-4" />
            <span>مركز المساعدة</span>
          </div>
        </Link>
        <Link href={`/${locale}/bus-operator/support`}>
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>تواصل مع الدعم</span>
          </div>
        </Link>
      </div>
    </div>
  );
} 