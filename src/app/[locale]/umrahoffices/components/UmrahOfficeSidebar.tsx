'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  Package,
  Building2,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  Users,
  Calendar,
  FileText,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  MapPin,
  Image as ImageIcon,
  UserCheck,
  Bus,
  Star,
  Briefcase,
  Wallet,
  Shield
} from 'lucide-react';
import { 
  useGetUnreadNotificationsCountQuery 
} from '../redux/api/notificationsApiSlice';
import { 
  useGetUnreadChatsCountQuery 
} from '../redux/api/chatsApiSlice';

interface UmrahOfficeSidebarProps {
  className?: string;
}

export default function UmrahOfficeSidebar({ className }: UmrahOfficeSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get unread counts
  const { data: notificationsCount } = useGetUnreadNotificationsCountQuery();
  const { data: chatsCount } = useGetUnreadChatsCountQuery();

  // Check screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname.includes(path);
  };

  // Main navigation items
  const mainNavItems = [
    { 
      href: '/umrahoffices/dashboard', 
      label: t('nav.dashboard') || 'لوحة التحكم', 
      icon: Home,
      description: 'نظرة عامة على أداء المكتب'
    },
    { 
      href: '/umrahoffices/packages', 
      label: t('packages.title') || 'الباقات', 
      icon: Package,
      description: 'إدارة باقات العمرة'
    },
    { 
      href: '/umrahoffices/hotels', 
      label: t('hotels.title') || 'الفنادق', 
      icon: Building2,
      description: 'إدارة الفنادق والإقامة'
    },
    { 
      href: '/umrahoffices/bookings', 
      label: t('bookings.title') || 'الحجوزات', 
      icon: Calendar,
      description: 'متابعة الحجوزات والعملاء'
    },
    { 
      href: '/umrahoffices/dashboard/wallet', 
      label: t('wallet.title') || 'المحافظ', 
      icon: Wallet,
      description: 'إدارة المحافظ والمعاملات المالية'
    },
    { 
      href: '/umrahoffices/chats', 
      label: t('chats.title') || 'المحادثات', 
      icon: MessageSquare,
      description: 'التواصل مع العملاء',
      badge: chatsCount?.unread_count || 0
    },
    { 
      href: '/umrahoffices/notifications', 
      label: t('notifications.title') || 'الإشعارات', 
      icon: Bell,
      description: 'الإشعارات والتنبيهات',
      badge: notificationsCount?.data?.total_unread || 0
    },
  ];

  // Management section
  const managementNavItems = [
    { 
      href: '/umrahoffices/customers', 
      label: t('customers.title') || 'العملاء', 
      icon: Users,
      description: 'إدارة بيانات العملاء'
    },
    { 
      href: '/umrahoffices/bus', 
      label: t('transportation.title') || 'النقل', 
      icon: Bus,
      description: 'إدارة وسائل النقل'
    },
    { 
      href: '/umrahoffices/gallery', 
      label: t('gallery.title') || 'المعرض', 
      icon: ImageIcon,
      description: 'معرض صور الباقات'
    },
    { 
      href: '/umrahoffices/reviews', 
      label: t('reviews.title') || 'التقييمات', 
      icon: Star,
      description: 'مراجعات وتقييمات العملاء'
    },
    { 
      href: '/umrahoffices/documents', 
      label: t('documents.title') || 'الوثائق', 
      icon: FileText,
      description: 'إدارة الوثائق والمستندات'
    },
  ];

  // Analytics and reports
  const analyticsNavItems = [
    { 
      href: '/umrahoffices/analytics', 
      label: t('analytics.title') || 'التحليلات', 
      icon: BarChart3,
      description: 'تقارير الأداء والإحصائيات'
    },
    { 
      href: '/umrahoffices/reports', 
      label: t('reports.title') || 'التقارير', 
      icon: Layers,
      description: 'التقارير التفصيلية'
    },
    { 
      href: '/umrahoffices/payments', 
      label: t('payments.title') || 'المدفوعات', 
      icon: CreditCard,
      description: 'إدارة المدفوعات والفواتير'
    },
  ];

  // Settings and support
  const settingsNavItems = [
    { 
      href: '/umrahoffices/office-profile', 
      label: t('office.profile') || 'ملف المكتب', 
      icon: Briefcase,
      description: 'معلومات وإعدادات المكتب'
    },
    { 
      href: '/umrahoffices/staff', 
      label: t('staff.title') || 'الموظفين', 
      icon: UserCheck,
      description: 'إدارة الموظفين والصلاحيات'
    },
    { 
      href: '/umrahoffices/settings', 
      label: t('settings.title') || 'الإعدادات', 
      icon: Settings,
      description: 'إعدادات النظام والحساب'
    },
    { 
      href: '/umrahoffices/help', 
      label: t('help.title') || 'المساعدة', 
      icon: HelpCircle,
      description: 'الدعم الفني والمساعدة'
    },
  ];

  const renderNavSection = (
    title: string, 
    items: typeof mainNavItems, 
    showSeparator: boolean = true
  ) => (
    <div className="mb-4">
      {!isCollapsed && showSeparator && (
        <div className="mb-2 px-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground relative group",
              isActive(item.href.split('/').pop() || '')
                ? "bg-accent text-accent-foreground border-r-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs px-1.5 py-0.5">
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                <div className="font-medium">{item.label}</div>
                <div className="text-muted-foreground text-xs">{item.description}</div>
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
      {!isCollapsed && showSeparator && <Separator className="my-4" />}
    </div>
  );

  return (
    <div
      className={cn(
        "relative h-screen border-r bg-background/95 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        !isMobile && "sticky top-0",
        className
      )}
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">مكتب العمرة</h2>
              <p className="text-xs text-muted-foreground">لوحة التحكم</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isCollapsed ? "توسيع" : "طي"}
          </span>
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="p-2">
          {/* Main navigation */}
          {renderNavSection("الرئيسية", mainNavItems, false)}
          
          {/* Management */}
          {renderNavSection("الإدارة", managementNavItems)}
          
          {/* Analytics */}
          {renderNavSection("التحليلات", analyticsNavItems)}
          
          {/* Settings */}
          {renderNavSection("الإعدادات", settingsNavItems)}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 UmrahGo
            </p>
            <p className="text-xs text-muted-foreground">
              الإصدار 1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 